import { Cascade, Embedded, ManyToOne, OneToOne, Property } from "@mikro-orm/core";
import { ABaseEntity } from "./ABaseEntity";
import { FounderInfo } from "./FounderInfo";
import { ProjectSummary } from "./ProjectSummary";
import { SebuUser } from "./SebuUser";
import { TokenMetadata } from "./TokenMetada";
import { Conversation } from "./Conversation";


export abstract class BaseSession extends ABaseEntity {

    @ManyToOne(() => SebuUser, {
        cascade: [Cascade.ALL]
    })
    owner: SebuUser;

    @OneToOne(() => Conversation, {
        orphanRemoval: true
    })
    conversation: Conversation;

    @Property()
    status: string;

    @OneToOne(() => TokenMetadata, {
        nullable: true
    })
    tokenMetadata?: TokenMetadata;

    @Embedded({
        nullable: true
    })
    projectSummary?: ProjectSummary

    @Embedded({
        nullable: true
    })
    founderInfo?: FounderInfo;

    //number of tokens consumed by the session's conversation so far
    @Property()
    conversationTokens: number = 0;

    @Property( {
        nullable: true
    })
    startTime?: Date;

    @Property()
    timeLimitSeconds: number;
}