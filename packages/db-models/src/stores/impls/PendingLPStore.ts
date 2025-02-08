import { EntityManager } from "@mikro-orm/core";
import { PendingLPDistribution } from "../../models";
import { APendingLPStore } from "../interfaces/APendingLPStore";
import { BaseStore } from "./BaseStore";
import { IStoreContext } from "../interfaces";

export class PendingLPStore extends BaseStore<PendingLPDistribution> implements APendingLPStore {
    
    constructor(
        readonly em: EntityManager,
        readonly ctx: IStoreContext
    ) {
        super(em, PendingLPDistribution);
    }
    
    async findByWalletAddressAndRound(round: number, address: string): Promise<PendingLPDistribution | null> {
        return this.em.findOne(PendingLPDistribution, { 
            round,
            owner: {
                user_wallet: address.toLowerCase()
            }
        });
    }

    async removeByWalletAddressAndRound(round: number, address: string): Promise<void> {
        const plp = await this.findByWalletAddressAndRound(round, address);
        if(plp) {
            await this.em.removeAndFlush(plp);
        }
    }
}