"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/I18nProvider";
import { AuthModal } from "@/components/molecules/AuthModal";
import { RetroButton } from "@/components/atoms/RetroButton";

interface AuthButtonProps {
  expanded?: boolean;
  onOpenAuth?: () => void;
}

export function AuthButton({ expanded, onOpenAuth }: AuthButtonProps) {
  const { user, isLoading, logout } = useAuth();
  const { t } = useTranslation();
  const a = t.auth;
  const [localModalOpen, setLocalModalOpen] = useState(false);

  const modalOpen = onOpenAuth ? false : localModalOpen;
  const openModal = onOpenAuth ?? (() => setLocalModalOpen(true));
  const closeModal = () => setLocalModalOpen(false);

  if (isLoading) {
    return (
      <span className="font-mono text-[10px] text-gray-600 animate-pulse">
        {a.loadingLabel}
      </span>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono text-[11px] text-cyber-cyan/80 truncate max-w-[120px]">
          {user.name}
        </span>
        <RetroButton
          variant="magenta"
          glow={false}
          onClick={logout}
          className="text-[10px] px-3 py-1"
          aria-label={a.signOut}
        >
          {a.signOut}
        </RetroButton>
      </div>
    );
  }

  return (
    <>
      <RetroButton
        variant="cyan"
        glow
        onClick={openModal}
        className={expanded ? "text-[11px] px-4 py-1.5 font-bold tracking-wider" : "text-[10px] px-3 py-1"}
        aria-label={expanded ? "Abrir inicio de sesión o registro" : "Abrir inicio de sesión"}
      >
        {expanded ? `[ ${a.signIn} / ${a.signUp} ]` : a.signIn}
      </RetroButton>
      {!onOpenAuth && <AuthModal open={modalOpen} onClose={closeModal} />}
    </>
  );
}
