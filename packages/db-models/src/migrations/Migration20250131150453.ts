import { Migration } from '@mikro-orm/migrations';

export class Migration20250131150453 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "conversation_message" add column "requires_response" boolean not null default true, add column "is_last" boolean not null default false;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "conversation_message" drop column "requires_response", drop column "is_last";`);
  }

}
