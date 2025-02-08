import { Entity, ManyToOne, OneToOne, Property } from "@mikro-orm/core";
import { ABaseEntity } from "./ABaseEntity";
import { TokenMetadata } from "./TokenMetada";
import { SebuPortfolio } from "./SebuPortfolio";

@Entity()
export class TokenPosition extends ABaseEntity {

    @Property({type: 'bigint'})
    amount: bigint = 0n;

    @OneToOne(() => TokenMetadata)
    tokenMetadata: TokenMetadata;

    @ManyToOne(() => SebuPortfolio)
    portfolio: SebuPortfolio;
}