import { Migration } from '@mikro-orm/migrations';

export class Migration20250203191656 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "investment_round" alter column "funds_raised" type bigint using ("funds_raised"::bigint);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "investment_round" alter column "funds_raised" type int using ("funds_raised"::int);`);
  }

}
