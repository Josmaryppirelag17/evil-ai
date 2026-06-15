# Component Catalog

> Generated: 2026-06-09  
> Total components: **12**  
> Reusables identified: **8**

---

![React](https://img.shields.io/badge/React-19-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC)
![Components](https://img.shields.io/badge/components-12-blueviolet)
![Atomic Design](https://img.shields.io/badge/pattern-Atomic%20Design-orange)

---

## Overview by Level

| Level | Count | Accessibility Avg Score |
|-------|-------|------------------------|
| **Atoms — UI primitives** | 3 | 0% |
| **Molecules — Groups of atoms** | 5 | 0% |
| **Organisms — Complex sections** | 3 | 0% |
| **Templates — Page layouts** | 1 | 0% |

---

## Atoms — UI primitives

### `<AsciiBadge />`

**Description:** —
**File:** `src/components/atoms/AsciiBadge.tsx`
**Platform:** `web`

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | — |
| `variant` | `'cyan' | 'green' | 'magenta' | 'gray'` | — |
| `pulse` | `boolean` | — |

**Accessibility:**
  - ARIA Label: No
  - Semantic Role: No
  - Keyboard Support: No
  - Focus Visible: No
  - Semantic HTML: No
  - Score: **0/100**

### `<RetroButton />`

**Description:** —
**File:** `src/components/atoms/RetroButton.tsx`
**Platform:** `web`

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `variant` | `'cyan' | 'green' | 'magenta' | 'unstyled'` | — |
| `glow` | `boolean` | — |
| `active` | `boolean` | — |
| `className` | `string` | — |
| `disabled` | `boolean` | — |
| `type` | `'button' | 'submit' | 'reset'` | — |
| `title` | `string` | — |
| `onClick` | `React.MouseEventHandler<HTMLButtonElement>` | — |
| `children` | `React.ReactNode` | — |

**Accessibility:**
  - ARIA Label: No
  - Semantic Role: No
  - Keyboard Support: No
  - Focus Visible: No
  - Semantic HTML: No
  - Score: **0/100**

### `<TerminalInput />`

**Description:** —
**File:** `src/components/atoms/TerminalInput.tsx`
**Platform:** `web`

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `prefixText` | `string` | — |
| `variant` | `'cyan' | 'green'` | — |
| `className` | `string` | — |
| `value` | `string` | — |
| `onChange` | `React.ChangeEventHandler<HTMLInputElement>` | — |
| `placeholder` | `string` | — |
| `disabled` | `boolean` | — |

**Accessibility:**
  - ARIA Label: No
  - Semantic Role: No
  - Keyboard Support: No
  - Focus Visible: No
  - Semantic HTML: No
  - Score: **0/100**

---

## Molecules — Groups of atoms

### `<AiAvatar />`

**Description:** —
**File:** `src/components/molecules/AiAvatar.tsx`
**Platform:** `web`

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `isSpeaking` | `boolean` | — |
| `isGenerating` | `boolean` | — |

**Accessibility:**
  - ARIA Label: No
  - Semantic Role: No
  - Keyboard Support: No
  - Focus Visible: No
  - Semantic HTML: No
  - Score: **0/100**

### `<BrowserBar />`

**Description:** —
**File:** `src/components/molecules/BrowserBar.tsx`
**Platform:** `web`

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `url` | `string` | — |
| `onNavigate` | `(newUrl: string) => void` | — |
| `onBack` | `() => void` | — |
| `onForward` | `() => void` | — |
| `onHome` | `() => void` | — |
| `onRefresh` | `() => void` | — |
| `canBack` | `boolean` | — |
| `canForward` | `boolean` | — |
| `isLoading` | `boolean` | — |

**Accessibility:**
  - ARIA Label: No
  - Semantic Role: No
  - Keyboard Support: No
  - Focus Visible: No
  - Semantic HTML: No
  - Score: **0/100**

### `<ChatList />`

**Description:** —
**File:** `src/components/molecules/ChatList.tsx`
**Platform:** `web`

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `messages` | `Message[]` | — |
| `onOpenUrl` | `(url: string, title: string) => void` | — |

**Accessibility:**
  - ARIA Label: No
  - Semantic Role: No
  - Keyboard Support: No
  - Focus Visible: No
  - Semantic HTML: No
  - Score: **0/100**

### `<MessageItem />`

**Description:** —
**File:** `src/components/molecules/MessageItem.tsx`
**Platform:** `web`

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `message` | `Message` | — |
| `onOpenUrl` | `(url: string, title: string) => void` | — |

**Accessibility:**
  - ARIA Label: No
  - Semantic Role: No
  - Keyboard Support: No
  - Focus Visible: No
  - Semantic HTML: No
  - Score: **0/100**

### `<RecommendationsPanel />`

**Description:** —
**File:** `src/components/molecules/RecommendationsPanel.tsx`
**Platform:** `web`

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `pages` | `RecommendationPage[]` | — |
| `currentPage` | `number` | — |
| `onPageChange` | `(page: number) => void` | — |
| `onOpenUrl` | `(url: string, title: string) => void` | — |
| `isLoading` | `boolean` | — |

**Accessibility:**
  - ARIA Label: No
  - Semantic Role: No
  - Keyboard Support: No
  - Focus Visible: No
  - Semantic HTML: No
  - Score: **0/100**

---

## Organisms — Complex sections

### `<ChatMessages />`

**Description:** —
**File:** `src/components/organisms/ChatMessages.tsx`
**Platform:** `web`

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `messages` | `Message[]` | — |
| `suggestions` | `string[]` | — |
| `isGenerating` | `boolean` | — |
| `isSpeaking` | `boolean` | — |
| `isListening` | `boolean` | — |
| `voices` | `SpeechSynthesisVoice[]` | — |
| `selectedVoice` | `string` | — |
| `speechRate` | `number` | — |
| `inputQuery` | `string` | — |
| `honeypotRef` | `React.MutableRefObject<string>` | — |
| `onInputChange` | `(value: string) => void` | — |
| `onSelectVoice` | `(voice: string) => void` | — |
| `onSpeechRateChange` | `(rate: number) => void` | — |
| `onMicClick` | `() => void` | — |
| `onSend` | `(e?: React.FormEvent) => void` | — |
| `onSpeakLast` | `() => void` | — |
| `onSuggestionClick` | `(suggestion: string) => void` | — |

**Accessibility:**
  - ARIA Label: No
  - Semantic Role: No
  - Keyboard Support: No
  - Focus Visible: No
  - Semantic HTML: No
  - Score: **0/100**

### `<SearchResults />`

**Description:** —
**File:** `src/components/organisms/SearchResults.tsx`
**Platform:** `web`

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `detailView` | `{ url: string; title: string } | null` | — |
| `browserState` | `BrowserTabState` | — |
| `isBrowserLoading` | `boolean` | — |
| `recommendationPages` | `RecommendationPage[]` | — |
| `currentRecPage` | `number` | — |
| `onDetailViewClose` | `() => void` | — |
| `onNavigate` | `(url: string, title?: string) => void` | — |
| `onBrowserBack` | `() => void` | — |
| `onBrowserForward` | `() => void` | — |
| `onBrowserHome` | `() => void` | — |
| `onBrowserRefresh` | `() => void` | — |
| `onPageChange` | `(page: number) => void` | — |
| `onOpenUrl` | `(url: string) => void` | — |

**Accessibility:**
  - ARIA Label: No
  - Semantic Role: No
  - Keyboard Support: No
  - Focus Visible: No
  - Semantic HTML: No
  - Score: **0/100**

### `<VirtualBrowserWindow />`

**Description:** —
**File:** `src/components/organisms/VirtualBrowserWindow.tsx`
**Platform:** `web`

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `state` | `BrowserTabState` | — |
| `isLoading` | `boolean` | — |
| `onNavigate` | `(url: string) => void` | — |
| `onBack` | `() => void` | — |
| `onForward` | `() => void` | — |
| `onHome` | `() => void` | — |
| `onRefresh` | `() => void` | — |
| `canBack` | `boolean` | — |
| `canForward` | `boolean` | — |

**Accessibility:**
  - ARIA Label: No
  - Semantic Role: No
  - Keyboard Support: No
  - Focus Visible: No
  - Semantic HTML: No
  - Score: **0/100**

---

## Templates — Page layouts

### `<SplitLayout />`

**Description:** —
**File:** `src/components/templates/SplitLayout.tsx`
**Platform:** `web`

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `leftSidebar` | `React.ReactNode; // 30% chat panel and avatar` | — |
| `rightBrowser` | `React.ReactNode; // 70% virtual browser` | — |

**Accessibility:**
  - ARIA Label: No
  - Semantic Role: No
  - Keyboard Support: No
  - Focus Visible: No
  - Semantic HTML: No
  - Score: **0/100**

---

*Generated by generate-docs.ts — 2026-06-09T20:22:24.304Z*
