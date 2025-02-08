import { Migration } from '@mikro-orm/migrations';

export class Migration20250203183726 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "investor_portfolio" add column "waiting_on_lpallocation" bigint null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "investor_portfolio" drop column "waiting_on_lpallocation";`);
  }

}
