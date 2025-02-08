import { ConversationMessage, Pitch, Screening } from "@sebu/db-models";

export abstract class ABaseSessionService<T extends Pitch | Screening> {

    abstract sendUserMessage(sessionId: number, message: string, lastId?: number): Promise<ConversationMessage[]>;
    abstract getMessage(id: number): Promise<ConversationMessage>;
    abstract getMessages(sessionId: number, lastId?: number): Promise<ConversationMessage[]>;
}