'use client'
import { SignUp } from '@clerk/nextjs'

export function SignUpClient() {
  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: 'var(--bg)'
    }}>
      <SignUp />
    </div>
  )
}
