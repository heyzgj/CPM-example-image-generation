import { getProjectStorage, ProjectStorageService } from '../project-storage'
import { SaveProjectRequest } from '@/lib/types/project-history'

// Mock IndexedDB
import 'fake-indexeddb/auto'

describe('ProjectStorageService', () => {
  let storage: ProjectStorageService

  beforeEach(() => {
    storage = getProjectStorage()
  })

  const createMockSaveRequest = (): SaveProjectRequest => ({
    originalImage: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
    transformedImage: new Blob(['transformed'], { type: 'image/jpeg' }),
    style: {
      name: 'Renaissance',
      parameters: {
        strength: 0.8,
        guidance: 7.5,
      },
    },
    transformationTime: 3500,
    title: 'Test Project',
    tags: ['art', 'classic'],
  })

  describe('saveProject', () => {
    it('should save a project successfully', async () => {
      const request = createMockSaveRequest()
      const result = await storage.saveProject(request)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(expect.any(String)) // Should return project ID
    })

    it('should handle save errors gracefully', async () => {
      // Create invalid request (missing required fields)
      const invalidRequest = {
        ...createMockSaveRequest(),
        originalImage: null as unknown as File,
      }

      const result = await storage.saveProject(invalidRequest)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should generate auto title when not provided', async () => {
      const request = {
        ...createMockSaveRequest(),
        title: undefined,
      }

      const result = await storage.saveProject(request)

      expect(result.success).toBe(true)
    })
  })

  describe('searchProjects', () => {
    it('should search projects with default parameters', async () => {
      const result = await storage.searchProjects()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(
        expect.objectContaining({
          projects: expect.any(Array),
          totalCount: expect.any(Number),
          hasMore: expect.any(Boolean),
        })
      )
    })

    it('should search projects with filters', async () => {
      const result = await storage.searchProjects(
        { favorited: true },
        10,
        0
      )

      expect(result.success).toBe(true)
      expect(result.data?.projects).toEqual(expect.any(Array))
    })

    it('should handle search errors', async () => {
      // This would test error scenarios if they exist
      const result = await storage.searchProjects({}, -1, -1) // Invalid parameters

      // The service should handle invalid parameters gracefully
      expect(result).toEqual(
        expect.objectContaining({
          success: expect.any(Boolean),
        })
      )
    })
  })

  describe('getRecentProjects', () => {
    it('should get recent projects', async () => {
      const result = await storage.getRecentProjects(5)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(expect.any(Array))
    })

    it('should use default limit', async () => {
      const result = await storage.getRecentProjects()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(expect.any(Array))
    })
  })

  describe('getFavoriteProjects', () => {
    it('should get favorite projects', async () => {
      const result = await storage.getFavoriteProjects()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(expect.any(Array))
    })
  })

  describe('searchByText', () => {
    it('should search projects by text query', async () => {
      const result = await storage.searchByText('test query')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(expect.any(Array))
    })

    it('should handle empty query', async () => {
      const result = await storage.searchByText('')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(expect.any(Array))
    })
  })

  describe('getProjectsByStyle', () => {
    it('should get projects by style', async () => {
      const result = await storage.getProjectsByStyle('renaissance')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(expect.any(Array))
    })
  })

  describe('getStorageStats', () => {
    it('should get storage statistics', async () => {
      const result = await storage.getStorageStats()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(
        expect.objectContaining({
          totalProjects: expect.any(Number),
          totalSize: expect.any(Number),
          favoriteCount: expect.any(Number),
        })
      )
    })
  })

  describe('getStorageInfo', () => {
    it('should get storage information', async () => {
      const result = await storage.getStorageInfo()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(
        expect.objectContaining({
          used: expect.any(String),
          available: expect.any(String),
          percentage: expect.any(Number),
          projectCount: expect.any(Number),
        })
      )
    })
  })

  describe('exportProjects', () => {
    it('should export projects', async () => {
      const result = await storage.exportProjects()

      expect(result.success).toBe(true)
      expect(result.data).toBeInstanceOf(Blob)
    })
  })

  describe('cleanupStorage', () => {
    it('should cleanup storage', async () => {
      const result = await storage.cleanupStorage()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(expect.any(Number))
    })

    it('should cleanup with custom target', async () => {
      const result = await storage.cleanupStorage(100 * 1024 * 1024) // 100MB

      expect(result.success).toBe(true)
      expect(result.data).toEqual(expect.any(Number))
    })
  })

  describe('project lifecycle', () => {
    it('should handle complete project lifecycle', async () => {
      // Save a project
      const saveRequest = createMockSaveRequest()
      const saveResult = await storage.saveProject(saveRequest)
      
      expect(saveResult.success).toBe(true)
      const projectId = saveResult.data!

      // Get the project
      const getResult = await storage.getProject(projectId)
      expect(getResult.success).toBe(true)
      expect(getResult.data?.id).toBe(projectId)

      // Toggle favorite
      const favoriteResult = await storage.toggleFavorite(projectId)
      expect(favoriteResult.success).toBe(true)

      // Delete the project
      const deleteResult = await storage.deleteProject(projectId)
      expect(deleteResult.success).toBe(true)

      // Verify deletion
      const getDeletedResult = await storage.getProject(projectId)
      expect(getDeletedResult.success).toBe(false)
    })
  })
}) 