import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RegistryRepository } from './model/registry/registry.respository';
import { ConfigService, ConfigModule } from '@nestjs/config';
import * as utils from './utils';
import * as qatar from './events/Qatar2022MatchEnded';
import * as phala from './phala';

@Injectable()
export class TaskService {
  public constructor(
    private readonly registryRepository: RegistryRepository,
    private readonly configService: ConfigService,
  ) {}
  private nonce: number = 0;

  @Cron('0 */100 * * * *')
  handleCron() {
    this.registryRepository.findAllCheckPerform().then((reg) => {
      reg.forEach(async (r) => {
        let sponsorMnemonic = this.configService.get('SPONSOR');
        let provider = this.configService.get('PROVIDER');
        console.log(r);
        await utils.perform(
          r.address,
          JSON.parse(r.abi),
          provider,
          sponsorMnemonic,
        );
      });
    });
  }

  @Cron('0 */1 * * * *')
  handleCron3() {
    let fatContractPath = this.configService.get('FAT_CONTRACT_PATH');
    let artifact = phala.loadFatContract(fatContractPath);
    let address = this.configService.get('SCHEDULER_ADDRESS');
    let mnemonic = this.configService.get('SPONSOR');
    let chainUrl = this.configService.get('PHALA_CHAIN_URL');
    let pruntimeUrl = this.configService.get('PHALA_PRUNTIME_URL');
    artifact.address = address;

    console.log(fatContractPath, address, mnemonic, chainUrl, pruntimeUrl);
    phala.call(mnemonic, chainUrl, pruntimeUrl, artifact, 'answer', []);
  }

  @Cron('0 */300 * * * *')
  handleCron2() {
    console.log(new Date());
    this.registryRepository.findAllTrigger().then((reg) => {
      reg.forEach(async (r) => {
        let sponsorMnemonic = this.configService.get('SPONSOR');
        let apikey = this.configService.get('QATAR2022_API_KEY');
        let season_id = this.configService.get('SEASON_ID');
        let only_str = this.configService.get('ONLY');
        let only = [];
        if (only_str != null && only_str != '') {
          only = only_str.split(',');
        }

        let gasLimit = this.configService.get('GAS_LIMIT');
        if (r.provider == null || r.provider == '') {
          console.log(
            'provider is null',
            'use default',
            this.configService.get('PROVIDER'),
          );
          r.provider = this.configService.get('PROVIDER');
        }

        console.log(
          r.rid,
          r.address,
          r.provider,
          r.played,
          r.update_at,
          r.last_check,
        );
        console.log(only);
        let res = null;
        try {
          res = await qatar.played(
            apikey,
            season_id,
            r.last_check,
            r.played,
            only,
          );
        } catch (e) {
          console.log(e);
        }
        if (res != null) {
          // will report
          console.log('report', res);
          try {
            let isok = await utils.triggle(
              r.address,
              JSON.parse(r.abi),
              r.provider,
              sponsorMnemonic,
              res.home,
              res.away,
              this.nonce,
              gasLimit,
            );
            if (isok.ok == true) {
              r.played.push(res.match_id);
              this.registryRepository.update(r);
            }
          } catch (e) {
            console.log(e);
          } finally {
            this.nonce++;
          }
        }
      });
    });
  }
}
