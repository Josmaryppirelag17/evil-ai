"use client";

import React from 'react';
import { motion } from "framer-motion";

interface TerminalInputProps {
  prefixText?: string;
  variant?: 'cyan' | 'green';
  className?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

export const TerminalInput: React.FC<TerminalInputProps> = ({
  prefixText,
  variant = 'cyan',
  className = '',
  value,
  onChange,
  placeholder,
  disabled,
  ariaLabel,
}) => {
  const glowClass = variant === 'cyan' ? 'focus:border-cyber-cyan/80 focus:shadow-[0_0_12px_rgba(0,240,255,0.2)]' : 'focus:border-cyber-green/80 focus:shadow-[0_0_12px_rgba(0,255,102,0.2)]';
  const borderCol = variant === 'cyan' ? 'border-cyber-cyan/30' : 'border-cyber-green/30';
  const textCol = variant === 'cyan' ? 'text-cyber-cyan' : 'text-cyber-green';

  return (
    <motion.div
      className={`flex items-center w-full bg-black/60 border ${borderCol} ${glowClass} px-3 py-2 transition-all group`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {prefixText && (
        <span className={`font-mono text-xs ${textCol} opacity-70 mr-2 select-none`}>
          {prefixText}
        </span>
      )}
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full bg-transparent border-none outline-none font-mono text-xs text-white placeholder-gray-600 tracking-wide selection:bg-cyber-cyan/30 ${className}`}
        aria-label={ariaLabel}
      />
    </motion.div>
  );
};
