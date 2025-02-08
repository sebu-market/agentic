import { Controller, Get, Logger, Param, Query, Req } from "@nestjs/common";
import { BaseMessagesController } from "../BaseMessagesController";
import { Pitch } from "@sebu/db-models";
import { APitchService } from "../../../services";
import { ErrorDTO, MessageResponse } from "@sebu/dto";
import { toErrorDTO } from "../../../utils/error-utils";


@Controller("pitches/:id/messages")
export class PitchMessagesController extends BaseMessagesController<Pitch>{

    private readonly _log: Logger = new Logger(PitchMessagesController.name);
    constructor(
        readonly ssvc: APitchService,
    ) {
        super(ssvc);
    }

    async getSession(id: number): Promise<Pitch | null> {
        return this.ssvc.getPitch(id);
    }

    get log(): Logger {
        return this._log;
    }

    @Get('latest')
    override async getLatestMessages(
        @Req() req,
        @Param() params: any,
        @Query() q: any
    ): Promise<MessageResponse | ErrorDTO> {
        const sessionId = params.id;
        const lastId = q.lastId || 0;

        
        try {
            const session = await this.getSession(sessionId);

            if (!session) {
                toErrorDTO("Session not found", 404);
            }

            const latestMsgs = await this.ssvc.getMessages(sessionId, lastId);
            return this.toMessagesDTO(latestMsgs);
        } catch (e:any) {
            this.log.error(e, e.stack);
            return toErrorDTO(e);
        }
    }

    @Get(':mid')
    override async getMessage(
        @Req() req,
        @Param() params: any
    ): Promise<any> {
        const sessionId = parseInt(params.id, 10);
        const messageId = params.mid;
        
        try {
            
            const session = await this.getSession(sessionId);

            if (!session) {
                toErrorDTO("Session not found", 404);
            }

            const message = await this.ssvc.getMessage(messageId);

            if (!message) {
                toErrorDTO("Message not found", 404);
            }

            return this.toMessageDTO(message);
        } catch (e: any) {
            this.log.error(e, e.stack);
            return toErrorDTO(e);
        }
    }

}