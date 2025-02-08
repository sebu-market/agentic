import { Entity, OneToOne, Property } from "@mikro-orm/core";
import { ABaseEntity } from "./ABaseEntity";
import { SebuUser } from "./SebuUser";

@Entity()
export class InvestorPortfolio extends ABaseEntity {

    @OneToOne(() => SebuUser)
    owner: SebuUser;

    @Property({type: 'bigint'})
    lpShares: bigint;

    @Property({type: 'bigint'})
    availableForWithdrawal: bigint;

}