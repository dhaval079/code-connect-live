"use client";
import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import CodeConnect from './landing'
import UserProfile from '@/components/Dashboard/(dashboard)/UserProfile'
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

  // Smooth scroll function with navbar offset
  const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId.replace('#', ''));
    if (element) {
      const navbarHeight = 80; // Adjust this to match your navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Handle navigation click
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    e.preventDefault();
    smoothScrollTo(link);
    setIsMobileMenuOpen(false); // Close mobile menu if open
  };

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
      name: "About",
      link: "#about",
    },
    {
      name: "FAQ",
      link: "#faq",
    },
  ];

  return (
    <>
      {/* Fixed Navbar */}
      <Navbar className=''>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo visible={undefined} />
          {/* Custom NavItems with smooth scroll */}
          <div className="hidden md:flex items-center justify-center mx-auto w-full mr-16 space-x-8">
            {navItems.map((item, idx) => (
              <a
                key={`nav-link-${idx}`}
                href={item.link}
                onClick={(e) => handleNavClick(e, item.link)}
                className="text-sm font-medium text-white hover:text-cyan-400 transition-colors duration-200 cursor-pointer"
              >
                {item.name}
              </a>
            ))}
          </div>
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
                onClick={(e) => handleNavClick(e, item.link)}
                className="block py-3 text-lg font-medium text-white hover:text-cyan-400 transition-colors border-b border-gray-800 last:border-b-0 cursor-pointer"
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