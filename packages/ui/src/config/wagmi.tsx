import { getDefaultConfig } from "connectkit";
import { createConfig, http } from "wagmi";
import { arbitrum, base, baseSepolia, Chain } from "wagmi/chains";


const forkedChain = {
  ...base,
  id: 44444,
  name: 'Hardhat',
  rpcUrls: {
    default: {
      http: ['http://localhost:8545'],
    },
  },
};

const enabledChainIds = import.meta.env.VITE_ENABLED_CHAINS
  .split(',')
  .filter(Boolean)
  .map((id: string) => parseInt(id, 10));

// readonly
const availableChains: Chain[] = [
  base,
  arbitrum,
  baseSepolia,
  forkedChain,
] as const;

const configuredChains = availableChains.filter(
  (chain) => enabledChainIds.includes(chain.id)
) as [Chain, ...Chain[]];

if (!configuredChains.length) {
  throw new Error('No enabled chains');
}

export const wagmiConfig = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: configuredChains,
    transports: {
      [forkedChain.id]: http(
        forkedChain.rpcUrls.default.http[0]
      ),
      // RPC URL for each chain
      [base.id]: http(
        `https://mainnet.base.org`
      ),
      [baseSepolia.id]: http(
        'https://sepolia.base.org',
      ),
    },

    // Required API Keys
    walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,

    // Required App Info
    appName: "Sebu",

    // Optional App Info
    appDescription: "",
    // // your app's url
    appUrl: "https://sebu.market",
    // // your app's icon, no bigger than 1024x1024px (max. 1MB)
    appIcon: "https://sebu.market/logo.png",
  }),
);
