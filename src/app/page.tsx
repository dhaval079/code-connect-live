// page.tsx - Updated with debug and proper state management
"use client";
import UserProfile from "@/components/Dashboard/UserProfile";
import { MobileNav, MobileNavHeader, MobileNavMenu, MobileNavToggle, Navbar, NavbarButton, NavbarLogo, NavBody, NavItems } from "@/components/ui/resizable-navbar";
import { useState, useEffect } from "react";
import CodeConnect from "./landing";

export default function Page() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Debug: Log state changes
  useEffect(() => {
    console.log('Mobile menu open state changed:', isMobileMenuOpen);
  }, [isMobileMenuOpen]);

  const navigationItems = [
    { name: "Features", link: "#features" },
    { name: "How It Works", link: "#how-it-works" },
    { name: "FAQ", link: "#faq" },
  ];

  const handleMobileItemClick = () => {
    console.log('Menu item clicked, closing menu');
    setIsMobileMenuOpen(false);
  };

  const handleToggleClick = () => {
    console.log('Toggle clicked, current state:', isMobileMenuOpen);
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen">
      {/* Desktop navbar - hidden on mobile */}
      <div className="hidden lg:block">
        <Navbar className="top-0">
          <NavBody className="flex">
            <NavbarLogo />
            <div className="flex gap-8 items-center">
              <NavItems
                items={navigationItems}
                onItemClick={handleMobileItemClick}
                className="justify-center align-middle items-center mx-auto w-full"
              />
            </div>
            <div className="flex items-center gap-4">
              <UserProfile />
            </div>
          </NavBody>
        </Navbar>
      </div>

      {/* Mobile navbar - hidden on desktop */}
      <div className="block lg:hidden">
        <Navbar className="top-0">
          <MobileNav>
            <MobileNavHeader className="flex items-center justify-between p-4">
              <NavbarLogo />
              <div className="flex items-center gap-4">
                <UserProfile />
                <MobileNavToggle
                  isOpen={isMobileMenuOpen}
                  onClick={handleToggleClick}
                />
              </div>
            </MobileNavHeader>

            <MobileNavMenu
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
            >
              {/* Debug: Show state */}
              <div className="text-xs text-gray-400 mb-2">
                Menu state: {isMobileMenuOpen ? 'OPEN' : 'CLOSED'}
              </div>
              
              {/* Mobile Menu Items */}
              {navigationItems.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  onClick={handleMobileItemClick}
                  className="block py-3 px-4 text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </MobileNavMenu>
          </MobileNav>
        </Navbar>
      </div>

      {/* Your main content - NO CHANGES to CodeConnect */}
      <CodeConnect />
    </div>
  );
}