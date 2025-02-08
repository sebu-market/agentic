import { Body, Get, Logger, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../../guards";
import { ErrorDTO, MessageDTO, MessageDTOSchema, MessageResponse, MessageResponseDTO, MessageResponseDTOSchema, MessageSendRequestDTO } from "@sebu/dto";
import { toErrorDTO } from "../../utils/error-utils";
import { ConversationMessage, Pitch, Screening } from "@sebu/db-models";
import { ABaseSessionService } from "../../services/interfaces/ABaseSessionService";

export abstract class BaseMessagesController<T extends Pitch | Screening> {
    
    
    constructor(
        readonly ssvc: ABaseSessionService<T>
    ) {

    }

    abstract get log(): Logger;
    abstract getSession(id: number): Promise<T | null>;

    @Post('send')
    @UseGuards(AuthGuard)
    async sendUserMessage(
        @Req() req,
        @Body() body: MessageSendRequestDTO
    ) {
        const sessionId = body.sessionId;
        const user = AuthGuard.getUser(req);

        if(!user) {
            return toErrorDTO("Unauthorized", 401);
        }
        try {
            const session = await this.getSession(sessionId);

            if (!session) {
                return toErrorDTO("Session not found", 404);
            }

            // verify the current user is either the owner of the screening or an admin
            if (session.owner.user_wallet.toLowerCase() !== user.user_wallet.toLowerCase()) {
                return toErrorDTO("Unauthorized", 401);
            }

            const latestMsgs = await this.ssvc.sendUserMessage(sessionId, body.content, body.lastId);

            return this.toMessagesDTO(latestMsgs);
        } catch (e:any) {
            this.log.error(e, e.stack);
            return toErrorDTO(e);
        }
    }

    @Get('latest')
    @UseGuards(AuthGuard)
    async getLatestMessages(
        @Req() req,
        @Param() params: any,
        @Query() q: any
    ): Promise<MessageResponse | ErrorDTO> {
        const sessionId = params.id;
        const lastId = q.lastId || 0;

        const user = AuthGuard.getUser(req);
        if(!user) {
            return toErrorDTO("Unauthorized", 401);
        }
        try {
            const session = await this.getSession(sessionId);

            if (!session) {
                toErrorDTO("Session not found", 404);
            }

            // verify the current user is either the owner of the screening or an admin
            if (session.owner.user_wallet.toLowerCase() !== user.user_wallet.toLowerCase()) {
                return toErrorDTO("Unauthorized", 401);
            }

            const latestMsgs = await this.ssvc.getMessages(sessionId, lastId);
            return this.toMessagesDTO(latestMsgs);
        } catch (e:any) {
            this.log.error(e, e.stack);
            return toErrorDTO(e);
        }
    }

    @Get(':mid')
    @UseGuards(AuthGuard)
    async getMessage(
        @Req() req,
        @Param() params: any
    ): Promise<any> {
        const sessionId = parseInt(params.id, 10);
        const messageId = params.mid;
        const user = AuthGuard.getUser(req);
        if(!user) {
            return toErrorDTO("Unauthorized", 401);
        }
        try {
            
            const session = await this.getSession(sessionId);

            if (!session) {
                toErrorDTO("Session not found", 404);
            }

            if (session.owner.id !== user.id) {
                toErrorDTO("Unauthorized", 401);
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


    toMessagesDTO(messages: ConversationMessage[]): MessageResponseDTO {
        messages.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
        const msgs = MessageResponseDTOSchema.parse({
            messages: messages.map(m => this.toMessageDTO(m))
        });
        return msgs;
    }

    toMessageDTO(message: ConversationMessage): MessageDTO {
        return MessageDTOSchema.parse({
            id: message.id,
            content: message.content,
            sender: message.sender,
            role: message.role,
            timestamp: message.updatedAt.toISOString(),
            requiresResponse: message.requiresResponse,
            last: message.isLast
        });
    }
}