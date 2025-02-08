import {  MikroORM } from "@mikro-orm/core";
import { Injectable, Logger } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { ADataStoreFactory, DBOperation, IContextOpts, IDSFactoryOptions, IStoreContext } from "../interfaces/ADataStoreFactory";
import { StoreContext } from "./StoreContext";
import { ADistributedLock } from "../../locks/";

type ContextMap = {
    [k: number]: StoreContext
}


@Injectable()
export class DataStoreFactory extends ADataStoreFactory {

    active: ContextMap = {};
    log: Logger = new Logger(DataStoreFactory.name);
    constructor(
        readonly modRef: ModuleRef,
        readonly lock: ADistributedLock,
        readonly orm: MikroORM
    ) {
        super();
    }

    async readOnlyContext(op: DBOperation, name?: string): Promise<any> {
        const ctx = await this.createContext({readOnly: true, name}) as StoreContext;
        try {
            return await op(ctx);
        } finally {
            await this.contextFinished(ctx);
        }
    }

    async readWriteContext(op: DBOperation, opts?: IDSFactoryOptions): Promise<any> {
        const ctx = await this.createContext({name: opts?.name}) as StoreContext;
        let commit = true;
        try {
            const r = await op(ctx);
            
            return r;
        } catch (e) {
            commit = false;
            if(!opts?.doNotAutoCommit) {
                await ctx.rollback();
            }
            throw e;
        } finally {
            if(commit && !opts?.doNotAutoCommit) {
                await ctx.commit();
            }
            await this.contextFinished(ctx);
        }
    }

    async lockedWriteContext(key: bigint, op: DBOperation, opts?: IDSFactoryOptions): Promise<any> {
        const em = this.orm.em.fork();
        await em.begin();
        this.log.debug(`Acquiring distributed locked...`);
        await this.lock.acquireTransactionalLock(em, key);
        this.log.debug(`Acquired distributed lock`);
        const c = new StoreContext(em, false, opts?.name);
        this.log.debug({
            msg: `Creating locking txn context`,
            name: opts?.name,
            ctxId: c.id
        });
        this.active[c.id] = c;
        let commit = true;
        try {
            return await op(c);
        } catch (e) {
            commit = false;
            if(!opts?.doNotAutoCommit) {
                await c.rollback();
            }
            throw e;
        } finally {
            if(commit && !opts?.doNotAutoCommit) {
                await c.commit();
            }
            await this.contextFinished(c);
        }
    }

    /**
     * Create a storage context to interact with data stores. The context must be committed or 
     * rolled back after every use.
     * 
     * @returns 
     */
    private async createContext(opts?: IContextOpts): Promise<IStoreContext> {
        
        const em = this.orm.em.fork();
        if(!opts?.readOnly) {
            await em.begin();
        }
        const c = new StoreContext(em, opts?.readOnly || false, opts?.name);
        /*this.log.debug({
            msg: "Creating new DB context",
            name: opts?.name,
            ctxId: c.id
        });*/
        this.active[c.id] = c;
        return c;
    }

    private contextFinished(ctx: StoreContext) {
        if(this.active[ctx.id]) {
            /*this.log.debug({
                msg: "Finished with DB context",
                name: ctx.name,
                ctxId: ctx.id
            });
            */
            delete this.active[ctx.id];
        } else {
            throw new Error("Attempting to finish a different context");
        }
    }

}
