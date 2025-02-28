"use client"

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import CodeConnect from './landing';
import AuthModal from '@/components/Auth/AuthDialog';

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      setShowAuthModal(true);
    }
  }, [isLoaded, isSignedIn]);

  // Add to src/app/page.tsx
useEffect(() => {
  const handleKeyDown = (e:any) => {
    // Press Ctrl+Shift+D to remove potential overlays
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      document.querySelectorAll('.fixed, .absolute').forEach((el) => {
        if (el.classList.contains('debug-remove')) {
          (el as HTMLElement).style.display = 'none';
        }
      });
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);

  return (
    <>
      <CodeConnect />
      <AuthModal
        isOpen={showAuthModal} 
        onClose={() => {
          if (isSignedIn) {
            setShowAuthModal(false);
          }
        }} 
      />
    </>
  );
}