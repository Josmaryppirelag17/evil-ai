"use client";

import React, { useEffect, useRef } from 'react';
import { Message } from '@/types';
import { MessageItem } from '@/components/molecules/MessageItem';
import { useTranslation } from '@/lib/i18n';

interface ChatListProps {
  messages: Message[];
  onOpenUrl?: (url: string, title: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ messages, onOpenUrl }) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      role="log"
      aria-live="polite"
      aria-label={t.chat.aiLabel || "Chat messages"}
      className="flex-1 overflow-y-auto cyber-scrollbar bg-black/40 border-x border-cyber-border/30 min-h-0"
    >
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-12 h-12 rounded-full border border-dashed border-cyber-cyan/30 flex items-center justify-center mb-3 animate-pulse">
            <span className="font-mono text-xs text-cyber-cyan font-bold">&gt;_</span>
          </div>
          <p className="font-mono text-xs text-cyber-cyan/80 tracking-widest font-bold uppercase mb-1">
            {t.chat.emptyTitle}
          </p>
          <p className="font-mono text-[10px] text-gray-500 max-w-[200px] leading-relaxed">
            {t.chat.emptyDesc}
          </p>
        </div>
      ) : (
        messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} onOpenUrl={onOpenUrl} />
        ))
      )}
    </div>
  );
};
