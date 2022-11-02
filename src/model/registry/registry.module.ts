import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { registryProviders } from './registry.providers';
import { RegistryRepository } from './registry.respository';

@Module({
  imports: [DatabaseModule],
  providers: [...registryProviders, RegistryRepository],
  exports: [RegistryRepository],
})
export class RegistryModule {}
