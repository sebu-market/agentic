import { Injectable } from "@nestjs/common";
import { BaseSessionService } from "./BaseSessionService";
import { APitchService } from "../interfaces/APitchService";
import { ADataStoreFactory, APitchStore, IStoreContext, PaginationOptions, Pitch } from "@sebu/db-models";
import { ConfigService } from "@nestjs/config";
import { ASQSService } from "@sebu/sqs-service";

@Injectable()
export class PitchService extends BaseSessionService<Pitch> implements APitchService {

    constructor(
        readonly ds: ADataStoreFactory,
        readonly config: ConfigService,
        readonly sqs: ASQSService
    ) {
        super(
            ds,sqs,config, 'pitch'
        );
    }

    async getPitch(id: number): Promise<Pitch> {
        return this.ds.readOnlyContext(async (ctx) => {
            const pStore = ctx.getDataStore(APitchStore);
            return await pStore.findById(id, true);
        });
    }

    async getPitches(options: PaginationOptions = {}): Promise<Pitch[]> {
        return this.ds.readOnlyContext(async (ctx) => {
            const pStore = ctx.getDataStore(APitchStore);
            return await pStore.findAll(options, true);
        });
    }

    async getSession(id: number, ctx: IStoreContext): Promise<Pitch> {
        const pStore = ctx.getDataStore(APitchStore);
        return await pStore.findById(id, true);
    }

    async saveSession(session: Pitch, ctx: IStoreContext): Promise<Pitch> {
        const pStore = ctx.getDataStore(APitchStore);
        return await pStore.save(session);
    }

    async getWinningPitches(): Promise<Pitch[]> {
        return await this.ds.readOnlyContext(async (ctx) => {
            const pStore = ctx.getDataStore(APitchStore);
            return await pStore.rankPitchesInCurrentRound();
        });
    }
}