import { useEffect, useRef } from 'react';
import { initMinorRepairApp } from './minorRepairApp';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      initMinorRepairApp(containerRef.current);
    }
  }, []);

  return <div ref={containerRef} className="w-full min-h-screen" />;
}
