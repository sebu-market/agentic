
import { EntityManager } from "@mikro-orm/core";
import { TokenMetadata } from "../../models";
import { StoreContext } from "./StoreContext";
import { BaseStore } from "./BaseStore";
import { ATokenMetaStore } from "../interfaces";

export class TokenMetaStore extends BaseStore<TokenMetadata> implements ATokenMetaStore {

    constructor(
        readonly em: EntityManager,
        readonly ctx: StoreContext
    ) {
        super(
            em,
            TokenMetadata
        );
    }

    async findByAddressAndChainId(address: string, chain: number): Promise<TokenMetadata | null> {
        return this.em.findOne(TokenMetadata, { address: address.toLowerCase(), chain });
    }
}