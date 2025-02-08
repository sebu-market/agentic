import { PitchesSignupPage } from '@/pages/screenings/signup/pitches-signup-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/screenings/signup')({
  loader: async ({ context }) => {
    context.title = 'Pitches - Sign Up'
    context.breadcrumbs = [
      { label: 'Home', path: '/' },
      { label: 'Pitches', path: '/pitches' },
      { label: 'Sign Up', path: '/pitches/signup' },
    ]
  },
  component: () => <PitchesSignupPage />,
})
