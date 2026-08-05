import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Upload, Copy, Download, Sparkles, RefreshCw, 
  Check, FileCheck, Layers, Eye, Table, ArrowRight, CornerDownLeft
} from 'lucide-react';
import { CompressionResult } from '../types';
import { comprimirSoxcima, formatBytes, getByteLength, SAMPLE_DATASETS } from '../utils/soxcima';
import { StatsOverview } from './StatsOverview';
import { DictionaryInspector } from './DictionaryInspector';

export const Compressor: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'compressed' | 'paso1' | 'dictionary'>('compressed');
  const [useZstd, setUseZstd] = useState<boolean>(true);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-compress on mount with first sample dataset if empty
  useEffect(() => {
    if (!inputText) {
      const defaultText = SAMPLE_DATASETS[0].getText();
      setInputText(defaultText);
      const res = comprimirSoxcima(defaultText, useZstd);
      setResult(res);
    }
  }, [useZstd]);

  const handleCompress = (textToCompress = inputText, zstd = useZstd) => {
    if (!textToCompress) return;
    const res = comprimirSoxcima(textToCompress, zstd);
    setResult(res);
  };

  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_DATASETS.find(s => s.id === sampleId);
    if (sample) {
      const text = sample.getText();
      setInputText(text);
      handleCompress(text);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setInputText(content);
          handleCompress(content);
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
          setInputText(content);
          handleCompress(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCopyCompressed = () => {
    if (!result?.compressedText) return;
    navigator.clipboard.writeText(result.compressedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSoxcima = () => {
    if (!result?.compressedText) return;
    const blob = new Blob([result.compressedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `soxcima_compressed_${Date.now()}.soxcima`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const inputByteSize = getByteLength(inputText);
  const inputLineCount = inputText ? inputText.split('\n').length : 0;

  return (
    <div className="space-y-6">
      
      {/* Preset Selector Banner */}
      <div className="bg-slate-900 text-slate-200 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-slate-100">
              Cargar Ejemplos de Prueba:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_DATASETS.map((sample) => (
              <button
                key={sample.id}
                id={`btn-preset-${sample.id}`}
                onClick={() => handleLoadSample(sample.id)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <span>{sample.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Input & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Input Text Area & Upload */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-bold text-slate-800">Texto Original / Archivo Entrada</h2>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{inputLineCount.toLocaleString()} líneas</span>
              <span>•</span>
              <span>{formatBytes(inputByteSize)}</span>
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`p-4 transition-colors relative flex-1 flex flex-col ${
              isDragOver ? 'bg-emerald-50/60 border-2 border-dashed border-emerald-400' : ''
            }`}
          >
            <textarea
              id="compress-input-textarea"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                handleCompress(e.target.value);
              }}
              placeholder="Pegue aquí el texto o arrastre un archivo (.txt, .log, .csv, .json)..."
              className="w-full h-80 lg:h-[420px] p-3 text-xs sm:text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none text-slate-800 leading-relaxed"
            />

            {/* Bottom Input Actions */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".txt,.log,.csv,.json,.js,.ts,.py,.md,.soxcima"
                />
                <button
                  id="btn-upload-file"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Subir Archivo
                </button>
                <button
                  id="btn-clear-text"
                  onClick={() => {
                    setInputText('');
                    setResult(null);
                  }}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  Limpiar
                </button>
              </div>

              <button
                id="btn-run-compress"
                onClick={() => handleCompress()}
                className="px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Comprimir Socxima-comprimir
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Compressed Output & Inspector */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-800">Resultado Comprimido SOXCIMA</h2>
            </div>

            {/* View switcher & mode toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useZstd}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setUseZstd(checked);
                    handleCompress(inputText, checked);
                  }}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-semibold text-emerald-700">+ ZSTD Level 9</span>
              </label>

              <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-xs">
                <button
                  id="view-compressed-raw"
                  onClick={() => setViewMode('compressed')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    viewMode === 'compressed' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3 h-3 inline mr-1" />
                  Output (ZSTD)
                </button>
                <button
                  id="view-paso1"
                  onClick={() => setViewMode('paso1')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    viewMode === 'paso1' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3 h-3 inline mr-1" />
                  Paso 1 (SOX)
                </button>
                <button
                  id="view-dictionary"
                  onClick={() => setViewMode('dictionary')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    viewMode === 'dictionary' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Table className="w-3 h-3 inline mr-1" />
                  Diccionario ({result ? Object.keys(result.dictionary).length : 0})
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            
            {result ? (
              <>
                {viewMode === 'compressed' ? (
                  <div className="flex-1 flex flex-col">
                    <textarea
                      id="compress-output-textarea"
                      readOnly
                      value={result.compressedText}
                      className="w-full h-80 lg:h-[420px] p-3 text-xs sm:text-sm font-mono bg-slate-900 text-emerald-400 border border-slate-800 rounded-lg focus:outline-none resize-none leading-relaxed"
                    />

                    {/* Output action buttons */}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500 font-mono">
                        Modo: {result.mode === 'zstd' ? 'SOXCIMA + ZSTD v5.2' : 'SOXCIMA v5.2 Pure'}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          id="btn-copy-compressed"
                          onClick={handleCopyCompressed}
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
                          id="btn-download-soxcima"
                          onClick={handleDownloadSoxcima}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Descargar .soxcima
                        </button>
                      </div>
                    </div>
                  </div>
                ) : viewMode === 'paso1' ? (
                  <div className="flex-1 flex flex-col">
                    <textarea
                      id="compress-paso1-textarea"
                      readOnly
                      value={result.paso1Text || ''}
                      className="w-full h-80 lg:h-[420px] p-3 text-xs sm:text-sm font-mono bg-slate-900 text-amber-300 border border-slate-800 rounded-lg focus:outline-none resize-none leading-relaxed"
                    />
                    <div className="mt-2 text-xs text-slate-500 font-mono">
                      Paso 1: Cabecera tokenizada con delimitador <code className="text-amber-400">"||SOX||"</code> y líneas filtradas por frecuencia (&gt;1 repetición).
                    </div>
                  </div>
                ) : (
                  <DictionaryInspector result={result} />
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <FileText className="w-12 h-12 stroke-1 mb-2 text-slate-300" />
                <p className="text-sm font-medium">No hay datos comprimidos</p>
                <p className="text-xs text-slate-400 mt-1">Ingrese texto a la izquierda o cargue un ejemplo</p>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Stats Overview Panel */}
      <StatsOverview result={result} />

    </div>
  );
};
