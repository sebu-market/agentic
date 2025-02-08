import { SIWEProvider, SIWEConfig, SIWESession } from 'connectkit';
import { SiweMessage } from 'siwe';
import { useSebuClient } from '../hooks/useSebuClient';

// import { 
//     useNonce,
//     useSession,
//     useLogout,
//     useVerifySignature,
// } from '@/queries/auth';

export function SebuSIWEProvider({ children }: { children: React.ReactNode }) {

    const sebuClient = useSebuClient();
    if(!sebuClient) {
        return null;
    }

    const siweConfig: SIWEConfig = {
        getNonce: async () => {
            // useNonce().promise.then((res) => res.nonce)
            const res = await sebuClient.auth.getNonce();
            return res.nonce;
        },
        createMessage: ({ nonce, address, chainId }) => new SiweMessage({
            version: '1',
            domain: window.location.host,
            uri: window.location.origin,
            address,
            chainId,
            nonce,
            statement: 'Sign in With Wallet.',
        }).prepareMessage(),
        verifyMessage: async ({ message, signature }) => {
            // useVerifySignature({
            //     message,
            //     signature,
            // }).mutateAsync().then((res) => Boolean(res.wallet)),
            const res = await sebuClient.auth.verifySignature({ message, signature });
            return Boolean(res.address);
        },
        getSession: async () => {
            // useSession().promise as Promise<SIWESession>,
            const res = await sebuClient.auth.getSession();
            return res as SIWESession;
        },
        signOut: async () => {
            //useLogout().mutateAsync().then(() => true),
            await sebuClient.auth.logout();
            return true;
        },
    };

    return (
        <SIWEProvider {
            ...siweConfig
        } >
            {children}
        </SIWEProvider>
    );
}