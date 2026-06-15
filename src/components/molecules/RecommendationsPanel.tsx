"use client";

import React from 'react';
import { RecommendationPage, GroundingSource } from '@/types';
import { Globe, Search, ExternalLink, ChevronLeft, ChevronRight, BookOpen, GraduationCap } from 'lucide-react';

interface RecommendationsPanelProps {
  pages: RecommendationPage[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onOpenUrl: (url: string, title: string) => void;
  onShowTutorial: () => void;
  isLoading?: boolean;
}

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  pages,
  currentPage,
  onPageChange,
  onOpenUrl,
  onShowTutorial,
  isLoading = false,
}) => {
  const totalPages = pages.length;
  const activePage = totalPages > 0 ? pages[currentPage] : null;

  return (
    <div className="flex flex-col h-full bg-[#03070b]/95 border border-cyber-cyan/30 text-white font-mono rounded overflow-hidden select-none">
      <div className="bg-gradient-to-r from-[#060e15] to-[#04090e] px-4 py-2 border-b border-cyber-cyan/25 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyber-magenta/80" aria-hidden="true" />
          <div className="w-2.5 h-2.5 rounded-full bg-cyber-cyan/80" aria-hidden="true" />
          <div className="w-2.5 h-2.5 rounded-full bg-cyber-green/80" aria-hidden="true" />
          <span className="text-[10px] text-cyber-cyan/70 tracking-widest leading-none ml-2 uppercase font-medium flex items-center gap-1.5">
            <Search className="w-3 h-3" />
            Web Nodemap Results
          </span>
        </div>
        <div className="flex items-center gap-2 text-[8px] text-cyber-cyan/50">
          <BookOpen className="w-2.5 h-2.5" />
          <span>{totalPages} page{totalPages !== 1 ? 's' : ''} indexed</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center select-none text-cyber-cyan">
          <div className="relative w-16 h-16 flex items-center justify-center border border-cyber-cyan/30 mb-4 animate-spin" aria-hidden="true">
            <div className="w-12 h-12 border border-cyber-cyan/50" />
            <div className="w-8 h-8 border border-cyber-cyan/80 absolute" />
          </div>
          <p className="tracking-widest animate-pulse font-bold uppercase text-glow-cyan text-xs">
            [ SCANNING WEB NODES ]
          </p>
        </div>
      ) : totalPages === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-14 h-14 rounded-full border border-dashed border-cyber-cyan/20 flex items-center justify-center mb-3">
            <Globe className="w-6 h-6 text-cyber-cyan/30" />
          </div>
          <p className="font-mono text-xs text-cyber-cyan/60 tracking-widest font-bold uppercase mb-1">
            No Web Results Yet
          </p>
          <p className="font-mono text-[10px] text-gray-600 max-w-[220px] leading-relaxed">
            Ask VIL a question to fetch grounded web data. Results will appear here.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-cyber-cyan/10 bg-black/30 shrink-0">
              <div className="flex items-center gap-1 text-[9px] text-cyber-cyan/60">
                <Globe className="w-2.5 h-2.5" />
                <span>Page {currentPage + 1} / {totalPages}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 0}
                  className="p-1 border border-cyber-cyan/20 text-cyber-cyan/60 hover:text-cyber-cyan hover:border-cyber-cyan/50 disabled:opacity-20 disabled:pointer-events-none cursor-pointer transition-all"
                  aria-label="Newer results"
                >
                  <ChevronLeft className="w-3 h-3" aria-hidden="true" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const start = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
                  const pageNum = start + i;
                  if (pageNum >= totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`w-5 h-5 text-[9px] border transition-all cursor-pointer ${
                        pageNum === currentPage
                          ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan'
                          : 'border-cyber-cyan/15 text-cyber-cyan/40 hover:border-cyber-cyan/40 hover:text-cyber-cyan/70'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="p-1 border border-cyber-cyan/20 text-cyber-cyan/60 hover:text-cyber-cyan hover:border-cyber-cyan/50 disabled:opacity-20 disabled:pointer-events-none cursor-pointer transition-all"
                  aria-label="Older results"
                >
                  <ChevronRight className="w-3 h-3" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto cyber-scrollbar p-3 space-y-2.5">
            {activePage && (
              <div className="mb-2 px-2 py-1 border-l-2 border-cyber-cyan/30 bg-cyber-cyan/5">
                <p className="text-[9px] text-cyber-cyan/50 uppercase tracking-wider">Query</p>
                <p className="text-[11px] text-cyber-cyan/80 font-bold truncate">{activePage.query}</p>
              </div>
            )}

            {activePage?.sources.map((source: GroundingSource) => (
              <div
                key={source.index}
                onClick={() => onOpenUrl(source.uri, source.title)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenUrl(source.uri, source.title); } }}
                role="button"
                tabIndex={0}
                className="border border-cyber-cyan/15 bg-black/40 hover:bg-cyber-cyan/5 hover:border-cyber-cyan/40 transition-all rounded-sm group cursor-pointer"
              >
                <div className="p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-white font-bold truncate group-hover:text-cyber-cyan transition-colors">
                        {source.title || 'Untitled Node'}
                      </p>
                      <p className="text-[8px] text-gray-500 truncate mt-0.5 flex items-center gap-1">
                        <Globe className="w-2 h-2 shrink-0" />
                        {source.uri.replace(/^https?:\/\/(www\.)?/, '')}
                      </p>
                    </div>
                    <ExternalLink className="shrink-0 w-3 h-3 text-cyber-cyan/40 group-hover:text-cyber-cyan transition-colors" />
                  </div>
                  {source.snippet && (
                    <p className="text-[9px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed border-t border-cyber-cyan/5 pt-1.5">
                      {source.snippet}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {activePage?.sources.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-[10px] text-gray-500">No web nodes found for this query.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="px-3 py-1.5 border-t border-cyber-cyan/10 bg-black/30 shrink-0 flex items-center justify-between text-[8px] text-gray-600">
        <span>Results: {activePage?.sources.length || 0} / 10</span>
        <button
          onClick={onShowTutorial}
          className="w-7 h-7 flex items-center justify-center border border-cyber-cyan/30 text-cyber-cyan/50 hover:text-cyber-cyan hover:border-cyber-cyan/70 hover:bg-cyber-cyan/10 transition-all cursor-pointer"
          aria-label="Show tutorial"
        >
          <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
