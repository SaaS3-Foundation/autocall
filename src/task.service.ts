import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RegistryRepository } from './model/registry/registry.respository';
import { ConfigService, ConfigModule } from '@nestjs/config';
import * as utils from './utils';
import * as qatar from './events/Qatar2022MatchEnded';

@Injectable()
export class TaskService {
  public constructor(
    private readonly registryRepository: RegistryRepository,
    private readonly configService: ConfigService,
  ) {}
  private nonce: number = 0;

  @Cron('0 */1 * * * *')
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

  @Cron('0 */3 * * * *')
  handleCron2() {
    this.registryRepository.findAllTrigger().then((reg) => {
      reg.forEach(async (r) => {
        let sponsorMnemonic = this.configService.get('SPONSOR');
        let provider = this.configService.get('PROVIDER');
        let apikey = this.configService.get('QATAR2022_API_KEY');
        let season_id = this.configService.get('SEASON_ID');
        let only_str = this.configService.get('ONLY');
        let only = only_str.split(',');
        let gasLimit = this.configService.get('GAS_LIMIT');

        console.log(r);
        console.log(only);
        let res = await qatar.played(
          apikey,
          season_id,
          r.last_check,
          r.played,
          only,
        );
        if (res != null) {
          // will report
          console.log('report', res);
          try {
            let isok = await utils.triggle(
              r.address,
              JSON.parse(r.abi),
              provider,
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
