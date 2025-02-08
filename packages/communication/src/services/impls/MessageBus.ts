import { Injectable } from "@nestjs/common";
import { IInboundMessageEnvelope, IOutboundMessageEnvelope } from "../../messageWrappers";
import { AMessageBus, IInboundMessageHandler, IOutboundMessageHandler } from "../interfaces/AMessageBus";

@Injectable()
export class MessageBus extends AMessageBus {
    private ins: Map<string, IInboundMessageHandler> = new Map();
    private outs: Map<number, IOutboundMessageHandler> = new Map();

    subscribe(handler: IInboundMessageHandler): void {
        this.ins.set(handler.context.toLowerCase(), handler);
    }

    unsubscribe(handler: IInboundMessageHandler): void {
        this.ins.delete(handler.context.toLowerCase());
    }

    async outgoing(inMsg: IInboundMessageEnvelope, msg: IOutboundMessageEnvelope): Promise<void> {
        const h = this.outs.get(msg.sessionId);
        if(!h) {
            throw new Error("No handler found for session id: " + msg.sessionId);
        }
        try {
            await h.onMessage(inMsg, msg);
        } catch (e) {
            console.error(e);
        }
    }

    async incoming(msg: IInboundMessageEnvelope, handler: IOutboundMessageHandler): Promise<void> {
        this.outs.set(msg.sessionId, handler);
    
        const h = this.ins.get(msg.context.toLowerCase());
        if(!h) {
            throw new Error("Unknown message target with id: " + msg.context);
        }
        try {
            await h.onMessage(msg);
        } catch (e) {
            console.error(e);
        }
    }
}