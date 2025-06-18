// Project Storage Service - High-level interface for managing project history

import { nanoid } from 'nanoid';
import {
  ProjectHistory,
  SaveProjectRequest,
  ProjectFilter,
  ProjectSearchResult,
  ProjectStorageStats,
  StorageResult,
} from '../types/project-history';
import { getStorageService } from './indexeddb-service';
import { compressImage, generateThumbnail } from './image-compression';

export class ProjectStorageService {
  private indexedDB = getStorageService();

  /**
   * Save a new project with automatic image compression and thumbnail generation
   */
  async saveProject(request: SaveProjectRequest): Promise<StorageResult<string>> {
    try {
      // Generate unique ID
      const id = nanoid();
      
      // Generate title if not provided
      const title = request.title || this.generateAutoTitle(request.originalImage.name, request.style.name);

      // Convert File to Blob for original image
      const originalBlob = new Blob([await request.originalImage.arrayBuffer()], {
        type: request.originalImage.type,
      });

      // Compress images for storage efficiency
      const [compressedOriginal, compressedTransformed, thumbnail] = await Promise.all([
        this.compressImageForStorage(originalBlob),
        this.compressImageForStorage(request.transformedImage),
        generateThumbnail(request.transformedImage, 200, 0.7),
      ]);

      // Create project object
      const project: ProjectHistory = {
        id,
        title,
        originalImage: {
          data: compressedOriginal,
          filename: request.originalImage.name,
          size: compressedOriginal.size,
          type: request.originalImage.type,
        },
        transformedImage: {
          data: compressedTransformed,
          filename: `${title}_transformed.jpg`,
          size: compressedTransformed.size,
        },
        style: request.style,
        thumbnail,
        metadata: {
          createdAt: new Date(),
          transformationTime: request.transformationTime,
          favorited: false,
          tags: request.tags || [],
        },
      };

      // Save to IndexedDB
      return await this.indexedDB.saveProject(project);
    } catch (error) {
      return {
        success: false,
        error: `Failed to save project: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get a project by ID
   */
  async getProject(id: string): Promise<StorageResult<ProjectHistory>> {
    return await this.indexedDB.getProject(id);
  }

  /**
   * Search projects with filtering and pagination
   */
  async searchProjects(
    filter: ProjectFilter = {},
    limit: number = 20,
    offset: number = 0
  ): Promise<StorageResult<ProjectSearchResult>> {
    return await this.indexedDB.searchProjects(filter, limit, offset);
  }

  /**
   * Get recent projects (convenience method)
   */
  async getRecentProjects(limit: number = 10): Promise<StorageResult<ProjectHistory[]>> {
    const result = await this.searchProjects({}, limit, 0);
    
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data.projects,
      };
    }
    
    return { success: false, error: result.error };
  }

  /**
   * Get favorite projects
   */
  async getFavoriteProjects(limit: number = 20): Promise<StorageResult<ProjectHistory[]>> {
    const result = await this.searchProjects({ favorited: true }, limit, 0);
    
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data.projects,
      };
    }
    
    return { success: false, error: result.error };
  }

  /**
   * Toggle favorite status for a project
   */
  async toggleFavorite(id: string): Promise<StorageResult> {
    return await this.indexedDB.toggleFavorite(id);
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<StorageResult> {
    return await this.indexedDB.deleteProject(id);
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<StorageResult<ProjectStorageStats>> {
    return await this.indexedDB.getStorageStats();
  }

  /**
   * Search projects by text query
   */
  async searchByText(query: string, limit: number = 20): Promise<StorageResult<ProjectHistory[]>> {
    const result = await this.searchProjects({ search: query }, limit, 0);
    
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data.projects,
      };
    }
    
    return { success: false, error: result.error };
  }

  /**
   * Get projects by style
   */
  async getProjectsByStyle(styleName: string, limit: number = 20): Promise<StorageResult<ProjectHistory[]>> {
    const result = await this.searchProjects({ style: styleName }, limit, 0);
    
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data.projects,
      };
    }
    
    return { success: false, error: result.error };
  }

  /**
   * Export projects for backup
   */
  async exportProjects(): Promise<StorageResult<Blob>> {
    try {
      const [projectsResult, statsResult] = await Promise.all([
        this.searchProjects({}, 1000, 0), // Get all projects
        this.getStorageStats(),
      ]);

      if (!projectsResult.success || !statsResult.success) {
        return {
          success: false,
          error: 'Failed to retrieve projects for export',
        };
      }

      const exportData = {
        version: '1.0',
        exportDate: new Date(),
        projects: projectsResult.data!.projects,
        stats: statsResult.data!,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      return { success: true, data: blob };
    } catch (error) {
      return {
        success: false,
        error: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get storage usage information
   */
  async getStorageInfo(): Promise<StorageResult<{
    used: string;
    available: string;
    percentage: number;
    projectCount: number;
  }>> {
    const statsResult = await this.getStorageStats();
    
    if (!statsResult.success || !statsResult.data) {
      return { success: false, error: statsResult.error };
    }

    const stats = statsResult.data;
    
    return {
      success: true,
      data: {
        used: this.formatBytes(stats.usedStorage),
        available: this.formatBytes(stats.availableStorage),
        percentage: Math.round(stats.storagePercentage),
        projectCount: stats.totalProjects,
      },
    };
  }

  /**
   * Cleanup old projects to free space
   */
  async cleanupStorage(targetFreeSpace: number = 50 * 1024 * 1024): Promise<StorageResult<number>> {
    try {
      const statsResult = await this.getStorageStats();
      
      if (!statsResult.success || !statsResult.data) {
        return { success: false, error: statsResult.error };
      }

      const { availableStorage } = statsResult.data;
      
      if (availableStorage >= targetFreeSpace) {
        return { success: true, data: 0 }; // No cleanup needed
      }

      // Get projects sorted by date (oldest first)
      const projectsResult = await this.searchProjects({}, 1000, 0);
      
      if (!projectsResult.success || !projectsResult.data) {
        return { success: false, error: 'Failed to retrieve projects for cleanup' };
      }

      const projects = projectsResult.data.projects
        .filter(p => !p.metadata.favorited) // Don't delete favorites
        .sort((a, b) => a.metadata.createdAt.getTime() - b.metadata.createdAt.getTime());

      let deletedCount = 0;
      let freedSpace = availableStorage;

      for (const project of projects) {
        if (freedSpace >= targetFreeSpace) break;

        const deleteResult = await this.deleteProject(project.id);
        if (deleteResult.success) {
          deletedCount++;
          freedSpace += project.originalImage.size + project.transformedImage.size + project.thumbnail.size;
        }
      }

      return { success: true, data: deletedCount };
    } catch (error) {
      return {
        success: false,
        error: `Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Compress image for storage with smart sizing
   */
  private async compressImageForStorage(blob: Blob): Promise<Blob> {
    // For storage, compress to reasonable quality while maintaining detail
    return await compressImage(blob, 1600, 1600, 0.8);
  }

  /**
   * Generate automatic title for projects
   */
  private generateAutoTitle(filename: string, styleName: string): string {
    const baseName = filename.split('.')[0]; // Remove extension
    const timestamp = new Date().toLocaleDateString();
    return `${baseName} - ${styleName} (${timestamp})`;
  }

  /**
   * Format bytes into human-readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Singleton instance
let storageInstance: ProjectStorageService | null = null;

export function getProjectStorage(): ProjectStorageService {
  if (!storageInstance) {
    storageInstance = new ProjectStorageService();
  }
  return storageInstance;
} 