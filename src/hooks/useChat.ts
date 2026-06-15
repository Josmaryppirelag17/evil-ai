"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Message, BrowserTabState, RecommendationPage } from '@/types';
import { Logger } from '@/infrastructure/logger/Logger';
import { SESSION_KEY } from '@/context/AuthContext';

const logger = new Logger("useChat");

function getStoredSessionId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(SESSION_KEY) || "";
}

function storeSessionId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, id);
}

export function getCurrentSessionId(): string {
  return getStoredSessionId();
}

const DEFAULT_BROWSER_STATE: BrowserTabState = {
  currentUrl: 'https://cyberterminal-node.hub',
  pageTitle: 'Home Hub',
  pageContent: '',
  isCustomPage: true,
  history: ['https://cyberterminal-node.hub'],
  historyIndex: 0,
  viewMode: 'rendered',
};

const SPEECH_RATE_DEFAULT = 1.05;
const SPEECH_PITCH = 0.95;
const SPEECH_LANG = 'es-ES';

async function fetchSearchResults(
  query: string,
  setPages: React.Dispatch<React.SetStateAction<RecommendationPage[]>>,
): Promise<void> {
  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const data = await response.json();
    if (data.results?.length > 0) {
      const mapped = data.results.map((r: { title: string; link: string; snippet: string }, i: number) => ({
        title: r.title,
        uri: r.link,
        snippet: r.snippet,
        index: i,
      }));
      setPages(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[0] = { ...updated[0]!, sources: mapped };
        }
        return updated;
      });
    }
  } catch (error) {
    logger.error("Search fetch failed", error);
  }
}

type UpdateMessagesFn = React.Dispatch<React.SetStateAction<Message[]>>;

function appendAssistantMessage(
  setMessages: UpdateMessagesFn,
  counter: React.MutableRefObject<number>,
  text: string,
  extras?: Partial<Message>,
): void {
  setMessages(prev => {
    const msgs = [...prev];
    const last = msgs[msgs.length - 1];
    if (last && last.role === 'assistant' && !last.groundingSources && !last.isSearchingWeb) {
      msgs[msgs.length - 1] = { ...last, text, ...extras };
    } else {
      counter.current += 1;
      msgs.push({
        id: `msg-assistant-${counter.current}`,
        role: 'assistant',
        text,
        timestamp: new Date().toLocaleTimeString(),
        ...extras,
      });
    }
    return msgs;
  });
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastResponse, setLastResponse] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [speechRate, setSpeechRate] = useState(SPEECH_RATE_DEFAULT);
  const [isStreaming, setIsStreaming] = useState(false);

  const [browserState, setBrowserState] = useState<BrowserTabState>(DEFAULT_BROWSER_STATE);
  const [isBrowserLoading, setIsBrowserLoading] = useState(false);

  const [recommendationPages, setRecommendationPages] = useState<RecommendationPage[]>([]);
  const [currentRecPage, setCurrentRecPage] = useState(0);
  const [detailView, setDetailView] = useState<{ url: string; title: string } | null>(null);

  const storedId = getStoredSessionId();
  const sessionId = useRef(storedId || crypto.randomUUID());
  const [sessionKey, setSessionKey] = useState(0);

  useEffect(() => {
    storeSessionId(sessionId.current);
  }, []);

  const honeypotRef = useRef('');
  const currentAbort = useRef<AbortController | null>(null);
  const msgCounter = useRef(0);

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/messages?sessionId=${sessionId.current}`);
      const data: Message[] = await res.json();
      if (data.length > 0) {
        setMessages(data);
        msgCounter.current = data.length;
      }
    } catch {
      logger.warn("Failed to load session messages");
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages, sessionKey]);

  useEffect(() => {
    fetch('/api/suggestions')
      .then(r => r.json())
      .then(setSuggestions)
      .catch(() => logger.warn("Failed to fetch suggestions"));
  }, []);

  useEffect(() => {
    const load = () => {
      const all = window.speechSynthesis.getVoices();
      const filtered = all.filter(v => v.name.includes('Google'));
      setVoices(filtered.length ? filtered : all);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const speak = useCallback((text: string) => {
    window.speechSynthesis.cancel();
    if (!text) return;

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = SPEECH_LANG;
    utter.rate = speechRate;
    utter.pitch = SPEECH_PITCH;

    if (selectedVoice) {
      const v = voices.find(v => v.name === selectedVoice);
      if (v) { utter.voice = v; utter.lang = v.lang; }
    }

    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  }, [speechRate, selectedVoice, voices]);

  const addMessage = useCallback((role: 'user' | 'assistant', text: string, extras?: Partial<Message>) => {
    msgCounter.current += 1;
    const msg: Message = {
      id: `msg-${role}-${msgCounter.current}`,
      role,
      text,
      timestamp: new Date().toLocaleTimeString(),
      ...extras,
    };
    setMessages(prev => [...prev, msg]);
    return msg;
  }, []);

  const createRecommendationPage = useCallback((query: string, sources: Array<{ title: string; uri: string; snippet: string; index: number }>) => {
    msgCounter.current += 1;
    const id = `rec-${msgCounter.current}`;
    const ts = new Date().toLocaleTimeString();
    const newPage: RecommendationPage = {
      id,
      query,
      sources: sources.length > 0 ? sources : [],
      timestamp: ts,
    };
    setRecommendationPages(prev => [newPage, ...prev]);
    setCurrentRecPage(0);
    setDetailView(null);
  }, []);

  const streamChat = useCallback(async (msg: string) => {
    if (currentAbort.current) currentAbort.current.abort();
    currentAbort.current = new AbortController();
    setIsStreaming(true);
    setIsGenerating(true);

    addMessage('user', msg);

    msgCounter.current += 1;
    const tempId = `temp-${msgCounter.current}`;
    setMessages(prev => [...prev, {
      id: tempId,
      role: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString(),
      isSearchingWeb: true,
    }]);

    let fullText = '';
    let hasReceivedChunk = false;
    let receivedSources: Array<{ title: string; uri: string; snippet: string; index: number }> = [];

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: msg, session_id: sessionId.current, _honey: honeypotRef.current }),
        signal: currentAbort.current.signal,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.hint || errBody.error || `HTTP ${res.status}`);
      }
      if (!res.body) throw new Error('No body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.chunk) {
              fullText += data.chunk;
              if (!hasReceivedChunk) {
                setMessages(prev => prev.filter(m => m.id !== tempId));
                hasReceivedChunk = true;
              }
              appendAssistantMessage(setMessages, msgCounter, fullText);
            }
            if (data.groundingSources) {
              receivedSources = data.groundingSources;
            }
            if (data.done) {
              setMessages(prev => {
                const msgs = [...prev];
                const last = msgs[msgs.length - 1];
                if (last && last.role === 'assistant') {
                  msgs[msgs.length - 1] = {
                    ...last,
                    groundingSources: receivedSources.length > 0 ? receivedSources : undefined,
                  };
                }
                return msgs;
              });

              createRecommendationPage(msg, receivedSources);

              if (receivedSources.length === 0) {
                fetchSearchResults(msg, setRecommendationPages);
              }
            }
            if (data.error) throw new Error(data.error);
          } catch (e) {
            if (e instanceof Error && e.message?.startsWith('data:')) continue;
            throw e;
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setMessages(prev => prev.filter(m => m.id !== tempId));
      const errorMessage = err instanceof Error ? err.message : 'Algo salió mal.';
      const hint = errorMessage.includes('API_KEY') || errorMessage.includes('GROQ')
        ? '\n\n*ajusta su monóculo* La llave API de Groq no es válida, *criatura*. Configurá GROQ_API_KEY en tu .env — https://console.groq.com/keys'
        : '';
      addMessage('assistant', `*ajusta su monóculo* Error: ${errorMessage}${hint}`);
    } finally {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setIsStreaming(false);
      setIsGenerating(false);
      if (fullText) {
        setLastResponse(fullText);
        speak(fullText);
      }
    }
  }, [addMessage, createRecommendationPage, speak]);

  const handleSendPrompt = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isGenerating) return;
    const msg = inputQuery.trim();
    setInputQuery('');
    streamChat(msg);
  }, [inputQuery, isGenerating, streamChat]);

  const speakLastResponse = useCallback(() => {
    if (lastResponse) speak(lastResponse);
  }, [lastResponse, speak]);

  const navigateToUrl = useCallback(async (url: string, topicTitle?: string) => {
    setIsBrowserLoading(true);
    const correctedTitle = topicTitle || url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || '_Node';
    try {
      const response = await fetch('/api/browser/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, title: correctedTitle }),
      });
      const data = await response.json();
      setBrowserState(prev => {
        const nextHistory = prev.history.slice(0, prev.historyIndex + 1);
        nextHistory.push(url);
        return {
          ...prev,
          currentUrl: url,
          pageTitle: correctedTitle,
          pageContent: data.content || 'Error: payload vacío.',
          isCustomPage: false,
          history: nextHistory,
          historyIndex: nextHistory.length - 1,
        };
      });
    } catch {
      setBrowserState(prev => {
        const nextHistory = prev.history.slice(0, prev.historyIndex + 1);
        nextHistory.push(url);
        return {
          ...prev,
          currentUrl: url,
          pageTitle: 'ERROR DE CONEXIÓN',
          pageContent: `[ERROR CRÍTICO]\nNo se pudo conectar a: ${url}\n\nCódigo: 0xDEADF00D`,
          isCustomPage: false,
          history: nextHistory,
          historyIndex: nextHistory.length - 1,
        };
      });
    } finally {
      setIsBrowserLoading(false);
    }
  }, []);

  const handleBrowserBack = useCallback(() => {
    setBrowserState(prev => {
      if (prev.historyIndex <= 0) return prev;
      const prevIndex = prev.historyIndex - 1;
      const prevUrl = prev.history[prevIndex]!;
      return {
        ...prev,
        currentUrl: prevUrl,
        pageTitle: prevUrl === 'https://cyberterminal-node.hub' ? 'Home Hub' : prev.pageTitle,
        isCustomPage: prevUrl === 'https://cyberterminal-node.hub',
        historyIndex: prevIndex,
      };
    });
  }, []);

  const handleBrowserForward = useCallback(() => {
    setBrowserState(prev => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;
      const nextIndex = prev.historyIndex + 1;
      const nextUrl = prev.history[nextIndex]!;
      return {
        ...prev,
        currentUrl: nextUrl,
        pageTitle: nextUrl === 'https://cyberterminal-node.hub' ? 'Home Hub' : prev.pageTitle,
        isCustomPage: nextUrl === 'https://cyberterminal-node.hub',
        historyIndex: nextIndex,
      };
    });
  }, []);

  const handleBrowserHome = useCallback(() => {
    setBrowserState(prev => ({
      ...prev,
      currentUrl: 'https://cyberterminal-node.hub',
      pageTitle: 'Home Hub',
      isCustomPage: true,
      historyIndex: 0,
    }));
  }, []);

  const handleBrowserRefresh = useCallback(() => {
    if (!browserState.isCustomPage) {
      navigateToUrl(browserState.currentUrl, browserState.pageTitle);
    }
  }, [browserState, navigateToUrl]);

  const switchSession = useCallback((newSessionId: string) => {
    if (newSessionId === sessionId.current) return;
    sessionId.current = newSessionId;
    storeSessionId(newSessionId);
    setMessages([]);
    setRecommendationPages([]);
    setCurrentRecPage(0);
    setDetailView(null);
    setSessionKey(k => k + 1);
  }, []);

  const createNewSession = useCallback(() => {
    const newId = crypto.randomUUID();
    sessionId.current = newId;
    storeSessionId(newId);
    setMessages([]);
    setRecommendationPages([]);
    setCurrentRecPage(0);
    setDetailView(null);
    setSessionKey(k => k + 1);
  }, []);

  return {
    messages,
    inputQuery,
    setInputQuery,
    isGenerating,
    isSpeaking,
    isStreaming,
    lastResponse,
    suggestions,
    voices,
    selectedVoice,
    setSelectedVoice,
    speechRate,
    setSpeechRate,
    browserState,
    isBrowserLoading,
    recommendationPages,
    currentRecPage,
    setCurrentRecPage,
    detailView,
    setDetailView,
    honeypotRef,
    sessionId,
    loadMessages,
    switchSession,
    createNewSession,
    speak,
    speakLastResponse,
    streamChat,
    handleSendPrompt,
    navigateToUrl,
    handleBrowserBack,
    handleBrowserForward,
    handleBrowserHome,
    handleBrowserRefresh,
  };
}
