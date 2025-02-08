import { createQueryKeyStore } from "@lukemorales/query-key-factory";
import { sebuClient } from "./client";
import { MessageSendRequest, ScreeningMetadata } from "@sebu/dto";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const queries = createQueryKeyStore({
    screenings: {
        all: {
            queryKey: [undefined],
            queryFn: () => sebuClient.screenings.getScreenings(),
        },
        detail: (id: number) => ({
            queryKey: [id],
            queryFn: () => sebuClient.screenings.getScreening({ id }),
            enabled: !!id && id > 0,
            contextQueries: {
                messages: {
                    queryKey: null,
                    enabled: !!id && id > 0,
                    queryFn: () => sebuClient.screenings.getScreeningMessages({ sessionId: id }),
                },
            },
        }),
    },
});

export function useScreening(id: number) {
    return useQuery({
        ...queries.screenings.detail(id),
    });
}

export function useScreenings({ isSignedIn }: { isSignedIn: boolean }) {
    return useQuery({
        ...queries.screenings.all,
        enabled: isSignedIn,
    });
}

export function useScreeningMessages(id: number) {
    return useQuery({
        ...queries.screenings.detail(id)._ctx.messages,
        refetchInterval: 1_000,
    });
}


export function useSendScreeningMessage() {
    return useMutation({
        mutationFn: (req: MessageSendRequest) => {
            return sebuClient.screenings.sendMessage(req);
        },
        onSuccess(res) {
            console.log('message sent', res);
        },
    });
};

export function useCreateScreening() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => sebuClient.screenings.createScreening(),
        onSuccess: (data: ScreeningMetadata) => {
            queryClient.setQueryData(queries.screenings.detail(data.id).queryKey, data);
            return data;
        },
    });
}