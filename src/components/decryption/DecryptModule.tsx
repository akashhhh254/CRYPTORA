/**
 * CRYPTORA Image Decryption Module
 * Upload .cpt container, header inspection, credential verification,
 * authenticated AES-256-GCM decryption, and bit-level fidelity verification.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Unlock,
  Key,
  Lock,
  ShieldCheck,
  ShieldAlert,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  X,
  FileCheck,
  Layers,
} from 'lucide-react';
import {
  decryptImage,
  inspectCptHeader,
} from '../../services/cryptoEngine';
import { logAuditEvent } from '../../services/auditService';
import { CptHeaderInspection, DecryptedResult } from '../../types/crypto';

interface DecryptModuleProps {
  initialFile?: File | null;
}

export const DecryptModule: React.FC<DecryptModuleProps> = ({ initialFile }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [headerInspection, setHeaderInspection] = useState<CptHeaderInspection | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Credentials
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rawKeyHex, setRawKeyHex] = useState('');

  // Execution states
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [decryptedResult, setDecryptedResult] = useState<DecryptedResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const keyFileInputRef = useRef<HTMLInputElement>(null);

  // Load initial file if passed from encryption shortcut
  useEffect(() => {
    if (initialFile) {
      handleFileChange(initialFile);
    }
  }, [initialFile]);

  // Clean up object URL on unmount or reset
  useEffect(() => {
    return () => {
      if (decryptedResult?.url) {
        URL.revokeObjectURL(decryptedResult.url);
      }
    };
  }, [decryptedResult]);

  // Handle encrypted file selection and inspection
  const handleFileChange = async (file: File) => {
    setErrorMessage(null);
    setDecryptedResult(null);

    try {
      const buffer = await file.arrayBuffer();
      const inspection = inspectCptHeader(buffer);
      setHeaderInspection(inspection);

      if (!inspection.valid) {
        setErrorMessage(
          inspection.error ||
            'The selected file is not a valid CRYPTORA container (.cpt). Please ensure you are uploading a file encrypted by CRYPTORA.'
        );
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
    } catch (err: any) {
      setErrorMessage('Failed to read file: ' + err.message);
      setSelectedFile(null);
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
    if (decryptedResult?.url) {
      URL.revokeObjectURL(decryptedResult.url);
    }
    setSelectedFile(null);
    setHeaderInspection(null);
    setDecryptedResult(null);
    setErrorMessage(null);
    setPassword('');
    setRawKeyHex('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Upload .cptkey file to automatically populate key field
  const handleKeyFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const keyFile = e.target.files[0];
      const text = await keyFile.text();
      // Extract hex key if formatted as .cptkey file or plain hex
      const match = text.match(/Hex:\s*([0-9a-fA-F]{64})/) || text.match(/([0-9a-fA-F]{64})/);
      if (match) {
        setRawKeyHex(match[1]);
      } else {
        setErrorMessage('Could not extract a valid 256-bit hexadecimal key from the uploaded key file.');
      }
    }
  };

  const handleDecrypt = async () => {
    if (!selectedFile || !headerInspection) return;
    setErrorMessage(null);

    const isPasswordMode = headerInspection.kdfMode === 'PBKDF2-SHA256';

    if (isPasswordMode && !password) {
      setErrorMessage('Please enter the decryption password.');
      return;
    }

    if (!isPasswordMode && !rawKeyHex) {
      setErrorMessage('Please enter or upload the 256-bit Master Key.');
      return;
    }

    setIsProcessing(true);
    setProgressPercent(10);
    setProgressStage('Initializing cryptographic verification...');

    try {
      const result = await decryptImage(
        selectedFile,
        {
          password: isPasswordMode ? password : undefined,
          rawKeyHex: !isPasswordMode ? rawKeyHex.replace(/[^0-9a-fA-F]/g, '') : undefined,
        },
        (percent, stage) => {
          setProgressPercent(percent);
          setProgressStage(stage);
        }
      );

      setDecryptedResult(result);

      // Record authentic audit event
      logAuditEvent({
        type: 'decrypt',
        category: 'file',
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: result.mimeType,
        algorithm: 'AES-256-GCM',
        status: 'success',
        details: `Restored: ${result.filename} (${(result.size / 1024).toFixed(1)} KB), verified in ${result.decryptionTimeMs}ms`,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Decryption failed.');
      logAuditEvent({
        type: 'decrypt',
        category: 'file',
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: 'application/octet-stream',
        algorithm: 'AES-256-GCM',
        status: 'failed',
        details: err.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Download restored image
  const handleDownloadRestored = () => {
    if (!decryptedResult) return;
    const a = document.createElement('a');
    a.href = decryptedResult.url;
    a.download = decryptedResult.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleResetForAnother = () => {
    handleRemoveFile();
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
          Image Decryption Workflow
        </h1>
        <p className="text-xs text-[#666666] mt-1.5 leading-relaxed">
          Restore previously encrypted <code className="font-mono text-[#111111]">.cpt</code> packages using authenticated credentials.
          Validates cryptographic tag and byte-for-byte SHA-256 hash.
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

      {!decryptedResult ? (
        <div className="space-y-8">
          {/* Section 1: Upload Container */}
          <div className="border border-[#E5E5E5] rounded bg-white overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E5E5E5] bg-[#F5F5F5] flex items-center justify-between">
              <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                01. Select Protected Container (.cpt)
              </span>
              <span className="text-[11px] text-[#666666]">
                CRYPTORA Package Format v1
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
                  aria-label="Upload encrypted CPT container"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".cpt,application/octet-stream"
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
                    Drag and drop your encrypted .cpt file here, or browse files
                  </h3>
                  <p className="text-xs text-[#666666] mt-1">
                    Validates binary header signature and cryptographic derivation parameters before decryption.
                  </p>
                </div>
              ) : (
                /* File Selected & Header Inspected */
                <div className="space-y-4">
                  <div className="border border-[#E5E5E5] rounded p-4 bg-[#F5F5F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-white border border-[#E5E5E5] flex items-center justify-center text-[#111111] font-bold shrink-0">
                        CPT
                      </div>
                      <div>
                        <div className="font-semibold text-[#111111] font-mono break-all">
                          {selectedFile.name}
                        </div>
                        <div className="text-[11px] text-[#666666]">
                          {(selectedFile.size / 1024).toFixed(1)} KB · Version {headerInspection?.version} · {headerInspection?.kdfMode}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleRemoveFile}
                      className="text-xs text-[#DC2626] hover:underline self-end sm:self-center"
                    >
                      Remove File
                    </button>
                  </div>

                  {/* Container Metadata Breakdown */}
                  {headerInspection?.valid && (
                    <div className="border border-[#E5E5E5] rounded p-4 bg-white grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[#666666] block text-[11px]">Original File Name:</span>
                        <span className="font-mono text-[#111111] font-medium break-all">
                          {headerInspection.metadata?.originalName || 'Unknown'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#666666] block text-[11px]">Original MIME Format:</span>
                        <span className="font-mono text-[#111111]">
                          {headerInspection.metadata?.mimeType || 'image/png'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#666666] block text-[11px]">Key Derivation Function:</span>
                        <span className="text-[#111111] font-semibold">
                          {headerInspection.kdfMode} ({headerInspection.iterations?.toLocaleString()} iterations)
                        </span>
                      </div>
                      <div>
                        <span className="text-[#666666] block text-[11px]">Encryption Cipher:</span>
                        <span className="text-[#111111] font-semibold">
                          AES-256-GCM (Authenticated)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Credential Input */}
          {selectedFile && headerInspection?.valid && (
            <div className="border border-[#E5E5E5] rounded bg-white overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#E5E5E5] bg-[#F5F5F5] flex items-center justify-between">
                <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                  02. Provide Decryption Credentials
                </span>
                <span className="text-[11px] text-[#666666]">
                  Required: {headerInspection.kdfMode === 'PBKDF2-SHA256' ? 'Passphrase' : '256-bit Key'}
                </span>
              </div>

              <div className="p-6 space-y-4">
                {headerInspection.kdfMode === 'PBKDF2-SHA256' ? (
                  <div className="max-w-md space-y-2">
                    <label className="block text-xs font-semibold text-[#111111]">
                      Decryption Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter the password used during encryption"
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
                    <p className="text-[11px] text-[#666666]">
                      Keys are derived locally in browser memory using PBKDF2 with SHA-256 and the unique salt stored in the header.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#111111]">
                        256-Bit Master Key (64-character Hexadecimal)
                      </label>
                      <button
                        type="button"
                        onClick={() => keyFileInputRef.current?.click()}
                        className="text-xs text-[#111111] hover:underline flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload Key File (.cptkey)</span>
                      </button>
                      <input
                        ref={keyFileInputRef}
                        type="file"
                        accept=".cptkey,.txt"
                        onChange={handleKeyFileUpload}
                        className="hidden"
                      />
                    </div>

                    <input
                      type="text"
                      value={rawKeyHex}
                      onChange={(e) => setRawKeyHex(e.target.value)}
                      placeholder="e.g. 4a2b9f..."
                      className="w-full px-3 py-2 text-xs border border-[#E5E5E5] rounded bg-white text-[#111111] font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#111111]"
                    />
                    <p className="text-[11px] text-[#666666]">
                      Paste your 64-character hex key or upload your saved <code className="font-mono text-[#111111]">.cptkey</code> backup file.
                    </p>
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-4 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-[#666666]">
                    Verifies cryptographic tag integrity. Tampered files will fail securely.
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleDecrypt}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#111111] hover:bg-[#1C1C1C] text-white text-xs font-semibold rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <span className="inline-block animate-spin">↻</span>
                        <span>{progressStage || 'Decrypting...'}</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Decrypt & Restore Image</span>
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
        /* Section 3: Restored Image View */
        <div className="border border-[#E5E5E5] rounded bg-white overflow-hidden space-y-6 p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center text-[#16A34A]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111111]">
                Image Restored with 100% Fidelity
              </h2>
              <p className="text-xs text-[#666666]">
                AES-GCM authentication tag verified. Binary SHA-256 checksum matches original image exactly.
              </p>
            </div>
          </div>

          {/* Restored Preview & Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Image Preview Container */}
            <div className="relative aspect-video max-h-72 bg-[#F5F5F5] border border-[#E5E5E5] rounded flex items-center justify-center overflow-hidden p-2">
              <img
                src={decryptedResult.url}
                alt={decryptedResult.filename}
                className="max-h-full max-w-full object-contain rounded"
              />
            </div>

            {/* Verification Breakdown */}
            <div className="space-y-3">
              <div className="border border-[#E5E5E5] rounded p-4 bg-[#F5F5F5] space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center py-1 border-b border-[#E5E5E5]">
                  <span className="text-[#666666] font-sans">Restored File:</span>
                  <span className="text-[#111111] font-semibold truncate max-w-[180px]">
                    {decryptedResult.filename}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#E5E5E5]">
                  <span className="text-[#666666] font-sans">Restored Size:</span>
                  <span className="text-[#111111]">
                    {(decryptedResult.size / 1024).toFixed(1)} KB ({decryptedResult.size.toLocaleString()} bytes)
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#E5E5E5]">
                  <span className="text-[#666666] font-sans">MIME Format:</span>
                  <span className="text-[#111111]">
                    {decryptedResult.mimeType}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#E5E5E5]">
                  <span className="text-[#666666] font-sans">Decryption Latency:</span>
                  <span className="text-[#111111]">
                    {decryptedResult.decryptionTimeMs} ms
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-[#666666] font-sans">Integrity Check:</span>
                  <span className="text-[#16A34A] font-semibold flex items-center gap-1 font-sans">
                    <Check className="w-3.5 h-3.5" /> Bit-for-Bit Verified
                  </span>
                </div>
              </div>

              {decryptedResult.sha256Restored && (
                <div className="p-3 bg-white border border-[#E5E5E5] rounded text-[11px] font-mono text-[#666666] space-y-1">
                  <span className="block text-[#111111] font-sans font-semibold">
                    Restored SHA-256 Hash:
                  </span>
                  <span className="break-all block text-[#111111]">
                    {decryptedResult.sha256Restored}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={handleDownloadRestored}
              className="py-2.5 px-5 bg-[#111111] hover:bg-[#1C1C1C] text-white text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Restored Image ({decryptedResult.filename})</span>
            </button>

            <button
              onClick={handleResetForAnother}
              className="py-2.5 px-4 bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#111111] text-xs font-semibold rounded border border-[#E5E5E5] flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Decrypt Another File</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
