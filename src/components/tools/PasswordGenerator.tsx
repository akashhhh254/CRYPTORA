/**
 * CRYPTORA Password Generator
 * Generates cryptographically secure passwords using window.crypto.getRandomValues().
 * Computes exact mathematical entropy in bits.
 */

import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import { generateSecurePassword } from '../../services/cryptoEngine';
import { PasswordGeneratorOptions } from '../../types/crypto';

export const PasswordGenerator: React.FC = () => {
  const [options, setOptions] = useState<PasswordGeneratorOptions>({
    length: 20,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
  });

  const [generatedPassword, setGeneratedPassword] = useState('');
  const [entropyBits, setEntropyBits] = useState(0);
  const [strength, setStrength] = useState<'Weak' | 'Fair' | 'Strong' | 'Enterprise'>('Enterprise');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const res = generateSecurePassword(options);
    setGeneratedPassword(res.password);
    setEntropyBits(res.entropyBits);
    setStrength(res.strength);
    setCopied(false);
  };

  useEffect(() => {
    handleGenerate();
  }, [options]);

  const handleCopy = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
          Cryptographic Password Generator
        </h1>
        <p className="text-xs text-[#777777] mt-1.5 leading-relaxed">
          Produce high-entropy passphrases using hardware-grade pseudo-random generators (<code className="font-mono text-[#111111]">crypto.getRandomValues</code>).
        </p>
      </div>

      {/* Password Display Card */}
      <div className="border border-[#E5E5E5] rounded bg-white p-6 space-y-4">
        <div className="relative">
          <input
            type="text"
            readOnly
            value={generatedPassword}
            className="w-full px-4 py-3.5 pr-24 font-mono text-base font-semibold text-[#111111] bg-[#F7F7F7] border border-[#E5E5E5] rounded select-all focus:outline-none"
            aria-label="Generated Secure Password"
          />
          <div className="absolute right-2 top-2 flex items-center gap-1">
            <button
              onClick={handleGenerate}
              className="p-2 text-[#777777] hover:text-[#111111] hover:bg-[#E5E5E5] rounded transition-colors"
              title="Regenerate Password"
              aria-label="Regenerate password"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              className="px-3 py-2 bg-[#111111] hover:bg-[#333333] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors"
              title="Copy to Clipboard"
              aria-label="Copy password"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Strength & Entropy Metrics */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#777777]">Strength Rating:</span>
            <span className={`font-bold ${
              strength === 'Enterprise'
                ? 'text-[#16A34A]'
                : strength === 'Strong'
                ? 'text-[#111111]'
                : strength === 'Fair'
                ? 'text-[#D97706]'
                : 'text-[#DC2626]'
            }`}>
              {strength} Grade
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[#777777]">
            <span>Entropy:</span>
            <span className="font-bold text-[#111111]">{entropyBits} bits</span>
            <span>·</span>
            <span>Length:</span>
            <span className="font-bold text-[#111111]">{options.length} chars</span>
          </div>
        </div>

        {/* Strength Bar */}
        <div className="w-full bg-[#E5E5E5] h-1.5 rounded overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              strength === 'Enterprise'
                ? 'bg-[#16A34A]'
                : strength === 'Strong'
                ? 'bg-[#111111]'
                : strength === 'Fair'
                ? 'bg-[#D97706]'
                : 'bg-[#DC2626]'
            }`}
            style={{ width: `${Math.min(100, (entropyBits / 128) * 100)}%` }}
          />
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="border border-[#E5E5E5] rounded bg-white p-6 space-y-6">
        <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
          Generation Parameters
        </h3>

        {/* Length Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label htmlFor="length-slider" className="font-semibold text-[#111111]">
              Password Length
            </label>
            <span className="font-mono font-bold text-[#111111]">{options.length} characters</span>
          </div>
          <input
            id="length-slider"
            type="range"
            min="8"
            max="64"
            value={options.length}
            onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value) })}
            className="w-full accent-[#111111] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#777777] font-mono">
            <span>8 (Basic)</span>
            <span>20 (Standard)</span>
            <span>32 (High Security)</span>
            <span>64 (Maximum)</span>
          </div>
        </div>

        {/* Character Sets Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E5E5E5]">
          <label className="flex items-center gap-3 p-3 border border-[#E5E5E5] rounded cursor-pointer hover:bg-[#F7F7F7] transition-colors">
            <input
              type="checkbox"
              checked={options.includeUppercase}
              onChange={(e) => setOptions({ ...options, includeUppercase: e.target.checked })}
              className="accent-[#111111] w-4 h-4 rounded"
            />
            <div className="text-xs">
              <span className="font-semibold text-[#111111] block">Uppercase Letters</span>
              <span className="text-[11px] text-[#777777] font-mono">A-Z</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border border-[#E5E5E5] rounded cursor-pointer hover:bg-[#F7F7F7] transition-colors">
            <input
              type="checkbox"
              checked={options.includeLowercase}
              onChange={(e) => setOptions({ ...options, includeLowercase: e.target.checked })}
              className="accent-[#111111] w-4 h-4 rounded"
            />
            <div className="text-xs">
              <span className="font-semibold text-[#111111] block">Lowercase Letters</span>
              <span className="text-[11px] text-[#777777] font-mono">a-z</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border border-[#E5E5E5] rounded cursor-pointer hover:bg-[#F7F7F7] transition-colors">
            <input
              type="checkbox"
              checked={options.includeNumbers}
              onChange={(e) => setOptions({ ...options, includeNumbers: e.target.checked })}
              className="accent-[#111111] w-4 h-4 rounded"
            />
            <div className="text-xs">
              <span className="font-semibold text-[#111111] block">Numeric Digits</span>
              <span className="text-[11px] text-[#777777] font-mono">0-9</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border border-[#E5E5E5] rounded cursor-pointer hover:bg-[#F7F7F7] transition-colors">
            <input
              type="checkbox"
              checked={options.includeSymbols}
              onChange={(e) => setOptions({ ...options, includeSymbols: e.target.checked })}
              className="accent-[#111111] w-4 h-4 rounded"
            />
            <div className="text-xs">
              <span className="font-semibold text-[#111111] block">Special Symbols</span>
              <span className="text-[11px] text-[#777777] font-mono">!@#$%^&*...</span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
