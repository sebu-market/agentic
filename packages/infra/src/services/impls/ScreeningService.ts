import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ADataStoreFactory, AScreeningStore, AUserStore, Conversation, ConversationMessage, IStoreContext, Screening, SebuUser } from "@sebu/db-models";
import { ScreeningStatus } from "@sebu/dto";
import { ASQSService } from "@sebu/sqs-service";
import { AScreeningService } from "../interfaces";
import { BaseSessionService } from "./BaseSessionService";

@Injectable()
export class ScreeningService extends BaseSessionService<Screening> implements AScreeningService {
    

    private readonly log: Logger = new Logger(ScreeningService.name);
    
    constructor(
        readonly ds: ADataStoreFactory,
        readonly sqs: ASQSService,
        readonly config: ConfigService
    ) {
        super(
            ds,
            sqs,
            config,
            'screen'
        );
    }

    async getSession(id: number, ctx: IStoreContext): Promise<Screening> {
        const sStore = ctx.getDataStore(AScreeningStore);
        return await sStore.findById(id, true);
    }

    async saveSession(session: Screening, ctx: IStoreContext): Promise<Screening> {
        const sStore = ctx.getDataStore(AScreeningStore);
        return await sStore.save(session);
    }


    async getScreening(id: number): Promise<Screening> {
       return this.ds.readOnlyContext(async (ctx) => {
            const sStore = ctx.getDataStore(AScreeningStore);
            return await sStore.findById(id, true);
        });
    }

    async findByOwner(user: SebuUser): Promise<Screening[]> {
        return this.ds.readOnlyContext(async (ctx) => {
            const sStore = ctx.getDataStore(AScreeningStore);
            return await sStore.findByOwner(user);
        });
    }

    async createScreening(user: SebuUser): Promise<Screening> {
        return await this.ds.readWriteContext(async (ctx) => {
            //uses auto commit and rollback on error
            const uStore = ctx.getDataStore(AUserStore);
            const sStore = ctx.getDataStore(AScreeningStore);
            const ss = new Screening();
            ss.owner = user;
            ss.timeLimitSeconds = 2*60;
            ss.status = ScreeningStatus.LIVE;
            ss.conversation = new Conversation();
            ss.startTime = new Date();
            user.screenings.add(ss);
            await uStore.save(user);

            const initMessage = new ConversationMessage();
            initMessage.role = 'assistant';
            initMessage.content = `When required, use this information for tool parameters: 
                screeningSessionId: ${ss.id} 
                userWalletAddress: ${user.user_wallet.toLowerCase()}
            `;
            initMessage.conversation = ss.conversation;
            initMessage.sender = 'system';
            initMessage.requiresResponse = false;
            initMessage.isLast = false;
            initMessage.isInjected = true;
            await ss.conversation.messages.init();
            ss.conversation.messages.add(initMessage);
            return await sStore.save(ss);
        });
    }

    
}