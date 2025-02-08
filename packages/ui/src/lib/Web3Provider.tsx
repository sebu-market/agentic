import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

import * as wagmiChains from "wagmi/chains";



const wagmiConfig = createConfig(
    getDefaultConfig({
      chains: [wagmiChains.baseSepolia],
      transports: {
        [wagmiChains.baseSepolia.id]: http(`${import.meta.env.WEB3_PROVIDER_44444}`)
      },
      walletConnectProjectId: import.meta.env.WC_PROJECT,
      appName: "sebu"
    })
  );

export const Web3Provider = (props: any) => {

   return (
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={props.queryClient}>
          <ConnectKitProvider>
            {props.children}
          </ConnectKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
   );
}