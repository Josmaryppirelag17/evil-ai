"use client";

import { useState, useMemo } from 'react';
import { BrowserTabState } from '@/types';

interface GeneratedData {
  matrixLines: string[];
  hexRecords: Array<{ addr: string; hex: string; chars: string }>;
}

function hashString(str: string): number {
  let s = 0;
  for (let i = 0; i < str.length; i++) {
    s = ((s << 5) - s + str.charCodeAt(i)) | 0;
  }
  return s === 0 ? 42 : s;
}

function generateMatrixLines(seed: number, rows: number, cols: number): string[] {
  const charset = "0103456789ABCDEF%$#@*[]{}<>!_?/";
  let s = seed;
  const lines: string[] = [];
  for (let i = 0; i < rows; i++) {
    let line = "";
    for (let j = 0; j < cols; j++) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      line += charset[Math.floor((s / 0x7fffffff) * charset.length)];
    }
    lines.push(line);
  }
  return lines;
}

function generateHexRecords(seed: number, count: number): GeneratedData['hexRecords'] {
  let s = seed;
  const records: GeneratedData['hexRecords'] = [];
  for (let i = 0; i < count; i++) {
    const address = `0x00F${(i * 16).toString(16).toUpperCase().padStart(3, '0')}`;
    let hex = "";
    let chars = "";
    for (let j = 0; j < 8; j++) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const val = Math.floor((s / 0x7fffffff) * 256);
      hex += val.toString(16).toUpperCase().padStart(2, '0') + " ";
      chars += (val >= 32 && val <= 126) ? String.fromCharCode(val) : ".";
    }
    records.push({ addr: address, hex: hex.trim(), chars });
  }
  return records;
}

const MATRIX_ROWS = 22;
const MATRIX_COLS = 40;
const HEX_RECORDS = 20;

export function useBrowserSimulation(state: BrowserTabState) {
  const [viewMode, setViewMode] = useState<'rendered' | 'matrix' | 'ascii' | 'hex'>('rendered');

  const generatedData: GeneratedData = useMemo(() => {
    const seed = hashString(state.currentUrl + state.pageContent);
    return {
      matrixLines: generateMatrixLines(seed, MATRIX_ROWS, MATRIX_COLS),
      hexRecords: generateHexRecords(seed, HEX_RECORDS),
    };
  }, [state.currentUrl, state.pageContent]);

  return { viewMode, setViewMode, generatedData };
}
