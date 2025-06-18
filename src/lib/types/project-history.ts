// Project History Storage Types

export interface ProjectHistory {
  id: string;
  title: string;
  originalImage: {
    data: Blob;
    filename: string;
    size: number;
    type: string;
  };
  transformedImage: {
    data: Blob;
    filename: string;
    size: number;
  };
  style: {
    name: string;
    parameters: Record<string, unknown>;
  };
  thumbnail: Blob;
  metadata: {
    createdAt: Date;
    transformationTime: number;
    favorited: boolean;
    tags: string[];
  };
}

export interface ProjectStorageStats {
  totalProjects: number;
  totalSize: number;
  usedStorage: number;
  availableStorage: number;
  storagePercentage: number;
}

export interface ProjectFilter {
  search?: string;
  style?: string;
  favorited?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
}

export interface SaveProjectRequest {
  title?: string;
  originalImage: File;
  transformedImage: Blob;
  style: {
    name: string;
    parameters: Record<string, unknown>;
  };
  transformationTime: number;
  tags?: string[];
}

export interface StorageConfig {
  maxTotalSize: number; // 500MB default
  warningThreshold: number; // 400MB default
  thumbnailSize: number; // 200px default
  compressionQuality: number; // 0.7 default
  autoCleanup: boolean;
}

export interface ProjectSearchResult {
  projects: ProjectHistory[];
  totalCount: number;
  hasMore: boolean;
}

// Storage operation results
export interface StorageResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// Export/Import types
export interface ProjectExport {
  version: string;
  exportDate: Date;
  projects: ProjectHistory[];
  stats: ProjectStorageStats;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
} 