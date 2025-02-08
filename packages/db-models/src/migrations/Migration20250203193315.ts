import { Migration } from '@mikro-orm/migrations';

export class Migration20250203193315 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "investment_round" rename column "seconds_remainig" to "seconds_remaining";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "investment_round" rename column "seconds_remaining" to "seconds_remainig";`);
  }

}
