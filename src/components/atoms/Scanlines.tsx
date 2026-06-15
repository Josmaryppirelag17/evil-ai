"use client";

import React from 'react';
import { motion } from "framer-motion";

export const Scanlines: React.FC = () => {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none"
      whileHover={{ opacity: [0.03, 0.05] }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      aria-hidden="true"
    >
      {/* Scrollable scanning glass highlight */}
      <div className="absolute w-full h-1/4 scanline-overlay top-0 left-0 animate-scanline" />
      {/* Dynamic scan layers */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.06),_rgba(0,255,0,0.02),_rgba(0,0,255,0.06))] bg-[size:100%_4px,_6px_100%]" />
    </motion.div>
  );
};
