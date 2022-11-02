import { DataSource } from 'typeorm';
import { RegistryEntity } from './registry.entity';

export const registryProviders = [
  {
    provide: 'REGISTRY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(RegistryEntity),
    inject: ['PG_SOURCE'],
  },
];
