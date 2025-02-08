import { useQueryClient } from "@tanstack/react-query";
import { Message, MessageResponse, MessageSendRequest } from "@sebu/dto";

export class MessageCacheManager {

    protected readonly queryKey: Array<string>;

    protected tempIdCounter = 0;

    constructor(queryKey: Array<string>) {
        this.queryKey = queryKey;
    }

    injectClientSideMessage(req: MessageSendRequest) {
        console.log('injecting client side message', req);

        const queryClient = useQueryClient();
        queryClient.setQueriesData({ queryKey: this.queryKey }, (oldData: MessageResponse) => {
            console.log({ oldData });

            const newData : MessageResponse = {
                messages: [
                    ...oldData.messages,
                    this.mapRequestToMessage(req),
                ],
            };

            console.log({ newData });
            return newData;
        });
    }

    protected mapRequestToMessage(req: MessageSendRequest): Message {
        const message: Message = {
            id: this.tempIdCounter--, // NOTE: we use negative numbers to prevent collisions
            content: req.content,
            sender: 'client', // FIXME
            role: 'client', // FIXME
            timestamp: new Date().toISOString(),
            requiresResponse: false,
            last: false
        };
        return message;
    }

}