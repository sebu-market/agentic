import { createQueryKeyStore } from "@lukemorales/query-key-factory";
import { sebuClient } from "./client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


export const queries = createQueryKeyStore({
    auth: {
        nonce: {
            queryKey: [undefined],
            queryFn: () => sebuClient.auth.getNonce(),
        },
        session: {
            queryKey: [undefined],
            queryFn: () => sebuClient.auth.getSession(),
        }
    },
});

export function useNonce() {
    return useQuery({
        ...queries.auth.nonce,
    });
}

export function useSession() {
    return useQuery({
        ...queries.auth.session,
    })
}



export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => sebuClient.auth.logout(),
        onSuccess() {
            queryClient.invalidateQueries({
                queryKey: queries.auth,
            });
        },
    });
};

export function useVerifySignature({
    message,
    signature,
}: {
    message: string,
    signature: string
}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => sebuClient.auth.verifySignature({ message, signature }),
        onSuccess(session) {
            queryClient.setQueryData(
                queries.auth.session.queryKey,
                session,
            );
        },
        onError() {
            queryClient.invalidateQueries({
                queryKey: queries.auth,
            });
        },
    });
}