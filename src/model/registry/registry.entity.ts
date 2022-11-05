import {
  PrimaryColumn,
  Entity,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

export enum AutoType {
  CHECK_PERFORM,
  TRIGGER_BY_EVENT,
}

export enum EventType {
  QATAR_2022_MATCH_ENDED,
}
@Entity('registry')
export class RegistryEntity {
  @PrimaryColumn()
  rid: string;

  @Column({ type: 'varchar', length: 1024, nullable: false })
  address: string;

  @Column({ type: 'varchar', nullable: true })
  abi: string;

  @Column({
    type: 'enum',
    enum: AutoType,
  })
  auto_type: AutoType;

  @Column({
    type: 'enum',
    enum: EventType,
  })
  event_type: EventType;

  @Column('text', { array: true, nullable: true })
  played: string[];

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  last_check: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  create_at: Date;

  @Column({ type: 'varchar', length: 300 })
  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  update_at: Date;
}
