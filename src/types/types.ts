export interface GroundingSource {
  title: string;
  uri: string;
  snippet?: string;
  index: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  groundingSources?: GroundingSource[];
  isSearchingWeb?: boolean;
}

export interface BrowserTabState {
  currentUrl: string;
  pageTitle: string;
  pageContent: string;
  isCustomPage: boolean;
  history: string[];
  historyIndex: number;
  viewMode: 'rendered' | 'matrix' | 'ascii' | 'hex';
}

export interface ChatSessionState {
  messages: Message[];
  isGenerating: boolean;
  isSpeaking: boolean;
  activeQuery: string;
}

export interface RecommendationPage {
  id: string;
  query: string;
  sources: GroundingSource[];
  timestamp: string;
}
