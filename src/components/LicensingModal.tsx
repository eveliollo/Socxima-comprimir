import React from 'react';
import { X, Scale, ShieldCheck, CheckCircle2, AlertOctagon, Heart, UserCheck } from 'lucide-react';
import { SOXCIMA_AUTHOR, SOXCIMA_DATE, SOXCIMA_SIGNATURE, SOXCIMA_VERSION } from '../utils/soxcima';

interface LicensingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LicensingModal: React.FC<LicensingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        
        {/* Modal Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Términos de Licencia SOXCIMA</h3>
              <p className="text-xs text-slate-400">Especificación Oficial v5.1 por {SOXCIMA_AUTHOR}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-slate-700 text-xs sm:text-sm">
          
          {/* Header Spec Block */}
          <div className="bg-slate-900 text-emerald-300 p-4 rounded-xl font-mono text-xs border border-slate-800 space-y-1">
            <p className="text-slate-400"># =====================================================</p>
            <p className="font-bold text-emerald-400">#   SOXCIMA — SISTEMA DE COMPRESIÓN UNIVERSAL</p>
            <p>#   CREADOR: {SOXCIMA_AUTHOR}</p>
            <p>#   FECHA: {SOXCIMA_DATE}</p>
            <p>#   FIRMA: {SOXCIMA_SIGNATURE}</p>
            <p>#   REGLAS: USO GRATIS PARA PERSONAS. USO COMERCIAL</p>
            <p>#   REQUIERE LICENCIA A EVELIO LLOVERA. NO BORRAR ESTA CABECERA.</p>
            <p className="text-slate-400"># =====================================================</p>
          </div>

          {/* Rules Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Uso Personal Gratuito</span>
              </div>
              <p className="text-emerald-900 text-xs leading-relaxed">
                Uso 100% gratuito para individuos, proyectos personales, investigaciones académicas y uso privado sin fines de lucro.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <AlertOctagon className="w-4 h-4 text-amber-600" />
                <span>Uso Comercial Requerido</span>
              </div>
              <p className="text-amber-900 text-xs leading-relaxed">
                Todo uso empresarial, comercial o de distribución monetizada requiere licencia explícita otorgada por Evelio Llovera.
              </p>
            </div>

          </div>

          {/* Signature Verification */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="block font-bold text-slate-800 text-xs">Clave de Firma Digital Registrada:</span>
                <code className="text-slate-600 font-mono text-xs">{SOXCIMA_SIGNATURE}</code>
              </div>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-100 text-emerald-800">
              VÁLIDA
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">© 2026 {SOXCIMA_AUTHOR}. Todos los derechos reservados.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
