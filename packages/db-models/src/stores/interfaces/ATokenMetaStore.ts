import { TokenMetadata } from "../../models";
import { ABaseStore } from "./ABaseStore";

export abstract class ATokenMetaStore extends ABaseStore<TokenMetadata> {

    abstract findByAddressAndChainId(address: string, chainId: number): Promise<TokenMetadata | null>;
}