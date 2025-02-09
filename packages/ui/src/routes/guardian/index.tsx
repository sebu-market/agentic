import { GuardianIndexPage } from '@/pages/guardian/index/guardian-index-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/guardian/')({
  loader: async ({ context }) => {
    context.title = 'Guaridan'
    context.breadcrumbs = [
      { label: 'Home', path: '/' },
      { label: 'Guardian', path: '/guardian' },
    ]
  },
  component: () => <GuardianIndexPage />,
})
