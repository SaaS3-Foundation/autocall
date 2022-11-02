import {
  PrimaryColumn,
  Entity,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('registry')
export class RegistryEntity {
  @PrimaryColumn()
  rid: string;

  @Column({ type: 'varchar', length: 1024, nullable: false })
  address: string;

  @Column({ type: 'varchar', nullable: true })
  abi: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  create_at: Date;

  @Column({ type: 'varchar', length: 300 })
  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  update_at: Date;
}
