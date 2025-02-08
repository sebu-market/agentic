import { Migration } from '@mikro-orm/migrations';

export class Migration20250130225002 extends Migration {

  override async up(): Promise<void> {
    this.addSql('create extension if not exists vector;');

    this.addSql(`create table "conversation" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`create table "conversation_message" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "conversation_id" int not null, "content" text not null, "sender" varchar(255) not null, "role" varchar(255) not null, "is_injected" boolean not null default false);`);

    this.addSql(`create table "sebu_user" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_wallet" varchar(255) not null);`);

    this.addSql(`create table "token_metadata" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "address" varchar(255) not null, "chain" int not null, "price" real null, "market_cap" real null, "supply" int null, "name" varchar(255) not null, "decimals" int not null, "symbol" varchar(255) not null, "last_price_check" timestamptz null);`);

    this.addSql(`create table "pitch" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "owner_id" int not null, "conversation_id" int not null, "status" varchar(255) not null, "token_metadata_id" int null, "project_summary_description" text null, "conversation_tokens" int not null, "project_summary_project_name" varchar(255) null, "founder_info_name" varchar(255) null, "start_time" timestamptz null, "project_summary_duplicate_score" real null, "founder_info_role" varchar(255) null, "time_limit_seconds" int not null, "project_summary_duplicate_name" varchar(255) null, "founder_info_social_media" varchar(255) null, "project_summary_duplicate_description" text null, "screening_id" int not null, "payment_txn_hash" varchar(255) null, "payment_amount" int null, "payment_pay_date" timestamptz null, "payment_slot_number" int null, "payment_round_number" int null, "evaluation_aping_in" boolean null, "evaluation_moon_potential_score" int null, "evaluation_confidence" int null, "evaluation_bullish_factors" text[] null, "evaluation_red_flags" text[] null);`);
    this.addSql(`alter table "pitch" add constraint "pitch_conversation_id_unique" unique ("conversation_id");`);
    this.addSql(`alter table "pitch" add constraint "pitch_token_metadata_id_unique" unique ("token_metadata_id");`);

    this.addSql(`create table "screening" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "owner_id" int not null, "conversation_id" int not null, "status" varchar(255) not null, "token_metadata_id" int null, "project_summary_description" text null, "conversation_tokens" int not null, "project_summary_project_name" varchar(255) null, "founder_info_name" varchar(255) null, "start_time" timestamptz null, "project_summary_duplicate_score" real null, "founder_info_role" varchar(255) null, "time_limit_seconds" int not null, "project_summary_duplicate_name" varchar(255) null, "founder_info_social_media" varchar(255) null, "project_summary_duplicate_description" text null, "follow_on_pitch_id" int null);`);
    this.addSql(`alter table "screening" add constraint "screening_conversation_id_unique" unique ("conversation_id");`);
    this.addSql(`alter table "screening" add constraint "screening_token_metadata_id_unique" unique ("token_metadata_id");`);
    this.addSql(`alter table "screening" add constraint "screening_follow_on_pitch_id_unique" unique ("follow_on_pitch_id");`);

    this.addSql(`alter table "conversation_message" add constraint "conversation_message_conversation_id_foreign" foreign key ("conversation_id") references "conversation" ("id") on update cascade;`);

    this.addSql(`alter table "pitch" add constraint "pitch_owner_id_foreign" foreign key ("owner_id") references "sebu_user" ("id") on update cascade;`);
    this.addSql(`alter table "pitch" add constraint "pitch_conversation_id_foreign" foreign key ("conversation_id") references "conversation" ("id") on update cascade;`);
    this.addSql(`alter table "pitch" add constraint "pitch_token_metadata_id_foreign" foreign key ("token_metadata_id") references "token_metadata" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "screening" add constraint "screening_owner_id_foreign" foreign key ("owner_id") references "sebu_user" ("id") on update cascade;`);
    this.addSql(`alter table "screening" add constraint "screening_conversation_id_foreign" foreign key ("conversation_id") references "conversation" ("id") on update cascade;`);
    this.addSql(`alter table "screening" add constraint "screening_token_metadata_id_foreign" foreign key ("token_metadata_id") references "token_metadata" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "screening" add constraint "screening_follow_on_pitch_id_foreign" foreign key ("follow_on_pitch_id") references "pitch" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "conversation_message" drop constraint "conversation_message_conversation_id_foreign";`);

    this.addSql(`alter table "pitch" drop constraint "pitch_conversation_id_foreign";`);

    this.addSql(`alter table "screening" drop constraint "screening_conversation_id_foreign";`);

    this.addSql(`alter table "pitch" drop constraint "pitch_owner_id_foreign";`);

    this.addSql(`alter table "screening" drop constraint "screening_owner_id_foreign";`);

    this.addSql(`alter table "pitch" drop constraint "pitch_token_metadata_id_foreign";`);

    this.addSql(`alter table "screening" drop constraint "screening_token_metadata_id_foreign";`);

    this.addSql(`alter table "screening" drop constraint "screening_follow_on_pitch_id_foreign";`);

    this.addSql(`drop table if exists "conversation" cascade;`);

    this.addSql(`drop table if exists "conversation_message" cascade;`);

    this.addSql(`drop table if exists "sebu_user" cascade;`);

    this.addSql(`drop table if exists "token_metadata" cascade;`);

    this.addSql(`drop table if exists "pitch" cascade;`);

    this.addSql(`drop table if exists "screening" cascade;`);

    this.addSql('drop extension if exists vector;');
  }

}
