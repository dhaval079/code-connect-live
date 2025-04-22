"use client"

import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import CodeConnect from './landing'

export default function Home() {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()

  // Redirect to auth page if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/auth')
    }
  }, [isLoaded, isSignedIn, router])

  // Show loading state before Clerk is loaded
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  // Show loading state while redirecting
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  // Show the main app once authenticated
  return <CodeConnect />
}