import { Injectable, Logger } from "@nestjs/common";
import { ITxnInput } from "./txnRouter.service";
import { ADataStoreFactory, APitchStore, Pitch } from "@sebu/db-models";
import { PitchStatus } from "@sebu/dto";

@Injectable()
export class NextPitchHandler {

    log: Logger = new Logger(NextPitchHandler.name);
    constructor(
        readonly ds: ADataStoreFactory
    ) {

    }

    async inboundTxn(txn: ITxnInput, pitch?: Pitch): Promise<Pitch | undefined> {
        return await this.ds.readWriteContext(async (ctx) => {
            const nextEvt = txn.decodedLogs.filter(log => log.log.name.toLowerCase() === 'newpitchup')[0];
            if(!nextEvt) {
                throw new Error('no new pitch up event found');
            }
            const [_founder,_tokenToPitch, _slot] = nextEvt.log.args;
            const store = ctx.getDataStore(APitchStore);
            if(!pitch) {
                pitch = await store.findBySlot(+_slot.toString());
            }
            if(!pitch) {
                this.log.error('no pitch found matching on-chain slot', {
                    slot: _slot,
                    token: _tokenToPitch,
                    founder: _founder
                });
                return;
            }

            if(_slot > 0n) {
                const prev = await store.findBySlot((+_slot.toString()) - 1);
                if(prev && prev.status === PitchStatus.EVALUATED) {
                    prev.status = PitchStatus.COMPLETED;
                    await store.save(prev);
                }
            }

            if(pitch.status === PitchStatus.COMPLETED) {
                this.log.error('pitch is already complete', {
                    slot: _slot,
                    token: _tokenToPitch,
                    founder: _founder
                });
                return;
            }

            pitch.status = PitchStatus.LIVE;
            pitch = await store.save(pitch);
            this.log.log("Pitch with id " + pitch.id + " is now live");
            return pitch;
                
            
        });
    }
}