import React, { useState, useEffect } from 'react';
import DesktopView from './DesktopView';
import MobileView from './MobileView';

export default function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile screens (less than 1024px wide)
    const checkSize = () => setIsMobile(window.innerWidth < 1024);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  return isMobile ? <MobileView /> : <DesktopView />;
}