"use client"
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function NotFoundContent() {
  const searchParams = useSearchParams()
  
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
    </div>
  )
}

export default function NotFound() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  )
}