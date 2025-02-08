import { Type } from "@nestjs/common";

export interface IStoreContext {
    isDone: boolean;

    /**
     * Get an instance of a data store of a particular type.
     * WARNING: DO NOT CACHE THE INSTANCE
     * 
     * Each instance is given a request-scoped entity manager that 
     * should not be reused across requests. That is, each request
     * will create a DB transaction that is committed/rolled back 
     * with each operation on the given store. If you cache it, you 
     * will eventually run out of memory since the entity manager 
     * instance will keep caching objects for each subsequent request.
     * 
     */
    getDataStore<TInput = any, TResult = TInput>(typeOrToken: Type<TInput> | Function | string | symbol): TResult;
    rollback(): Promise<void>;
    commit(): Promise<void>;
}


export interface IDSFactoryOptions {
    name?: string;
    //whether to automatically commit or rollback depending on operation outcome. false or 
    //undefined means auto-commit
    doNotAutoCommit?: boolean;
}

export interface IContextOpts {
    readOnly?: boolean;
    name?: string;
}

export const LockKeys = {
    RACE_SESSION: 1n
}

export type DBOperation = (ctx: IStoreContext) => Promise<any>;
export abstract class ADataStoreFactory {

    abstract readWriteContext(op: DBOperation, opts?: IDSFactoryOptions): Promise<any>;
    abstract readOnlyContext(op: DBOperation, name?: string): Promise<any>;
    abstract lockedWriteContext(key: bigint, op: DBOperation, opts?: IDSFactoryOptions): Promise<any>;
    
}