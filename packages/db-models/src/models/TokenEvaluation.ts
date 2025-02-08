import { Embeddable, Property } from "@mikro-orm/core";

@Embeddable()
export class TokenEvaluation {

    @Property()
    apingIn: boolean;

    @Property()
    moonPotentialScore: number;

    @Property()
    confidence: number;

    @Property()
    bullishFactors: string[];

    @Property()
    redFlags: string[];
}