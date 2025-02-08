import { PrimaryKey, Property } from '@mikro-orm/core';

export abstract class ABaseEntity {

  @PrimaryKey()
  id!: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

}