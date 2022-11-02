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

const nanoid = customAlphabet('1234567890abcdef', 6);

type CallParams = {
  rpc: string;
  address: string;
  calldata: string; // hex string of calldata bytes
  abi: any;
};

@Controller('/saas3/autocall')
export class MainController {
  public constructor(private readonly registryRepository: RegistryRepository) {}

  @Post('/register')
  async register(@Body() req: CallParams, @Response() res) {
    // TODO check
    await this.registryRepository.save({
      rid: 'reg-ac-' + nanoid(),
      address: req.address,
      abi: JSON.stringify(req.abi),
      create_at: new Date(),
      update_at: new Date(),
    });
    res.send({ ok: true });
  }

  @Delete('/unregister')
  async unregister(@Query('address') address: string, @Response() res) {
    await this.registryRepository.deleteByAddress(address);
    res.send({ ok: true });
  }
}
