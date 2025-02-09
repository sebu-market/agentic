import { Toaster } from "@/components/ui/toaster";
import { QueryCache, QueryClient, QueryClientProvider, useQueryErrorResetBoundary } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { ConnectKitProvider } from "connectkit";
import { ErrorBoundary } from 'react-error-boundary';
import { WagmiProvider } from "wagmi";
import { ThemeProvider, useTheme } from "./components/theme-provider";
import { wagmiConfig } from "./config/wagmi";
import { SebuSIWEProvider } from "./context/sebu-siwe-provider";
import { routeTree } from './routeTree.gen';
import { ToastProvider, showToast } from './utils/toast-utils';
import { SebuClientProvider } from "./context/SebuClient.provider";
import { sebuClient } from "./queries/client";


// Create a new router instance
const router = createRouter({
  routeTree,
  // Tanstack Router has a built-in cache, but we rely 
  // on Tanstack Query for data fetching and caching
  defaultPreloadStaleTime: 0,
  context: {
    title: 'Home',
    breadcrumbs: [],
  }
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      experimental_prefetchInRender: true,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      showToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
      console.error(error);
    }
  })
});

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div role="alert">
    <p>Something went wrong:</p>
    <pre>{error.message}</pre>
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);



export function App() {
  // TODO: this seems to work, but it's surprising considering 
  // it's not being called from a child of ThemeProvider....
  const { theme } = useTheme()
  const { reset } = useQueryErrorResetBoundary();

  const defaultChainId = import.meta.env.VITE_DEFAULT_CHAIN_ID
    ? parseInt(import.meta.env.VITE_DEFAULT_CHAIN_ID, 10)
    : undefined;

  return (
    <ThemeProvider storageKey="ui-theme">
      <ToastProvider>
        <ErrorBoundary onReset={reset} FallbackComponent={ErrorFallback} >
          <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
              <SebuClientProvider client={sebuClient}>
                <SebuSIWEProvider>
                  <ConnectKitProvider mode={theme == 'system' ? 'auto' : theme} options={{ initialChainId: defaultChainId }}>
                    <RouterProvider router={router} />
                    <Toaster />
                  </ConnectKitProvider>
                </SebuSIWEProvider>
              </SebuClientProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </ErrorBoundary>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App