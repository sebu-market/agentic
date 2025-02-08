
/**
 * Message bus handles incoming and outgoing messages for pitch sessions. It abstracts away
 * how the user is interacting with the agent and allows for bi-directional communication.
 */

import { IInboundMessageEnvelope, IOutboundMessageEnvelope } from "../../messageWrappers";


export interface IOutboundMessageHandler {
    onMessage: (inMsg: IInboundMessageEnvelope, msg: IOutboundMessageEnvelope) => Promise<void>;
}

export interface IInboundMessageHandler {
    context: 'pitch' | 'screen';
    onMessage: (msg: IInboundMessageEnvelope) => Promise<void>;
}

export abstract class AMessageBus{

    //subscribe to inbound messages
    abstract subscribe(handler: IInboundMessageHandler): void;
    abstract unsubscribe(handler: IInboundMessageHandler): void;

    //send incoming messages to inbound subscribers
    abstract incoming(msg: IInboundMessageEnvelope, callback: IOutboundMessageHandler): Promise<void>;

    //send outgoing messages to outbound handler associated with the connection id in the message
    abstract outgoing(inMsg: IInboundMessageEnvelope, msg: IOutboundMessageEnvelope): Promise<void>;
}