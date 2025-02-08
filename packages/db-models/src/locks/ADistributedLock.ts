import { EntityManager } from "@mikro-orm/core";

export abstract class ADistributedLock {
    //MUST be called with a transactional entity manager. Will block until lock acquired
    abstract acquireTransactionalLock(em: EntityManager, key: bigint): Promise<void>;

    abstract withTransactionLock<T>(key: bigint, fn: ()=> Promise<T>): Promise<T>;
}