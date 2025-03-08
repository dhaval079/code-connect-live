"use client"
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import CodeConnect from './landing';
import AuthModal from '@/components/Auth/AuthDialog';

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Handle initial auth state
  useEffect(() => {
    if (isLoaded) {
      setInitialLoadComplete(true);
      // Show auth modal if user is not signed in
      setShowAuthModal(!isSignedIn);
    }
  }, [isLoaded, isSignedIn]);

  // If auth state changes, update modal visibility
  useEffect(() => {
    if (initialLoadComplete) {
      setShowAuthModal(!isSignedIn);
    }
  }, [isSignedIn, initialLoadComplete]);

  // Keyboard shortcut for debug mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  // Handle modal close attempt
  const handleCloseModal = () => {
    // Only allow closing the modal if user is signed in
    if (isSignedIn) {
      setShowAuthModal(false);
    }
    // If not signed in, modal remains open
  };

  // Show loading state before Clerk is loaded
  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <>
      <CodeConnect />
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleCloseModal}
      />
    </>
  );
}