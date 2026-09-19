import React from 'react';
import { Play, Eye, HardDrive, Edit3, Trash2 } from 'lucide-react';
import { VideoItem, Category } from '../types';
import { DragonBallIcon } from './DragonBallIcon';

interface VideoCardProps {
  video: VideoItem;
  category?: Category;
  onPlay: (video: VideoItem) => void;
  onEdit?: (video: VideoItem) => void;
  onDelete?: (video: VideoItem) => void;
  isAdmin?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  category,
  onPlay,
  onEdit,
  onDelete,
  isAdmin
}) => {
  // Format file size nicely
  const formatSize = (bytes?: number) => {
    if (!bytes) return null;
    const mb = bytes / (1024 * 1024);
    if (mb >= 1000) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${Math.round(mb)} MB`;
  };

  return (
    <article
      id={`video-card-${video.id}`}
      className="group bg-[#0f0f13] rounded-xl overflow-hidden border border-zinc-800/80 hover:border-amber-500/50 transition-all duration-300 flex flex-col hover:shadow-[0_8px_24px_rgba(0,0,0,0.6)] hover:-translate-y-1"
    >
      {/* Thumbnail Container */}
      <div
        className="relative aspect-video w-full overflow-hidden bg-zinc-950 cursor-pointer"
        onClick={() => onPlay(video)}
      >
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop';
          }}
        />

        {/* Dark gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Center Glowing Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 text-black flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.7)] group-hover:scale-115 transition-transform duration-300">
            <Play size={22} className="fill-black text-black ml-0.5" />
          </div>
        </div>

        {/* Duration badge */}
        {video.duration && (
          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/85 backdrop-blur-md text-[11px] font-mono text-zinc-200 border border-white/10">
            {video.duration}
          </span>
        )}

        {/* Category tag badge on top left */}
        {category && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/85 backdrop-blur-md border border-zinc-700/60 shadow">
            <DragonBallIcon type={category.icon || category.id} size={16} />
            <span className="text-[11px] font-semibold text-amber-400 tracking-wide">
              {category.name}
            </span>
          </div>
        )}

        {/* Storage Size Tag */}
        {video.fileSizeBytes && (
          <span className="absolute top-2.5 right-2.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900/90 text-[10px] font-mono text-zinc-300 border border-zinc-700/50">
            <HardDrive size={10} className="text-amber-400" />
            {formatSize(video.fileSizeBytes)}
          </span>
        )}
      </div>

      {/* Details Container */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3
            onClick={() => onPlay(video)}
            className="font-bold text-white text-base line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors cursor-pointer mb-2 font-['Outfit']"
            title={video.title}
          >
            {video.title}
          </h3>

          {/* Optional Short Description */}
          <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed mb-3">
            {video.shortDescription || video.description}
          </p>
        </div>

        {/* Card Footer: Play Action Button & Meta */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between mt-auto">
          {/* Views and metadata */}
          <div className="flex items-center gap-2 text-zinc-400 text-xs">
            <span className="flex items-center gap-1">
              <Eye size={13} className="text-zinc-400" />
              {video.views.toLocaleString()}
            </span>
            <span>•</span>
            <span className="text-[11px] text-zinc-400">
              {new Date(video.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {isAdmin && (
              <>
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(video);
                    }}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 hover:text-amber-300 transition-colors border border-zinc-700"
                    title="Editar información del video"
                  >
                    <Edit3 size={14} />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(video);
                    }}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-600/90 text-zinc-400 hover:text-white transition-colors border border-zinc-700 hover:border-red-500"
                    title="Eliminar este video"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </>
            )}

            {/* Explicit Reproducir Button */}
            <button
              id={`play-btn-${video.id}`}
              onClick={() => onPlay(video)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-black font-semibold text-xs transition-all border border-amber-500/40 hover:border-amber-400 hover:shadow-[0_0_12px_rgba(245,158,11,0.5)] cursor-pointer"
            >
              <Play size={12} className="fill-current" />
              <span>Reproducir</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
