import { Migration } from '@mikro-orm/migrations';

export class Migration20250203211204 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "pending_lpdistribution" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "owner_id" int not null, "round" int not null, "amount" bigint not null);`);

    this.addSql(`alter table "pending_lpdistribution" add constraint "pending_lpdistribution_owner_id_foreign" foreign key ("owner_id") references "sebu_user" ("id") on update cascade;`);

    this.addSql(`alter table "investor_portfolio" drop column "waiting_on_lpallocation";`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "pending_lpdistribution" cascade;`);

    this.addSql(`alter table "investor_portfolio" add column "waiting_on_lpallocation" bigint null;`);
  }

}
