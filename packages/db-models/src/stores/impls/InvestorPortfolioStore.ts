import { EntityManager } from "@mikro-orm/core";
import { InvestorPortfolio } from "../../models";
import { BaseStore } from "./BaseStore";
import { IStoreContext } from "../interfaces";

export class InvestorPortfolioStore extends BaseStore<InvestorPortfolio> {
    
    constructor(
        readonly em: EntityManager,
        readonly ctx: IStoreContext
    ) {
        super(em, InvestorPortfolio);
    }

    async findByWalletAddress(walletAddress: string): Promise<InvestorPortfolio|null> {
        return this.em.findOne(InvestorPortfolio, { 
            owner:  {
                user_wallet: walletAddress.toLowerCase()
            }
         });
    }
}