import { Button } from '@/components/ui/button';
import { useEthersProvider } from '@/hooks/viemToEthers';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useSIWE } from 'connectkit';
import { Signer } from 'ethers';
import { useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useSebuClient } from '../hooks/useSebuClient';

export const Route = createLazyFileRoute('/')({
  component: Index,
})

function Index() {
  const { data, isSignedIn, signOut, signIn } = useSIWE();
  
 
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <p>
        {isSignedIn ? 'You are signed in' : 'You are not signed in'}
      </p>
      <Button onClick={isSignedIn ? signOut : signIn}>
        {isSignedIn ? 'Sign Out' : 'Sign In'}
      </Button>
      <h4>Data</h4>
      <pre>
        {JSON.stringify(data, null, 2)}
      </pre>
      
    </div>
  )
}
