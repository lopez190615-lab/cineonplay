/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Category, VideoItem, StorageOverview } from './types';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { VideoCard } from './components/VideoCard';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';
import { StorageGuideModal } from './components/StorageGuideModal';
import { DragonBallIcon } from './components/DragonBallIcon';
import { Play, Sparkles, ChevronRight, HardDrive, Shield, AlertCircle, Plus, Edit3, Trash2 } from 'lucide-react';

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [storageStats, setStorageStats] = useState<StorageOverview | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');

  // Player & Modals
  const [activePlayingVideo, setActivePlayingVideo] = useState<VideoItem | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [isStorageGuideOpen, setIsStorageGuideOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Admin routing inside modal
  const [adminInitialTab, setAdminInitialTab] = useState<
    'videos' | 'upload' | 'categories' | 'reorder' | 'settings' | 'storage'
  >('videos');
  const [adminInitialCategory, setAdminInitialCategory] = useState<string>('');
  const [adminEditingVideo, setAdminEditingVideo] = useState<VideoItem | null>(null);

  // Auth State
  const [token, setToken] = useState<string>(() => localStorage.getItem('admin_token') || '');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminUsername, setAdminUsername] = useState<string>('admin');

  // Load Categories, Videos & Storage Stats
  const fetchData = async () => {
    try {
      const [catRes, vidRes, statRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/videos'),
        fetch('/api/storage/stats')
      ]);

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
      if (vidRes.ok) {
        const vidData = await vidRes.json();
        setVideos(vidData);
      }
      if (statRes.ok) {
        const statData = await statRes.json();
        setStorageStats(statData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Check auth token
  useEffect(() => {
    if (!token) {
      setIsAdmin(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch('/api/auth/check', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.authenticated) {
          setIsAdmin(true);
          if (data.username) setAdminUsername(data.username);
        } else {
          setIsAdmin(false);
          localStorage.removeItem('admin_token');
          setToken('');
        }
      } catch {
        setIsAdmin(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleLoginSuccess = (newToken: string, username: string) => {
    localStorage.setItem('admin_token', newToken);
    setToken(newToken);
    setIsAdmin(true);
    setAdminUsername(username);
    setIsAdminPanelOpen(true);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch {}
    localStorage.removeItem('admin_token');
    setToken('');
    setIsAdmin(false);
    setIsAdminPanelOpen(false);
  };

  // Video count per category
  const videoCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    videos.forEach((v) => {
      counts[v.categoryId] = (counts[v.categoryId] || 0) + 1;
    });
    return counts;
  }, [videos]);

  // Current category object
  const currentCategory = useMemo(() => {
    if (selectedCategoryId === 'all') return null;
    return categories.find((c) => c.id === selectedCategoryId) || null;
  }, [categories, selectedCategoryId]);

  // Filtered & Sorted Videos
  const filteredVideos = useMemo(() => {
    let result = [...videos];

    // Filter by Category
    if (selectedCategoryId !== 'all') {
      result = result.filter((v) => v.categoryId === selectedCategoryId);
    }

    // Filter by Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          (v.description && v.description.toLowerCase().includes(q)) ||
          (v.shortDescription && v.shortDescription.toLowerCase().includes(q)) ||
          (v.tags && v.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Sort
    if (sortBy === 'views') {
      result.sort((a, b) => b.views - a.views);
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result.sort(
        (a, b) =>
          (a.orderIndex || 0) - (b.orderIndex || 0) ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return result;
  }, [videos, selectedCategoryId, searchTerm, sortBy]);

  // Featured video (first featured video, or first video)
  const featuredVideo = useMemo(() => {
    if (videos.length === 0) return null;
    return videos.find((v) => v.featured) || videos[0];
  }, [videos]);

  // Play video handler: increments views on server
  const handlePlayVideo = async (video: VideoItem) => {
    setActivePlayingVideo(video);
    try {
      const res = await fetch(`/api/videos/${video.id}`);
      if (res.ok) {
        const updated = await res.json();
        setVideos((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      }
    } catch {}
  };

  // Open Admin Panel helper with specific target tab
  const handleOpenAdminTab = (tab: 'videos' | 'upload' | 'categories' | 'reorder' | 'settings' | 'storage' = 'videos') => {
    if (isAdmin) {
      setAdminInitialTab(tab);
      setAdminEditingVideo(null);
      setIsAdminPanelOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  // Quick upload to category from category view or sidebar
  const handleQuickUploadToCategory = (categoryId: string) => {
    if (isAdmin) {
      setAdminInitialTab('upload');
      setAdminInitialCategory(categoryId);
      setAdminEditingVideo(null);
      setIsAdminPanelOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  // Quick edit category
  const handleQuickEditCategory = (category: Category) => {
    if (isAdmin) {
      setAdminInitialTab('categories');
      setIsAdminPanelOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  // Quick delete category
  const handleQuickDeleteCategory = async (category: Category) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }

    const count = videos.filter((v) => v.categoryId === category.id).length;
    let deleteVideos = false;

    if (count > 0) {
      const choice = confirm(
        `¿Deseas eliminar la categoría "${category.name}"?\n\n` +
        `Esta categoría contiene ${count} video(s).\n\n` +
        `• Pulsa ACEPTAR si deseas eliminar también TODOS sus ${count} videos.\n` +
        `• Pulsa CANCELAR si deseas conservar los videos (se reasignarán a otra categoría).`
      );
      if (choice) {
        deleteVideos = true;
      } else {
        const confirmReassign = confirm(`¿Confirmas eliminar la categoría "${category.name}" y conservar los videos en otra categoría?`);
        if (!confirmReassign) return;
        deleteVideos = false;
      }
    } else {
      if (!confirm(`¿Eliminar la categoría "${category.name}"?`)) return;
    }

    try {
      const res = await fetch(`/api/categories/${category.id}?deleteVideos=${deleteVideos ? 'true' : 'false'}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Error al eliminar categoría');
      if (selectedCategoryId === category.id) {
        setSelectedCategoryId('all');
      }
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar categoría');
    }
  };

  // Direct video edit from Card or Player
  const handleEditVideo = (video: VideoItem) => {
    if (isAdmin) {
      setAdminInitialTab('upload');
      setAdminEditingVideo(video);
      setIsAdminPanelOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  // Direct video delete from Card or Player
  const handleDeleteVideo = async (video: VideoItem) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente el video:\n\n"${video.title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/videos/${video.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al eliminar video');
      }

      if (activePlayingVideo?.id === video.id) {
        setActivePlayingVideo(null);
      }

      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el video');
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex font-['Outfit'] antialiased selection:bg-amber-500 selection:text-black">
      {/* Sidebar - Matching Reference Image */}
      <Sidebar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        videoCounts={videoCounts}
        totalVideosCount={videos.length}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenAdmin={handleOpenAdminTab}
        isAdmin={isAdmin}
        onOpenStorageGuide={() => setIsStorageGuideOpen(true)}
        onQuickUploadToCategory={handleQuickUploadToCategory}
        onQuickEditCategory={handleQuickEditCategory}
        onQuickDeleteCategory={handleQuickDeleteCategory}
      />

      {/* Main Content Area (Offset by sidebar width on large screens) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-80">
        {/* Top Navbar */}
        <Navbar
          currentCategory={currentCategory}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onOpenAdmin={handleOpenAdminTab}
          isAdmin={isAdmin}
          totalResults={filteredVideos.length}
        />

        {/* Content Container */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Quick Mobile Category Pills */}
          <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                selectedCategoryId === 'all'
                  ? 'bg-amber-500 text-black border-amber-500 font-bold'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800'
              }`}
            >
              Todos ({videos.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategoryId(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 border ${
                  selectedCategoryId === c.id
                    ? 'bg-amber-500 text-black border-amber-500 font-bold'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                }`}
              >
                <DragonBallIcon type={c.icon || c.id} size={16} />
                <span>{c.name}</span>
              </button>
            ))}
          </div>

          {/* Featured Spotlight Banner (Shown when viewing "All" and no active search) */}
          {selectedCategoryId === 'all' && !searchTerm && featuredVideo && (
            <section
              id="hero-featured-video"
              className="relative rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-950 shadow-2xl group"
            >
              {/* Background Image with Gradient Mask */}
              <div className="absolute inset-0 z-0">
                <img
                  src={featuredVideo.thumbnailUrl}
                  alt={featuredVideo.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center opacity-40 group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#070709] via-[#070709]/80 to-transparent" />
              </div>

              {/* Content Overlay */}
              <div className="relative z-10 p-6 sm:p-8 lg:p-12 max-w-3xl flex flex-col justify-end min-h-[340px] sm:min-h-[420px]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-extrabold tracking-wide uppercase flex items-center gap-1 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                    <Sparkles size={12} />
                    Destacado en Cineon Play
                  </span>
                  {categories.find((c) => c.id === featuredVideo.categoryId) && (
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-amber-400 text-xs font-semibold">
                      {categories.find((c) => c.id === featuredVideo.categoryId)?.name}
                    </span>
                  )}
                  {featuredVideo.duration && (
                    <span className="text-zinc-400 text-xs font-mono">
                      {featuredVideo.duration}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-wide font-['Outfit'] mb-3 leading-tight drop-shadow-md">
                  {featuredVideo.title}
                </h2>

                <p className="text-zinc-300 text-sm sm:text-base line-clamp-3 mb-6 max-w-2xl leading-relaxed">
                  {featuredVideo.description || featuredVideo.shortDescription}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    id="hero-play-btn"
                    onClick={() => handlePlayVideo(featuredVideo)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold text-sm tracking-wide transition-all shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:shadow-[0_0_35px_rgba(245,158,11,0.7)] flex items-center gap-2.5 cursor-pointer hover:scale-105"
                  >
                    <Play size={18} className="fill-black" />
                    <span>Reproducir Ahora</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => handleEditVideo(featuredVideo)}
                      className="px-4 py-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-amber-400 font-bold text-xs border border-zinc-700 flex items-center gap-1.5 transition-colors"
                    >
                      <Edit3 size={14} />
                      <span>Editar Destacado</span>
                    </button>
                  )}

                  <div className="text-xs text-zinc-400 font-mono px-3 py-2 rounded-lg bg-black/40 backdrop-blur-sm border border-zinc-800">
                    {featuredVideo.views.toLocaleString()} visualizaciones
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* VIEW MODE 1: Single Category Active or Active Search */}
          {(selectedCategoryId !== 'all' || searchTerm) && (
            <section className="space-y-4">
              {/* Category Info Header Banner with Direct Admin Controls */}
              {currentCategory && !searchTerm && (
                <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <DragonBallIcon
                      type={currentCategory.icon || currentCategory.id}
                      size={54}
                      glowing={true}
                    />
                    <div>
                      <h2 className="text-2xl font-bold text-white font-['Outfit'] flex items-center gap-3">
                        {currentCategory.name}
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-normal">
                          {filteredVideos.length} disponibles
                        </span>
                      </h2>
                      {currentCategory.description && (
                        <p className="text-sm text-zinc-400 mt-1">
                          {currentCategory.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Direct Admin Controls right on the category section */}
                  {isAdmin ? (
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                      <button
                        onClick={() => handleQuickUploadToCategory(currentCategory.id)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs font-black shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Subir un nuevo video directamente a esta categoría"
                      >
                        <Plus size={15} className="stroke-[3]" />
                        <span>Subir Video Aquí</span>
                      </button>

                      <button
                        onClick={() => handleQuickEditCategory(currentCategory)}
                        className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-700 transition-colors"
                        title="Editar nombre, icono o descripción de esta categoría"
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        onClick={() => handleQuickDeleteCategory(currentCategory)}
                        className="p-2.5 rounded-xl bg-zinc-800 hover:bg-red-600 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-700 hover:border-red-500 transition-colors"
                        title="Eliminar esta categoría"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleQuickUploadToCategory(currentCategory.id)}
                      className="self-start sm:self-center px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-semibold border border-zinc-700 transition-colors flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Subir video a {currentCategory.name}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Search active notification */}
              {searchTerm && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                  <p className="text-sm text-zinc-300">
                    Resultados para "<strong className="text-amber-400">{searchTerm}</strong>":{' '}
                    <span className="font-mono text-white">{filteredVideos.length}</span> videos encontrados
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-xs text-amber-400 hover:underline cursor-pointer"
                  >
                    Borrar filtro
                  </button>
                </div>
              )}

              {/* Video Cards Grid */}
              {filteredVideos.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 space-y-3">
                  <AlertCircle size={36} className="mx-auto text-zinc-500" />
                  <h3 className="text-lg font-bold text-white">No hay videos en esta sección</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    {isAdmin
                      ? `Puedes subir un nuevo video a la categoría "${currentCategory?.name || 'esta sección'}" de forma inmediata.`
                      : 'Aún no se han añadido videos a esta categoría. ¡Vuelve pronto!'}
                  </p>
                  <button
                    onClick={() => handleQuickUploadToCategory(currentCategory?.id || 'all')}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors cursor-pointer"
                  >
                    + Subir Video Ahora
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredVideos.map((video) => {
                    const cat = categories.find((c) => c.id === video.categoryId);
                    return (
                      <VideoCard
                        key={video.id}
                        video={video}
                        category={cat}
                        onPlay={handlePlayVideo}
                        isAdmin={isAdmin}
                        onEdit={handleEditVideo}
                        onDelete={handleDeleteVideo}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* VIEW MODE 2: Multi-Category Sections (When "All" is active and no search) */}
          {selectedCategoryId === 'all' && !searchTerm && (
            <div className="space-y-12">
              {categories.map((cat) => {
                const catVideos = videos.filter((v) => v.categoryId === cat.id);
                if (catVideos.length === 0) return null;

                return (
                  <section key={cat.id} id={`section-${cat.id}`} className="space-y-4">
                    {/* Section Header with Dragon Ball Icon, "Ver más", and Quick Admin Actions */}
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                      <button
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className="flex items-center gap-3 text-left group cursor-pointer"
                      >
                        <DragonBallIcon type={cat.icon || cat.id} size={32} glowing={true} />
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
                            {cat.name}
                            <ChevronRight size={18} className="text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                          </h3>
                          {cat.description && (
                            <p className="text-xs text-zinc-400 line-clamp-1">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </button>

                      <div className="flex items-center gap-3">
                        {isAdmin && (
                          <button
                            onClick={() => handleQuickUploadToCategory(cat.id)}
                            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black text-xs font-bold border border-amber-500/30 transition-all cursor-pointer"
                            title={`Subir video a ${cat.name}`}
                          >
                            <Plus size={13} />
                            <span>Subir a {cat.name}</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedCategoryId(cat.id)}
                          className="text-xs font-semibold text-zinc-400 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Ver todos ({catVideos.length})</span>
                        </button>
                      </div>
                    </div>

                    {/* Section Videos Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {catVideos.slice(0, 4).map((video) => (
                        <VideoCard
                          key={video.id}
                          video={video}
                          category={cat}
                          onPlay={handlePlayVideo}
                          isAdmin={isAdmin}
                          onEdit={handleEditVideo}
                          onDelete={handleDeleteVideo}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </main>

        {/* Global Footer: Cineon Play */}
        <footer className="mt-12 border-t border-zinc-800/80 bg-[#050507] p-6 lg:px-8 text-xs text-zinc-400">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <DragonBallIcon type="ball-4" size={26} glowing={true} />
              <div>
                <p className="text-white font-black tracking-wide text-sm">
                  CINEON <span className="text-amber-500">PLAY</span>
                </p>
                <p className="text-[11px] text-zinc-400">
                  Tu plataforma oficial de videos, sagas y entretenimiento por secciones
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <button
                onClick={() => setIsStorageGuideOpen(true)}
                className="hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <HardDrive size={14} className="text-amber-500" />
                <span>Capacidad 500+ Videos ({storageStats?.totalStorageMB || 0} MB)</span>
              </button>

              <button
                onClick={() => handleOpenAdminTab('videos')}
                className="hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Shield size={14} className={isAdmin ? 'text-amber-400' : 'text-zinc-400'} />
                <span>{isAdmin ? 'Panel de Administrador (Conectado)' : 'Acceso Administrador'}</span>
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Video Player Modal with Edit and Delete capabilities */}
      {activePlayingVideo && (
        <VideoPlayerModal
          video={activePlayingVideo}
          category={categories.find((c) => c.id === activePlayingVideo.categoryId)}
          relatedVideos={videos.filter((v) => v.categoryId === activePlayingVideo.categoryId)}
          onClose={() => setActivePlayingVideo(null)}
          onSelectVideo={handlePlayVideo}
          isAdmin={isAdmin}
          onEditVideo={handleEditVideo}
          onDeleteVideo={handleDeleteVideo}
        />
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Admin Panel Full Management View */}
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => {
          setIsAdminPanelOpen(false);
          setAdminEditingVideo(null);
        }}
        token={token}
        adminUsername={adminUsername}
        onUpdateAdminUsername={setAdminUsername}
        categories={categories}
        videos={videos}
        storageStats={storageStats}
        onRefreshData={fetchData}
        onLogout={handleLogout}
        onPreviewVideo={handlePlayVideo}
        initialTab={adminInitialTab}
        initialCategoryId={adminInitialCategory}
        editingVideo={adminEditingVideo}
      />

      {/* Storage Guide Modal (500+ videos / 100 GB) */}
      <StorageGuideModal
        isOpen={isStorageGuideOpen}
        onClose={() => setIsStorageGuideOpen(false)}
        storageStats={storageStats}
      />
    </div>
  );
}
