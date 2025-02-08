import { RoundsShowPage } from '@/pages/rounds/show/rounds-show-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/rounds/')({
  loader: async ({ context }) => {
    context.title = 'Current Round'
    context.breadcrumbs = [
      { label: 'Home', path: '/' },
      { label: 'Rounds', path: '/rounds' },
    ]
  },
  component: () => <RoundsShowPage />,
})
