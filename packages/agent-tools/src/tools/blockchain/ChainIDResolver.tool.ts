import { Injectable, OnModuleInit } from "@nestjs/common";
import { AToolRepo, IAgentTool } from "../../services";
import { z, ZodSchema } from "zod";



export type NetworkType = {
    networkName: string,
    chainId: number
}


export const Ethereum: NetworkType = {networkName: 'ethereum', chainId: 1};
export const Arbitrum: NetworkType = {networkName: 'arbitrum', chainId: 42161};
export const BaseSepolia: NetworkType = {networkName: 'base-sepolia', chainId: 84532};

export const NETWORKS: Map<number|string, NetworkType> = new Map();
NETWORKS.set(1, Ethereum);
NETWORKS.set(42161, Arbitrum);
NETWORKS.set(84532, BaseSepolia);
NETWORKS.set('ethereum', Ethereum);
NETWORKS.set('arbitrum', Arbitrum);
NETWORKS.set('base-sepolia', BaseSepolia);

const params: ZodSchema = z.object({
    chainName: z.string().describe("The name of a blockchain network such as 'ethereum' or 'arbitrum'"),
});

type ChainIDInputType = z.infer<typeof params>;

@Injectable()
export class ChainIDResolver implements IAgentTool<NetworkType> , OnModuleInit {
    name: string = 'chainid-resolver';
    description: string = `Resolves the blockchain network ID for a given blockchain network name such as 'etehereum' or 'arbitrum'`;
    schema: ZodSchema = params;

    constructor(
        readonly repo: AToolRepo
    ) {
        
    }

    async invoke(input: ChainIDInputType): Promise<NetworkType> {
        let {chainName} = input;
        if(typeof chainName === 'string') {
            chainName = chainName.toLowerCase();
        }
        if(Number.isInteger(chainName)) {
            chainName = +chainName;
        }

        const network = NETWORKS.get(chainName);
        if (!network) {
            throw new Error(`Network ${chainName} not supported`);
        }
        return network;
    }

    async onModuleInit() {
        this.repo.register(this);
    }
}