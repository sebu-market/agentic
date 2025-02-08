import { EntityManager } from "@mikro-orm/core";
import { Screening, SebuUser } from "../../models";
import { BaseStore } from "./BaseStore";
import { StoreContext } from "./StoreContext";
import { PaginationOptions } from "../interfaces";

export class ScreeningStore extends BaseStore<Screening> {

    constructor(
        readonly em: EntityManager,
        readonly ctx: StoreContext
    ) {
        super(em, Screening);
    }

    async findByOwner(
        owner: SebuUser,
        options?: PaginationOptions
    ): Promise<Screening[]> {
        return await this.em.find(
            Screening,
            { owner },
            {
                populate: ['tokenMetadata'],
                limit: options?.limit,
                offset: options?.offset
            }   
        );
    }
}