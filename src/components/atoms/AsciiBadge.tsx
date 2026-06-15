"use client";

import React from 'react';
import { motion } from "framer-motion";

interface AsciiBadgeProps {
  label: string;
  variant?: 'cyan' | 'green' | 'magenta' | 'gray';
  pulse?: boolean;
}

export const AsciiBadge: React.FC<AsciiBadgeProps> = ({
  label,
  variant = 'cyan',
  pulse = false,
}) => {
  const colorMap = {
    cyan: 'text-cyber-cyan border-cyber-cyan/30 bg-cyber-cyan/5 text-glow-cyan',
    green: 'text-cyber-green border-cyber-green/30 bg-cyber-green/5 text-glow-green',
    magenta: 'text-cyber-magenta border-cyber-magenta/30 bg-cyber-magenta/5 text-glow-magenta',
    gray: 'text-gray-400 border-gray-700 bg-gray-900/40',
  };

  return (
    <motion.div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-xs font-mono tracking-widest uppercase transition-all select-none ${
        colorMap[variant]
      } ${pulse ? 'animate-pulse' : ''}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <span className="opacity-60">[</span>
      <span>{label}</span>
      <span className="opacity-60">]</span>
    </motion.div>
  );
};
