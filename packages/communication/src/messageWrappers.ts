

export interface IMessageBusMessage {
    sessionId: number;
    content: string;
}

export interface IMessageBusMessageWithContext extends IMessageBusMessage {
    context: 'pitch' | 'screen';
    agentResponseMsgId: number;
}

export interface IInboundMessageEnvelope extends IMessageBusMessageWithContext {
    
}

export interface IOutboundMessageEnvelope extends IMessageBusMessage{
    isInjected?: boolean;
    requiresResponse: boolean;
    last: boolean;
}