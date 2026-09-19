import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Play,
  Eye,
  Calendar,
  HardDrive,
  Maximize2,
  Minimize2,
  ChevronRight,
  Share2,
  Check,
  Edit3,
  Trash2
} from 'lucide-react';
import { VideoItem, Category } from '../types';
import { DragonBallIcon } from './DragonBallIcon';

interface VideoPlayerModalProps {
  video: VideoItem;
  category?: Category;
  relatedVideos: VideoItem[];
  onClose: () => void;
  onSelectVideo: (video: VideoItem) => void;
  isAdmin?: boolean;
  onEditVideo?: (video: VideoItem) => void;
  onDeleteVideo?: (video: VideoItem) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  category,
  relatedVideos,
  onClose,
  onSelectVideo,
  isAdmin,
  onEditVideo,
  onDeleteVideo
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isTheater, setIsTheater] = useState(false);
  const [copied, setCopied] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Check if video is YouTube
  const isYouTube =
    video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be');

  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1]?.split('&')[0] || '';
    } else if (url.includes('embed/')) {
      return url;
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return null;
    const mb = bytes / (1024 * 1024);
    if (mb >= 1000) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${Math.round(mb)} MB`;
  };

  return (
    <div
      id="video-player-overlay"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-start overflow-y-auto p-3 sm:p-6"
    >
      <div
        className={`w-full mx-auto transition-all duration-300 ${
          isTheater ? 'max-w-full px-2' : 'max-w-6xl'
        }`}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between gap-4 pb-4 mb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5 min-w-0">
            {category && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 shrink-0">
                <DragonBallIcon type={category.icon || category.id} size={18} />
                <span className="text-xs font-semibold text-amber-400">
                  {category.name}
                </span>
              </div>
            )}
            <h2 className="text-sm sm:text-base font-bold text-white truncate">
              {video.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Admin actions */}
            {isAdmin && (
              <>
                {onEditVideo && (
                  <button
                    onClick={() => {
                      onEditVideo(video);
                      onClose();
                    }}
                    className="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500 hover:text-black text-amber-400 border border-amber-500/40 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                    title="Editar información de este video"
                  >
                    <Edit3 size={15} />
                    <span className="hidden sm:inline">Editar</span>
                  </button>
                )}
                {onDeleteVideo && (
                  <button
                    onClick={() => {
                      onDeleteVideo(video);
                      onClose();
                    }}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                    title="Eliminar este video permanentemente"
                  >
                    <Trash2 size={15} />
                    <span className="hidden sm:inline">Eliminar</span>
                  </button>
                )}
              </>
            )}

            {/* Theater Mode Toggle */}
            <button
              id="theater-mode-btn"
              onClick={() => setIsTheater(!isTheater)}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors hidden sm:inline-flex items-center gap-1.5 text-xs"
              title={isTheater ? 'Modo Normal' : 'Modo Teatro'}
            >
              {isTheater ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              <span className="hidden md:inline">
                {isTheater ? 'Normal' : 'Teatro'}
              </span>
            </button>

            {/* Share / Copy link */}
            <button
              id="share-video-btn"
              onClick={handleShare}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors flex items-center gap-1.5 text-xs"
              title="Copiar enlace"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-emerald-400" />
                  <span className="text-emerald-400 hidden sm:inline">Copiado</span>
                </>
              ) : (
                <>
                  <Share2 size={16} />
                  <span className="hidden sm:inline">Compartir</span>
                </>
              )}
            </button>

            {/* Close Modal Button */}
            <button
              id="close-player-btn"
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-red-600 text-white transition-colors"
              aria-label="Cerrar reproductor"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Video Player Box */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-[0_12px_40px_rgba(0,0,0,0.8)] border border-zinc-800">
          {isYouTube ? (
            <iframe
              src={getYouTubeEmbedUrl(video.videoUrl)}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              ref={videoRef}
              key={video.id + video.videoUrl}
              src={video.videoUrl}
              poster={video.thumbnailUrl}
              controls
              autoPlay
              playsInline
              preload="metadata"
              className="w-full h-full object-contain bg-black"
            >
              Tu navegador no soporta el elemento de video.
            </video>
          )}
        </div>

        {/* Video Info Section & Related Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Info (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide font-['Outfit'] mb-2">
                {video.title}
              </h1>

              {/* Meta Stats Bar */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 pb-3 border-b border-zinc-800/80">
                <span className="flex items-center gap-1.5">
                  <Eye size={14} className="text-amber-400" />
                  <strong className="text-zinc-200">
                    {video.views.toLocaleString()}
                  </strong>{' '}
                  reproducciones
                </span>

                <span>•</span>

                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {new Date(video.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>

                {video.fileSizeBytes && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-zinc-300 font-mono">
                      <HardDrive size={13} className="text-amber-400" />
                      {formatSize(video.fileSizeBytes)} (Streaming Optimizado)
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description Box */}
            <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800/80 text-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Descripción
              </h4>
              <p
                className={`text-zinc-300 leading-relaxed whitespace-pre-line ${
                  !descExpanded && video.description.length > 250
                    ? 'line-clamp-3'
                    : ''
                }`}
              >
                {video.description || video.shortDescription || 'Sin descripción disponible.'}
              </p>

              {video.description && video.description.length > 250 && (
                <button
                  onClick={() => setDescExpanded(!descExpanded)}
                  className="mt-2 text-xs font-semibold text-amber-400 hover:underline cursor-pointer"
                >
                  {descExpanded ? 'Mostrar menos' : 'Leer descripción completa...'}
                </button>
              )}

              {/* Tags */}
              {video.tags && video.tags.length > 0 && (
                <div className="mt-4 pt-3 border-t border-zinc-800 flex flex-wrap gap-1.5">
                  {video.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Related Playlist Column (Right col) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="flex items-center gap-2">
                <DragonBallIcon type={category?.icon || 'ball-4'} size={18} />
                Más en {category ? category.name : 'Cineon Play'}
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                {relatedVideos.length} videos
              </span>
            </h3>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
              {relatedVideos.map((rv) => {
                const isCurrent = rv.id === video.id;
                return (
                  <div
                    key={rv.id}
                    onClick={() => onSelectVideo(rv)}
                    className={`flex items-start gap-3 p-2 rounded-xl transition-all cursor-pointer border ${
                      isCurrent
                        ? 'bg-amber-500/10 border-amber-500/40'
                        : 'bg-zinc-900/50 hover:bg-zinc-800/80 border-transparent'
                    }`}
                  >
                    {/* Tiny Thumbnail */}
                    <div className="relative w-24 sm:w-28 aspect-video rounded-lg overflow-hidden shrink-0 bg-black">
                      <img
                        src={rv.thumbnailUrl}
                        alt={rv.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {isCurrent ? (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Play size={16} className="text-amber-400 fill-amber-400 animate-pulse" />
                        </div>
                      ) : (
                        rv.duration && (
                          <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[10px] font-mono text-zinc-300">
                            {rv.duration}
                          </span>
                        )
                      )}
                    </div>

                    {/* Meta */}
                    <div className="min-w-0 flex-1">
                      <h4
                        className={`text-xs font-semibold line-clamp-2 leading-snug ${
                          isCurrent ? 'text-amber-400' : 'text-zinc-200 hover:text-white'
                        }`}
                      >
                        {rv.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1.5">
                        <Eye size={10} />
                        <span>{rv.views.toLocaleString()}</span>
                      </p>
                    </div>

                    <ChevronRight size={14} className="text-zinc-600 shrink-0 self-center" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
