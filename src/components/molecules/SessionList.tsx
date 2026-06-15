"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

interface SessionItem {
  sessionId: string;
  userId: number | null;
  createdAt: string;
  updatedAt: string;
  messages: { role: string; content: string }[];
}

interface SessionListProps {
  open: boolean;
  onClose: () => void;
  currentSessionId: string;
  onSwitchSession: (sessionId: string) => void;
  onNewSession: () => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `hace ${diffD}d`;
  return d.toLocaleDateString();
}

function getSessionPreview(session: SessionItem): string {
  const firstUserMsg = session.messages.find(m => m.role === "user");
  if (firstUserMsg) {
    const text = firstUserMsg.content;
    return text.length > 60 ? text.slice(0, 60) + "..." : text;
  }
  return "(conversación vacía)";
}

export function SessionList({
  open,
  onClose,
  currentSessionId,
  onSwitchSession,
  onNewSession,
}: SessionListProps) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/user/sessions");
      const data: SessionItem[] = await res.json();
      setSessions(data);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (open) {
      fetchSessions();
    }
  }, [open, fetchSessions]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Historial de sesiones"
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg border border-cyber-cyan/40 bg-[#03070b]/95 rounded shadow-[0_0_30px_rgba(0,255,65,0.1)] max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-cyber-cyan/25 bg-[#060e15] shrink-0">
          <span className="font-mono text-xs text-cyber-cyan tracking-widest">
            [ SESIONES ]
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onNewSession}
              className="font-mono text-[10px] text-cyber-green border border-cyber-green/40 hover:border-cyber-green px-3 py-1 transition-all cursor-pointer"
            >
              + NUEVA
            </button>
            <button
              onClick={onClose}
              className="text-cyber-cyan/60 hover:text-cyber-cyan text-xs border border-cyber-cyan/20 hover:border-cyber-cyan/50 px-2 py-1 transition-all cursor-pointer"
              autoFocus
              aria-label="Cerrar"
            >
              [X]
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading && (
            <div className="text-center font-mono text-[10px] text-cyber-cyan/50 animate-pulse py-8">
              CARGANDO...
            </div>
          )}

          {!loading && sessions.length === 0 && (
            <div className="text-center font-mono text-[10px] text-gray-500 py-8">
              No hay sesiones anteriores.
            </div>
          )}

          {!loading && sessions.map((session) => {
            const isActive = session.sessionId === currentSessionId;
            const preview = getSessionPreview(session);
            return (
              <button
                key={session.sessionId}
                onClick={() => {
                  onSwitchSession(session.sessionId);
                  onClose();
                }}
                className={`w-full text-left p-3 border rounded transition-all cursor-pointer ${
                  isActive
                    ? "border-cyber-cyan bg-cyber-cyan/10"
                    : "border-cyber-cyan/15 bg-[#04090e] hover:border-cyber-cyan/40 hover:bg-cyber-cyan/5"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-cyber-cyan/60 truncate">
                    {session.sessionId.slice(0, 8)}...
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {isActive && (
                      <span className="font-mono text-[8px] text-cyber-green border border-cyber-green/40 px-1.5 py-0.5">
                        ACTUAL
                      </span>
                    )}
                    <span className="font-mono text-[9px] text-gray-500">
                      {formatDate(session.updatedAt)}
                    </span>
                    <span className="font-mono text-[9px] text-gray-600">
                      {session.messages.length} msgs
                    </span>
                  </div>
                </div>
                <p className="font-mono text-[11px] text-gray-300 mt-1.5 truncate">
                  {preview}
                </p>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-cyber-cyan/10 bg-black/30 text-[9px] text-gray-600 font-mono text-center shrink-0">
          <span className="text-cyber-cyan/30">[</span>
          <span> {sessions.length} sesiones en total </span>
          <span className="text-cyber-cyan/30">]</span>
        </div>
      </div>
    </div>
  );
}
