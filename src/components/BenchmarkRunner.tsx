import React, { useState } from 'react';
import { Cpu, Play, CheckCircle2, Zap, BarChart3, AlertCircle, ShieldCheck } from 'lucide-react';
import { BenchmarkResult } from '../types';
import { runEvelioLloveraBenchmark, formatBytes, SOXCIMA_SIGNATURE, SOXCIMA_AUTHOR } from '../utils/soxcima';

export const BenchmarkRunner: React.FC = () => {
  const [lineCount, setLineCount] = useState<number>(10000);
  const [lineLength, setLineLength] = useState<number>(500);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [history, setHistory] = useState<BenchmarkResult[]>([]);

  const handleRunBenchmark = () => {
    setIsRunning(true);
    // Use setTimeout to allow UI render before heavy loop
    setTimeout(() => {
      try {
        const result = runEvelioLloveraBenchmark(lineCount, lineLength);
        setHistory(prev => [result, ...prev]);
      } catch (err) {
        console.error("Benchmark error:", err);
      } finally {
        setIsRunning(false);
      }
    }, 50);
  };

  return (
    <div className="space-y-6">
      
      {/* Benchmark Info Header */}
      <div className="bg-slate-900 text-slate-100 p-6 rounded-xl border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">SOXCIMA Performance Benchmark Suite</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Official Spec Test
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Prueba de rendimiento oficial de la especificación SOXCIMA por <strong className="text-slate-200">{SOXCIMA_AUTHOR}</strong>. 
              Evalúa la velocidad de compresión de diccionarios con patrones de repetición masiva.
            </p>
          </div>

          <button
            id="btn-run-official-benchmark"
            disabled={isRunning}
            onClick={handleRunBenchmark}
            className="px-5 py-2.5 text-sm font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Ejecutando...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Ejecutar Benchmark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Benchmark Settings Panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-600" />
          Configuración del Generador de Patrones
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Número de Líneas Repetidas
            </label>
            <select
              id="benchmark-line-count-select"
              value={lineCount}
              onChange={(e) => setLineCount(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
            >
              <option value={1000}>1,000 líneas (~0.5 MB)</option>
              <option value={5000}>5,000 líneas (~2.5 MB)</option>
              <option value={10000}>10,000 líneas (~5.0 MB)</option>
              <option value={25000}>25,000 líneas (~12.5 MB)</option>
              <option value={50000}>50,000 líneas (Standard Evelio Test ~25MB)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Longitud del Patrón por Línea ('0's)
            </label>
            <select
              id="benchmark-line-len-select"
              value={lineLength}
              onChange={(e) => setLineLength(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
            >
              <option value={250}>250 caracteres por línea</option>
              <option value={500}>500 caracteres por línea</option>
              <option value={1000}>1,000 caracteres por línea (Prueba Original)</option>
            </select>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Tamaño Estimado del Corpus</span>
            <span className="text-base font-bold text-slate-900 font-mono">
              {formatBytes(lineCount * (lineLength + 1))}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">Alta tasa de compresión esperada ({'>'}99.9%)</span>
          </div>

        </div>
      </div>

      {/* Benchmark Results History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600" />
            Resultados de Benchmark SOXCIMA
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Firma: <code className="text-slate-700">{SOXCIMA_SIGNATURE}</code>
          </span>
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-600 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Prueba / Corpus</th>
                  <th className="py-3 px-4">Tamaño Original</th>
                  <th className="py-3 px-4">Tamaño Comprimido</th>
                  <th className="py-3 px-4">Reducción %</th>
                  <th className="py-3 px-4">Tiempo (ms)</th>
                  <th className="py-3 px-4 text-right">Throughput</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {history.map((res, idx) => (
                  <tr key={idx} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800 font-sans">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{res.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{formatBytes(res.originalSizeBytes)}</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">{formatBytes(res.compressedSizeBytes)}</td>
                    <td className="py-3 px-4 text-slate-900 font-bold">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-sans">
                        {res.reductionPercentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{res.timeTakenMs.toFixed(2)} ms</td>
                    <td className="py-3 px-4 text-right font-bold text-purple-600 font-sans">
                      {res.throughputMBps} MB/s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-slate-400">
            <Cpu className="w-10 h-10 stroke-1 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No se han ejecutado benchmarks aún.</p>
            <p className="text-xs text-slate-400 mt-1">Haga clic en "Ejecutar Benchmark" para iniciar la prueba.</p>
          </div>
        )}
      </div>

    </div>
  );
};
