import { Injectable, Logger } from "@nestjs/common";
import { ADistributedLock } from "./ADistributedLock";
import { EntityManager } from "@mikro-orm/core";
import { EntityManager as PGM} from '@mikro-orm/postgresql';

@Injectable()
export class DistributedLock extends ADistributedLock {

    log: Logger = new Logger(DistributedLock.name);
    constructor(
        readonly em: EntityManager
    ) {
        super();
    }

    async acquireTransactionalLock(em: EntityManager, key: bigint): Promise<void> {
        this.log.debug(`Acquiring lock for key ${key}`);
        await (em as PGM).execute(`SELECT pg_advisory_xact_lock(?)`, [key]);
    }

    async withTransactionLock<T>(key: bigint, fn: () => Promise<T>): Promise<T> {
        return (this.em as PGM).transactional(async (tem): Promise<T> => {
            //blocks until global distributed lock is acquired
            this.log.debug(`Acquiring lock for key ${key}`);
            await tem.execute(`SELECT pg_advisory_xact_lock($1')`, [key]);

            try {
                return await fn();
            } catch (error) {
                this.log.error(error);
                throw error;
            } finally {
                this.log.debug(`Releasing lock for key ${key}`);
            }
        });
    }

    
}