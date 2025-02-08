import { PendingLPDistribution } from "../../models";
import { ABaseStore } from "./ABaseStore";

export abstract class APendingLPStore extends ABaseStore<PendingLPDistribution> {

    abstract findByWalletAddressAndRound(round: number, address: string): Promise<PendingLPDistribution | null>;
    abstract removeByWalletAddressAndRound(round: number, address: string): Promise<void>;
}