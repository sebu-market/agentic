import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ITxnHandler, ITxnInput } from "./txnRouter.service";
import { ConfigService } from "@nestjs/config";
import { TxnRouterService } from "./txnRouter.service";
import { ADataStoreFactory, APitchStore, Pitch } from "@sebu/db-models";
import { PaymentHandler } from "./PaymentHandler";
import { NextPitchHandler } from "./NextPitchHandler";
import { PitchStatus } from "@sebu/dto";

@Injectable()
export class PitchRelatedEventHandler implements OnModuleInit, ITxnHandler {

    private eventOfInterest = [
        'NewPitch', 'NewPitchUp', 'NewPitchQueued', 'PitchInvalidated'
    ];
    
    payToken: string;
    log: Logger = new Logger(PitchRelatedEventHandler.name);
    constructor(
        readonly config: ConfigService,
        readonly router: TxnRouterService,
        readonly ds: ADataStoreFactory,
        readonly payment: PaymentHandler,
        readonly nextUp: NextPitchHandler
    ) {
    }

    onModuleInit() {
        this.router.subscribe(this.eventOfInterest, this);
    }

    async inboundTxn(txn: ITxnInput): Promise<void> {
        /**
         * The order of processing pitch related events is important. Namely, if a payment was made,
         * it must be first to handle the update because it adds payment and slot details to the DB.
         * After that, we need to handle the next pitch up event to update the DB with the new pitch.
         */
        this.log.debug('inboundTxn', txn);
        const byName = txn.decodedLogs.reduce((acc, log) => {
            if(!acc[log.log.name.toLowerCase()]) {
                acc[log.log.name.toLowerCase()] = [];
            }
            acc[log.log.name.toLocaleLowerCase()].push(log);
            return acc;
        }, {});
        this.log.debug("Decoded logs by name", byName);
        const payment = byName['newpitch'][0];
        let pitch: Pitch | undefined;
        if(payment) {
            this.log.debug("Handling payment event");
            pitch = await this.payment.inboundTxn(txn);
        }
        if(!pitch) {
            //likely already handled it
            this.log.warn({
                msg: "Possible duplicate processing of pitch",
                txnHash: txn.hash,
                newPitchEvent: payment
            });
            return;
        }
        
        const nextUp = byName['newpitchup'][0];
        const queued = byName['newpitchqueued'][0];
        if(nextUp) {
            this.log.debug("Setting up next pitch");
            pitch = await this.nextUp.inboundTxn(txn, pitch);
        }
        if(queued) {
            this.log.debug("Handling queued pitch");
            pitch.status = PitchStatus.QUEUED;
            await this.ds.readWriteContext(async (ctx) => {
                const store = ctx.getDataStore(APitchStore);
                await store.save(pitch);
            });
        }
        //TODO: add invalidation handler
    }
}