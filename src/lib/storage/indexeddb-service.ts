// IndexedDB Service for Project History Storage

import {
  ProjectHistory,
  ProjectStorageStats,
  ProjectFilter,
  ProjectSearchResult,
  StorageResult,
  StorageConfig,
} from '../types/project-history';

const DB_NAME = 'ImageGenerationApp';
const DB_VERSION = 1;
const PROJECTS_STORE = 'projects';
const CONFIG_STORE = 'config';

export class IndexedDBService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor(private config: StorageConfig = {
    maxTotalSize: 500 * 1024 * 1024, // 500MB
    warningThreshold: 400 * 1024 * 1024, // 400MB
    thumbnailSize: 200,
    compressionQuality: 0.7,
    autoCleanup: true,
  }) {}

  /**
   * Initialize the IndexedDB database
   */
  private async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create projects store
        if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
          const projectStore = db.createObjectStore(PROJECTS_STORE, {
            keyPath: 'id',
          });

          // Create indexes for efficient querying
          projectStore.createIndex('createdAt', 'metadata.createdAt');
          projectStore.createIndex('favorited', 'metadata.favorited');
          projectStore.createIndex('style', 'style.name');
          projectStore.createIndex('title', 'title');
        }

        // Create config store
        if (!db.objectStoreNames.contains(CONFIG_STORE)) {
          db.createObjectStore(CONFIG_STORE, { keyPath: 'key' });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Save a project to storage
   */
  async saveProject(project: ProjectHistory): Promise<StorageResult<string>> {
    try {
      await this.init();
      
      if (!this.db) {
        return { success: false, error: 'Database not initialized' };
      }

      // Check storage limits before saving
      const stats = await this.getStorageStats();
      const projectSize = this.estimateProjectSize(project);
      
      if (stats.data && stats.data.usedStorage + projectSize > this.config.maxTotalSize) {
        if (this.config.autoCleanup) {
          await this.cleanupOldestProjects(1);
        } else {
          return { 
            success: false, 
            error: 'Storage limit exceeded. Please free up space.' 
          };
        }
      }

      const transaction = this.db.transaction([PROJECTS_STORE], 'readwrite');
      const store = transaction.objectStore(PROJECTS_STORE);

      return new Promise((resolve) => {
        const request = store.put(project);

        request.onsuccess = () => {
          resolve({ success: true, data: project.id });
        };

        request.onerror = () => {
          resolve({ 
            success: false, 
            error: `Failed to save project: ${request.error?.message}` 
          });
        };
      });
    } catch (error) {
      return { 
        success: false, 
        error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Get a project by ID
   */
  async getProject(id: string): Promise<StorageResult<ProjectHistory>> {
    try {
      await this.init();
      
      if (!this.db) {
        return { success: false, error: 'Database not initialized' };
      }

      const transaction = this.db.transaction([PROJECTS_STORE], 'readonly');
      const store = transaction.objectStore(PROJECTS_STORE);

      return new Promise((resolve) => {
        const request = store.get(id);

        request.onsuccess = () => {
          if (request.result) {
            resolve({ success: true, data: request.result });
          } else {
            resolve({ success: false, error: 'Project not found' });
          }
        };

        request.onerror = () => {
          resolve({ 
            success: false, 
            error: `Failed to get project: ${request.error?.message}` 
          });
        };
      });
    } catch (error) {
      return { 
        success: false, 
        error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Search projects with filtering and pagination
   */
  async searchProjects(
    filter: ProjectFilter = {},
    limit: number = 20,
    offset: number = 0
  ): Promise<StorageResult<ProjectSearchResult>> {
    try {
      await this.init();
      
      if (!this.db) {
        return { success: false, error: 'Database not initialized' };
      }

      const transaction = this.db.transaction([PROJECTS_STORE], 'readonly');
      const store = transaction.objectStore(PROJECTS_STORE);

      return new Promise((resolve) => {
        const projects: ProjectHistory[] = [];
        let totalCount = 0;

        // Use appropriate index based on filter
        let index: IDBIndex | IDBObjectStore = store;
        if (filter.favorited !== undefined) {
          index = store.index('favorited');
        } else if (filter.style) {
          index = store.index('style');
        } else {
          index = store.index('createdAt');
        }

        const request = index.openCursor(null, 'prev'); // Most recent first

        request.onsuccess = () => {
          const cursor = request.result;
          
          if (cursor) {
            const project = cursor.value as ProjectHistory;
            
            if (this.matchesFilter(project, filter)) {
              totalCount++;
              
              if (totalCount > offset && projects.length < limit) {
                projects.push(project);
              }
            }
            
            cursor.continue();
          } else {
            // Finished iterating
            resolve({
              success: true,
              data: {
                projects,
                totalCount,
                hasMore: totalCount > offset + limit,
              },
            });
          }
        };

        request.onerror = () => {
          resolve({ 
            success: false, 
            error: `Failed to search projects: ${request.error?.message}` 
          });
        };
      });
    } catch (error) {
      return { 
        success: false, 
        error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<StorageResult> {
    try {
      await this.init();
      
      if (!this.db) {
        return { success: false, error: 'Database not initialized' };
      }

      const transaction = this.db.transaction([PROJECTS_STORE], 'readwrite');
      const store = transaction.objectStore(PROJECTS_STORE);

      return new Promise((resolve) => {
        const request = store.delete(id);

        request.onsuccess = () => {
          resolve({ success: true });
        };

        request.onerror = () => {
          resolve({ 
            success: false, 
            error: `Failed to delete project: ${request.error?.message}` 
          });
        };
      });
    } catch (error) {
      return { 
        success: false, 
        error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<StorageResult<ProjectStorageStats>> {
    try {
      await this.init();
      
      if (!this.db) {
        return { success: false, error: 'Database not initialized' };
      }

      const transaction = this.db.transaction([PROJECTS_STORE], 'readonly');
      const store = transaction.objectStore(PROJECTS_STORE);

      return new Promise((resolve) => {
        const request = store.getAll();

        request.onsuccess = () => {
          const projects = request.result as ProjectHistory[];
          let totalSize = 0;

          projects.forEach((project) => {
            totalSize += this.estimateProjectSize(project);
          });

          const stats: ProjectStorageStats = {
            totalProjects: projects.length,
            totalSize,
            usedStorage: totalSize,
            availableStorage: this.config.maxTotalSize - totalSize,
            storagePercentage: (totalSize / this.config.maxTotalSize) * 100,
          };

          resolve({ success: true, data: stats });
        };

        request.onerror = () => {
          resolve({ 
            success: false, 
            error: `Failed to get storage stats: ${request.error?.message}` 
          });
        };
      });
    } catch (error) {
      return { 
        success: false, 
        error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Toggle favorite status for a project
   */
  async toggleFavorite(id: string): Promise<StorageResult> {
    const projectResult = await this.getProject(id);
    
    if (!projectResult.success || !projectResult.data) {
      return { success: false, error: projectResult.error };
    }

    const project = projectResult.data;
    project.metadata.favorited = !project.metadata.favorited;

    const saveResult = await this.saveProject(project);
    return { success: saveResult.success, error: saveResult.error };
  }

  /**
   * Cleanup oldest projects to free space
   */
  private async cleanupOldestProjects(count: number): Promise<void> {
    const searchResult = await this.searchProjects({}, count, 0);
    
    if (searchResult.success && searchResult.data) {
      const oldestProjects = searchResult.data.projects
        .sort((a, b) => a.metadata.createdAt.getTime() - b.metadata.createdAt.getTime())
        .slice(0, count);

      for (const project of oldestProjects) {
        await this.deleteProject(project.id);
      }
    }
  }

  /**
   * Check if a project matches the filter criteria
   */
  private matchesFilter(project: ProjectHistory, filter: ProjectFilter): boolean {
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      if (!project.title.toLowerCase().includes(searchLower) &&
          !project.originalImage.filename.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    if (filter.style && project.style.name !== filter.style) {
      return false;
    }

    if (filter.favorited !== undefined && project.metadata.favorited !== filter.favorited) {
      return false;
    }

    if (filter.dateRange) {
      const projectDate = project.metadata.createdAt;
      if (projectDate < filter.dateRange.start || projectDate > filter.dateRange.end) {
        return false;
      }
    }

    if (filter.tags && filter.tags.length > 0) {
      const hasMatchingTag = filter.tags.some(tag => 
        project.metadata.tags.includes(tag)
      );
      if (!hasMatchingTag) {
        return false;
      }
    }

    return true;
  }

  /**
   * Estimate the storage size of a project
   */
  private estimateProjectSize(project: ProjectHistory): number {
    return (
      project.originalImage.size +
      project.transformedImage.size +
      project.thumbnail.size +
      1024 // Metadata overhead
    );
  }

  /**
   * Clean up and close the database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }
}

// Singleton instance
let dbInstance: IndexedDBService | null = null;

export function getStorageService(): IndexedDBService {
  if (!dbInstance) {
    dbInstance = new IndexedDBService();
  }
  return dbInstance;
} 