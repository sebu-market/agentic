import { EntityManager } from "@mikro-orm/core";
import { InvestmentRound } from "../../models";
import { AInvestmentRoundStore, IStoreContext } from "../interfaces";
import { BaseStore } from "./BaseStore";

export class InvestmentRoundStore extends BaseStore<InvestmentRound> implements AInvestmentRoundStore {
    
    constructor(
        readonly em: EntityManager,
        readonly ctx: IStoreContext
    ) {
        super(em, InvestmentRound);
    }

    async findByRound(round: number): Promise<InvestmentRound | null> {
        return this.em.findOne(InvestmentRound, {round});
    }
    
    async getActiveRound(): Promise<InvestmentRound | null> {
        return this.em.findOne(InvestmentRound, {isCurrent: true});
    }

}