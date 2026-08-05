import React from 'react';
import { Cpu, ShieldCheck, FileCode2, Scale, Zap, Info } from 'lucide-react';
import { SOXCIMA_AUTHOR, SOXCIMA_DATE, SOXCIMA_SIGNATURE, SOXCIMA_VERSION } from '../utils/soxcima';

interface HeaderProps {
  onOpenCodeModal: () => void;
  onOpenLicenseModal: () => void;
  activeTab: 'compress' | 'decompress' | 'benchmark';
  setActiveTab: (tab: 'compress' | 'decompress' | 'benchmark') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCodeModal,
  onOpenLicenseModal,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Socxima-comprimir</h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {SOXCIMA_VERSION}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {SOXCIMA_SIGNATURE}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sistema de Compresión Universal por <span className="text-slate-200 font-medium">{SOXCIMA_AUTHOR}</span> ({SOXCIMA_DATE})
              </p>
            </div>
          </div>

          {/* Nav Tabs & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Main Mode Tabs */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center">
              <button
                id="tab-compress"
                onClick={() => setActiveTab('compress')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'compress'
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                Comprimir
              </button>
              <button
                id="tab-decompress"
                onClick={() => setActiveTab('decompress')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'decompress'
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                Descomprimir
              </button>
              <button
                id="tab-benchmark"
                onClick={() => setActiveTab('benchmark')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'benchmark'
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                Benchmark
              </button>
            </div>

            {/* Code Snippets & Licensing */}
            <button
              id="btn-code-modal"
              onClick={onOpenCodeModal}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Ver código de implementación"
            >
              <FileCode2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Código</span>
            </button>

            <button
              id="btn-license-modal"
              onClick={onOpenLicenseModal}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-colors"
              title="Ver Términos de Licencia y Autor"
            >
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Licencia</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
