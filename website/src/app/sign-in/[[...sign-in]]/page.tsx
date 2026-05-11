import type { Metadata } from 'next'
import { AuthLanding } from '@/components/AuthLanding'

export const metadata: Metadata = {
  title: 'Sign In — Consult The Dead',
  robots: { index: false, follow: false },
}

export default function SignInPage() {
  return <AuthLanding />
}
