import { Entity, ManyToOne, OneToOne, Property } from "@mikro-orm/core";
import { SebuUser } from "./SebuUser";
import { ABaseEntity } from "./ABaseEntity";

/**
 * This entity represents the limbo state funds are in while the investor waits for the
 * round to complete and have their portion of the total round be converted to LP tokens pro-rata.
 */
@Entity()
export class PendingLPDistribution extends ABaseEntity {

    @ManyToOne(() => SebuUser)
    owner:  SebuUser;

    @Property()
    round: number;

    @Property({type: 'bigint'})
    amount: bigint;
}