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