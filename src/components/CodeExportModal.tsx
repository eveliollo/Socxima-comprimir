import React, { useState } from 'react';
import { X, Copy, Check, FileCode2, Terminal } from 'lucide-react';
import { CODE_SNIPPETS } from '../utils/soxcima';

interface CodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({ isOpen, onClose }) => {
  const [activeLang, setActiveLang] = useState<'python' | 'typescript' | 'rust'>('python');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentSnippet = CODE_SNIPPETS[activeLang];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Código de Implementación SOXCIMA v5.1</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language selector tabs */}
        <div className="px-4 py-2 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              id="lang-tab-python"
              onClick={() => setActiveLang('python')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeLang === 'python'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Python (Código Original Reference)
            </button>
            <button
              id="lang-tab-typescript"
              onClick={() => setActiveLang('typescript')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeLang === 'typescript'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              TypeScript / JS
            </button>
            <button
              id="lang-tab-rust"
              onClick={() => setActiveLang('rust')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeLang === 'rust'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Rust
            </button>
          </div>

          <button
            id="btn-copy-code-snippet"
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-semibold">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copiar Código
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 flex-1 overflow-y-auto bg-slate-950">
          <pre className="text-xs sm:text-sm font-mono text-emerald-300 leading-relaxed overflow-x-auto p-4 bg-slate-900 rounded-xl border border-slate-800">
            <code>{currentSnippet}</code>
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 text-xs text-slate-400 flex items-center justify-between px-4">
          <span>Creador original: Evelio Llovera (4 de Agosto de 2026)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
