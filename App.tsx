/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import { initMinorRepairApp } from './minorRepairApp';

export default function App() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const cleanup = initMinorRepairApp(rootRef.current);
    return () => {
      cleanup();
    };
  }, []);

  return <div id="app-root" ref={rootRef} />;
}

