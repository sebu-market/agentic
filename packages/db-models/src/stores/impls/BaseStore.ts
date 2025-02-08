import { EntityManager } from "@mikro-orm/core";
import { ABaseStore } from "../interfaces/ABaseStore";
import { Type } from "@nestjs/common";
import { PaginationOptions } from "../interfaces";

export abstract class BaseStore<T> extends ABaseStore<T> {

    constructor(
        readonly em: EntityManager,
        readonly type: Type<T> 
    ) {
        super();
    }
    
    async findById<T>(id: number, populateRelationships?: boolean): Promise<T | null> {
        return await this.em.findOne(this.type, id, populateRelationships ? { populate: ["*"] } : undefined);
    }

    async findAll(pagination: PaginationOptions, populateRelationships?: boolean): Promise<T[]> {
        const opts = {
            limit: pagination.limit || 100,
            offset: pagination.offset || 0
        }
        if(populateRelationships) {
            opts["populate"] = ["*"];
        }
        return await this.em.findAll(this.type, opts);
    }

    async save(entity: T): Promise<T> {
        await this.em.persistAndFlush(entity);
        return entity;
    }

    async remove(entity: T): Promise<void> {
        await this.em.removeAndFlush(entity);
    }
}