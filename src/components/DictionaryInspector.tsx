import React, { useState } from 'react';
import { Search, Hash, Layers, ArrowRight } from 'lucide-react';
import { CompressionResult } from '../types';
import { getByteLength, formatBytes } from '../utils/soxcima';

interface DictionaryInspectorProps {
  result: CompressionResult;
}

export const DictionaryInspector: React.FC<DictionaryInspectorProps> = ({ result }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const dictionaryEntries: [string, string][] = Object.entries(result.dictionary); // token -> line

  const filteredEntries = dictionaryEntries.filter(([token, line]) => {
    return token.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (line as string).toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex-1 flex flex-col h-80 lg:h-[420px] bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
      
      {/* Search Header */}
      <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            id="dictionary-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar token (@1) o contenido..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {filteredEntries.length} de {dictionaryEntries.length} tokens
        </span>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-y-auto">
        {filteredEntries.length > 0 ? (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2 px-3">Token SOXCIMA</th>
                <th className="py-2 px-3">Frecuencia</th>
                <th className="py-2 px-3">Línea Original</th>
                <th className="py-2 px-3 text-right">Ahorro Est.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {filteredEntries.map(([token, line]) => {
                const count = result.lineFrequency[line] || 1;
                const origLen = getByteLength(line);
                const tokenLen = getByteLength(token);
                // Saved per replacement: (origLen - tokenLen) * (count - 1) - header cost
                const lineSpaceSaved = Math.max(0, (origLen - tokenLen) * (count - 1));

                return (
                  <tr key={token} className="hover:bg-emerald-50/50 transition-colors">
                    <td className="py-2 px-3 font-bold text-emerald-600 whitespace-nowrap">
                      {token}
                    </td>
                    <td className="py-2 px-3 text-slate-600">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[11px] font-sans font-medium">
                        x{count}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-800 max-w-xs truncate" title={line}>
                      {line}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-600 font-sans text-xs">
                      {formatBytes(lineSpaceSaved)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-slate-400">
            <p className="text-xs">No se encontraron tokens que coincidan con la búsqueda.</p>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="p-2 bg-slate-100 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between px-3">
        <span>Formato cabecera: <code className="text-slate-700">@1=line1 @2=line2 | </code></span>
        <span>Algoritmo SOXCIMA v5.1</span>
      </div>

    </div>
  );
};
