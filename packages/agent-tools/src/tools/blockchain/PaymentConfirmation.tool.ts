import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { AToolRepo, IAgentTool } from "../../services";
import { z, ZodSchema } from "zod";
import { ConfigService } from "@nestjs/config";
import { ADataStoreFactory, APitchStore, AScreeningStore, AUserStore, Conversation, ConversationMessage, FounderInfo, LockCodes, PaymentInfo, Pitch, Screening, SebuUser } from "@sebu/db-models";
import { ethers, Interface, JsonRpcProvider, TransactionLike, TransactionReceipt } from "ethers";
import {SebuMasterABI} from "@sebu/smartcontracts";
import { VectorGenerator } from "../duplication";
import {ContractAddresses, PitchStatus} from "@sebu/dto";

const params: ZodSchema = z.object({
    paymentChainId: z.number().describe("The chain id for the blockchain network where payment was made"),
    txnHash: z.string().describe("The transaction hash for the payment to confirm"),
    screeningSessionId: z.number().describe("The current screening session id for the pitch"),
    userWalletAddress: z.string().describe("The wallet address of the user making the payment")
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type PaymentConfirmationInputType = z.infer<typeof params>;

export interface IPaymentConfirmation {
    pitchId: number;
    scheduledSlot: number;
    scheduledRound: number;
    error?: string;
}

interface ICreateOpts {
    input: PaymentConfirmationInputType,
    user: SebuUser,
    payment: PaymentInfo,
    pitchIsNextUp: boolean,
    screening: Screening,
    onChainPitchId?: number,
    pitch?: Pitch
}

@Injectable()
export class PaymentConfirmationTool implements IAgentTool<IPaymentConfirmation> , OnModuleInit {
    name: string = 'pitch-payment-confirmation';
    description: string = `Confirms payment for a pitch and schedules pitch slot if payment is confirmed`;
    schema: ZodSchema = params;

    expectedChainId: number;
    provider: JsonRpcProvider;
    pitchTimeLimit: number = 10 * 60; 
    log: Logger = new Logger(PaymentConfirmationTool.name);
    sebuAddress: string;
    constructor(
        readonly repo: AToolRepo,
        readonly config: ConfigService,
        readonly ds: ADataStoreFactory,
        readonly embedding: VectorGenerator
    ) {
        this.expectedChainId = +this.config.getOrThrow("rpc.chainId");
        const url = this.config.getOrThrow(`rpc.${this.expectedChainId}.url`);
        this.provider = new JsonRpcProvider(url);
        const tl = config.get<number>('sebu.evaluation.timeLimitMinutes');
        if(tl) {
            this.pitchTimeLimit = tl * 60;
        }
        this.sebuAddress = ContractAddresses[this.expectedChainId].SebuMaster;
    }

    async invoke(input: PaymentConfirmationInputType): Promise<IPaymentConfirmation> {
        //we need to wait for the pitch to be confirmed on chain and stored in the db
        //if we timeout, we try to do it manually
        const user = await this.ds.readOnlyContext(async (ctx) => {
            const us = ctx.getDataStore(AUserStore);
            return await us.findByWalletAddress(input.userWalletAddress);
        });
        if(!user) {
            return {
                pitchId: -1,
                scheduledSlot: -1,
                scheduledRound: -1,
                error: `User not found for wallet address ${input.userWalletAddress}`
            }
        }

        const screening = await this.ds.readOnlyContext(async (ctx) => {
            const ss = ctx.getDataStore(AScreeningStore);
            return await ss.findById(input.screeningSessionId, true);
        });
        if(!screening) {
            return {
                pitchId: -1,
                scheduledSlot: -1,
                scheduledRound: -1,
                error: `Screening session not found for id ${input.screeningSessionId}`
            }
        }

        const getPending = async () => {
            return await this.ds.lockedWriteContext(LockCodes.PitchStoreLock, async (ctx) => {  
                const ps = ctx.getDataStore(APitchStore);
                return await ps.findUnresolvedPaidPitch(user);
            });
        }

        let delay = 1000;
        let expiry = Date.now() + 15000; //wait up to 15 secs for the transaction to be confirmed
        let lastError: any;
        let pitch = await getPending();
        while(!pitch && Date.now() < expiry) {
            await sleep(delay);
            pitch = await getPending();
        }
        if(!pitch) {
            return await this.invokeOld(input);
        } else {
            const p = await this.createOrUpdatePitch({
                input,
                user,
                payment: pitch.payment,
                pitchIsNextUp: pitch.status === PitchStatus.LIVE,
                screening,
                onChainPitchId: pitch.onChainPitchId,
                pitch
            });
            return {
                pitchId: p.id,
                scheduledSlot: +p.payment.slotNumber,
                scheduledRound: +p.payment.roundNumber
            }
        }
    }

    async invokeOld(input: PaymentConfirmationInputType): Promise<IPaymentConfirmation> {
        /**
         * - Confirms transaction on-chain
         * - Extracts payment information from receipt event data (decode using sebu master abi)
         * - Creates a new pitch with payment information and current screening session id
         */
        if(input.paymentChainId !== this.expectedChainId) {
            return {
                pitchId: -1,
                scheduledSlot: -1,
                scheduledRound: -1,
                error: `Payment cannot be confirmed on chain ${input.paymentChainId}. It does not match the expected chain id ${this.expectedChainId}`
            }
        }
        this.log.log({args: input});

        let delay = 1000;
        let expiry = Date.now() + 15000; //wait up to 15 secs for the transaction to be confirmed
        let lastError: any;
        let txn: TransactionLike | undefined;
        while(Date.now() < expiry) {
            try {
                lastError = null;
                if(!txn) {
                    txn = await this.provider.getTransaction(input.txnHash);
                }
                if(txn) {
                    this.log.log({txn});
                    if(txn.from.toLowerCase() !== input.userWalletAddress.toLowerCase()) {
                        return {
                            pitchId: -1,
                            scheduledSlot: -1,
                            scheduledRound: -1,
                            error: `Payment was not made by the expected wallet: ${input.userWalletAddress} does not match the txn wallet address ${txn.from}`
                        };
                    }
                }
                const r = await this.provider.getTransactionReceipt(input.txnHash);
                if(r) {
                    this.log.log({receipt: r});
                    return await this.createPitch(input, r);
                }

                await sleep(delay);
            } catch (error) {
                lastError = error;
                await sleep(delay);
            }
        }

        if(lastError) {
            return {
                pitchId: -1,
                scheduledSlot: -1,
                scheduledRound: -1,
                error: lastError.message
            }
        }

    }

    async onModuleInit() {
        this.repo.register(this);
    }

    async createPitch(input: PaymentConfirmationInputType, receipt: TransactionReceipt): Promise<IPaymentConfirmation> {
        const ifc = new Interface(SebuMasterABI);
        const events = receipt.logs.map((log) => {
            try {
                if(log.address.toLowerCase() === this.sebuAddress.toLowerCase()) {
                    return ifc.parseLog(log);
                } else {
                    return null;
                }
            } catch (e) {
                return null;
            }
        }).filter((event) => event !== null);
        const byName = events.reduce((acc, event) => {
            acc[event.name] = event;
            return acc;
        }, {} as Record<string, any>);
        this.log.log({events, byName});
        const newPitchEvent = byName['NewPitch'];
        const nextUp = byName['NewPitchUp'];
        if(!newPitchEvent) {
            throw new Error('no new pitch event found');
        }
        const args = newPitchEvent.log?.args || newPitchEvent.args;
        const [_founder,_tokenToPitch, _pitchId, _round, _slot, _feeAmount] = args;
        const payment = new PaymentInfo();
        payment.amount = +ethers.formatUnits(_feeAmount, 6);
        payment.txnHash = input.txnHash;
        payment.payDate = new Date();
        payment.roundNumber = _round;
        payment.slotNumber = _slot;
        const [user,screening] = await this.ds.readOnlyContext(async (ctx) => {
            const us = ctx.getDataStore(AUserStore);
            const ss = ctx.getDataStore(AScreeningStore);
            const u = await us.findByWalletAddress(input.userWalletAddress);
            const s = await ss.findById(input.screeningSessionId, true);
            return [u, s];
        });
        const pitch = await this.createOrUpdatePitch({
            input,
            user,
            payment,
            pitchIsNextUp: !!nextUp,
            screening,
            onChainPitchId: +_pitchId.toString()
        });

        return {
            pitchId: pitch.id,
            scheduledSlot: +(_slot.toString()),
            scheduledRound: +(_round.toString())
        }
    }
    
    async createOrUpdatePitch(opts: ICreateOpts): Promise<Pitch> {
        const {user, payment, pitchIsNextUp, screening, pitch} = opts;
        return await this.ds.lockedWriteContext(LockCodes.PitchStoreLock, async (ctx) => {
            const ps = ctx.getDataStore(APitchStore);
            const ss = ctx.getDataStore(AScreeningStore);

            const test = pitch || await ps.findUnresolvedPaidPitch(user);
            const embedding = await this.embedding.invoke({text: screening.projectSummary.description});
            //this.log.log("Embedding generated", embedding);
            if(!embedding.length) {
                throw new Error("Failed to generate embedding for pitch");
            }

            const p = test || new Pitch();
            p.onChainPitchId = opts.onChainPitchId;
            p.founderInfo = new FounderInfo();
            p.founderInfo.name = screening.founderInfo.name;
            p.founderInfo.role = screening.founderInfo.role;
            p.founderInfo.socialMedia = screening.founderInfo.socialMedia;
            p.owner = screening.owner;
            p.projectSummary = screening.projectSummary;
            p.embedding = embedding;
            p.conversation = new Conversation();
            p.conversationTokens = 0;
            p.screeningId = screening.id;
            p.status = pitchIsNextUp ? PitchStatus.LIVE : PitchStatus.QUEUED;
            p.timeLimitSeconds = this.pitchTimeLimit;
            p.tokenMetadata = screening.tokenMetadata;

            if(!screening.owner.pitches.isInitialized(true)) {
                await screening.owner.pitches.init();
            }
            screening.owner.pitches.add(p);
            screening.followOnPitch = p;
            p.payment = payment;

            const summaryEntry = new ConversationMessage();
            summaryEntry.conversation = p.conversation;
            summaryEntry.sender = 'aime';
            summaryEntry.role = 'assistant';
            summaryEntry.isInjected = true;
            summaryEntry.content = `FROM EXECUTIVE ASSISTANT: Here is a summary of this pitch
                - Description: ${screening.projectSummary.description}
                - Person Pitching: ${screening.founderInfo.name}
                - Person's Role: ${screening.founderInfo.role}
                - Project: ${screening.projectSummary.projectName}
                - Twitter Handle: ${screening.founderInfo.socialMedia}
                - TokenMetadata: ${JSON.stringify({
                    chainId: screening.tokenMetadata.chain,
                    symbol: screening.tokenMetadata.symbol,
                    name: screening.tokenMetadata.name,
                    decimals: screening.tokenMetadata.decimals,
                    address: screening.tokenMetadata.address,
                    volume: screening.tokenMetadata.volume,
                    marketCap: screening.tokenMetadata.market_cap,
                    price: screening.tokenMetadata.price,
                })}
            `;
            if(screening.projectSummary.duplicateScore > 0) {
                summaryEntry.content += `\n- This project is similar to another we have already seen: ${screening.projectSummary.duplicateName} described as ${screening.projectSummary.duplicateDescription}`;
            }
            p.conversation.messages.add(summaryEntry);
            await ss.save(screening);
            return p;
        });
    }
}