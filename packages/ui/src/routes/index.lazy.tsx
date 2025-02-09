import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useSIWE } from 'connectkit';

export const Route = createLazyFileRoute('/')({
  component: Index,
})

function Index() {

  return (
    <div className="p-2 min-h-96 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold mb-4 text-center logo w-[50%] pb-8">
        Funding the tokenized future through
        autonomous portfolios
        </div>

      <div className="w-64 h-64 mr-0 md:mr-8 ">
        <Logo className="h-64 w-64 flex-no-shrink" />
      </div>

    </div>
  )
}
