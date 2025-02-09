import { createQueryKeyStore } from "@lukemorales/query-key-factory";
import { sebuClient } from "./client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const queries = createQueryKeyStore({
    guardian: {
        isGuardian: {
            queryKey: [undefined],
            queryFn: () => sebuClient.guardian.isGuardian(),
        },
    },
});

export function useIsGuardian(hasSession: boolean) {
    return useQuery({
        ...queries.guardian.isGuardian,
        enabled: hasSession,
    });
}

export function useAdvanceRound() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => sebuClient.guardian.advanceRound(),
        onSuccess() {
        },
    });
};