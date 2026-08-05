import React, { useState, useRef } from 'react';
import { 
  FileText, Upload, Copy, Download, Check, RefreshCw, 
  CheckCircle2, AlertTriangle, ShieldCheck, FileCheck
} from 'lucide-react';
import { DecompressionResult } from '../types';
import { descomprimirSoxcima, formatBytes, SOXCIMA_SIGNATURE } from '../utils/soxcima';

export const Decompressor: React.FC = () => {
  const [compressedInput, setCompressedInput] = useState<string>('');
  const [result, setResult] = useState<DecompressionResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDecompress = (textToDecompress = compressedInput) => {
    if (!textToDecompress) return;
    const res = descomprimirSoxcima(textToDecompress);
    setResult(res);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setCompressedInput(content);
          handleDecompress(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setCompressedInput(content);
          handleDecompress(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCopyDecompressed = () => {
    if (!result?.decompressedText) return;
    navigator.clipboard.writeText(result.decompressedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadOriginal = () => {
    if (!result?.decompressedText) return;
    const blob = new Blob([result.decompressedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `soxcima_decompressed_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-slate-900 text-slate-200 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Descompresor Universal SOXCIMA v5.1</h3>
            <p className="text-xs text-slate-400">
              Restaura archivos comprimidos con el delimitador <code className="text-emerald-300 font-mono">" | "</code> y tokens <code className="text-emerald-300 font-mono">@1, @2...</code>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Input Compressed Text */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-bold text-slate-800">Entrada Comprimida (.soxcima)</h2>
            </div>
            {compressedInput && (
              <span className="text-xs text-slate-500 font-mono">
                {formatBytes(new TextEncoder().encode(compressedInput).length)}
              </span>
            )}
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`p-4 transition-colors relative flex-1 flex flex-col ${
              isDragOver ? 'bg-emerald-50/60 border-2 border-dashed border-emerald-400' : ''
            }`}
          >
            <textarea
              id="decompress-input-textarea"
              value={compressedInput}
              onChange={(e) => {
                setCompressedInput(e.target.value);
                handleDecompress(e.target.value);
              }}
              placeholder="Pegue aquí el contenido comprimido SOXCIMA (@1=linea1 @2=linea2 | @1&#10;@2) o arrastre un archivo .soxcima..."
              className="w-full h-80 lg:h-[420px] p-3 text-xs sm:text-sm font-mono bg-slate-900 text-emerald-300 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none leading-relaxed"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".soxcima,.txt,.log"
                />
                <button
                  id="btn-upload-soxcima-file"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Cargar .soxcima
                </button>
                <button
                  id="btn-clear-decompress"
                  onClick={() => {
                    setCompressedInput('');
                    setResult(null);
                  }}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  Limpiar
                </button>
              </div>

              <button
                id="btn-run-decompress"
                onClick={() => handleDecompress()}
                className="px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Descomprimir
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Decompressed Result Output */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-800">Resultado Original Restaurado</h2>
            </div>
            
            {result && (
              <div className="flex items-center gap-1.5">
                {result.isValidHeader ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Header Válido ({result.dictionaryEntriesCount} tokens)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    Sin Formato Header
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="p-4 flex-1 flex flex-col">
            {result ? (
              <div className="flex-1 flex flex-col">
                <textarea
                  id="decompress-output-textarea"
                  readOnly
                  value={result.decompressedText}
                  className="w-full h-80 lg:h-[420px] p-3 text-xs sm:text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none resize-none leading-relaxed text-slate-800"
                />

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="text-xs text-slate-500">
                    Restaura: {result.totalLines.toLocaleString()} líneas | {formatBytes(result.decompressedSizeBytes)} | {result.timeTakenMs.toFixed(2)} ms
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id="btn-copy-decompressed"
                      onClick={handleCopyDecompressed}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copiar
                        </>
                      )}
                    </button>
                    <button
                      id="btn-download-original"
                      onClick={handleDownloadOriginal}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Descargar Original
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <FileText className="w-12 h-12 stroke-1 mb-2 text-slate-300" />
                <p className="text-sm font-medium">No hay texto descomprimido</p>
                <p className="text-xs text-slate-400 mt-1">Pegue texto comprimido a la izquierda para restaurar</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
