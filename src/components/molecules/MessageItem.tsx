"use client";

import React from 'react';
import { Message, GroundingSource } from '@/types';
import { Monitor, User, Globe, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface MessageItemProps {
  message: Message;
  onOpenUrl?: (url: string, title: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onOpenUrl }) => {
  const { t } = useTranslation();
  const isUser = message.role === 'user';

  const formatText = (rawText: string) => {
    return rawText.split('\n').map((line, index) => {
      if (line.startsWith('### ')) {
        return <h4 key={index} className="text-cyber-cyan text-xs font-bold tracking-widest uppercase mt-4 mb-2">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={index} className="text-cyber-cyan text-sm font-bold tracking-widest uppercase mt-4 mb-2">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return (
          <li key={index} className="ml-4 list-disc text-slate-300 font-mono text-xs leading-relaxed mt-1">
            {line.substring(2)}
          </li>
        );
      }
      if (line.startsWith('`') && line.endsWith('`')) {
        return (
          <div key={index} className="bg-black/40 border border-cyber-cyan/15 rounded px-2 py-1 my-1 font-mono text-[10px] text-cyber-green overflow-x-auto">
            {line.replace(/`/g, '')}
          </div>
        );
      }
      return (
        <p key={index} className="font-mono text-xs leading-relaxed text-slate-300 mb-1.5 break-words">
          {line}
        </p>
      );
    });
  };

  return (
    <div
      className={`border-b border-cyber-border/40 p-4 transition-all ${
        isUser ? 'bg-black/20' : 'bg-cyber-card/10'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isUser ? (
            <>
              <div className="p-1 border border-cyber-green/30 bg-cyber-green/5">
                <User className="w-3.5 h-3.5 text-cyber-green" aria-hidden="true" />
              </div>
              <span className="font-mono text-[10px] uppercase font-bold text-cyber-green tracking-widest">
                {t.chat.userLabel}
              </span>
            </>
          ) : (
            <>
              <div className="p-1 border border-cyber-cyan/30 bg-cyber-cyan/5">
                <Monitor className="w-3.5 h-3.5 text-cyber-cyan" aria-hidden="true" />
              </div>
              <span className="font-mono text-[10px] uppercase font-bold text-cyber-cyan tracking-widest">
                {t.chat.aiLabel}
              </span>
            </>
          )}
        </div>
        <span className="font-mono text-[9px] text-gray-500">{message.timestamp}</span>
      </div>

      <div className="pl-7 pr-2 font-mono text-xs text-slate-100">
        {formatText(message.text)}
      </div>

      {message.isSearchingWeb && (
        <div className="pl-7 mt-3 flex items-center gap-2 font-mono text-[10px] text-cyber-cyan animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan" aria-hidden="true"></span>
          <span>{t.chat.searching}</span>
        </div>
      )}

      {message.groundingSources && message.groundingSources.length > 0 && (
        <div className="pl-7 mt-4 pt-3 border-t border-cyber-border/20">
          <div className="flex items-center gap-1.5 mb-2 font-mono text-[10px] text-slate-400">
            <Globe className="w-3 h-3 text-cyber-cyan" aria-hidden="true" />
            <span className="uppercase tracking-widest">{t.chat.sources}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {message.groundingSources.map((source: GroundingSource) => (
              <button
                key={source.index}
                onClick={() => onOpenUrl?.(source.uri, source.title)}
                className="flex items-center gap-2 bg-black/60 border border-cyber-cyan/20 hover:border-cyber-cyan/80 px-2 py-1 text-left group transition-all cursor-pointer rounded-sm hover:shadow-[0_0_8px_rgba(0,240,255,0.15)]"
                title={`Decrypt content for: ${source.uri}`}
              >
                <div className="flex-1 overflow-hidden">
                  <p className="font-mono text-[9px] text-white font-medium truncate leading-none mb-0.5 group-hover:text-cyber-cyan">
                    {source.title}
                  </p>
                  <p className="font-mono text-[8px] text-slate-500 truncate leading-none">
                    {source.uri.replace(/^https?:\/\/(www\.)?/, '')}
                  </p>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyber-cyan transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
