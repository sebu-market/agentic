import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ADataStoreFactory, AInvestorPortfolioStore, APendingLPStore } from "@sebu/db-models";
import { ILogDescription, ITxnHandler, ITxnInput, TxnRouterService } from "./txnRouter.service";

@Injectable()
export class MintRelatedEventHandler implements OnModuleInit, ITxnHandler {

    private eventOfInterest = [
        'MintLPShares'
    ];
    
    payToken: string;
    log: Logger = new Logger(MintRelatedEventHandler.name);
    sebuLPTokenAddress: string;
    constructor(
        readonly config: ConfigService,
        readonly router: TxnRouterService,
        readonly ds: ADataStoreFactory
    ) {
        this.sebuLPTokenAddress = config.getOrThrow('contracts.lpToken');
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
        const mint = byName.has('mintlpshares') ? byName.get('mintlpshares')[0] : undefined;
        if(mint) {
            await this.handleMint(txn, byName, mint);
        }
    }

    async handleMint(txn: ITxnInput, byName: Map<string, ILogDescription[]>, log: ILogDescription): Promise<void> {
        /**
         * The mint log event has the round and array of investors that have minted shares.
         * We need to look for matching transfer events for the LP tokens and pair it up 
         * with the investor address to know how many shares they get.
         */
        const round = +log.log.args[0].toString();
        const investors: string[] = log.log.args[1];
        const transfersByReceiver: Map<string, ILogDescription> = new Map();
        for(const l of byName.get('transfer')) {
            if(l.address.toLowerCase() === this.sebuLPTokenAddress) {
                const receiver = l.log.args[1];
                transfersByReceiver.set(receiver.toLowerCase(), l);
            }
        }
        
        await this.ds.readWriteContext(async (ctx) => {
            const ips = ctx.getDataStore(AInvestorPortfolioStore);
            const plps = ctx.getDataStore(APendingLPStore);

            for(const u of investors) {
                const ip = await ips.findByWalletAddress(u);
                if(!ip) {
                    this.log.error(`Investor ${u} not found`);
                    continue;
                }
                const xferEvent = transfersByReceiver.get(u.toLowerCase());
                if(!xferEvent) {
                    this.log.error(`No transfer event found for investor ${u}`);
                    continue;
                }
                ip.lpShares = BigInt(ip.lpShares||0) + xferEvent.log.args[2];
                await plps.removeByWalletAddressAndRound(round, u);
                await ips.save(ip);
            }
        });
    }    
}