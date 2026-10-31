/**
 * CRYPTORA Text Encryption Module
 * Authenticated text encryption supporting AES-256-GCM, AES-256-CBC, and cryptographic hashing.
 */

import React, { useState } from 'react';
import {
  Lock,
  Copy,
  Check,
  Download,
  RotateCcw,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  FileCode,
  ShieldCheck,
} from 'lucide-react';
import { encryptText, generateSecure256BitKey } from '../../services/cryptoEngine';
import { logAuditEvent } from '../../services/auditService';
import { TextEncryptionResult } from '../../types/crypto';

interface TextEncryptModuleProps {
  userId?: string;
  onNavigateToDecrypt?: (payloadJson?: string) => void;
}

export const TextEncryptModule: React.FC<TextEncryptModuleProps> = ({
  userId,
  onNavigateToDecrypt,
}) => {
  const [plaintext, setPlaintext] = useState('');
  const [algorithm, setAlgorithm] = useState<'AES-256-GCM' | 'AES-256-CBC' | 'SHA-256' | 'SHA-512'>('AES-256-GCM');
  const [mode, setMode] = useState<'password' | 'key'>('password');
  const [passphrase, setPassphrase] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Results
  const [result, setResult] = useState<TextEncryptionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isHashing = algorithm.startsWith('SHA-');

  const handleGenerateKey = () => {
    const key = generateSecure256BitKey();
    setPassphrase(key.hexKey);
    setMode('key');
  };

  const handleEncrypt = async () => {
    if (!plaintext.trim()) {
      setError('Please provide text to encrypt or hash.');
      return;
    }
    if (!isHashing && !passphrase.trim()) {
      setError('Please provide a password or encryption key.');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const res = await encryptText(plaintext, algorithm, passphrase, mode);
      setResult(res);

      logAuditEvent(
        {
          type: isHashing ? 'hash' : 'encrypt',
          category: 'text',
          fileName: `Text Payload (${plaintext.length} chars)`,
          fileSize: plaintext.length,
          mimeType: 'text/plain',
          algorithm,
          status: 'success',
          details: isHashing ? 'Cryptographic Hash' : `Ciphertext Length: ${res.ciphertext.length}`,
        },
        userId
      );
    } catch (err: any) {
      setError(err.message || 'Encryption failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = result.packageJson || result.ciphertext;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.packageJson || result.ciphertext], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cryptora_${algorithm.toLowerCase()}_payload_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setPlaintext('');
    setPassphrase('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
          Text Encryption & Hashing
        </h1>
        <p className="text-xs text-[#777777] mt-1.5 leading-relaxed">
          Transform strings, tokens, credentials, or sensitive notes using authenticated ciphers or one-way cryptographic hashes.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-xs text-[#DC2626] rounded flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <div className="border border-[#E5E5E5] rounded bg-white p-6 space-y-6">
        {/* Plaintext Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-[#111111]">
              Plaintext Input Data
            </label>
            <span className="text-[#777777] font-mono">{plaintext.length} characters</span>
          </div>
          <textarea
            rows={5}
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            placeholder="Type or paste confidential text to encrypt..."
            className="w-full p-3 text-xs border border-[#E5E5E5] rounded font-mono text-[#111111] bg-[#F7F7F7] focus:outline-none focus:ring-1 focus:ring-[#111111]"
          />
        </div>

        {/* Algorithm Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1.5">
              Cryptographic Algorithm
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-[#E5E5E5] rounded bg-white text-[#111111] font-medium focus:outline-none"
            >
              <option value="AES-256-GCM">AES-256-GCM (Authenticated Encryption · Recommended)</option>
              <option value="AES-256-CBC">AES-256-CBC (Cipher Block Chaining · Legacy)</option>
              <option value="SHA-256">SHA-256 (One-Way Cryptographic Hash)</option>
              <option value="SHA-512">SHA-512 (High-Security Digest)</option>
            </select>
          </div>

          {!isHashing ? (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-[#111111]">
                  {mode === 'password' ? 'Encryption Password' : '256-Bit Master Key (Hex)'}
                </label>
                <button
                  type="button"
                  onClick={handleGenerateKey}
                  className="text-[11px] text-[#111111] underline hover:text-[#777777] flex items-center gap-1"
                >
                  <Key className="w-3 h-3" />
                  <span>Generate Key</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder={mode === 'password' ? 'Enter strong passphrase' : '64-character hex key'}
                  className="w-full px-3 py-2 pr-9 text-xs border border-[#E5E5E5] rounded font-mono text-[#111111] bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2.5 text-[#777777] hover:text-[#111111]"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center text-xs text-[#777777] p-3 bg-[#F7F7F7] border border-[#E5E5E5] rounded">
              <span>Notice: Hashing algorithms are one-way mathematical functions and do not require a secret key.</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-[#777777] hover:text-[#111111] flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear Input</span>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleEncrypt}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#111111] hover:bg-[#333333] text-white text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isHashing ? 'Compute Digest' : 'Encrypt Text'}</span>
          </button>
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div className="border border-[#E5E5E5] rounded bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <h2 className="text-sm font-bold text-[#111111]">
                {result.isHash ? 'Computed Cryptographic Digest' : 'Encrypted Ciphertext Package'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-[#F7F7F7] hover:bg-[#E5E5E5] text-[#111111] border border-[#E5E5E5] rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-[#111111] hover:bg-[#333333] text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download JSON</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-[#777777] uppercase tracking-wider">
              Output Payload:
            </span>
            <pre className="p-4 bg-[#F7F7F7] border border-[#E5E5E5] rounded font-mono text-xs text-[#111111] overflow-x-auto whitespace-pre-wrap break-all max-h-60">
              {result.packageJson || result.ciphertext}
            </pre>
          </div>

          {!result.isHash && onNavigateToDecrypt && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => onNavigateToDecrypt(result.packageJson)}
                className="text-xs text-[#111111] font-semibold hover:underline"
              >
                Test Decrypting this payload →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
