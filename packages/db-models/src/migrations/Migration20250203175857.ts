import { Migration } from '@mikro-orm/migrations';

export class Migration20250203175857 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "sebu_portfolio" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "total_lpshares" int not null);`);

    this.addSql(`create table "investor_portfolio" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "owner_id" int not null, "lp_shares" bigint not null, "available_for_withdrawal" bigint not null);`);
    this.addSql(`alter table "investor_portfolio" add constraint "investor_portfolio_owner_id_unique" unique ("owner_id");`);

    this.addSql(`create table "investment_round" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "round" int not null, "funds_raised" int not null, "leading_pitch_id" int null, "seconds_remainig" int not null, "is_current" boolean not null);`);
    this.addSql(`alter table "investment_round" add constraint "investment_round_leading_pitch_id_unique" unique ("leading_pitch_id");`);

    this.addSql(`create table "token_position" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "amount" bigint not null default 0, "token_metadata_id" int not null, "portfolio_id" int not null);`);
    this.addSql(`alter table "token_position" add constraint "token_position_token_metadata_id_unique" unique ("token_metadata_id");`);

    this.addSql(`alter table "investor_portfolio" add constraint "investor_portfolio_owner_id_foreign" foreign key ("owner_id") references "sebu_user" ("id") on update cascade;`);

    this.addSql(`alter table "investment_round" add constraint "investment_round_leading_pitch_id_foreign" foreign key ("leading_pitch_id") references "pitch" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "token_position" add constraint "token_position_token_metadata_id_foreign" foreign key ("token_metadata_id") references "token_metadata" ("id") on update cascade;`);
    this.addSql(`alter table "token_position" add constraint "token_position_portfolio_id_foreign" foreign key ("portfolio_id") references "sebu_portfolio" ("id") on update cascade;`);

    this.addSql(`alter table "sebu_user" add column "investor_portfolio_id" int null;`);
    this.addSql(`alter table "sebu_user" add constraint "sebu_user_investor_portfolio_id_foreign" foreign key ("investor_portfolio_id") references "investor_portfolio" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "sebu_user" add constraint "sebu_user_investor_portfolio_id_unique" unique ("investor_portfolio_id");`);

    this.addSql(`alter table "pitch" alter column "conversation_tokens" type int using ("conversation_tokens"::int);`);
    this.addSql(`alter table "pitch" alter column "conversation_tokens" set default 0;`);

    this.addSql(`alter table "screening" alter column "conversation_tokens" type int using ("conversation_tokens"::int);`);
    this.addSql(`alter table "screening" alter column "conversation_tokens" set default 0;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "token_position" drop constraint "token_position_portfolio_id_foreign";`);

    this.addSql(`alter table "sebu_user" drop constraint "sebu_user_investor_portfolio_id_foreign";`);

    this.addSql(`drop table if exists "sebu_portfolio" cascade;`);

    this.addSql(`drop table if exists "investor_portfolio" cascade;`);

    this.addSql(`drop table if exists "investment_round" cascade;`);

    this.addSql(`drop table if exists "token_position" cascade;`);

    this.addSql(`alter table "sebu_user" drop constraint "sebu_user_investor_portfolio_id_unique";`);
    this.addSql(`alter table "sebu_user" drop column "investor_portfolio_id";`);

    this.addSql(`alter table "pitch" alter column "conversation_tokens" drop default;`);
    this.addSql(`alter table "pitch" alter column "conversation_tokens" type int using ("conversation_tokens"::int);`);

    this.addSql(`alter table "screening" alter column "conversation_tokens" drop default;`);
    this.addSql(`alter table "screening" alter column "conversation_tokens" type int using ("conversation_tokens"::int);`);
  }

}
