import { Injectable, OnModuleInit } from "@nestjs/common";
import { AToolRepo, IAgentTool } from "../../services";
import { z, ZodSchema } from "zod";
import { ethers } from "ethers";
import { ConfigService } from "@nestjs/config";
import { CoinGeckoService } from "./CoinGecko.service";
import { ADataStoreFactory, ATokenMetaStore, TokenMetadata } from "@sebu/db-models";

const ToolMetaInputSchema = z.object({
    address: z.string().describe("Smart contract address for the token"),
    chainId: z.number().describe("Chain ID for the token"),
});

type TokenMetaIn = z.infer<typeof ToolMetaInputSchema>;

export interface ITokenMetadata {
    chainId: number;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    circulating_supply?: string;
    liquidity_usd?: number;
    volume_usd: number;
    market_cap_usd: number;
    holders?: number;
    price_usd?: number;
}

@Injectable()
export class TokenMetaTool implements IAgentTool<ITokenMetadata>, OnModuleInit {
    name: string = 'token-metadata';
    description: string = `Retrieves metadata for a given token address and chain`;
    schema: ZodSchema = ToolMetaInputSchema;

    provider: ethers.Provider;
    chainId: number;
    constructor(
        readonly config: ConfigService,
        readonly gecko: CoinGeckoService,
        readonly repo: AToolRepo,
        readonly ds: ADataStoreFactory
    ) {
        this.provider = new ethers.JsonRpcProvider(this.config.getOrThrow("rpc.url"));
        this.chainId = +this.config.getOrThrow("rpc.chainId");
    }

    onModuleInit() {
        this.repo.register(this);
    }

    async invoke(props: TokenMetaIn): Promise<ITokenMetadata> {
        console.log("Getting token metadata for", props.address);
        const con = new ethers.Contract(props.address, ['function symbol() view returns (string)', 'function name() view returns (string)', 'function decimals() view returns (uint8)'], this.provider);
        
        //FIXME: Make this multicall
        const [symbol, name, decimals] = await Promise.all([
            con.symbol(),
            con.name(),
            con.decimals()
        ]);
        const metrics = await this.gecko.getTokenMeta(props.address);

        await this.ds.readWriteContext(async (ctx) => {
            const ts = ctx.getDataStore(ATokenMetaStore);
            const match = await ts.findByAddressAndChainId(props.address, props.chainId);
            if (!match) {
                const t = new TokenMetadata();
                t.chain = props.chainId;
                t.address = props.address.toLowerCase();
                t.name = name;
                t.symbol = symbol;
                t.decimals = decimals;
                t.price = metrics?.price_usd;
                t.market_cap = metrics?.market_cap_usd;
                t.volume = metrics?.volume_usd;
                await ts.save(t);
            } else {
                match.market_cap = metrics?.market_cap_usd;
                match.volume = metrics?.volume_usd;
                match.price = metrics?.price_usd;
                await ts.save(match);
            }
        });
        return {
            chainId: props.chainId,
            address: props.address.toLowerCase(),
            symbol: symbol,
            decimals: decimals.toString(),
            name: name,
            market_cap_usd: metrics?.market_cap_usd,
            volume_usd: metrics?.volume_usd,
            price_usd: metrics?.price_usd
        };
    }

}