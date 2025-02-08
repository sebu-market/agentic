import { Cascade, Entity, ManyToOne, Property } from "@mikro-orm/core";
import { ABaseEntity } from "./ABaseEntity";
import { Conversation } from "./Conversation";

@Entity()
export class ConversationMessage extends ABaseEntity {

    @ManyToOne(()=>Conversation, {
        cascade: [Cascade.ALL]
    })
    conversation: Conversation;

    @Property({type: 'text'})
    content: string;

    @Property()
    sender: string;

    @Property()
    role: string;

    //whether this messages was inserted by the agent advisors or services. These should NOT
    //be displayed to the user.
    @Property()
    isInjected: boolean = false; //default is actual message

    @Property()
    requiresResponse: boolean = true; //default is we need a response

    @Property()
    isLast: boolean = false; //default is we are not done with conversation

    

}