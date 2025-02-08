import { Entity, Property } from "@mikro-orm/core";
import { ABaseEntity } from "./ABaseEntity";

@Entity()
export class TokenMetadata extends ABaseEntity {

    @Property({
        onCreate: (e: TokenMetadata) => e.address.toLowerCase()
    })
    address: string;

    @Property()
    chain: number;

    @Property({
        type: "float",
        nullable: true
    })
    price?: number;

    @Property({
        type: "float",
        nullable: true
    })
    market_cap?: number;

    @Property({
        type: "float",
        nullable: true
    })
    volume?: number;

    @Property({
        nullable: true
    })
    supply?: number;

    @Property()
    name: string;

    @Property()
    decimals: number;

    @Property()
    symbol: string;

    @Property({
        nullable: true
    })
    lastPriceCheck?: Date;

}