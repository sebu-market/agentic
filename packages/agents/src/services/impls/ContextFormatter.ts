import { Injectable } from "@nestjs/common";
import { Conversation } from "@sebu/db-models";

/**
 * Context formatter is responsible for sorting and formatting messages for an agent prompt.
 */
@Injectable()
export class ContextFormatter {

    formatContext(conversation: Conversation): any[] {
        const sorted = conversation.messages.getItems().filter(m => m.content.length > 0);
        sorted.sort((a, b) => {
            return a.updatedAt.getTime() - b.updatedAt.getTime();
        });
        return sorted.map(m => {
            return {
                role: m.role,
                content: m.content
            }
        });
    }
}