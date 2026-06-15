"use client";

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Home, RotateCw, Globe } from 'lucide-react';
import { RetroButton } from '@/components/atoms/RetroButton';
import { useTranslation } from '@/lib/i18n';

interface BrowserBarProps {
  url: string;
  onNavigate: (newUrl: string) => void;
  onBack: () => void;
  onForward: () => void;
  onHome: () => void;
  onRefresh: () => void;
  canBack: boolean;
  canForward: boolean;
  isLoading: boolean;
}

export const BrowserBar: React.FC<BrowserBarProps> = ({
  url,
  onNavigate,
  onBack,
  onForward,
  onHome,
  onRefresh,
  canBack,
  canForward,
  isLoading,
}) => {
  const { t } = useTranslation();
  const b = t.browser;
  const [inputVal, setInputVal] = useState(url);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim() !== '') {
      let formatted = inputVal.trim();
      if (!/^https?:\/\//i.test(formatted)) {
        formatted = `https://${formatted}`;
      }
      onNavigate(formatted);
    }
  };

  return (
    <div className="flex items-center gap-1.5 bg-black border border-cyber-cyan/20 p-1.5 select-none shrink-0 w-full">
      {/* Navigation Controls */}
      <div className="flex items-center gap-1">
        <RetroButton
          variant="unstyled"
          onClick={onBack}
          disabled={!canBack}
          className={`p-1.5 border border-cyber-cyan/20 text-cyber-cyan hover:bg-cyber-cyan/10 disabled:opacity-30 disabled:pointer-events-none cursor-pointer`}
          aria-label={b.navBack}
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
        </RetroButton>
        <RetroButton
          variant="unstyled"
          onClick={onForward}
          disabled={!canForward}
          className={`p-1.5 border border-cyber-cyan/20 text-cyber-cyan hover:bg-cyber-cyan/10 disabled:opacity-30 disabled:pointer-events-none cursor-pointer`}
          aria-label={b.navForward}
        >
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </RetroButton>
        <RetroButton
          variant="unstyled"
          onClick={onHome}
          className="p-1.5 border border-cyber-cyan/20 text-cyber-cyan hover:bg-cyber-cyan/10 cursor-pointer"
          aria-label={b.navHome}
        >
          <Home className="w-3.5 h-3.5" aria-hidden="true" />
        </RetroButton>
        <RetroButton
          variant="unstyled"
          onClick={onRefresh}
          className={`p-1.5 border border-cyber-cyan/20 text-cyber-cyan hover:bg-cyber-cyan/10 cursor-pointer ${
            isLoading ? 'animate-spin' : ''
          }`}
          aria-label={b.navRefresh}
        >
          <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
        </RetroButton>
      </div>

      {/* Address Form Container */}
      <form onSubmit={handleSubmit} className="flex-1 flex items-center relative h-7">
        <div className="absolute left-2.5 pointer-events-none">
          <Globe className={`w-3.5 h-3.5 ${isLoading ? 'text-cyber-green animate-pulse' : 'text-cyber-cyan/60'}`} aria-hidden="true" />
        </div>
        <label htmlFor="url-input" className="sr-only">{b.urlLabel}</label>
        <input
          id="url-input"
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="w-full h-full bg-[#03070b] border border-cyber-cyan/20 px-8 py-1 font-mono text-xs text-cyber-cyan tracking-wide focus:outline-none focus:border-cyber-cyan/60 select-auto selection:bg-cyber-cyan/30"
          placeholder={b.urlPlaceholder}
        />
        {isLoading && (
          <span className="absolute right-2 font-mono text-[8px] text-cyber-green bg-[#03070b] px-1 border border-cyber-green/30 tracking-tight select-none">
            {b.syncing}
          </span>
        )}
      </form>
    </div>
  );
};
