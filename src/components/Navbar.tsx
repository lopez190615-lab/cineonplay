import React from 'react';
import { Menu, Search, X, Shield, SlidersHorizontal, Plus } from 'lucide-react';
import { Category } from '../types';
import { DragonBallIcon } from './DragonBallIcon';

interface NavbarProps {
  currentCategory: Category | null;
  onOpenMobileMenu: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onOpenAdmin: (tab?: 'videos' | 'upload' | 'categories') => void;
  isAdmin: boolean;
  totalResults: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCategory,
  onOpenMobileMenu,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  onOpenAdmin,
  isAdmin,
  totalResults
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#070709]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Mobile hamburger & Section header */}
        <div className="flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-3">
            <button
              id="mobile-menu-trigger"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800 transition-colors"
              aria-label="Abrir categorías"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2.5">
              {currentCategory ? (
                <>
                  <DragonBallIcon
                    type={currentCategory.icon || currentCategory.id}
                    size={30}
                    glowing={true}
                  />
                  <div>
                    <h1 className="text-lg md:text-xl font-bold text-white tracking-wide flex items-center gap-2 font-['Outfit']">
                      {currentCategory.name}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-normal">
                        {totalResults} videos
                      </span>
                    </h1>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                    <span className="text-amber-400 text-xs font-bold font-mono">★</span>
                  </div>
                  <div>
                    <h1 className="text-lg md:text-xl font-bold text-white tracking-wide flex items-center gap-2 font-['Outfit']">
                      Cineon Play
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-normal">
                        {totalResults} disponibles
                      </span>
                    </h1>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Admin Icon Button on Mobile */}
          <div className="flex md:hidden items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => onOpenAdmin('upload')}
                className="p-2 rounded-lg bg-amber-500 text-black text-xs font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                title="Subir video"
              >
                <Plus size={16} />
              </button>
            )}
            <button
              id="mobile-admin-btn"
              onClick={() => onOpenAdmin()}
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${
                isAdmin
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
              title="Panel de Administrador"
            >
              <Shield size={16} />
              {isAdmin ? 'Admin' : 'Acceso'}
            </button>
          </div>
        </div>

        {/* Right: Search bar, Sort & Admin Controls */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-64 lg:w-72">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            />
            <input
              id="video-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar videos en Cineon Play..."
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-9 pr-8 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
            {searchTerm && (
              <button
                id="clear-search-btn"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5"
                title="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="relative shrink-0">
            <div className="flex items-center bg-zinc-900/90 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300">
              <SlidersHorizontal size={14} className="mr-1.5 text-amber-400" />
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer pr-1"
              >
                <option value="default" className="bg-zinc-900 text-white">Orden oficial</option>
                <option value="views" className="bg-zinc-900 text-white">Más vistos</option>
                <option value="title" className="bg-zinc-900 text-white">Título (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Admin Quick Upload Button */}
          {isAdmin && (
            <button
              onClick={() => onOpenAdmin('upload')}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs font-extrabold shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all cursor-pointer shrink-0"
              title="Subir nuevo video"
            >
              <Plus size={15} className="stroke-[3]" />
              <span>Subir Video</span>
            </button>
          )}

          {/* Desktop Admin Button */}
          <button
            id="desktop-admin-header-btn"
            onClick={() => onOpenAdmin()}
            className={`hidden md:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide border transition-all shrink-0 ${
              isAdmin
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/40 hover:bg-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Shield size={14} className={isAdmin ? 'text-amber-400' : 'text-zinc-400'} />
            <span>{isAdmin ? 'Panel Admin' : 'Admin'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
