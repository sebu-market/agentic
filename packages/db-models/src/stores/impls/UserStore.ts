import { EntityManager } from "@mikro-orm/core";
import { SebuUser } from "../../models";
import { StoreContext } from "./StoreContext";
import { BaseStore } from "./BaseStore";
import { AUserStore } from "../interfaces";

export class UserStore extends BaseStore<SebuUser> implements AUserStore {

    constructor(
        readonly em: EntityManager,
        readonly ctx: StoreContext
    ) {
        super(
            em,
            SebuUser
        );
    }

    async findByWalletAddress(address: string): Promise<SebuUser | null> {
        return this.em.findOne(SebuUser, { user_wallet: address.toLowerCase() }, { populate: ['*'] });
    }
}