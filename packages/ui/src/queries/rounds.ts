import { createQueryKeyStore } from "@lukemorales/query-key-factory";
import { sebuClient } from "./client";
import { useQuery } from "@tanstack/react-query";
import {
    addDays,
 } from 'date-fns';

function getMockRound(id?: number) {
    id = id || 1;
    return {
        id: id,
        name: `Round ${id}`,
        start_date: "2021-01-01",
        endsAt: addDays(new Date(), 1).toISOString(),
        status: "active",
        valueUSD: 10_000,
    };
}

export const queries = createQueryKeyStore({
    rounds: {
        current: {
            queryKey: [undefined],
            queryFn: () => getMockRound(),
        },
        detail: (roundId: number) => ({
            queryKey: ["rounds", roundId],
            queryFn: () => getMockRound(roundId),
        }),
    }
});

export function useCurrentRound() {
    return useQuery({
        ...queries.rounds.current,
    });
}

export function useRound(roundId: number) {
    return useQuery({
        ...queries.rounds.detail(roundId),
    });
}