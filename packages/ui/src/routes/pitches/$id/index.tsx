import { PitchShowPage } from '@/pages/pitches/show/pitch-show-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pitches/$id/')({
  loader: async ({ context, params }) => {
    context.title = 'Show Pitch'
    context.breadcrumbs = [
      { label: 'Home', path: '/' },
      { label: 'Pitches', path: '/pitches' },
      { label: 'Show Pitch', path: '/pitches/$id' },
    ]
  },
  component: () => {
    const { id } = Route.useParams()
    return <PitchShowPage id={+id} />
  },
})
