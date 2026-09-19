import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Upload,
  Film,
  FolderPlus,
  ArrowUpDown,
  Settings,
  HardDrive,
  LogOut,
  Save,
  Check,
  AlertTriangle,
  FileVideo,
  Image as ImageIcon,
  Link,
  ChevronUp,
  ChevronDown,
  Play,
  Loader2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Category, VideoItem, StorageOverview } from '../types';
import { DragonBallIcon } from './DragonBallIcon';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  adminUsername: string;
  onUpdateAdminUsername: (name: string) => void;
  categories: Category[];
  videos: VideoItem[];
  storageStats: StorageOverview | null;
  onRefreshData: () => Promise<void>;
  onLogout: () => void;
  onPreviewVideo: (video: VideoItem) => void;
  initialTab?: 'videos' | 'upload' | 'categories' | 'reorder' | 'settings' | 'storage';
  initialCategoryId?: string;
  editingVideo?: VideoItem | null;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  token,
  adminUsername,
  onUpdateAdminUsername,
  categories,
  videos,
  storageStats,
  onRefreshData,
  onLogout,
  onPreviewVideo,
  initialTab,
  initialCategoryId,
  editingVideo
}) => {
  const [activeTab, setActiveTab] = useState<
    'videos' | 'upload' | 'categories' | 'reorder' | 'settings' | 'storage'
  >(initialTab || 'videos');

  // Video Form State (for both create & edit)
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoCategory, setVideoCategory] = useState(initialCategoryId || categories[0]?.id || 'sagas');
  const [videoShortDesc, setVideoShortDesc] = useState('');
  const [videoFullDesc, setVideoFullDesc] = useState('');
  const [videoSourceType, setVideoSourceType] = useState<'upload' | 'external'>('upload');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [thumbnailType, setThumbnailType] = useState<'upload' | 'url'>('url');
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbUrlInput, setThumbUrlInput] = useState('');
  const [videoDuration, setVideoDuration] = useState('20:00');
  const [videoSizeMB, setVideoSizeMB] = useState(200);
  const [videoTagsInput, setVideoTagsInput] = useState('');
  const [videoFeatured, setVideoFeatured] = useState(false);

  // Upload Progress & Action states
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Category Form State
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIcon, setCatIcon] = useState('ball-1');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // Reorder State
  const [reorderCategoryId, setReorderCategoryId] = useState<string>('all');

  // Security Settings State
  const [newUsernameInput, setNewUsernameInput] = useState(adminUsername);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter & Search in Admin Videos list
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState('all');

  // Synchronize when initial props change
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  React.useEffect(() => {
    if (initialCategoryId) {
      setVideoCategory(initialCategoryId);
    }
  }, [initialCategoryId]);

  React.useEffect(() => {
    if (editingVideo) {
      setEditingVideoId(editingVideo.id);
      setVideoTitle(editingVideo.title);
      setVideoCategory(editingVideo.categoryId);
      setVideoShortDesc(editingVideo.shortDescription || '');
      setVideoFullDesc(editingVideo.description || '');
      setVideoUrlInput(editingVideo.videoUrl);
      setVideoSourceType(editingVideo.videoUrl.startsWith('/uploads/videos/') ? 'upload' : 'external');
      setThumbUrlInput(editingVideo.thumbnailUrl);
      setThumbnailType('url');
      setVideoDuration(editingVideo.duration || '20:00');
      setVideoSizeMB(Math.round((editingVideo.fileSizeBytes || 209715200) / (1024 * 1024)));
      setVideoTagsInput((editingVideo.tags || []).join(', '));
      setVideoFeatured(Boolean(editingVideo.featured));
      setActiveTab('upload');
      setFormMessage(null);
    }
  }, [editingVideo]);

  if (!isOpen) return null;

  // Reset video form
  const resetVideoForm = () => {
    setEditingVideoId(null);
    setVideoTitle('');
    setVideoCategory(categories[0]?.id || 'sagas');
    setVideoShortDesc('');
    setVideoFullDesc('');
    setVideoSourceType('upload');
    setVideoFile(null);
    setVideoUrlInput('');
    setThumbnailType('url');
    setThumbFile(null);
    setThumbUrlInput('');
    setVideoDuration('20:00');
    setVideoSizeMB(200);
    setVideoTagsInput('');
    setVideoFeatured(false);
    setUploadProgress(null);
    setFormMessage(null);
  };

  // Open Edit Video
  const handleStartEditVideo = (video: VideoItem) => {
    setEditingVideoId(video.id);
    setVideoTitle(video.title);
    setVideoCategory(video.categoryId);
    setVideoShortDesc(video.shortDescription || '');
    setVideoFullDesc(video.description || '');
    setVideoUrlInput(video.videoUrl);
    setVideoSourceType(video.videoUrl.startsWith('/uploads/videos/') ? 'upload' : 'external');
    setThumbUrlInput(video.thumbnailUrl);
    setThumbnailType('url');
    setVideoDuration(video.duration || '20:00');
    setVideoSizeMB(Math.round((video.fileSizeBytes || 209715200) / (1024 * 1024)));
    setVideoTagsInput((video.tags || []).join(', '));
    setVideoFeatured(Boolean(video.featured));
    setActiveTab('upload');
    setFormMessage(null);
  };

  // Save or Upload Video
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormMessage(null);

    try {
      let finalVideoUrl = videoUrlInput.trim();
      let finalThumbUrl = thumbUrlInput.trim();
      let calculatedBytes = videoSizeMB * 1024 * 1024;

      // 1. Upload Video File if selected
      if (videoSourceType === 'upload' && videoFile) {
        setUploadProgress(10);
        const formData = new FormData();
        formData.append('video', videoFile);

        const uploadRes = await fetch('/api/upload/video', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(errData.error || 'Error al subir el archivo de video');
        }

        const uploadData = await uploadRes.json();
        finalVideoUrl = uploadData.url;
        calculatedBytes = uploadData.fileSizeBytes || videoFile.size;
        setUploadProgress(60);
      }

      // If no video URL at this point
      if (!finalVideoUrl) {
        throw new Error('Debes subir un archivo de video o proporcionar un enlace de video.');
      }

      // 2. Upload Thumbnail File if selected
      if (thumbnailType === 'upload' && thumbFile) {
        const thumbFormData = new FormData();
        thumbFormData.append('thumbnail', thumbFile);

        const thumbRes = await fetch('/api/upload/thumbnail', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: thumbFormData
        });

        if (!thumbRes.ok) {
          const errData = await thumbRes.json();
          throw new Error(errData.error || 'Error al subir la miniatura');
        }

        const thumbData = await thumbRes.json();
        finalThumbUrl = thumbData.url;
      }

      if (!finalThumbUrl) {
        finalThumbUrl =
          'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop';
      }

      setUploadProgress(85);

      // Parse tags
      const tags = videoTagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      // 3. Send payload to create or edit video
      const payload = {
        title: videoTitle.trim(),
        categoryId: videoCategory,
        shortDescription: videoShortDesc.trim(),
        description: videoFullDesc.trim() || videoShortDesc.trim(),
        videoUrl: finalVideoUrl,
        thumbnailUrl: finalThumbUrl,
        sourceType: finalVideoUrl.startsWith('/uploads/videos/') ? 'upload' : 'external',
        duration: videoDuration || '20:00',
        fileSizeBytes: calculatedBytes,
        tags,
        featured: videoFeatured
      };

      if (editingVideoId) {
        const res = await fetch(`/api/videos/${editingVideoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Error al actualizar video');
        }

        setFormMessage({ type: 'success', text: '¡Video actualizado con éxito!' });
      } else {
        const res = await fetch('/api/videos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Error al crear video');
        }

        setFormMessage({ type: 'success', text: '¡Video guardado y publicado con éxito!' });
      }

      setUploadProgress(100);
      await onRefreshData();

      // Reset form if creating new, or offer to return
      if (!editingVideoId) {
        setTimeout(() => {
          resetVideoForm();
          setActiveTab('videos');
        }, 1200);
      }
    } catch (err: any) {
      setFormMessage({ type: 'error', text: err.message || 'Error al guardar video.' });
    } finally {
      setFormLoading(false);
      setTimeout(() => setUploadProgress(null), 1500);
    }
  };

  // Delete Video
  const handleDeleteVideo = async (videoId: string, videoTitle: string) => {
    if (!confirm(`¿Estás seguro de eliminar el video "${videoTitle}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al eliminar video');
      }

      await onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el video');
    }
  };

  // Reorder Single Video (Move Up / Down)
  const handleMoveVideo = async (videoId: string, direction: 'up' | 'down') => {
    const list = [...videos];
    const currentIndex = list.findIndex((v) => v.id === videoId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    // Swap
    const temp = list[currentIndex];
    list[currentIndex] = list[targetIndex];
    list[targetIndex] = temp;

    const orderedIds = list.map((v) => v.id);

    try {
      await fetch('/api/videos/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderedIds })
      });
      await onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Create or Update Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    try {
      if (editingCatId) {
        const res = await fetch(`/api/categories/${editingCatId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: catName.trim(),
            description: catDesc.trim(),
            icon: catIcon
          })
        });
        if (!res.ok) throw new Error('Error al actualizar categoría');
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: catName.trim(),
            description: catDesc.trim(),
            icon: catIcon
          })
        });
        if (!res.ok) throw new Error('Error al crear categoría');
      }

      setCatName('');
      setCatDesc('');
      setEditingCatId(null);
      await onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Error con la categoría');
    }
  };

  // Delete Category with choice to delete videos or reassign
  const handleDeleteCategory = async (cat: Category) => {
    const count = videos.filter((v) => v.categoryId === cat.id).length;
    let deleteVideos = false;

    if (count > 0) {
      const choice = confirm(
        `¿Deseas eliminar la categoría "${cat.name}"?\n\n` +
        `Esta sección contiene ${count} video(s).\n\n` +
        `• Pulsa ACEPTAR si deseas eliminar también TODOS sus ${count} videos.\n` +
        `• Pulsa CANCELAR si deseas conservar los videos (se moverán a otra categoría).`
      );
      if (choice) {
        deleteVideos = true;
      } else {
        const confirmReassign = confirm(`¿Confirmas eliminar la categoría "${cat.name}" y mantener los videos en otra categoría?`);
        if (!confirmReassign) return;
        deleteVideos = false;
      }
    } else {
      if (!confirm(`¿Eliminar la categoría "${cat.name}"?`)) return;
    }

    try {
      const res = await fetch(`/api/categories/${cat.id}?deleteVideos=${deleteVideos ? 'true' : 'false'}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Error al eliminar categoría');
      await onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar categoría');
    }
  };

  // Clear starter demo videos
  const handleClearDemoVideos = async () => {
    if (!confirm('¿Deseas eliminar todos los videos de ejemplo iniciales (Sagas, Películas, Mangas precargados)?\n\nEsta acción dejará la plataforma lista y limpia para que subas tus propios videos.')) {
      return;
    }

    try {
      const res = await fetch('/api/videos/bulk/clear-demo', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Error al limpiar videos de ejemplo');
      await onRefreshData();
      alert('¡Videos de ejemplo eliminados con éxito!');
    } catch (err: any) {
      alert(err.message || 'Error al eliminar videos de ejemplo');
    }
  };

  // Update Settings (Username / Password)
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsMsg(null);

    try {
      const res = await fetch('/api/auth/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          newUsername: newUsernameInput.trim(),
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar configuración');
      }

      onUpdateAdminUsername(data.username);
      setSettingsMsg({ type: 'success', text: '¡Configuración actualizada con éxito!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setSettingsMsg({ type: 'error', text: err.message || 'Error al actualizar' });
    } finally {
      setSettingsLoading(false);
    }
  };

  // Filtered Videos for Admin list
  const filteredAdminVideos = videos.filter((v) => {
    const matchesCat =
      adminCategoryFilter === 'all' || v.categoryId === adminCategoryFilter;
    const matchesQuery =
      !adminSearch.trim() ||
      v.title.toLowerCase().includes(adminSearch.toLowerCase()) ||
      (v.description && v.description.toLowerCase().includes(adminSearch.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div
      id="admin-panel-overlay"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-y-auto flex flex-col"
    >
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col p-4 lg:p-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <DragonBallIcon type="ball-4" size={40} glowing={true} />
            <div>
              <h1 className="text-xl lg:text-2xl font-black text-white tracking-wide font-['Outfit'] flex items-center gap-2">
                Panel de Administrador • <span className="text-amber-500">Cineon Play</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  @{adminUsername}
                </span>
              </h1>
              <p className="text-xs text-zinc-400">
                Gestión completa de Cineon Play: videos, categorías, orden y almacenamiento
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="admin-logout-btn"
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <LogOut size={14} />
              <span>Cerrar Sesión</span>
            </button>

            <button
              id="close-admin-panel-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
              title="Volver a la web"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 pt-4 pb-6 border-b border-zinc-800/80 shrink-0">
          <button
            id="tab-videos"
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'videos'
                ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800'
            }`}
          >
            <Film size={15} />
            <span>Todos los Videos ({videos.length})</span>
          </button>

          <button
            id="tab-upload"
            onClick={() => {
              resetVideoForm();
              setActiveTab('upload');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800'
            }`}
          >
            <Upload size={15} />
            <span>{editingVideoId ? 'Editar Video' : '+ Subir Video'}</span>
          </button>

          <button
            id="tab-categories"
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800'
            }`}
          >
            <FolderPlus size={15} />
            <span>Categorías ({categories.length})</span>
          </button>

          <button
            id="tab-reorder"
            onClick={() => setActiveTab('reorder')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'reorder'
                ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800'
            }`}
          >
            <ArrowUpDown size={15} />
            <span>Ordenar Videos</span>
          </button>

          <button
            id="tab-storage"
            onClick={() => setActiveTab('storage')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'storage'
                ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800'
            }`}
          >
            <HardDrive size={15} />
            <span>Almacenamiento (500 Videos / 100 GB)</span>
          </button>

          <button
            id="tab-settings"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800'
            }`}
          >
            <Settings size={15} />
            <span>Configuración de Usuario</span>
          </button>
        </div>

        {/* Tab 1: Videos Management List */}
        {activeTab === 'videos' && (
          <div className="mt-6 flex-1 flex flex-col space-y-4">
            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Buscar video..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 w-full sm:w-60"
                />

                <select
                  value={adminCategoryFilter}
                  onChange={(e) => setAdminCategoryFilter(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none cursor-pointer"
                >
                  <option value="all">Todas las Categorías</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleClearDemoVideos}
                  className="w-full sm:w-auto px-3 py-2 rounded-lg bg-zinc-800 hover:bg-red-600/80 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Eliminar videos de ejemplo iniciales (Sagas, Películas, Mangas, etc.)"
                >
                  <Trash2 size={14} />
                  <span>Limpiar Videos de Prueba</span>
                </button>

                <button
                  onClick={() => {
                    resetVideoForm();
                    setActiveTab('upload');
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                >
                  <Plus size={16} />
                  <span>Subir Nuevo Video</span>
                </button>
              </div>
            </div>

            {/* Video List Table */}
            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-[#0c0d11]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Miniatura y Título</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4">Fuente / Peso</th>
                    <th className="py-3 px-4">Vistas</th>
                    <th className="py-3 px-4">Orden</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {filteredAdminVideos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-zinc-500">
                        No se encontraron videos con ese filtro.
                      </td>
                    </tr>
                  ) : (
                    filteredAdminVideos.map((video, idx) => {
                      const cat = categories.find((c) => c.id === video.categoryId);
                      const isLocal = video.videoUrl.startsWith('/uploads/videos/');
                      const mb = Math.round((video.fileSizeBytes || 209715200) / (1024 * 1024));

                      return (
                        <tr
                          key={video.id}
                          className="hover:bg-zinc-900/40 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                onClick={() => onPreviewVideo(video)}
                                className="relative w-16 aspect-video rounded overflow-hidden bg-black shrink-0 cursor-pointer group"
                              >
                                <img
                                  src={video.thumbnailUrl}
                                  alt={video.title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play size={12} className="text-white fill-white" />
                                </div>
                              </div>
                              <div className="min-w-0 max-w-xs md:max-w-md">
                                <h4
                                  onClick={() => onPreviewVideo(video)}
                                  className="font-bold text-white truncate hover:text-amber-400 cursor-pointer"
                                >
                                  {video.title}
                                </h4>
                                <p className="text-[11px] text-zinc-400 truncate">
                                  {video.shortDescription || video.description}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            {cat ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-amber-400 font-medium">
                                <DragonBallIcon type={cat.icon || cat.id} size={14} />
                                {cat.name}
                              </span>
                            ) : (
                              <span className="text-zinc-500">General</span>
                            )}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-mono text-zinc-200 font-semibold">
                                {mb} MB
                              </span>
                              <span className="text-[10px] text-zinc-400">
                                {isLocal ? 'Servidor Local (Streaming)' : 'Enlace CDN'}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap font-mono text-zinc-300">
                            {video.views}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleMoveVideo(video.id, 'up')}
                                disabled={idx === 0}
                                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30"
                                title="Subir"
                              >
                                <ChevronUp size={13} />
                              </button>
                              <span className="font-mono text-xs w-6 text-center text-zinc-400">
                                {video.orderIndex || idx + 1}
                              </span>
                              <button
                                onClick={() => handleMoveVideo(video.id, 'down')}
                                disabled={idx === filteredAdminVideos.length - 1}
                                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30"
                                title="Bajar"
                              >
                                <ChevronDown size={13} />
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onPreviewVideo(video)}
                                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                                title="Ver video"
                              >
                                <Play size={14} />
                              </button>

                              <button
                                onClick={() => handleStartEditVideo(video)}
                                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-300 transition-colors"
                                title="Editar video"
                              >
                                <Edit3 size={14} />
                              </button>

                              <button
                                onClick={() => handleDeleteVideo(video.id, video.title)}
                                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-600 hover:text-white text-zinc-300 transition-colors"
                                title="Eliminar video"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Upload / Edit Form */}
        {activeTab === 'upload' && (
          <form
            onSubmit={handleSaveVideo}
            className="mt-6 flex-1 max-w-4xl mx-auto w-full bg-[#0e0f14] p-6 lg:p-8 rounded-2xl border border-zinc-800 space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  {editingVideoId ? <Edit3 size={18} /> : <Upload size={18} />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    {editingVideoId ? 'Editar Información del Video' : 'Subir y Publicar Nuevo Video'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Completa los detalles del video. Soporta archivos de hasta 600MB y enlaces externos.
                  </p>
                </div>
              </div>

              {editingVideoId && (
                <button
                  type="button"
                  onClick={resetVideoForm}
                  className="text-xs text-amber-400 hover:underline"
                >
                  Cancelar Edición
                </button>
              )}
            </div>

            {formMessage && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                  formMessage.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
              >
                {formMessage.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
                <span>{formMessage.text}</span>
              </div>
            )}

            {/* Progress bar if uploading */}
            {uploadProgress !== null && (
              <div className="space-y-1.5 p-4 rounded-xl bg-zinc-900 border border-amber-500/40">
                <div className="flex justify-between text-xs text-amber-400 font-semibold">
                  <span>Subiendo y procesando video...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Details */}
              <div className="space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Título del Video *
                  </label>
                  <input
                    type="text"
                    required
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="Ej. Saga Saiyan: Goku vs Vegeta Combate Final"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Sección o Categoría *
                  </label>
                  <select
                    required
                    value={videoCategory}
                    onChange={(e) => setVideoCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Short Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Descripción Corta (opcional)
                  </label>
                  <input
                    type="text"
                    value={videoShortDesc}
                    onChange={(e) => setVideoShortDesc(e.target.value)}
                    placeholder="Resumen de 1 línea para la tarjeta"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Full Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Descripción Completa
                  </label>
                  <textarea
                    rows={4}
                    value={videoFullDesc}
                    onChange={(e) => setVideoFullDesc(e.target.value)}
                    placeholder="Sinopsis detallada, créditos, lista de capítulos..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Tags & Featured */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-400">
                      Tags (separados por coma)
                    </label>
                    <input
                      type="text"
                      value={videoTagsInput}
                      onChange={(e) => setVideoTagsInput(e.target.value)}
                      placeholder="Goku, Saiyans, Torneo"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="feat-check"
                      checked={videoFeatured}
                      onChange={(e) => setVideoFeatured(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <label
                      htmlFor="feat-check"
                      className="text-xs text-zinc-300 cursor-pointer select-none"
                    >
                      Destacar en Portada
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Video Source & Thumbnail */}
              <div className="space-y-4">
                {/* Video Source Selection */}
                <div className="space-y-2 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  <label className="text-xs font-bold text-white flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileVideo size={14} className="text-amber-400" />
                      Archivo de Video *
                    </span>
                    <span className="text-[10px] text-zinc-400">Soporta ~200MB / video</span>
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setVideoSourceType('upload')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        videoSourceType === 'upload'
                          ? 'bg-amber-500 text-black'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Subir Archivo Local
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoSourceType('external')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        videoSourceType === 'external'
                          ? 'bg-amber-500 text-black'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Enlace / Cloud Storage
                    </button>
                  </div>

                  {videoSourceType === 'upload' ? (
                    <div className="space-y-2">
                      <div className="border-2 border-dashed border-zinc-800 hover:border-amber-500/60 rounded-xl p-4 text-center cursor-pointer transition-colors bg-zinc-900/50">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setVideoFile(file);
                              setVideoSizeMB(Math.round(file.size / (1024 * 1024)));
                            }
                          }}
                          className="hidden"
                          id="file-video-input"
                        />
                        <label
                          htmlFor="file-video-input"
                          className="cursor-pointer block space-y-1"
                        >
                          <Upload size={24} className="mx-auto text-amber-400" />
                          <p className="text-xs font-medium text-zinc-200">
                            {videoFile ? videoFile.name : 'Haz clic para seleccionar archivo MP4 / WebM'}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            {videoFile
                              ? `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB seleccionado`
                              : 'Hasta 600MB por archivo'}
                          </p>
                        </label>
                      </div>

                      {videoUrlInput && !videoFile && (
                        <p className="text-[11px] text-zinc-400 truncate">
                          Archivo actual: <span className="font-mono text-zinc-300">{videoUrlInput}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <input
                        type="url"
                        value={videoUrlInput}
                        onChange={(e) => setVideoUrlInput(e.target.value)}
                        placeholder="https://... o enlace direct MP4 / Cloud Storage"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                      />
                      <p className="text-[11px] text-zinc-500">
                        Ideal para 500+ videos: Google Cloud Storage, AWS S3, BunnyCDN, YouTube o enlaces directos.
                      </p>
                    </div>
                  )}

                  {/* Duration & Size in MB */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-900">
                    <div>
                      <label className="text-[10px] text-zinc-400">Duración (ej. 24:15)</label>
                      <input
                        type="text"
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400">Tamaño estimado (MB)</label>
                      <input
                        type="number"
                        value={videoSizeMB}
                        onChange={(e) => setVideoSizeMB(Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Thumbnail Selection */}
                <div className="space-y-2 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  <label className="text-xs font-bold text-white flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-amber-400" />
                      Miniatura del Video *
                    </span>
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setThumbnailType('url')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        thumbnailType === 'url'
                          ? 'bg-amber-500 text-black'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      URL de Imagen
                    </button>
                    <button
                      type="button"
                      onClick={() => setThumbnailType('upload')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        thumbnailType === 'upload'
                          ? 'bg-amber-500 text-black'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Subir Imagen
                    </button>
                  </div>

                  {thumbnailType === 'url' ? (
                    <input
                      type="url"
                      value={thumbUrlInput}
                      onChange={(e) => setThumbUrlInput(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setThumbFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-zinc-400 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-zinc-800 file:text-white file:cursor-pointer"
                    />
                  )}

                  {/* Thumbnail Preview */}
                  {(thumbUrlInput || thumbFile) && (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black border border-zinc-800 mt-2">
                      <img
                        src={thumbFile ? URL.createObjectURL(thumbFile) : thumbUrlInput}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={resetVideoForm}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors"
              >
                Limpiar
              </button>

              <button
                id="save-video-submit-btn"
                type="submit"
                disabled={formLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold text-xs tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {formLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>{editingVideoId ? 'Guardar Cambios' : 'Publicar Video'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Categories Management */}
        {activeTab === 'categories' && (
          <div className="mt-6 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create or Edit Form */}
            <div className="bg-[#0e0f14] p-6 rounded-2xl border border-zinc-800 space-y-4 h-fit">
              <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                <FolderPlus size={18} className="text-amber-400" />
                {editingCatId ? 'Editar Categoría' : 'Crear Nueva Categoría'}
              </h3>

              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">
                    Nombre de la Categoría *
                  </label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="Ej. Combates Clásicos"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    placeholder="Breve detalle de la sección"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Dragon Ball Icon Choice */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">
                    Icono Dragon Ball
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['ball-1', 'ball-2', 'ball-3', 'ball-4', 'ball-5', 'ball-6', 'ball-7', 'akira'].map(
                      (iconType) => (
                        <button
                          key={iconType}
                          type="button"
                          onClick={() => setCatIcon(iconType)}
                          className={`p-2 rounded-xl flex flex-col items-center justify-center border transition-all ${
                            catIcon === iconType
                              ? 'border-amber-500 bg-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                              : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                          }`}
                        >
                          <DragonBallIcon type={iconType} size={28} glowing={catIcon === iconType} />
                          <span className="text-[10px] text-zinc-400 mt-1 uppercase font-mono">
                            {iconType === 'akira' ? 'Akira' : iconType.replace('ball-', '★ ')}
                          </span>
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  {editingCatId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCatId(null);
                        setCatName('');
                        setCatDesc('');
                      }}
                      className="flex-1 py-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-colors"
                  >
                    {editingCatId ? 'Guardar Cambios' : '+ Agregar Categoría'}
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Categories Table */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                Categorías Existentes ({categories.length})
              </h3>

              <div className="space-y-2">
                {categories.map((cat) => {
                  const vidsInCat = videos.filter((v) => v.categoryId === cat.id).length;

                  return (
                    <div
                      key={cat.id}
                      className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <DragonBallIcon type={cat.icon || cat.id} size={32} />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            {cat.name}
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                              {vidsInCat} videos
                            </span>
                          </h4>
                          {cat.description && (
                            <p className="text-xs text-zinc-400 truncate">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setEditingCatId(cat.id);
                            setCatName(cat.name);
                            setCatDesc(cat.description || '');
                            setCatIcon(cat.icon || 'ball-1');
                          }}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-300 transition-colors"
                          title="Editar categoría"
                        >
                          <Edit3 size={14} />
                        </button>

                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-600 hover:text-white text-zinc-300 transition-colors"
                          title="Eliminar categoría"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Reorder Videos */}
        {activeTab === 'reorder' && (
          <div className="mt-6 flex-1 max-w-4xl mx-auto w-full space-y-4">
            <div className="flex items-center justify-between bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Ordenar Videos de la Plataforma
                </h3>
                <p className="text-xs text-zinc-400">
                  Usa los botones arriba/abajo para posicionar exactamente el orden de aparición.
                </p>
              </div>

              <select
                value={reorderCategoryId}
                onChange={(e) => setReorderCategoryId(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none cursor-pointer"
              >
                <option value="all">Todas las Categorías</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              {videos
                .filter(
                  (v) => reorderCategoryId === 'all' || v.categoryId === reorderCategoryId
                )
                .map((video, idx, arr) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-amber-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs font-bold text-amber-500 w-6 text-center">
                        #{idx + 1}
                      </span>
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        referrerPolicy="no-referrer"
                        className="w-14 aspect-video object-cover rounded bg-black"
                      />
                      <div className="truncate min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">
                          {video.title}
                        </h4>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {video.duration || '20:00'} • {video.views} vistas
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleMoveVideo(video.id, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-25 transition-opacity"
                        title="Mover arriba"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        onClick={() => handleMoveVideo(video.id, 'down')}
                        disabled={idx === arr.length - 1}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-25 transition-opacity"
                        title="Mover abajo"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 5: Storage Breakdown (500 videos / 100 GB) */}
        {activeTab === 'storage' && (
          <div className="mt-6 flex-1 max-w-4xl mx-auto w-full space-y-6">
            <div className="p-6 rounded-2xl bg-[#0e0f14] border border-zinc-800 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <HardDrive size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    Gestión de Almacenamiento (500+ Videos / 100 GB)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Métricas en tiempo real y guías para soportar alto volumen sin ralentizar la web
                  </p>
                </div>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <p className="text-xs text-zinc-400">Total Videos</p>
                  <p className="text-2xl font-black text-white font-mono mt-1">
                    {storageStats?.totalVideos || videos.length}
                  </p>
                  <p className="text-[11px] text-amber-400 mt-1">
                    Meta: 500+ videos
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <p className="text-xs text-zinc-400">Almacenamiento Acumulado</p>
                  <p className="text-2xl font-black text-amber-400 font-mono mt-1">
                    {storageStats?.totalStorageGB || 0} GB
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    {storageStats?.totalStorageMB || 0} MB utilizados
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <p className="text-xs text-zinc-400">Capacidad Estimada 500 Vids</p>
                  <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
                    ~100 GB
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    200 MB por video
                  </p>
                </div>
              </div>

              {/* Cloud Storage Recommendation */}
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Sparkles size={14} />
                  Recomendación para 500 videos sin saturar el servidor
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Para subir más de 500 videos de 200MB (~100 GB en total), puedes usar cualquiera de estos dos métodos compatibles:
                </p>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-black/50 border border-zinc-800">
                    <p className="font-bold text-white">Opción 1: Archivo Local en Servidor</p>
                    <p className="text-zinc-400 text-[11px] mt-1">
                      Sube el video directo desde la pestaña "+ Subir Video". Se almacena en disco y se transmite por fragmentos HTTP 206 para reproducción instantánea.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-black/50 border border-zinc-800">
                    <p className="font-bold text-white">Opción 2: Cloud Storage / S3 (Ilimitado)</p>
                    <p className="text-zinc-400 text-[11px] mt-1">
                      Aloja tus videos en Bunny Stream, Google Cloud Storage, AWS S3, Cloudflare R2 o Backblaze B2, y simplemente pega la URL en la pestaña "+ Subir Video". ¡Costo mínimo y velocidad ultra-rápida!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Security & User Settings */}
        {activeTab === 'settings' && (
          <form
            onSubmit={handleUpdateSettings}
            className="mt-6 flex-1 max-w-xl mx-auto w-full bg-[#0e0f14] p-6 lg:p-8 rounded-2xl border border-zinc-800 space-y-5"
          >
            <div className="pb-4 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                <Settings size={18} className="text-amber-400" />
                Configuración de Administrador
              </h3>
              <p className="text-xs text-zinc-400">
                Cambia tu nombre de usuario y tu contraseña privada
              </p>
            </div>

            {settingsMsg && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  settingsMsg.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
              >
                {settingsMsg.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
                <span>{settingsMsg.text}</span>
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Nombre de Usuario del Administrador
              </label>
              <input
                type="text"
                required
                value={newUsernameInput}
                onChange={(e) => setNewUsernameInput(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-zinc-500">
                * Con este nombre podrás iniciar sesión en el panel.
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-800 space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Cambiar Contraseña (Opcional)
              </h4>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={settingsLoading}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {settingsLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>Actualizar Configuración</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
