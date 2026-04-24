import React, { useState, useEffect } from 'react';
import DesktopView from './DesktopView';
import MobileView from './MobileView';

export default function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Standard professional laptop vs mobile breakpoint
    const checkRes = () => setIsMobile(window.innerWidth < 1024);
    checkRes();
    window.addEventListener('resize', checkRes);
    return () => window.removeEventListener('resize', checkRes);
  }, []);

  return isMobile ? <MobileView /> : <DesktopView />;
}