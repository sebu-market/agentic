import { Collection, Entity, OneToMany } from "@mikro-orm/core";
import { ABaseEntity } from "./ABaseEntity";
import { ConversationMessage } from "./ConversationMessage";

@Entity()
export class Conversation extends ABaseEntity {

    @OneToMany(() => ConversationMessage, message => message.conversation, {
        orphanRemoval: true,
    })
    messages = new Collection<ConversationMessage>(this);
}