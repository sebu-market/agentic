import { SebuUser } from "../../models";
import { ABaseStore } from "./ABaseStore";

export abstract class AUserStore extends ABaseStore<SebuUser> {

    abstract findByWalletAddress(address: string): Promise<SebuUser | null>;
}