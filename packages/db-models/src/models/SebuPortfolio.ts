import { Collection, Entity, OneToMany, Property } from "@mikro-orm/core";
import { ABaseEntity } from "./ABaseEntity";
import { TokenPosition } from "./TokenPosition";

@Entity()
export class SebuPortfolio extends ABaseEntity {

    @Property()
    totalLPShares: number;

    @OneToMany(() => TokenPosition, tp => tp.portfolio)
    positions = new Collection<TokenPosition>(this);
}