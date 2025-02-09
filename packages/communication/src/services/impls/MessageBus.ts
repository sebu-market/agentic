import { Injectable, Logger } from "@nestjs/common";
import { IInboundMessageEnvelope, IOutboundMessageEnvelope } from "../../messageWrappers";
import { AMessageBus, IInboundMessageHandler, IOutboundMessageHandler } from "../interfaces/AMessageBus";

@Injectable()
export class MessageBus extends AMessageBus {
    private ins: Map<string, IInboundMessageHandler> = new Map();
    private outs: Map<number, IOutboundMessageHandler> = new Map();
    private log = new Logger(MessageBus.name);

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
            const start= Date.now();
            this.log.log('outgoing:start', inMsg, msg);
            await h.onMessage(inMsg, msg);
            this.log.log('outgoing:end', Date.now() - start);
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
            const start= Date.now();
            this.log.log('incoming:start', msg);
            await h.onMessage(msg);
            this.log.log('incoming:end', Date.now() - start);
        } catch (e) {
            console.error(e);
        }
    }
}