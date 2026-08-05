import React from 'react';
import { ArrowDownRight, Clock, Layers, Save, Percent, CheckCircle2 } from 'lucide-react';
import { CompressionResult } from '../types';
import { formatBytes } from '../utils/soxcima';

interface StatsOverviewProps {
  result: CompressionResult | null;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ result }) => {
  if (!result) return null;

  const isSaving = result.spaceSavedBytes > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      
      {/* Stat 1: Compression Ratio & Reduction % */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Reducción Total
          </span>
          <div className={`p-2 rounded-lg ${isSaving ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-2xl font-bold tracking-tight ${isSaving ? 'text-emerald-600' : 'text-slate-800'}`}>
            {result.reductionPercentage}%
          </span>
          {isSaving && (
            <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
              <ArrowDownRight className="w-3 h-3 mr-0.5" />
              Reducido
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {result.originalSizeBytes > 0 ? (
            `Ratio: ${(result.originalSizeBytes / Math.max(1, result.compressedSizeBytes)).toFixed(2)}x original`
          ) : 'Sin datos'}
        </p>
      </div>

      {/* Stat 2: Sizes & Space Saved */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Espacio Ahorrado
          </span>
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <Save className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            {formatBytes(result.spaceSavedBytes)}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1 truncate">
          {formatBytes(result.originalSizeBytes)} &rarr; {formatBytes(result.compressedSizeBytes)}
        </p>
      </div>

      {/* Stat 3: Processing Time & Speed */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Tiempo de Proceso
          </span>
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            {result.timeTakenMs.toFixed(2)} ms
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Velocidad de compresión ultra-rápida
        </p>
      </div>

      {/* Stat 4: Line Analysis & Unique Tokens */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Eficiencia de Líneas
          </span>
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            {result.uniqueLines} / {result.totalLines}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Líneas únicas ({((result.uniqueLines / Math.max(1, result.totalLines)) * 100).toFixed(1)}% del total)
        </p>
      </div>

    </div>
  );
};
