import { ScreeningShowPage } from '@/pages/screenings/show/screening-show-page'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { queries } from '@/queries/screenings'

export const Route = createFileRoute('/screenings/$id/')({
  loader: async ({ context, params }) => {
    context.title = 'Show Screening'
    context.breadcrumbs = [
      { label: 'Home', path: '/' },
      { label: 'Screenings', path: '/screenings' },
      { label: 'Show Screening', path: '/screenings/$id' },
    ]
  },
  component: () => {
    const { id } = Route.useParams();
    return <ScreeningShowPage id={+id} />
  },
})
