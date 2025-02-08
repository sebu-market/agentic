import { InvestmentRound } from "../../models";
import { ABaseStore } from "./ABaseStore";

export abstract class AInvestmentRoundStore extends ABaseStore<InvestmentRound> {
    
    abstract findByRound(round: number): Promise<InvestmentRound | null>;
    abstract getActiveRound(): Promise<InvestmentRound | null>;
    
}