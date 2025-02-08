import { Migration } from '@mikro-orm/migrations';

export class Migration20250208145053 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "pitch" add column "on_chain_pitch_id" int not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "pitch" drop column "on_chain_pitch_id";`);
  }

}
