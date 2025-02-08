
import { Embeddable, Property } from "@mikro-orm/core";

@Embeddable()
export class PaymentInfo  {

    @Property()
    txnHash?: string;

    @Property()
    amount: number;

    @Property()
    payDate: Date;

    @Property()
    slotNumber: number;

    @Property()
    roundNumber: number;
}