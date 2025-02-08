import { Migration } from '@mikro-orm/migrations';

export class Migration20250131172149 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "conversation_message" drop constraint "conversation_message_conversation_id_foreign";`);

    this.addSql(`alter table "pitch" drop constraint "pitch_owner_id_foreign";`);
    this.addSql(`alter table "pitch" drop constraint "pitch_conversation_id_foreign";`);

    this.addSql(`alter table "screening" drop constraint "screening_owner_id_foreign";`);
    this.addSql(`alter table "screening" drop constraint "screening_conversation_id_foreign";`);

    this.addSql(`alter table "conversation_message" alter column "conversation_id" type int using ("conversation_id"::int);`);
    this.addSql(`alter table "conversation_message" alter column "conversation_id" drop not null;`);
    this.addSql(`alter table "conversation_message" add constraint "conversation_message_conversation_id_foreign" foreign key ("conversation_id") references "conversation" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "pitch" alter column "owner_id" type int using ("owner_id"::int);`);
    this.addSql(`alter table "pitch" alter column "owner_id" drop not null;`);
    this.addSql(`alter table "pitch" alter column "conversation_id" type int using ("conversation_id"::int);`);
    this.addSql(`alter table "pitch" alter column "conversation_id" set not null;`);
    this.addSql(`alter table "pitch" add constraint "pitch_owner_id_foreign" foreign key ("owner_id") references "sebu_user" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "pitch" add constraint "pitch_conversation_id_foreign" foreign key ("conversation_id") references "conversation" ("id") on update cascade;`);

    this.addSql(`alter table "screening" alter column "owner_id" type int using ("owner_id"::int);`);
    this.addSql(`alter table "screening" alter column "owner_id" drop not null;`);
    this.addSql(`alter table "screening" alter column "conversation_id" type int using ("conversation_id"::int);`);
    this.addSql(`alter table "screening" alter column "conversation_id" set not null;`);
    this.addSql(`alter table "screening" add constraint "screening_owner_id_foreign" foreign key ("owner_id") references "sebu_user" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "screening" add constraint "screening_conversation_id_foreign" foreign key ("conversation_id") references "conversation" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "conversation_message" drop constraint "conversation_message_conversation_id_foreign";`);

    this.addSql(`alter table "pitch" drop constraint "pitch_owner_id_foreign";`);
    this.addSql(`alter table "pitch" drop constraint "pitch_conversation_id_foreign";`);

    this.addSql(`alter table "screening" drop constraint "screening_owner_id_foreign";`);
    this.addSql(`alter table "screening" drop constraint "screening_conversation_id_foreign";`);

    this.addSql(`alter table "conversation_message" alter column "conversation_id" type int using ("conversation_id"::int);`);
    this.addSql(`alter table "conversation_message" alter column "conversation_id" set not null;`);
    this.addSql(`alter table "conversation_message" add constraint "conversation_message_conversation_id_foreign" foreign key ("conversation_id") references "conversation" ("id") on update cascade;`);

    this.addSql(`alter table "pitch" alter column "owner_id" type int using ("owner_id"::int);`);
    this.addSql(`alter table "pitch" alter column "owner_id" set not null;`);
    this.addSql(`alter table "pitch" alter column "conversation_id" type int using ("conversation_id"::int);`);
    this.addSql(`alter table "pitch" alter column "conversation_id" drop not null;`);
    this.addSql(`alter table "pitch" add constraint "pitch_owner_id_foreign" foreign key ("owner_id") references "sebu_user" ("id") on update cascade;`);
    this.addSql(`alter table "pitch" add constraint "pitch_conversation_id_foreign" foreign key ("conversation_id") references "conversation" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "screening" alter column "owner_id" type int using ("owner_id"::int);`);
    this.addSql(`alter table "screening" alter column "owner_id" set not null;`);
    this.addSql(`alter table "screening" alter column "conversation_id" type int using ("conversation_id"::int);`);
    this.addSql(`alter table "screening" alter column "conversation_id" drop not null;`);
    this.addSql(`alter table "screening" add constraint "screening_owner_id_foreign" foreign key ("owner_id") references "sebu_user" ("id") on update cascade;`);
    this.addSql(`alter table "screening" add constraint "screening_conversation_id_foreign" foreign key ("conversation_id") references "conversation" ("id") on update cascade on delete cascade;`);
  }

}
