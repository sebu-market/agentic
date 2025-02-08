import { FooterSection } from '@/components/sebu/layout/footer-section/footer-section'
import { TopMenu } from '@/components/sebu/layout/top-menu/top-menu'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { useAccount, useChainId } from 'wagmi'
import { useEthersProvider } from '../hooks/viemToEthers'
import { useSebuClient } from '../hooks/useSebuClient'
import { useEffect } from 'react'
import { Signer } from 'ethers'
import { useSIWE } from 'connectkit'

export interface BreadcrumbsContext {
  label: string; //Leaves<CustomTypeOptions['resources']['breadcrumbs']>;
  path?: string; //RoutePath<typeof routeTree>;
}

export interface RouterContext {
  title: string;
  breadcrumbs: BreadcrumbsContext[];
}

// Create a client
//const queryClient = new QueryClient()

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => {
    const chainId = useChainId();
    let provider: Signer | undefined;
    if(chainId) {
      provider = useEthersProvider({chainId});
    }
    const account = useAccount();
    const sebu = useSebuClient();
    const { isSignedIn } = useSIWE();

    useEffect(() => {
      if(sebu && isSignedIn && provider) {
          (async () => {
            await sebu.web3.setAddressAndProvider({
              address: account.address!, 
              signer: provider,
              chainId
            });
          })();
      }
    }, [sebu, isSignedIn, provider]);


    return (
    <>
        {/* <LoginForm/> */}
        <div className='grid grid-cols-12 gap-4 p-4 '>
          <header className='col-span-12'>
            <TopMenu />
          </header>

          <main className='col-span-12'>
            <Outlet />
          </main>

          <footer className='col-span-12'>
            <FooterSection />
      <TanStackRouterDevtools />
      <ReactQueryDevtools />
          </footer>
        </div>
        {/* <ModeToggle /> */}

    </>
  )},
})


