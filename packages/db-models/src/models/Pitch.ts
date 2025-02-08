import { Embedded, Entity, Property } from "@mikro-orm/core";
import { BaseSession } from "./BaseSession";
import { PaymentInfo } from "./PaymentInfo";
import { TokenEvaluation } from "./TokenEvaluation";
import { VectorType } from "../types/VectorType";

@Entity()
export class Pitch extends BaseSession {

    @Property()
    screeningId: number;

    @Property()
    onChainPitchId: number;

    @Embedded({
        nullable: true
    })
    payment?: PaymentInfo;

    @Embedded({
        nullable: true
    })
    evaluation?: TokenEvaluation;

    @Property({ type: VectorType, length: 1536 , nullable: true})
    embedding?: number[];
}