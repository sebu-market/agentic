import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ILogDescription, ITxnHandler, ITxnInput } from "./TxnRouterService";
import { ConfigService } from "@nestjs/config";
import { TxnRouterService } from "./TxnRouterService";
import { ADataStoreFactory, AInvestmentRoundStore, APendingLPStore, AUserStore, InvestmentRound, InvestorPortfolio, LockCodes, PendingLPDistribution, SebuUser } from "@sebu/db-models";

@Injectable()
export class RoundRelatedEventHandler implements OnModuleInit, ITxnHandler {

    private eventOfInterest = [
        'RoundClosed', 'Investment'
    ];
    
    payToken: string;
    log: Logger = new Logger(RoundRelatedEventHandler.name);
    roundDurationSeconds: number;
    constructor(
        readonly config: ConfigService,
        readonly router: TxnRouterService,
        readonly ds: ADataStoreFactory
    ) {
        this.roundDurationSeconds = +config.getOrThrow('rounds.durationSeconds');
    }

    onModuleInit() {
        this.router.subscribe(this.eventOfInterest, this);
    }

    async inboundTxn(txn: ITxnInput): Promise<void> {
        this.log.debug('inboundTxn', txn);
        const byName: Map<string, ILogDescription[]> = new Map();
        txn.decodedLogs.forEach((log) => {
            const nm = log.log.name.toLowerCase();
            let hits: ILogDescription[] = byName.get(nm);
            if(!hits) {
                hits = [];
                byName.set(nm,hits);
            }
            hits.push(log);
        });
        this.log.debug("Decoded logs by name", byName);
        const closed = byName.has('roundclosed') ? byName.get('roundclosed')[0] : undefined;
        if(closed) {
            await this.handleRoundClosed(txn, byName, closed);
        }
        const investment = byName.has('investment') ? byName.get('investment')[0] : undefined;
        if(investment) {
            await this.handleInvestment(txn, byName, investment);
        }
    }

    async handleRoundClosed(txn: ITxnInput, byName: Map<string, ILogDescription[]>, log: ILogDescription): Promise<void> {
        /**
         * We must use a distributed lock to prevent a race between investors making investment in 
         * a round and the current round closing. On chain activity can arrive out of order
         * creating a race between which txn notification causes the next round to be created.
         */
        await this.ds.lockedWriteContext(LockCodes.InvestorPortfolioLock, async (ctx) => {
            const rs = ctx.getDataStore(AInvestmentRoundStore);
            const current = (+log.log.args[0].toString());
            const nextRd = current+1;
            let round = await rs.findByRound(current);
            if(!round) {
                round = new InvestmentRound();
                round.round = current;
            }
            round.isCurrent = false;
            round.fundsRaised = log.log.args[1];
            round.secondsRemaining = 0;
            await rs.save(round);
            
            let next = await rs.findByRound(nextRd);
            if(!next) {
                next = new InvestmentRound();
                next.isCurrent = true;
                next.round = nextRd;
                next.fundsRaised = 0n;
                next.secondsRemaining = this.roundDurationSeconds;
                await rs.save(next);
            }
        });
    }

    async handleInvestment(txn: ITxnInput, byName: Map<string, ILogDescription[]>, log: ILogDescription): Promise<void> {  
        const round = +log.log.args[1].toString();
        const investor = log.log.args[0];
        const amount:bigint = BigInt(log.log.args[2]);
        this.log.log({
            msg: "Investment",
            round,
            investor,
            amount  
        });
        await this.ds.lockedWriteContext(LockCodes.InvestorPortfolioLock, async (ctx) => {
            const rs = ctx.getDataStore(AInvestmentRoundStore);
            const us = ctx.getDataStore(AUserStore);
            const plps = ctx.getDataStore(APendingLPStore);

            let user = await us.findByWalletAddress(investor.toLowerCase());
            if(!user) {
                this.log.error(`Creating new user from investment: ${investor}`);
                user = new SebuUser();
                user.user_wallet = investor;
                user = await us.save(user);
            } 
            let ip = user.investorPortfolio;
            if(!ip) {
                ip = new InvestorPortfolio();
                ip.owner = user;
                ip.lpShares = 0n;
                ip.availableForWithdrawal = 0n;
                user.investorPortfolio = ip;
            }
            let pendingLp = await plps.findByWalletAddressAndRound(round, investor.toLowerCase());
            if(!pendingLp) {
                if(!user.pendingLPDistributions.isInitialized(true)) {
                    await user.pendingLPDistributions.init();
                }
                pendingLp = new PendingLPDistribution();
                pendingLp.owner = user;
                pendingLp.round = round;
                user.pendingLPDistributions.add(pendingLp);
            }
            pendingLp.amount = BigInt(pendingLp.amount||0) + amount;
            await us.save(user);
            
            const prev = await rs.findByRound(round-1);
            if(prev) {
                prev.isCurrent = false;
                await rs.save(prev);
            }
            
            let r = await rs.findByRound(round);
            if(!r) {
                r = new InvestmentRound();
                r.round = round;
                r.secondsRemaining = this.roundDurationSeconds;
                r.isCurrent = true;
            }
            r.fundsRaised = BigInt(r.fundsRaised||0) + amount;
            await rs.save(r);
        });
    }
}