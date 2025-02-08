import { PaginationOptions } from "./PaginationOptions";

export abstract class ABaseStore<T> {

    abstract findById(id: number, populateRelationships?: boolean): Promise<T | null>;
    abstract findAll(pagination: PaginationOptions, populateRelationships?: boolean): Promise<T[]>;
    abstract save(entity: T): Promise<T>;
    abstract remove(entity: T): Promise<void>;
}