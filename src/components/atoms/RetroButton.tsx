"use client";

import React from 'react';
import { motion } from "framer-motion";

interface RetroButtonProps {
  variant?: 'cyan' | 'green' | 'magenta' | 'unstyled';
  glow?: boolean;
  active?: boolean;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
  'aria-label'?: string;
}

export const RetroButton: React.FC<RetroButtonProps> = ({
  children,
  variant = 'cyan',
  glow = true,
  active = false,
  className = '',
  disabled,
  type,
  onClick,
  title,
  'aria-label': ariaLabel,
}) => {
  const baseStyles = 'font-mono text-xs tracking-wider uppercase px-3 py-1.5 border transition-all active:translate-y-px select-none cursor-pointer flex items-center justify-center gap-1.5';

  const variantStyles = {
    cyan: `border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/10 ${
      active ? 'bg-cyber-cyan/15 bg-opacity-100 text-glow-cyan' : 'bg-transparent'
    } ${glow ? 'hover:shadow-[0_0_10px_rgba(0,240,255,0.4)]' : ''}`,

    green: `border-cyber-green text-cyber-green hover:bg-cyber-green/10 ${
      active ? 'bg-cyber-green/15 bg-opacity-100 text-glow-green' : 'bg-transparent'
    } ${glow ? 'hover:shadow-[0_0_10px_rgba(0,255,102,0.4)]' : ''}`,

    magenta: `border-cyber-magenta text-cyber-magenta hover:bg-cyber-magenta/10 ${
      active ? 'bg-cyber-magenta/15 bg-opacity-100 text-glow-magenta' : 'bg-transparent'
    } ${glow ? 'hover:shadow-[0_0_10px_rgba(255,0,127,0.4)]' : ''}`,

    unstyled: '',
  };

  const finalStyle = variant === 'unstyled' ? className : `${baseStyles} ${variantStyles[variant]} ${className}`;

  return (
    <motion.button
      disabled={disabled}
      type={type}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      className={finalStyle}
    >
      {children}
    </motion.button>
  );
};
