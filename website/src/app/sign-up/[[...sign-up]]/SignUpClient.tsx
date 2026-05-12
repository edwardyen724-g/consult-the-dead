'use client'
import { SignUp } from '@clerk/nextjs'
import { useClerkUtmStamper } from '@/lib/use-clerk-utm-stamper'

export function SignUpClient() {
  useClerkUtmStamper()

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: 'var(--bg)'
    }}>
      <SignUp />
    </div>
  )
}
