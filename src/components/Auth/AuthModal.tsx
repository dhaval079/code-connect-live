"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Loader2 } from "lucide-react"
import AuthPage from "./AuthDialog"

export default function AuthRoute() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()

  // If user is already signed in, redirect to home page
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/")
    }
  }, [isLoaded, isSignedIn, router])

  // Handle successful authentication
  const handleSuccessfulAuth = () => {
    router.push("/")
  }

  // Show loading state while Clerk loads
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  // Render auth page if user is not signed in
  return <AuthPage onSuccessfulAuth={handleSuccessfulAuth} />
}