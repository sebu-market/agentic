import { Entity, OneToOne, Property } from "@mikro-orm/core";
import { ABaseEntity } from "./ABaseEntity";
import { Pitch } from "./Pitch";

@Entity()
export class InvestmentRound extends ABaseEntity {

    @Property()
    round: number;

    @Property({type: 'bigint'})
    fundsRaised: bigint;

    @OneToOne(() => Pitch, {nullable: true})
    leadingPitch?: Pitch;

    @Property()
    secondsRemaining: number;

    @Property()
    isCurrent: boolean;
}