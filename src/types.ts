export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string; // 'ball-1' | 'ball-2' | 'ball-3' | 'ball-4' | 'ball-5' | 'ball-6' | 'ball-7' | 'akira' | custom
  order: number;
  createdAt: string;
}

export type VideoSourceType = 'upload' | 'external' | 'youtube';

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  thumbnailUrl: string;
  videoUrl: string;
  sourceType: VideoSourceType;
  duration?: string;
  fileSizeBytes?: number;
  orderIndex: number;
  views: number;
  createdAt: string;
  tags?: string[];
  featured?: boolean;
}

export interface AdminSettings {
  username: string;
  updatedAt?: string;
}

export interface StorageOverview {
  totalVideos: number;
  totalCategories: number;
  localVideoCount: number;
  externalVideoCount: number;
  totalStorageBytes: number;
  totalStorageMB: number;
  totalStorageGB: number;
}
