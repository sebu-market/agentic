import { Migration } from '@mikro-orm/migrations';

export class Migration20250204171746 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "token_metadata" add column "volume" float null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "token_metadata" drop column "volume";`);
  }

}
