import { InvestorPortfolio } from "../../models";
import { ABaseStore } from "./ABaseStore";

export abstract class AInvestorPortfolioStore extends ABaseStore<InvestorPortfolio> {

    abstract findByWalletAddress(walletAddress: string): Promise<InvestorPortfolio|null>;
}