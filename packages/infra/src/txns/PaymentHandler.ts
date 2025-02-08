import { Injectable, Logger } from "@nestjs/common";
import { ADataStoreFactory, APitchStore, AUserStore, Conversation, LockCodes, PaymentInfo, Pitch } from "@sebu/db-models";
import { ethers } from "ethers";
import { ITxnInput } from "./txnRouter.service";
import { PitchStatus } from "@sebu/dto";
import { ConfigService } from "@nestjs/config";
@Injectable()
export class PaymentHandler  {

    log: Logger = new Logger(PaymentHandler.name);
    pitchTimeLimit: number = 10 * 60; 
    constructor(
        readonly ds: ADataStoreFactory,
        readonly config: ConfigService
    ) {
        const tl = config.get<number>('sebu.evaluation.timeLimitMinutes');
        if(tl) {
            this.pitchTimeLimit = tl * 60;
        }
    }

    async inboundTxn(txn: ITxnInput): Promise<Pitch | undefined> {
        //need to find the pitch associated with the pitch sent on chain and add payment info to it
        const newPitchEvent = txn.decodedLogs.filter(log => log.log.name.toLowerCase() === 'newpitch')[0];
        if(!newPitchEvent) {
            throw new Error('no new pitch event found');
        }

        const nextUp = txn.decodedLogs.filter(log => log.log.name.toLowerCase() === 'newpitchup')[0];
        //setup payment structure based on new pitch event data
        const [_founder,_tokenToPitch, _pitchId, _round, _slot, _feeAmount] = newPitchEvent.log.args;
        return  await this.ds.lockedWriteContext(LockCodes.PitchStoreLock, async (ctx) => {
            
            const ps = ctx.getDataStore(APitchStore);

            //see if a pitch has already been created with this txn hash 
            const match = await ps.findByOnChainPitchId(_pitchId);
            if(match) {
                return undefined;
            }

            const us = ctx.getDataStore(AUserStore);

            const user = await us.findByWalletAddress(txn.from.toString());
            if(!user) {
                throw new Error('user not found');
            }
            const p = new Pitch();
            p.onChainPitchId = _pitchId;
            p.owner = user;
            p.conversation = new Conversation();
            p.conversationTokens = 0;
            p.screeningId = -1; //used by screening tool to match up with user's screening session
            p.status = nextUp ? PitchStatus.LIVE : PitchStatus.QUEUED;
            p.timeLimitSeconds = this.pitchTimeLimit;
            
            const payment = new PaymentInfo();
            payment.amount = +ethers.formatUnits(_feeAmount, 6);
            payment.txnHash = txn.hash;
            payment.payDate = new Date();
            payment.roundNumber = _round;
            payment.slotNumber = _slot;
            p.payment = payment;

            user.pitches.add(p);
            await us.save(user);
            return p;
        });
        
    }
}