import { Controller, Get, Logger, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/guards";
import { ACookieManager } from "src/services";
import { toErrorDTO } from "src/utils/error-utils";
import { ConfigService } from "@nestjs/config";
import { Contract, ethers, JsonRpcProvider, Signer } from "ethers";
import { abis, ContractAddresses } from "@sebu/dto";
import { ITxnInput, ITxnLogEvent, TxnRouterService } from "../../txns";
import { ADataStoreFactory, AInvestmentRoundStore } from "@sebu/db-models";

@Controller('guardian')
export class GuardianController {
    private readonly log: Logger = new Logger(GuardianController.name);

    guardianSigner: Signer;
    chainId: number;
    sebuContract: Contract;
    provider: JsonRpcProvider;
    constructor(
        readonly config: ConfigService,
        readonly sessionManager: ACookieManager,
        readonly txnRouter: TxnRouterService,
        readonly ds: ADataStoreFactory
    ) { 
        this.chainId = Number(this.config.getOrThrow('rpc.chainId'));
        const abi = abis.SebuMasterABI
        const addy = ContractAddresses[this.chainId].SebuMaster;
        if(!addy) {
            throw new Error("No SebuMaster address found for chainId: " + this.chainId);
        }
        const pk = this.config.getOrThrow('guardian.wallet.privateKey');
        const url = this.config.getOrThrow(`rpc.${this.chainId}.url`);
        this.provider = new JsonRpcProvider(url, this.chainId);
        this.guardianSigner = new ethers.Wallet(pk, this.provider);
        this.sebuContract = new Contract(addy, abi, this.guardianSigner);
    }

    @Get('is-guardian')
    async isGuardian(@Req() req, @Res() res) {
        const user = AuthGuard.getUser(req);
        if (!user) {
            return toErrorDTO("Unauthorized", 401);
        }

        // verify site admin
        const siteAdmins = this.config.get<string[]>('admin.siteAdmins');
        const isAdmin = siteAdmins.includes(user.user_wallet.toLowerCase());
        if (!isAdmin) {
            return {
                content: "false"
            }
        }
        return {
            content: "true"
        }
    }

    @Post('advance-round')
    @UseGuards(AuthGuard)
    async advanceRound(
        @Req() req
    ) {
        const user = AuthGuard.getUser(req);
        if (!user) {
            return toErrorDTO("Unauthorized", 401);
        }

        // verify site admin
        const siteAdmins = this.config.get<string[]>('admin.siteAdmins');
        const isAdmin = siteAdmins.includes(user.user_wallet.toLowerCase());
        if (!isAdmin) {
            return toErrorDTO("Unauthorized", 401);
        }

        try {
            const tx = await this.sebuContract.closeRound();
            await tx.wait();
            const txn = await this.provider.getTransaction(tx.hash);
            const rec = await this.provider.getTransactionReceipt(tx.hash);
            const input: ITxnInput = {
                block_number: ""+txn.blockNumber,
                from: txn.from,
                to: txn.to,
                hash: txn.hash,
                logs: rec.logs.map(log => {
                    return {
                        address: log.address,
                        data: log.data,
                        topics: log.topics,
                    } as ITxnLogEvent;
                }),
                network: this.chainId.toString(),
                status: Boolean(rec.status),
            };
            await this.txnRouter.route(input);
            const round = await this.ds.readOnlyContext(async (ctx) => {
                const rs = ctx.getDataStore(AInvestmentRoundStore);
                return await rs.getActiveRound();
            });
            return {
                content: `New round: ${round ? round.round : 'Failed to advance to next round'}`
            }
        } catch (e: any) {
            this.log.error(e, e.stack);
            return toErrorDTO(e);
        }

    }

}