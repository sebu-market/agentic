import { Cascade, Collection, Entity, OneToMany, OneToOne, Property } from "@mikro-orm/core";
import { ABaseEntity } from "./ABaseEntity";
import { Pitch } from "./Pitch";
import { Screening } from "./Screening";
import { InvestorPortfolio } from "./InvestorPortfolio";
import { PendingLPDistribution } from "./PendingLPDistribution";

@Entity()
export class SebuUser extends ABaseEntity {

    @Property({
        onCreate(entity: SebuUser) {
            return entity?.user_wallet?.toLowerCase();
        },
        onUpdate(entity: SebuUser) {
            return entity?.user_wallet?.toLowerCase();
        },
        nullable: false
    })
    user_wallet: string;

    @OneToMany(() => Screening, session => session.owner, {
        orphanRemoval: true,
        cascade: [Cascade.ALL]
    })
    screenings = new Collection<Screening>(this);

    @OneToMany(() => Pitch, session => session.owner, {
        orphanRemoval: true,
        cascade: [Cascade.ALL]
    })
    pitches = new Collection<Pitch>(this);

    @OneToOne(() => InvestorPortfolio, {nullable: true})
    investorPortfolio?: InvestorPortfolio;
    
    @OneToMany(() => PendingLPDistribution, pending => pending.owner)
    pendingLPDistributions = new Collection<PendingLPDistribution>(this);

}