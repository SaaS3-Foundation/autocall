import {
  Controller,
  Response,
  Get,
  Post,
  Query,
  Body,
  Delete,
} from '@nestjs/common';
import { RegistryEntity } from './model/registry/registry.entity';
import { RegistryRepository } from './model/registry/registry.respository';
import { customAlphabet } from 'nanoid';
import { AutoType, EventType } from './model/registry/registry.entity';

const nanoid = customAlphabet('1234567890abcdef', 6);

type CallParams = {
  rpc: string;
  address: string;
  abi: any;
  auto_type: AutoType;
  event_type: EventType;
};

@Controller('/saas3/autocall')
export class MainController {
  public constructor(private readonly registryRepository: RegistryRepository) {}

  @Post('/register')
  async register(@Body() req: CallParams, @Response() res) {
    // TODO check
    let ret = await this.registryRepository.save({
      rid: 'reg-ac-' + nanoid(),
      address: req.address,
      abi: JSON.stringify(req.abi),
      auto_type: req.auto_type,
      event_type: req.event_type,
      played: [],
      last_check: new Date(),
      create_at: new Date(),
      update_at: new Date(),
    });
    res.send({ ok: true, rid: ret.rid });
  }

  @Delete('/unregister')
  async unregister(@Query('rid') rid: string, @Response() res) {
    await this.registryRepository.delete(rid);
    res.send({ ok: true });
  }
}
