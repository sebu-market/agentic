import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface ITokenMetrics {
    market_cap_usd: number;
    volume_usd: number;
    price_usd: number;
}

const BASE_SEPOLIA = 84532;
@Injectable()
export class CoinGeckoService {

    private static CON_ADDRESSES = "contract_addresses";
    private static VS_CURRENCIES = "vs_currencies";
    private static INCL_MCAP = "include_market_cap";
    private static INCL_24H = "include_24hr_vol";
    private static API_KEY = "x_cg_demo_api_key";
    private static CHAIN_ID = "chain_identifier";
    apiKey: string;
    network?: string;
    chainID: number;
    constructor(
        readonly config: ConfigService
    ) {
        this.apiKey = config.getOrThrow("coingecko.api_key");
        this.chainID = +config.getOrThrow("coingecko.chainId");
    }

    async getPlatformId(chainId: number): Promise<string> {
        const url = `https://api.coingecko.com/api/v3/asset_platforms?${CoinGeckoService.API_KEY}=${this.apiKey}&${CoinGeckoService.CHAIN_ID}=${chainId}`;
        
        const res = await fetch(url);
        const data = await res.json() as any[];

        const hit = await data.find((item: any) => item.chain_identifier === chainId);
        return hit?.id;
    }

    async getTokenMeta(address: string): Promise<ITokenMetrics> {   
        if(!this.network && this.chainID !== BASE_SEPOLIA) {
            this.network = await this.getPlatformId(+this.config.getOrThrow("coingecko.chainId"));
        } else if(this.chainID === BASE_SEPOLIA) {
           return {
                market_cap_usd: 100_000_000,
                volume_usd: 5_000_000,
                price_usd: .05
           }
        }

        const url = `https://api.coingecko.com/api/v3/simple/token_price/${this.network}?${CoinGeckoService.API_KEY}=${this.apiKey}&${CoinGeckoService.CON_ADDRESSES}=${address.toLowerCase()}&${CoinGeckoService.VS_CURRENCIES}=usd&${CoinGeckoService.INCL_MCAP}=true&${CoinGeckoService.INCL_24H}=true`;

        const res = await fetch(url);
        const data = (await res.json())[address.toLowerCase()];

        return {
            market_cap_usd: data?.usd_market_cap,
            volume_usd: data?.usd_24h_vol,
            price_usd: data?.usd
        }
    }

}