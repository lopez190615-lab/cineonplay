import React from 'react';
import { Category } from '../types';
import { DragonBallIcon } from './DragonBallIcon';
import { Sparkles, Shield, X, HardDrive, Info, Plus, Edit3, Trash2 } from 'lucide-react';

interface SidebarProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  videoCounts: Record<string, number>;
  totalVideosCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenAdmin: (tab?: 'videos' | 'upload' | 'categories') => void;
  isAdmin: boolean;
  onOpenStorageGuide: () => void;
  onQuickUploadToCategory?: (categoryId: string) => void;
  onQuickEditCategory?: (category: Category) => void;
  onQuickDeleteCategory?: (category: Category) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  videoCounts,
  totalVideosCount,
  isOpenMobile,
  onCloseMobile,
  onOpenAdmin,
  isAdmin,
  onOpenStorageGuide,
  onQuickUploadToCategory,
  onQuickEditCategory,
  onQuickDeleteCategory
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          id="sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        id="main-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 lg:w-80 bg-[#070709] border-r border-zinc-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Orange Border Header - Exactly matching user reference image */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.6)] shrink-0" />

        {/* Brand Header: CINEON PLAY */}
        <div className="p-4 flex items-center justify-between border-b border-zinc-900 shrink-0 bg-gradient-to-b from-zinc-900/60 to-transparent">
          <button
            id="brand-home-btn"
            onClick={() => {
              onSelectCategory('all');
              onCloseMobile();
            }}
            className="flex items-center gap-3 text-left group"
          >
            <DragonBallIcon type="ball-4" size={38} glowing={true} />
            <div>
              <span className="font-black text-xl tracking-wider text-white flex items-center gap-1.5 font-['Outfit'] group-hover:text-amber-400 transition-colors">
                CINEON <span className="text-amber-500">PLAY</span>
              </span>
              <p className="text-[11px] text-zinc-400 font-medium tracking-wide">
                Tu plataforma de videos
              </p>
            </div>
          </button>

          {/* Close button on mobile */}
          <button
            id="close-sidebar-btn"
            onClick={onCloseMobile}
            className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/60 transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Admin Actions Bar in Sidebar */}
        {isAdmin && (
          <div className="px-3 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
              <Shield size={12} />
              Modo Administrador
            </span>
            <button
              onClick={() => onOpenAdmin('categories')}
              className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-semibold flex items-center gap-1 transition-colors"
              title="Crear nueva sección o categoría"
            >
              <Plus size={12} />
              <span>+ Categoría</span>
            </button>
          </div>
        )}

        {/* Categories Navigation List - Exactly matching user reference image */}
        <div className="flex-1 overflow-y-auto py-2 px-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          {/* Option: Ver Todo / Inicio */}
          <div className="group flex items-center justify-between border-b border-zinc-900/80">
            <button
              id="cat-item-all"
              onClick={() => {
                onSelectCategory('all');
                onCloseMobile();
              }}
              className={`flex-1 flex items-center justify-between px-4 py-3 text-left transition-all ${
                selectedCategoryId === 'all'
                  ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent text-amber-400 font-bold border-l-4 border-l-amber-500'
                  : 'text-zinc-200 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-700/60 group-hover:border-amber-500/50 shadow-inner">
                  <Sparkles
                    size={18}
                    className={selectedCategoryId === 'all' ? 'text-amber-400' : 'text-zinc-400 group-hover:text-amber-400'}
                  />
                </div>
                <span className="text-[15px] font-medium tracking-wide">
                  Todas las Secciones
                </span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-900/90 text-zinc-400 border border-zinc-800 font-mono">
                {totalVideosCount}
              </span>
            </button>
          </div>

          {/* Categories List matching image.png */}
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const count = videoCounts[cat.id] || 0;

            return (
              <div
                key={cat.id}
                className={`flex items-center justify-between border-b border-zinc-900/90 group transition-all duration-150 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent text-[#ff8000] font-bold border-l-4 border-l-[#ff8000]'
                    : 'text-zinc-100 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                {/* Main Category Click to Browse */}
                <button
                  id={`cat-item-${cat.id}`}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    onCloseMobile();
                  }}
                  className="flex-1 flex items-center justify-between px-4 py-3.5 text-left min-w-0"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <DragonBallIcon
                      type={cat.icon || cat.id}
                      size={36}
                      glowing={isSelected}
                    />
                    <div className="truncate">
                      <span
                        className={`text-[15px] block truncate transition-colors ${
                          isSelected
                            ? 'text-[#ff8000] font-semibold drop-shadow-[0_0_10px_rgba(255,128,0,0.3)]'
                            : 'text-zinc-200 group-hover:text-white font-medium'
                        }`}
                      >
                        {cat.name}
                      </span>
                      {cat.description && (
                        <span className="text-[11px] text-zinc-400 truncate block opacity-80 group-hover:opacity-100">
                          {cat.description}
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-mono ml-2 border ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-zinc-900/80 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    {count}
                  </span>
                </button>

                {/* Quick Admin Actions directly inside Sidebar */}
                {isAdmin && (
                  <div className="pr-2 hidden group-hover:flex items-center gap-1 shrink-0">
                    {onQuickUploadToCategory && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickUploadToCategory(cat.id);
                        }}
                        className="p-1 rounded bg-amber-500/20 hover:bg-amber-500 hover:text-black text-amber-400 transition-colors"
                        title={`Subir video a ${cat.name}`}
                      >
                        <Plus size={13} />
                      </button>
                    )}
                    {onQuickEditCategory && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickEditCategory(cat);
                        }}
                        className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                        title={`Editar ${cat.name}`}
                      >
                        <Edit3 size={13} />
                      </button>
                    )}
                    {onQuickDeleteCategory && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickDeleteCategory(cat);
                        }}
                        className="p-1 rounded bg-zinc-800 hover:bg-red-600 text-zinc-300 hover:text-white transition-colors"
                        title={`Eliminar ${cat.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Area: Storage info & Admin Access */}
        <div className="p-3 border-t border-zinc-900 bg-[#050507] shrink-0 space-y-2">
          {/* Storage capacity banner for 500+ videos */}
          <button
            id="storage-guide-btn"
            onClick={onOpenStorageGuide}
            className="w-full flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800/80 hover:border-amber-500/40 text-left transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <HardDrive size={16} className="text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-xs font-semibold text-zinc-300 group-hover:text-amber-400 transition-colors">
                  Capacidad Cineon Play
                </p>
                <p className="text-[10px] text-zinc-400">
                  Soporte 500+ videos (100GB+)
                </p>
              </div>
            </div>
            <Info size={14} className="text-zinc-400 group-hover:text-amber-400" />
          </button>

          {/* Admin Panel button */}
          <button
            id="sidebar-admin-btn"
            onClick={() => onOpenAdmin()}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold tracking-wide transition-all border ${
              isAdmin
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/40 hover:bg-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white hover:bg-zinc-800/80 hover:border-zinc-700'
            }`}
          >
            <Shield size={14} className={isAdmin ? 'text-amber-400' : 'text-zinc-400'} />
            <span>{isAdmin ? 'Panel de Administrador (Activo)' : 'Acceso Administrador'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
