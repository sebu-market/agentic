import { useQueryClient } from "@tanstack/react-query";
import { ClientType, EventType, HumanMessageContext } from "@sebu/dto";
import React from "react";
import { useSebuClient } from "../context/sebu-sdk.js";
import type {
    IBaseMessage,
    IEntityInvalidate,
    IEntityUpdate,
    IHumanMessage,
    MessageWithContext,
} from '@sebu/dto';
import { queries } from "./screenings.js";

type BaseEventHandler = (event: IBaseMessage) => void;
type IEntityInvalidateHandler = (event: IEntityInvalidate) => void;
type IEntityUpdateHandler = (event: IEntityUpdate) => void;

type EventHandler = BaseEventHandler | IEntityInvalidateHandler | IEntityUpdateHandler;

class WebsocketEventHandler {
    handlers: Map<EventType, EventHandler[]> = new Map();

    addHandler(eventType: EventType, handler: EventHandler) {
        const handlers = this.handlers.get(eventType) || [];
        handlers.push(handler);
        this.handlers.set(eventType, handlers);
    }

    removeHandler(eventType: EventType, handler: EventHandler) {
        const handlers = this.handlers.get(eventType) || [];
        const index = handlers.indexOf(handler);
        if (index >= 0) {
            handlers.splice(index, 1);
        }
        this.handlers.set(eventType, handlers);
    }

    handleEvent(event: MessageWithContext) {
        const handlers = this.handlers.get(event.event) || [];
        handlers.forEach(handler => handler(event as any));
    }
}

export const useReactQuerySubscription = () => {
    const queryClient = useQueryClient();
    const sebuClient = useSebuClient();

    function appendMessage(message: MessageWithContext) {
        const context = message.context;
        // const queryKey = queries.screenings.detail(
        //     message.context.id as number
        // )._ctx.messages.queryKey;

        const queryKey = queries.chat.local.queryKey;

        // console.log({ msg: 'clearing cache', queryKey });

        // queryClient.invalidateQueries({ queryKey, refetchType: 'all' });
        // return;


        console.log({
            msg: `appending message to query key`,
            queryKey, message
        });

        queryClient.setQueriesData({ queryKey }, (oldData: MessageWithContext[]) => {
            console.log({ oldData });

            const newData = [...oldData, message];

            console.log({ newData });

            return newData;
        });

        console.log("appended message to query key", queryKey);
    }

    const websocketEventHandler = new WebsocketEventHandler();

    websocketEventHandler.addHandler(EventType.ENTITY_INVALIDATE, (event: IEntityInvalidate) => {
        console.log("received entity invalidated", event);
    });

    websocketEventHandler.addHandler(EventType.ENTITY_UPDATE, (event: IEntityUpdate) => {
        console.log("received entity update", event);
    });

    websocketEventHandler.addHandler(EventType.AGENT_MESSAGE, (event: IBaseMessage) => {
        console.log("received agent message", event);
        // FIXME
        appendMessage(event as unknown as MessageWithContext);
    });


    React.useEffect(() => {
        const handleWebsocketEvent = (event: MessageWithContext) => {
            console.log("received event", event);

            try {
                websocketEventHandler.handleEvent(event);
            } catch (e) {
                // console.error(e);
            }
        };

        sebuClient.websockets.on('message', handleWebsocketEvent);

        return () => {
            sebuClient.websockets.off('message', handleWebsocketEvent);
        };
    }, [queryClient]);

    return (message: IHumanMessage) => {
        console.log("sending message", message);
        sebuClient.websockets.send(message);
        appendMessage(message);
    };
};
