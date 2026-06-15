"use client";

import React from 'react';
import { Message } from '@/types';
import { AiAvatar } from '@/components/molecules/AiAvatar';
import { ChatList } from '@/components/molecules/ChatList';
import { TerminalInput } from '@/components/atoms/TerminalInput';
import { RetroButton } from '@/components/atoms/RetroButton';
import { Send, Mic, Volume2, Sparkles, Languages } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface ChatMessagesProps {
  messages: Message[];
  suggestions: string[];
  isGenerating: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: string;
  speechRate: number;
  inputQuery: string;
  honeypotRef: React.MutableRefObject<string>;
  onInputChange: (value: string) => void;
  onSelectVoice: (voice: string) => void;
  onSpeechRateChange: (rate: number) => void;
  onMicClick: () => void;
  onSend: (e?: React.FormEvent) => void;
  onSpeakLast: () => void;
  onSuggestionClick: (suggestion: string) => void;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  suggestions,
  isGenerating,
  isSpeaking,
  isListening,
  voices,
  selectedVoice,
  speechRate,
  inputQuery,
  honeypotRef,
  onInputChange,
  onSelectVoice,
  onSpeechRateChange,
  onMicClick,
  onSend,
  onSpeakLast,
  onSuggestionClick,
}) => {
  const { t, locale, setLocale } = useTranslation();

  const toggleLocale = () => {
    setLocale(locale === "es" ? "en" : "es");
  };

  return (
    <div className="flex flex-col flex-1 bg-[#04090e]/95 relative min-h-0 overflow-hidden">
      <AiAvatar isSpeaking={isSpeaking} isGenerating={isGenerating} />

      {suggestions.length > 0 && (
        <div className="flex gap-1.5 p-2 overflow-x-auto shrink-0 flex-wrap justify-center border-b border-cyber-cyan/15 bg-black/30">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSuggestionClick(s)}
              disabled={isGenerating}
              className="font-mono text-[9px] px-2 py-1 rounded-sm border border-cyber-cyan/20 bg-cyber-cyan/5 text-cyber-cyan/70 hover:text-cyber-cyan hover:border-cyber-cyan/50 hover:bg-cyber-cyan/10 transition-all whitespace-nowrap cursor-pointer disabled:opacity-30 min-h-[32px]"
            >
              <Sparkles className="w-2.5 h-2.5 inline mr-1" aria-hidden="true" />
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="bg-[#060e15] border-y border-cyber-cyan/15 px-3 py-1 flex items-center justify-between shrink-0">
        <span className="font-mono text-[9px] text-cyber-cyan tracking-widest uppercase font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" aria-hidden="true" />
          {t.nav.title}
        </span>
        <span className="font-mono text-[8px] text-gray-500 uppercase">{t.nav.session}</span>
      </div>

      <ChatList messages={messages} onOpenUrl={(url) => window.open(url, '_blank', 'noopener,noreferrer')} />

      <div className="p-2 border-t border-cyber-cyan/15 bg-black shrink-0 space-y-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onMicClick}
            disabled={isGenerating}
            aria-label={t.common.speak}
            className={`p-1.5 border rounded-sm transition-all cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center ${
              isListening
                ? 'border-cyber-magenta text-cyber-magenta bg-cyber-magenta/10 animate-pulse'
                : 'border-cyber-cyan/20 text-cyber-cyan/60 hover:text-cyber-cyan hover:border-cyber-cyan/40'
            } disabled:opacity-30`}
          >
            <Mic className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          <label htmlFor="voice-select" className="sr-only">{t.voice.defaultVoice}</label>
          <select
            id="voice-select"
            value={selectedVoice}
            onChange={e => onSelectVoice(e.target.value)}
            className="flex-1 bg-[#03070b] border border-cyber-cyan/20 text-cyber-cyan/70 text-[9px] font-mono px-1.5 py-1 rounded-sm outline-none focus:border-cyber-cyan/50 cursor-pointer"
          >
            <option value="">{t.voice.defaultVoice}</option>
            {voices.map(v => (
              <option key={v.name} value={v.name}>{v.name}</option>
            ))}
          </select>

          <div className="flex items-center gap-1 text-cyber-cyan/40">
            <Volume2 className="w-3 h-3" aria-hidden="true" />
            <label htmlFor="speech-rate" className="sr-only">Speech rate</label>
            <input
              id="speech-rate"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speechRate}
              onChange={e => onSpeechRateChange(Number.parseFloat(e.target.value))}
              className="w-14 h-1 accent-cyber-cyan cursor-pointer"
            />
          </div>
        </div>

        <form onSubmit={onSend} className="flex gap-1.5 items-center">
          <input
            type="text"
            name="_honey"
            defaultValue=""
            onChange={e => { honeypotRef.current = e.target.value; }}
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
          <div className="flex-1">
            <TerminalInput
              prefixText="VIL:"
              value={inputQuery}
              onChange={e => onInputChange(e.target.value)}
              placeholder={t.chat.placeholder}
              disabled={isGenerating}
              ariaLabel={t.chat.placeholder}
            />
          </div>
          <RetroButton
            type="submit"
            variant="cyan"
            disabled={isGenerating || !inputQuery.trim()}
            onClick={() => onSend()}
            className="p-2 border border-cyber-cyan text-cyber-cyan h-8 w-8 flex items-center justify-center cursor-pointer hover:shadow-[0_0_8px_rgba(0,240,255,0.4)] disabled:opacity-30 disabled:pointer-events-none"
            aria-label={t.chat.sendTooltip}
          >
            <Send className="w-3.5 h-3.5" aria-hidden="true" />
          </RetroButton>
        </form>

        <div className="flex items-center justify-between px-1 font-mono text-[8px] text-gray-600">
          <span>{t.chat.enterToSend}</span>
          <button onClick={onSpeakLast} className="hover:text-cyber-cyan transition-colors cursor-pointer font-mono" title={t.common.repeat} aria-label={t.common.repeat}>
            [{t.chat.repeatLabel}]
          </button>
          <button
            onClick={toggleLocale}
            className="hover:text-cyber-cyan transition-colors cursor-pointer flex items-center gap-1 uppercase min-w-[44px] min-h-[44px] justify-center"
            aria-label={`${t.common.language}: ${locale === "es" ? "English" : "Español"}`}
          >
            <Languages className="w-2.5 h-2.5" aria-hidden="true" />
            {locale === "es" ? "EN" : "ES"}
          </button>
          <span>{t.chat.grounding}</span>
        </div>
      </div>
    </div>
  );
};
