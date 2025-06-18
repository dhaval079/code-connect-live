import { useState, useEffect } from 'react';

export const useIsMobile = (breakpoint: number = 1024) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Check on mount
    checkDevice();
    
    // Listen for resize
    window.addEventListener('resize', checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, [breakpoint]);

  return isMobile;
};