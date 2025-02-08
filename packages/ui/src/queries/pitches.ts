import { createQueryKeyStore } from "@lukemorales/query-key-factory";
import { sebuClient } from "./client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EntityByIDRequest, MessageSendRequest } from "@sebu/dto";


export const queries = createQueryKeyStore({
    pitches: {
        detail: (pitchId: number) => ({
            queryKey: [pitchId],
            queryFn: () => sebuClient.pitches.getPitch({ id: pitchId }),
            // enabled: Boolean(pitchId > 0),
            contextQueries: {
                messages: {
                    queryKey: null,
                    queryFn: () => sebuClient.pitches.getPitchMessages({ sessionId: pitchId }),
                },
            },
        }),
        byRound: (roundId: number) => ({
            queryKey: [roundId],
            // NOTE: currently db doesn't support filtering by roundId
            queryFn: () => sebuClient.pitches.getPitches(),
            enabled: roundId > 0,
        }),
        leaders: () => ({
            queryKey: ['leaders'],
            queryFn: () => sebuClient.pitches.rankedLeaderboard(),
        })
    }
});


export function usePitches(roundId?: number) {
    return useQuery({
        ...queries.pitches.byRound(roundId || 0),
    });
};

export function usePitch(pitchId?: number) {
    return useQuery({
        ...queries.pitches.detail(pitchId || 0),
        enabled: !!pitchId,
    });
}



export function useMakePayment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (req: EntityByIDRequest) => {
            return Promise.resolve({
                id: 0
            });
            //return sebuClient.paymentSimulation.simulate(req);
        },
        onSuccess(res) {
            console.log('payment completed', res);
            queryClient.invalidateQueries({
                queryKey: queries.pitches.detail(res.id).queryKey,
                refetchType: 'active',
            });
        },
    });
};


export function usePitchLeaders() {
    return useQuery({
        ...queries.pitches.leaders(),
    });
}


export function usePitchMessages(id: number) {
    return useQuery({
        ...queries.pitches.detail(id)._ctx.messages,
        refetchInterval: 1_000,
    });
}

export function useSendPitchMessage() {
    return useMutation({
        mutationFn: (req: MessageSendRequest) => {
            return sebuClient.pitches.sendMessage(req);
        },
        onSuccess(res) {
            console.log('message sent', res);
        },
    });
};
