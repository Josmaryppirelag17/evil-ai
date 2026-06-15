"use client";

import React, { useEffect, useState } from 'react';
import { useChat, getCurrentSessionId } from '@/hooks/useChat';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { ChatMessages } from '@/components/organisms/ChatMessages';
import { SearchResults } from '@/components/organisms/SearchResults';
import { SplitLayout } from '@/components/templates/SplitLayout';
import { ParticlesBackground } from '@/components/atoms/ParticlesBackground';
import { TutorialCards } from '@/components/molecules/TutorialCards';
import { AuthButton } from '@/components/atoms/AuthButton';
import { AuthModal } from '@/components/molecules/AuthModal';
import { SessionList } from '@/components/molecules/SessionList';
import { useAuth, SESSION_KEY } from '@/context/AuthContext';

export const TerminalConsolePage: React.FC = () => {
  const [tutorialKey, setTutorialKey] = React.useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [sessionListOpen, setSessionListOpen] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const { user, isLoading: authLoading } = useAuth();

  const handleShowTutorial = React.useCallback(() => {
    localStorage.removeItem("vil-tutorial-done");
    setTutorialKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    const existingSessionId = localStorage.getItem(SESSION_KEY);

    if (!existingSessionId && user) {
      fetch("/api/user/sessions")
        .then(r => r.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            const mostRecent = data[0] as { sessionId: string };
            if (mostRecent.sessionId) {
              localStorage.setItem(SESSION_KEY, mostRecent.sessionId);
            }
          }
        })
        .catch(() => {})
        .finally(() => setSessionReady(true));
    } else {
      setSessionReady(true);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user && sessionReady) {
      fetch("/api/user/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: getCurrentSessionId() }),
      }).catch(() => {});
    }
  }, [user, sessionReady]);

  const {
    messages, inputQuery, setInputQuery, isGenerating, isSpeaking,
    suggestions, voices, selectedVoice,
    setSelectedVoice, speechRate, setSpeechRate, browserState, isBrowserLoading,
    recommendationPages, currentRecPage, setCurrentRecPage, detailView, setDetailView,
    honeypotRef, sessionId, speakLastResponse, streamChat, handleSendPrompt,
    navigateToUrl, handleBrowserBack, handleBrowserForward, handleBrowserHome,
    handleBrowserRefresh, loadMessages, switchSession, createNewSession,
  } = useChat();

  useEffect(() => {
    if (sessionReady && user) {
      loadMessages();
    }
  }, [sessionReady, user, loadMessages]);

  const { isListening, handleMicClick, callbacksRef } = useSpeechRecognition();

  useEffect(() => {
    callbacksRef.current = {
      onResult: (text: string) => {
        setInputQuery('');
        streamChat(text);
      },
      onUnsupported: () => {
        streamChat('*suspira* Tu navegador no soporta reconocimiento de voz, *criatura*.');
      },
    };
  }, [callbacksRef, setInputQuery, streamChat]);

  if (!sessionReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#03070b]">
        <span className="font-mono text-xs text-cyber-cyan/50 animate-pulse">
          [ CARGANDO SESIÓN... ]
        </span>
      </div>
    );
  }

  return (
    <>
      <h1 className="sr-only">E-VIL Asistente Villano - Terminal de chat con IA</h1>
      <TutorialCards key={tutorialKey} />
      <ParticlesBackground />
      <div className="relative z-10 flex items-center justify-end gap-3 px-4 py-2 bg-[#03070b]/80 border-b border-cyber-cyan/10">
        <span className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">
          SESSION
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-cyber-green/60 animate-pulse" aria-hidden="true" />
        {user && (
          <button
            onClick={() => setSessionListOpen(true)}
            className="font-mono text-[10px] text-cyber-cyan/70 hover:text-cyber-cyan border border-cyber-cyan/20 hover:border-cyber-cyan/50 px-2.5 py-1 transition-all cursor-pointer"
            aria-label="Historial de sesiones"
          >
            [ SESIONES ]
          </button>
        )}
        <div className="flex-1" />
        <AuthButton expanded onOpenAuth={() => setAuthModalOpen(true)} />
      </div>
      <SplitLayout
        leftSidebar={
          <ChatMessages
            messages={messages}
            suggestions={suggestions}
            isGenerating={isGenerating}
            isSpeaking={isSpeaking}
            isListening={isListening}
            voices={voices}
            selectedVoice={selectedVoice}
            speechRate={speechRate}
            inputQuery={inputQuery}
            honeypotRef={honeypotRef}
            onInputChange={setInputQuery}
            onSelectVoice={setSelectedVoice}
            onSpeechRateChange={setSpeechRate}
            onMicClick={handleMicClick}
            onSend={handleSendPrompt}
            onSpeakLast={speakLastResponse}
            onSuggestionClick={(s) => { setInputQuery(''); streamChat(s); }}
          />
        }
        rightBrowser={
          <SearchResults
            detailView={detailView}
            browserState={browserState}
            isBrowserLoading={isBrowserLoading}
            recommendationPages={recommendationPages}
            currentRecPage={currentRecPage}
            onDetailViewClose={() => setDetailView(null)}
            onNavigate={navigateToUrl}
            onBrowserBack={handleBrowserBack}
            onBrowserForward={handleBrowserForward}
            onBrowserHome={handleBrowserHome}
            onBrowserRefresh={handleBrowserRefresh}
            onPageChange={setCurrentRecPage}
            onOpenUrl={(url) => window.open(url, '_blank', 'noopener,noreferrer')}
            onShowTutorial={handleShowTutorial}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        }
      />
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <SessionList
        open={sessionListOpen}
        onClose={() => setSessionListOpen(false)}
        currentSessionId={sessionId.current}
        onSwitchSession={switchSession}
        onNewSession={createNewSession}
      />
    </>
  );
};
