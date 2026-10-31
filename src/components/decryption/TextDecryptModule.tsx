/**
 * CRYPTORA Text Decryption Module
 * Authenticated text restoration supporting AES-256-GCM and AES-256-CBC with tag verification.
 */

import React, { useState, useEffect } from 'react';
import {
  Unlock,
  Copy,
  Check,
  RotateCcw,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { decryptText } from '../../services/cryptoEngine';
import { logAuditEvent } from '../../services/auditService';

interface TextDecryptModuleProps {
  userId?: string;
  initialPayloadJson?: string;
}

export const TextDecryptModule: React.FC<TextDecryptModuleProps> = ({
  userId,
  initialPayloadJson,
}) => {
  const [ciphertextInput, setCiphertextInput] = useState(initialPayloadJson || '');
  const [algorithm, setAlgorithm] = useState<'AES-256-GCM' | 'AES-256-CBC'>('AES-256-GCM');
  const [keyOrPass, setKeyOrPass] = useState('');
  const [ivHex, setIvHex] = useState('');
  const [saltHex, setSaltHex] = useState('');
  const [tagHex, setTagHex] = useState('');
  const [showPass, setShowPass] = useState(false);

  // States
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-parse if JSON package is pasted
  useEffect(() => {
    const trimmed = ciphertextInput.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const obj = JSON.parse(trimmed);
        if (obj.algorithm) {
          setAlgorithm(obj.algorithm);
        }
        if (obj.iv) setIvHex(obj.iv);
        if (obj.salt) setSaltHex(obj.salt);
        if (obj.tag) setTagHex(obj.tag);
      } catch {
        // Not valid JSON, keep as raw text
      }
    }
  }, [ciphertextInput]);

  const handleDecrypt = async () => {
    if (!ciphertextInput.trim()) {
      setError('Please provide ciphertext or an encrypted package.');
      return;
    }
    if (!keyOrPass.trim()) {
      setError('Please provide the decryption password or master key.');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const restored = await decryptText({
        ciphertext: ciphertextInput,
        algorithm,
        keyOrPass,
        ivHex: ivHex || undefined,
        saltHex: saltHex || undefined,
        tagHex: tagHex || undefined,
      });

      setDecryptedText(restored);

      logAuditEvent(
        {
          type: 'decrypt',
          category: 'text',
          fileName: `Restored Text (${restored.length} chars)`,
          fileSize: restored.length,
          mimeType: 'text/plain',
          algorithm,
          status: 'success',
          details: 'Bit-level verified decryption',
        },
        userId
      );
    } catch (err: any) {
      setError(err.message || 'Decryption failed.');
      logAuditEvent(
        {
          type: 'decrypt',
          category: 'text',
          fileName: 'Text Decryption Attempt',
          fileSize: ciphertextInput.length,
          mimeType: 'text/plain',
          algorithm,
          status: 'failed',
          details: err.message,
        },
        userId
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!decryptedText) return;
    navigator.clipboard.writeText(decryptedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCiphertextInput('');
    setKeyOrPass('');
    setIvHex('');
    setSaltHex('');
    setTagHex('');
    setDecryptedText(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
          Text Decryption & Verification
        </h1>
        <p className="text-xs text-[#777777] mt-1.5 leading-relaxed">
          Restore encrypted text packages. Verifies 128-bit authentication tags to ensure ciphertext integrity and reject tampering.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-xs text-[#DC2626] rounded flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Section */}
      <div className="border border-[#E5E5E5] rounded bg-white p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-[#111111]">
              Encrypted Payload (Ciphertext Hex or JSON Package)
            </label>
            <span className="text-[11px] text-[#777777]">
              Tip: Pasting full CRYPTORA JSON automatically fills parameters
            </span>
          </div>
          <textarea
            rows={5}
            value={ciphertextInput}
            onChange={(e) => setCiphertextInput(e.target.value)}
            placeholder='Paste ciphertext or JSON: {"algorithm": "AES-256-GCM", "ciphertext": "...", "iv": "..."}'
            className="w-full p-3 text-xs border border-[#E5E5E5] rounded font-mono text-[#111111] bg-[#F7F7F7] focus:outline-none focus:ring-1 focus:ring-[#111111]"
          />
        </div>

        {/* Algorithm & Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1.5">
              Cipher Algorithm
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-[#E5E5E5] rounded bg-white text-[#111111] font-medium focus:outline-none"
            >
              <option value="AES-256-GCM">AES-256-GCM (Authenticated)</option>
              <option value="AES-256-CBC">AES-256-CBC (Legacy)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1.5">
              Decryption Password or Key
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={keyOrPass}
                onChange={(e) => setKeyOrPass(e.target.value)}
                placeholder="Enter password or 64-char hex key"
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
        </div>

        {/* Optional explicit parameter inputs if not in JSON */}
        {(!ciphertextInput.trim().startsWith('{')) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#F7F7F7] border border-[#E5E5E5] rounded text-xs font-mono">
            <div>
              <label className="block text-[11px] font-sans font-semibold text-[#111111] mb-1">
                Nonce / IV (Hex)
              </label>
              <input
                type="text"
                value={ivHex}
                onChange={(e) => setIvHex(e.target.value)}
                placeholder="12-byte hex for GCM"
                className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded bg-white text-[#111111] text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-sans font-semibold text-[#111111] mb-1">
                Salt (Hex)
              </label>
              <input
                type="text"
                value={saltHex}
                onChange={(e) => setSaltHex(e.target.value)}
                placeholder="16-byte hex"
                className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded bg-white text-[#111111] text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-sans font-semibold text-[#111111] mb-1">
                Tag (Hex - GCM only)
              </label>
              <input
                type="text"
                value={tagHex}
                onChange={(e) => setTagHex(e.target.value)}
                placeholder="16-byte GMAC tag"
                className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded bg-white text-[#111111] text-xs"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-[#777777] hover:text-[#111111] flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear Fields</span>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleDecrypt}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#111111] hover:bg-[#333333] text-white text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Decrypt & Authenticate</span>
          </button>
        </div>
      </div>

      {/* Restored Plaintext Card */}
      {decryptedText !== null && (
        <div className="border border-[#E5E5E5] rounded bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <h2 className="text-sm font-bold text-[#111111]">
                Authenticated Plaintext Output
              </h2>
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-[#111111] hover:bg-[#333333] text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Plaintext'}</span>
            </button>
          </div>

          <div className="p-4 bg-[#F7F7F7] border border-[#E5E5E5] rounded font-mono text-xs text-[#111111] whitespace-pre-wrap break-all max-h-72 overflow-y-auto">
            {decryptedText}
          </div>
        </div>
      )}
    </div>
  );
};
