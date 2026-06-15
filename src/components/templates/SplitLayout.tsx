"use client";

import React from 'react';
import { Scanlines } from '@/components/atoms/Scanlines';

interface SplitLayoutProps {
  leftSidebar: React.ReactNode; // 30% chat panel and avatar
  rightBrowser: React.ReactNode; // 70% virtual browser
}

export const SplitLayout: React.FC<SplitLayoutProps> = ({ leftSidebar, rightBrowser }) => {
  return (
    <div className="w-full h-full min-h-screen bg-cyber-bg text-white relative flex flex-col items-stretch overflow-hidden select-none crt-screen">
      {/* Scanline CRT glass overlay across the entire cockpit */}
      <Scanlines />

      {/* Under Layer Cyber decorative neon grid line details */}
      <div className="absolute inset-0 bg-cyber-bg opacity-30 cyber-grid-bg pointer-events-none" aria-hidden="true" />

      {/* Interactive Main Split Grid: 30% (AI CORE) and 70% (BROWSER VIEWER) */}
      <main className="flex-1 w-full flex flex-col md:flex-row items-stretch overflow-hidden p-3 gap-3 relative z-10 min-h-0">
        
        {/* Left Side: 30% Width Chat Cockpit */}
        <section className="w-full md:w-[30%] min-w-[280px] flex flex-col items-stretch bg-[#04090e]/85 border border-cyber-cyan/20 rounded shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden min-h-0">
          {leftSidebar}
        </section>

        {/* Right Side: 70% Width Virtual Web Browser Window */}
        <section className="flex-1 flex flex-col items-stretch bg-[#04090e]/85 border border-cyber-cyan/20 rounded shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden min-h-0">
          {rightBrowser}
        </section>

      </main>

      {/* Decorative Cyber bottom dashboard bar */}
      <div className="h-6 shrink-0 bg-[#020508] border-t border-cyber-cyan/15 px-4 flex items-center justify-between font-mono text-[8px] tracking-wider text-slate-500 z-10 select-none md:flex">
        <div className="flex items-center gap-3">
          <span>PORT: 3000 :: DEPLOY_ACTIVE</span>
          <span className="hidden md:inline text-cyber-cyan">MATRIX MODULE ENABLED [v2.4.0]</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="animate-pulse text-cyber-green flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-cyber-green" aria-hidden="true"></span>
            SECURE LINK_ESTABLISHED
          </span>
          <span>© MCMLXIX CYBER_CORP</span>
        </div>
      </div>
    </div>
  );
};
