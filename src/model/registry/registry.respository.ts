import { Injectable, Inject } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RegistryEntity } from './registry.entity';
import { AutoType, EventType } from './registry.entity';

@Injectable()
export class RegistryRepository {
  constructor(
    @Inject('REGISTRY_REPOSITORY')
    private readonly repo: Repository<RegistryEntity>,
    @Inject('PG_SOURCE')
    private dataSource: DataSource,
  ) {}

  async findAll(): Promise<RegistryEntity[]> {
    return this.repo.find();
  }

  async findAllCheckPerform(): Promise<RegistryEntity[]> {
    return this.dataSource
      .getRepository(RegistryEntity)
      .createQueryBuilder('registry')
      .where({ auto_type: AutoType.CHECK_PERFORM })
      .getMany();
  }

  async findAllTrigger(): Promise<RegistryEntity[]> {
    return this.dataSource
      .getRepository(RegistryEntity)
      .createQueryBuilder('registry')
      .where({ auto_type: AutoType.TRIGGER_BY_EVENT })
      .getMany();
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  async findByAddress(address: string): Promise<RegistryEntity> {
    return this.dataSource
      .getRepository(RegistryEntity)
      .createQueryBuilder('registry')
      .where({ address: address })
      .getOne();
  }

  async update(entity: any): Promise<any> {
    entity.update_at = new Date();
    return this.repo.update({ rid: entity.rid }, entity);
  }

  async save(entity: RegistryEntity): Promise<RegistryEntity> {
    return this.repo.save(entity);
  }

  async deleteByAddress(address: string): Promise<any> {
    return this.repo.delete({ address: address });
  }

  async delete(rid: string): Promise<any> {
    return this.repo.delete({ rid: rid });
  }
}
