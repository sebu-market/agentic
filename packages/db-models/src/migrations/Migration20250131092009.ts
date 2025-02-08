import { Migration } from '@mikro-orm/migrations';

export class Migration20250131092009 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "pitch" add column "embedding" vector(1536) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "pitch" drop column "embedding";`);
  }

}
