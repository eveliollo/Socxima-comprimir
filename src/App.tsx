import React, { useState } from 'react';
import { Header } from './components/Header';
import { Compressor } from './components/Compressor';
import { Decompressor } from './components/Decompressor';
import { BenchmarkRunner } from './components/BenchmarkRunner';
import { CodeExportModal } from './components/CodeExportModal';
import { LicensingModal } from './components/LicensingModal';
import { SOXCIMA_AUTHOR, SOXCIMA_DATE, SOXCIMA_SIGNATURE, SOXCIMA_VERSION } from './utils/soxcima';
import { ShieldCheck, Zap, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'compress' | 'decompress' | 'benchmark'>('compress');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
        onOpenLicenseModal={() => setIsLicenseModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {activeTab === 'compress' && <Compressor />}

        {activeTab === 'decompress' && <Decompressor />}

        {activeTab === 'benchmark' && <BenchmarkRunner />}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-slate-500 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Socxima-comprimir {SOXCIMA_VERSION} — Sistema de Compresión Universal</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {SOXCIMA_SIGNATURE}
            </span>
            <span>•</span>
            <span>Creador: <strong className="text-slate-300">{SOXCIMA_AUTHOR}</strong> ({SOXCIMA_DATE})</span>
          </div>

        </div>
      </footer>

      {/* Modals */}
      <CodeExportModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />

      <LicensingModal
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
      />

    </div>
  );
}
