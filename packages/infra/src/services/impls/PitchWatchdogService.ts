import { Injectable, Logger } from "@nestjs/common";
import { Sebu } from "@sebu/agents";;
import { ADataStoreFactory, APitchStore, Pitch } from "@sebu/db-models";

@Injectable()
export class PitchWatchdogService {

    log: Logger = new Logger(PitchWatchdogService.name);
    constructor(
        readonly ds: ADataStoreFactory,
        readonly sebu: Sebu

    ) {}

    public async run() {
        /**
         * 1. Get current active pitch; if none, bail out
         * 2. See if the pitch has expired; if not, bail out
         * 3. If we've gone past expiration by at least 30s, generate a message from Aime to Sebu, 
         *    add it to the pitch's conversation, then generate a message to Sebu through message bus
         *    indicating that the user disconnected and ask him to create evaluation as is. 
         * 4. In the client callback, post Sebu's final evaluation
         */
        let pitch: Pitch | null= null;
        try {
            pitch = await this.ds.readWriteContext(async ctx => {

                const pStore = ctx.getDataStore(APitchStore);
                const activePitch = await pStore.findActivePitch();
                if(!activePitch) {
                    this.log.debug('No active pitch');
                    return;
                }
                if(!activePitch.startTime) {
                    this.log.debug('Pitch has not started yet');
                    return;
                }
                const expired = Math.floor(activePitch.startTime.getTime()/1000) + activePitch.timeLimitSeconds;
                const now = Math.floor(Date.now() / 1000);
                if(now < expired) {
                    this.log.debug('Pitch has not expired yet');
                    return;
                }
                if(now - expired < 30) {
                    this.log.debug('Pitch has not expired for long enough yet');
                    return;
                }
                return activePitch;
                
            });
        } catch (e) {
            this.log.error(e);
            throw e;
        }

        if(!pitch) {
            return;
        }

        await this.sebu.finishEvaluation(pitch);
    }
}