"use client";
import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import CodeConnect from './landing'
import UserProfile from '@/components/Dashboard/UserProfile'
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";

export default function Home() {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const navItems = [
    {
      name: "Features",
      link: "#features",
    },
    {
      name: "How It Works",
      link: "#how-it-works",
    },
    {
      name: "FAQ",
      link: "#faq",
    },
  ];

  return (
    <>
      {/* Fixed Navbar */}
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center">
            <UserProfile />
          </div>
        </NavBody>
        
        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <div className="flex items-center gap-3">
              <UserProfile />
              <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-3 text-lg font-medium text-white hover:text-cyan-400 transition-colors border-b border-gray-800 last:border-b-0"
              >
                {item.name}
              </a>
            ))}
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
      
      {/* Main Content */}
      <div className="min-h-screen">
        <CodeConnect />
      </div>
    </>
  )
}