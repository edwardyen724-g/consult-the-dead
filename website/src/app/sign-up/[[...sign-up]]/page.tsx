import type { Metadata } from 'next'
import { SignUpClient } from './SignUpClient'
import { UtmStamper } from './UtmStamper'

export const metadata: Metadata = {
  title: 'Sign Up — Consult The Dead',
  robots: { index: false, follow: false },
}

export default function SignUpPage() {
  return (
    <>
      {/*
        UtmStamper is a client component that runs a single useEffect on
        mount: it reads utm_source / utm_campaign / utm_content from the
        URL and stamps them into the Clerk sign-up unsafeMetadata so the
        user.created webhook can attribute the signup to an acquisition
        channel. It renders nothing and fails open when UTMs are absent.
      */}
      <UtmStamper />
      <SignUpClient />
    </>
  )
}
