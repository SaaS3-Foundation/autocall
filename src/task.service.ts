import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RegistryRepository } from './model/registry/registry.respository';
import { ConfigService, ConfigModule } from '@nestjs/config';
import * as utils from './utils';

@Injectable()
export class TasksService {
  public constructor(
    private readonly registryRepository: RegistryRepository,
    private readonly configService: ConfigService,
  ) {}

  @Cron('0 */1 * * * *')
  handleCron() {
    this.registryRepository.findAll().then((reg) => {
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
}
