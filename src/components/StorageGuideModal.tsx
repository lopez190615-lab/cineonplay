import React from 'react';
import {
  X,
  HardDrive,
  Cloud,
  CheckCircle2,
  Server,
  Zap,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { StorageOverview } from '../types';

interface StorageGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  storageStats: StorageOverview | null;
}

export const StorageGuideModal: React.FC<StorageGuideModalProps> = ({
  isOpen,
  onClose,
  storageStats
}) => {
  if (!isOpen) return null;

  const totalGB = storageStats?.totalStorageGB || 0;
  const target500GB = 100; // 500 videos * 200MB = ~100GB
  const percentOf500 = Math.min(100, Math.round((totalGB / target500GB) * 100));

  return (
    <div
      id="storage-guide-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="w-full max-w-3xl bg-[#0d0e12] rounded-2xl border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden my-8">
        {/* Top Header */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

        <div className="p-6 pb-4 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <HardDrive size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-['Outfit']">
                Arquitectura de Almacenamiento (500+ Videos / 100 GB+)
              </h3>
              <p className="text-xs text-zinc-400">
                Soluciones preparadas para alto volumen y transmisión fluida de 200MB por video
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
          {/* Real-time Storage Monitor */}
          <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-zinc-200 flex items-center gap-2">
                <Layers size={16} className="text-amber-400" />
                Almacenamiento actual de la biblioteca
              </span>
              <span className="font-mono text-amber-400 font-bold">
                {storageStats?.totalStorageMB || 0} MB ({totalGB} GB)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                  style={{ width: `${Math.max(4, percentOf500)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                <span>{storageStats?.totalVideos || 0} videos registrados</span>
                <span>Objetivo 500 videos (~100 GB)</span>
              </div>
            </div>

            {/* Metrics Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-800/80 text-xs">
              <div className="p-2 rounded-lg bg-black/40 border border-zinc-800">
                <p className="text-zinc-500 text-[10px]">Videos Locales</p>
                <p className="font-mono text-white font-bold">{storageStats?.localVideoCount || 0}</p>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-zinc-800">
                <p className="text-zinc-500 text-[10px]">Videos CDN / Enlace</p>
                <p className="font-mono text-white font-bold">{storageStats?.externalVideoCount || 0}</p>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-zinc-800">
                <p className="text-zinc-500 text-[10px]">Promedio por video</p>
                <p className="font-mono text-white font-bold">~200 MB</p>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-zinc-800">
                <p className="text-zinc-500 text-[10px]">Streaming Protocol</p>
                <p className="font-mono text-emerald-400 font-bold">HTTP 206 Partial</p>
              </div>
            </div>
          </div>

          {/* Solution 1: Streaming Integrado */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Server size={18} className="text-amber-400" />
                <span>1. Subida Directa al Servidor</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                El sistema soporta subida de archivos directos (hasta 600MB por archivo) con almacenamiento en disco persistente y transmisión por rangos (HTTP 206), permitiendo que los usuarios salten a cualquier minuto sin esperar a descargar los 200MB.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 size={14} />
                <span>Listo para usar en el Panel de Administrador</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Cloud size={18} className="text-amber-400" />
                <span>2. Almacenamiento Cloud para 100GB+</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Para albergar más de 500 videos sin saturar el servidor local, el panel te permite ingresar URLs directas de almacenamiento masivo en la nube:
              </p>
              <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                <li>Google Cloud Storage / AWS S3 / Wasabi</li>
                <li>Bunny Stream / Cloudflare R2</li>
                <li>Backblaze B2 o Enlaces directos CDN</li>
              </ul>
            </div>
          </div>

          {/* Quick tips */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Zap size={16} />
              <span>Consejo de Optimización para 200 MB</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              Un video en resolución 1080p con codec H.264 o H.265 (HEVC) codificado a una tasa de bits de 2.5 a 3.5 Mbps ofrece calidad cinematográfica con un peso de tan solo 150 a 220 MB por cada 15-25 minutos de video.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
