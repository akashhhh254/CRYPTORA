/**
 * CRYPTORA Image Encryption Module
 * Drag & Drop upload, signature validation, aspect-ratio preview,
 * AES-256-GCM authenticated encryption, and .cpt package generation.
 */

import React, { useState, useRef } from 'react';
import {
  Upload,
  Lock,
  Key,
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Check,
  ArrowRight,
  X,
  FileImage,
} from 'lucide-react';
import {
  encryptImage,
  generateSecure256BitKey,
  validateImageFile,
} from '../../services/cryptoEngine';
import { logAuditEvent } from '../../services/auditService';
import { EncryptedPackage, EncryptionMode, FileValidationResult } from '../../types/crypto';

interface EncryptModuleProps {
  onDecryptionShortcut?: (file: File) => void;
}

export const EncryptModule: React.FC<EncryptModuleProps> = ({ onDecryptionShortcut }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileValidation, setFileValidation] = useState<FileValidationResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Configuration
  const [mode, setMode] = useState<EncryptionMode>('password');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Master Key mode state
  const [masterKey, setMasterKey] = useState<{
    keyBytes: Uint8Array;
    hexKey: string;
    formattedKey: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Execution states
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [encryptedPackage, setEncryptedPackage] = useState<EncryptedPackage | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate key on demand
  const handleGenerateKey = () => {
    const key = generateSecure256BitKey();
    setMasterKey(key);
  };

  // Handle file selection and validation
  const handleFileChange = async (file: File) => {
    setErrorMessage(null);
    setEncryptedPackage(null);

    const validation = await validateImageFile(file);
    setFileValidation(validation);

    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file format.');
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);

    // If master key mode is active and no key yet, generate one
    if (mode === 'generated_key' && !masterKey) {
      handleGenerateKey();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileValidation(null);
    setEncryptedPackage(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Password strength check
  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Empty' };
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (pass.length >= 14) score += 25;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score += 25;

    let label = 'Weak';
    if (score >= 100) label = 'Enterprise (High Entropy)';
    else if (score >= 75) label = 'Strong';
    else if (score >= 50) label = 'Moderate';
    return { score, label };
  };

  const passStrength = calculatePasswordStrength(password);

  const handleEncrypt = async () => {
    if (!selectedFile) return;
    setErrorMessage(null);

    if (mode === 'password') {
      if (!password || password.length < 8) {
        setErrorMessage('Password must be at least 8 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
    } else {
      if (!masterKey) {
        setErrorMessage('Please generate a 256-bit master key.');
        return;
      }
    }

    setIsProcessing(true);
    setProgressPercent(5);
    setProgressStage('Initializing cryptographic engine...');

    try {
      const result = await encryptImage(
        selectedFile,
        {
          mode,
          password: mode === 'password' ? password : undefined,
          rawKeyBytes: mode === 'generated_key' ? masterKey?.keyBytes : undefined,
          iterations: 100000,
        },
        (percent, stage) => {
          setProgressPercent(percent);
          setProgressStage(stage);
        }
      );

      setEncryptedPackage(result);

      // Record authentic audit log
      logAuditEvent({
        type: 'encrypt',
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: fileValidation?.mimeType || selectedFile.type,
        algorithm: 'AES-256-GCM',
        status: 'success',
        details: `Container: ${result.filename} (${(result.encryptedSize / 1024).toFixed(1)} KB), KDF: ${result.kdfMode}`,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Encryption failed.');
      logAuditEvent({
        type: 'encrypt',
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        algorithm: 'AES-256-GCM',
        status: 'failed',
        details: err.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Download encrypted container
  const handleDownloadPackage = () => {
    if (!encryptedPackage) return;
    const url = URL.createObjectURL(encryptedPackage.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = encryptedPackage.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download key file
  const handleDownloadKeyFile = () => {
    if (!masterKey) return;
    const content = `CRYPTORA-AES256-KEY\nVersion: 1\nHex: ${masterKey.hexKey}\nFormatted: ${masterKey.formattedKey}\nCreated: ${new Date().toISOString()}\nWarning: Keep this key strictly confidential. Anyone with this key can decrypt files encrypted with it.`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFile?.name || 'cryptora'}.cptkey`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyKey = () => {
    if (!masterKey) return;
    navigator.clipboard.writeText(masterKey.hexKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleResetForAnother = () => {
    handleRemoveFile();
    setPassword('');
    setConfirmPassword('');
    setMasterKey(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
          Image Encryption Workflow
        </h1>
        <p className="text-xs text-[#666666] mt-1.5 leading-relaxed">
          Encrypt standard image formats using client-side AES-256-GCM authenticated encryption.
          Generates a tamper-proof <code className="font-mono text-[#111111]">.cpt</code> container file.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded flex items-start gap-3 text-xs text-[#DC2626]">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Security Alert: </span>
            {errorMessage}
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-800"
            aria-label="Dismiss alert"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {!encryptedPackage ? (
        <div className="space-y-8">
          {/* Section 1: Upload & Preview Area */}
          <div className="border border-[#E5E5E5] rounded bg-white overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E5E5E5] bg-[#F5F5F5] flex items-center justify-between">
              <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                01. Select Source Image
              </span>
              <span className="text-[11px] text-[#666666]">
                Max 50MB · PNG, JPEG, WEBP, GIF, SVG, BMP, TIFF
              </span>
            </div>

            <div className="p-6">
              {!selectedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded p-10 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-[#111111] bg-[#F5F5F5]'
                      : 'border-[#E5E5E5] hover:border-[#888888] bg-white'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      fileInputRef.current?.click();
                    }
                  }}
                  aria-label="Upload image file"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/bmp,image/tiff"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center mx-auto mb-3 text-[#111111]">
                    <Upload className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#111111]">
                    Drag and drop your image here, or browse files
                  </h3>
                  <p className="text-xs text-[#666666] mt-1">
                    Processed 100% in local browser memory. No remote plaintext transmission.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Image Aspect-Ratio Preview Container */}
                  <div className="relative aspect-video max-h-64 bg-[#F5F5F5] border border-[#E5E5E5] rounded flex items-center justify-center overflow-hidden p-2">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Source preview"
                        className="max-h-full max-w-full object-contain rounded"
                      />
                    )}
                    <button
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 p-1.5 bg-[#111111] text-white rounded hover:bg-[#333333] transition-colors"
                      title="Remove and select different image"
                      aria-label="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Metadata inspection */}
                  <div className="space-y-3">
                    <div className="border border-[#E5E5E5] rounded p-4 bg-[#F5F5F5] space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-[#E5E5E5]">
                        <span className="text-[#666666]">File Name:</span>
                        <span className="font-mono text-[#111111] font-medium truncate max-w-[180px]">
                          {selectedFile.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-[#E5E5E5]">
                        <span className="text-[#666666]">Format Signature:</span>
                        <span className="font-semibold text-[#111111]">
                          {fileValidation?.detectedFormat}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-[#E5E5E5]">
                        <span className="text-[#666666]">File Size:</span>
                        <span className="font-mono text-[#111111]">
                          {(selectedFile.size / 1024).toFixed(1)} KB ({selectedFile.size.toLocaleString()} bytes)
                        </span>
                      </div>
                      {fileValidation?.dimensions && (
                        <div className="flex justify-between items-center py-1 border-b border-[#E5E5E5]">
                          <span className="text-[#666666]">Dimensions:</span>
                          <span className="font-mono text-[#111111]">
                            {fileValidation.dimensions.width} × {fileValidation.dimensions.height} px
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-1">
                        <span className="text-[#666666]">Signature Status:</span>
                        <span className="text-[#16A34A] font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Valid Image
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-[#111111] hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Choose a different image</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Encryption Configuration */}
          {selectedFile && (
            <div className="border border-[#E5E5E5] rounded bg-white overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#E5E5E5] bg-[#F5F5F5] flex items-center justify-between">
                <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                  02. Encryption Credentials & Parameters
                </span>
                <span className="text-[11px] text-[#666666]">
                  AES-256-GCM · 128-bit Authentication Tag
                </span>
              </div>

              <div className="p-6 space-y-6">
                {/* Mode Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('password')}
                    className={`p-4 border rounded text-left transition-colors flex items-start gap-3 ${
                      mode === 'password'
                        ? 'border-[#111111] bg-[#F5F5F5]'
                        : 'border-[#E5E5E5] hover:border-[#888888] bg-white'
                    }`}
                  >
                    <Lock className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-[#111111]">
                        Password Protection (PBKDF2)
                      </div>
                      <div className="text-[11px] text-[#666666] mt-0.5">
                        Derives a 256-bit AES key using PBKDF2-SHA256 with 100,000 iterations and a unique 16-byte salt.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('generated_key');
                      if (!masterKey) handleGenerateKey();
                    }}
                    className={`p-4 border rounded text-left transition-colors flex items-start gap-3 ${
                      mode === 'generated_key'
                        ? 'border-[#111111] bg-[#F5F5F5]'
                        : 'border-[#E5E5E5] hover:border-[#888888] bg-white'
                    }`}
                  >
                    <Key className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-[#111111]">
                        Generated 256-Bit Master Key
                      </div>
                      <div className="text-[11px] text-[#666666] mt-0.5">
                        Generates a cryptographically random 32-byte master key. Downloadable as a backup key file.
                      </div>
                    </div>
                  </button>
                </div>

                {/* Password Mode Fields */}
                {mode === 'password' ? (
                  <div className="space-y-4 max-w-lg">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-[#111111]">
                          Encryption Password
                        </label>
                        {password && (
                          <span className="text-[10px] font-mono text-[#666666]">
                            Strength: {passStrength.label}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter strong encryption password"
                          className="w-full px-3 py-2 text-xs border border-[#E5E5E5] rounded bg-white text-[#111111] pr-9 font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#111111]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-[#888888] hover:text-[#111111]"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {/* Password strength bar */}
                      {password && (
                        <div className="mt-1.5 h-1 w-full bg-[#E5E5E5] rounded overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              passStrength.score >= 75
                                ? 'bg-[#16A34A]'
                                : passStrength.score >= 50
                                ? 'bg-[#111111]'
                                : 'bg-[#D97706]'
                            }`}
                            style={{ width: `${passStrength.score}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1">
                        Confirm Password
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password to confirm"
                        className="w-full px-3 py-2 text-xs border border-[#E5E5E5] rounded bg-white text-[#111111] font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#111111]"
                      />
                    </div>
                  </div>
                ) : (
                  /* Master Key Mode Fields */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#111111]">
                        Cryptographically Generated 256-Bit Key:
                      </span>
                      <button
                        type="button"
                        onClick={handleGenerateKey}
                        className="text-xs text-[#111111] hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Regenerate Key</span>
                      </button>
                    </div>

                    {masterKey && (
                      <div className="p-3 bg-[#F5F5F5] border border-[#E5E5E5] rounded space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <code className="text-xs font-mono font-medium text-[#111111] break-all select-all">
                            {masterKey.hexKey}
                          </code>
                          <button
                            type="button"
                            onClick={handleCopyKey}
                            className="p-1.5 bg-white border border-[#E5E5E5] hover:bg-[#EBEBEB] rounded shrink-0 text-[#111111]"
                            title="Copy Hex Key"
                            aria-label="Copy Hex Key"
                          >
                            {copiedKey ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={handleDownloadKeyFile}
                            className="text-xs text-[#111111] font-medium underline flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download Key File (.cptkey)</span>
                          </button>
                          <span className="text-[11px] text-[#888888]">
                            Save this file now. Decryption is impossible without it.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-4 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-[#666666]">
                    Hardware-accelerated client-side encryption. Zero server upload.
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleEncrypt}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#111111] hover:bg-[#1C1C1C] text-white text-xs font-semibold rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <span className="inline-block animate-spin">↻</span>
                        <span>{progressStage || 'Encrypting...'}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Encrypt Image Now</span>
                      </>
                    )}
                  </button>
                </div>

                {isProcessing && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px] text-[#666666]">
                      <span>{progressStage}</span>
                      <span className="font-mono">{progressPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#E5E5E5] rounded overflow-hidden">
                      <div
                        className="h-full bg-[#111111] transition-all duration-200"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Section 3: Success & Download Result */
        <div className="border border-[#E5E5E5] rounded bg-white overflow-hidden space-y-6 p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center text-[#16A34A]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111111]">
                Image Encrypted Successfully
              </h2>
              <p className="text-xs text-[#666666]">
                Protected using AES-256-GCM authenticated cipher inside a verifiable CRYPTORA container.
              </p>
            </div>
          </div>

          {/* Package Details Matrix */}
          <div className="border border-[#E5E5E5] rounded p-4 bg-[#F5F5F5] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-[#666666] block text-[11px] font-sans">
                Container Package:
              </span>
              <span className="text-[#111111] font-semibold break-all">
                {encryptedPackage.filename}
              </span>
            </div>

            <div>
              <span className="text-[#666666] block text-[11px] font-sans">
                Encrypted Size:
              </span>
              <span className="text-[#111111]">
                {(encryptedPackage.encryptedSize / 1024).toFixed(1)} KB ({encryptedPackage.encryptedSize.toLocaleString()} bytes)
              </span>
            </div>

            <div>
              <span className="text-[#666666] block text-[11px] font-sans">
                Cipher & Mode:
              </span>
              <span className="text-[#111111]">
                AES-256-GCM (96-bit Nonce, 128-bit Tag)
              </span>
            </div>

            <div>
              <span className="text-[#666666] block text-[11px] font-sans">
                Key Derivation:
              </span>
              <span className="text-[#111111]">
                {encryptedPackage.kdfMode} ({encryptedPackage.iterations.toLocaleString()} iter)
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-[#666666] block text-[11px] font-sans">
                Original SHA-256 Checksum:
              </span>
              <span className="text-[#111111] text-[11px] break-all">
                {encryptedPackage.sha256Original}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={handleDownloadPackage}
              className="py-2.5 px-5 bg-[#111111] hover:bg-[#1C1C1C] text-white text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Encrypted File ({encryptedPackage.filename})</span>
            </button>

            {mode === 'generated_key' && masterKey && (
              <button
                onClick={handleDownloadKeyFile}
                className="py-2.5 px-4 bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#111111] text-xs font-semibold rounded border border-[#E5E5E5] flex items-center justify-center gap-2 transition-colors"
              >
                <Key className="w-4 h-4" />
                <span>Download Master Key (.cptkey)</span>
              </button>
            )}

            {onDecryptionShortcut && (
              <button
                onClick={() => {
                  const cptFile = new File([encryptedPackage.blob], encryptedPackage.filename, {
                    type: 'application/octet-stream',
                  });
                  onDecryptionShortcut(cptFile);
                }}
                className="py-2.5 px-4 bg-white hover:bg-[#F5F5F5] text-[#111111] text-xs font-medium rounded border border-[#E5E5E5] flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Test Decrypt This Package</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="pt-4 border-t border-[#E5E5E5]">
            <button
              onClick={handleResetForAnother}
              className="text-xs text-[#666666] hover:text-[#111111] flex items-center gap-1.5 underline decoration-dotted"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Encrypt another image</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
