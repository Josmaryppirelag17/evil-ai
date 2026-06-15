"use client";

import React from 'react';
import { BrowserTabState, RecommendationPage } from '@/types';
import { VirtualBrowserWindow } from '@/components/organisms/VirtualBrowserWindow';
import { RecommendationsPanel } from '@/components/molecules/RecommendationsPanel';
import { ArrowLeft, Terminal } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SearchResultsProps {
  detailView: { url: string; title: string } | null;
  browserState: BrowserTabState;
  isBrowserLoading: boolean;
  recommendationPages: RecommendationPage[];
  currentRecPage: number;
  onDetailViewClose: () => void;
  onNavigate: (url: string, title?: string) => void;
  onBrowserBack: () => void;
  onBrowserForward: () => void;
  onBrowserHome: () => void;
  onBrowserRefresh: () => void;
  onPageChange: (page: number) => void;
  onOpenUrl: (url: string) => void;
  onShowTutorial: () => void;
  onOpenAuth?: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  detailView,
  browserState,
  isBrowserLoading,
  recommendationPages,
  currentRecPage,
  onDetailViewClose,
  onNavigate,
  onBrowserBack,
  onBrowserForward,
  onBrowserHome,
  onBrowserRefresh,
  onPageChange,
  onOpenUrl,
  onShowTutorial,
  onOpenAuth,
}) => {
  const { user, isLoading: authLoading } = useAuth();

  if (detailView) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#060e15] border-b border-cyber-cyan/25 shrink-0">
          <button
            onClick={onDetailViewClose}
            className="flex items-center gap-1 text-[9px] text-cyber-cyan/70 hover:text-cyber-cyan border border-cyber-cyan/20 hover:border-cyber-cyan/50 px-2 py-0.5 transition-all cursor-pointer"
            aria-label="Back to search results"
          >
            <ArrowLeft className="w-2.5 h-2.5" aria-hidden="true" />
            BACK TO RESULTS
          </button>
          <span className="text-[9px] text-cyber-cyan/50 truncate flex-1 text-right">
            {detailView.title}
          </span>
        </div>
        <VirtualBrowserWindow
          state={browserState}
          isLoading={isBrowserLoading}
          onNavigate={(url) => onNavigate(url)}
          onBack={onBrowserBack}
          onForward={onBrowserForward}
          onHome={onBrowserHome}
          onRefresh={onBrowserRefresh}
          canBack={browserState.historyIndex > 0}
          canForward={browserState.historyIndex < browserState.history.length - 1}
        />
      </div>
    );
  }

  if (!authLoading && !user && recommendationPages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#03070b]/95 border border-cyber-cyan/30 rounded p-8 text-center select-none">
        <Terminal className="w-10 h-10 text-cyber-cyan/30 mb-4" aria-hidden="true" />
        <p className="font-mono text-xs text-cyber-cyan/60 mb-2 max-w-xs">
          Your conversation history is currently session-only.
        </p>
        <p className="font-mono text-[10px] text-gray-500 max-w-xs leading-relaxed">
          <span className="text-cyber-cyan">Sign in</span> to save your chat history.
          Without an account, all data will be lost when you close this page.
        </p>
        <button
          onClick={onOpenAuth}
          className="mt-5 px-5 py-2 bg-cyber-cyan/10 border border-cyber-cyan/50 text-cyber-cyan font-mono text-[11px] tracking-wider hover:bg-cyber-cyan/20 hover:border-cyber-cyan transition-all cursor-pointer"
          aria-label="Abrir inicio de sesión o registro"
        >
          [ SIGN IN / REGISTER ]
        </button>
        <div className="mt-4 flex items-center gap-1.5 text-[9px] text-gray-600 font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-cyber-cyan/40 animate-pulse" aria-hidden="true" />
          SESSION :: EPHEMERAL
        </div>
      </div>
    );
  }

  return (
    <RecommendationsPanel
      pages={recommendationPages}
      currentPage={currentRecPage}
      onPageChange={onPageChange}
      onOpenUrl={(url) => onOpenUrl(url)}
      onShowTutorial={onShowTutorial}
      isLoading={isBrowserLoading && recommendationPages.length === 0}
    />
  );
};
