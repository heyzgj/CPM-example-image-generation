import React, { ReactElement, ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock data generators
export const mockProjectHistory = {
  id: 'test-project-1',
  title: 'Test Project',
  originalImage: {
    data: new Blob(['test'], { type: 'image/jpeg' }),
    filename: 'original.jpg',
    size: 1024,
  },
  transformedImage: {
    data: new Blob(['transformed'], { type: 'image/jpeg' }),
    filename: 'transformed.jpg',
    size: 2048,
  },
  thumbnail: new Blob(['thumb'], { type: 'image/jpeg' }),
  style: {
    id: 'renaissance',
    name: 'Renaissance',
    category: 'classic',
    description: 'Classic Renaissance art style',
    featured: true,
    difficulty: 'medium' as const,
    parameters: {
      strength: 0.8,
      guidance: 7.5,
    },
  },
  metadata: {
    createdAt: new Date('2024-01-01'),
    transformationTime: 3500,
    favorited: false,
    tags: ['art', 'classic'],
    tokenUsage: {
      input: 1000,
      output: 500,
      total: 1500,
    },
  },
  aiDescription: 'A beautiful Renaissance-style transformation',
}

export const mockStyleLibrary = [
  {
    id: 'renaissance',
    name: 'Renaissance',
    category: 'classic',
    description: 'Classic Renaissance art style with rich colors and detailed brushwork',
    featured: true,
    difficulty: 'medium' as const,
    parameters: {
      strength: 0.8,
      guidance: 7.5,
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    category: 'digital',
    description: 'Futuristic cyberpunk aesthetic with neon colors and digital elements',
    featured: true,
    difficulty: 'hard' as const,
    parameters: {
      strength: 0.9,
      guidance: 8.0,
    },
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    category: 'traditional',
    description: 'Soft watercolor painting style with flowing colors',
    featured: false,
    difficulty: 'easy' as const,
    parameters: {
      strength: 0.6,
      guidance: 6.5,
    },
  },
]

export const mockApiKeyData = {
  encrypted: 'encrypted-api-key-data',
  iv: 'initialization-vector',
  salt: 'encryption-salt',
  isValid: true,
  lastValidated: new Date('2024-01-01'),
}

export const mockStorageInfo = {
  used: '2.5 MB',
  available: '497.5 MB',
  percentage: 0.5,
  projectCount: 5,
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add any custom provider props here if needed
  initialEntries?: string[];
}

function CustomWrapper({ children }: { children: ReactNode }) {
  // Add any providers your app uses here
  return <>{children}</>
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  return render(ui, { wrapper: CustomWrapper, ...options })
}

// User event setup
export function setupUserEvent() {
  return userEvent.setup()
}

// Mock service responses
export const mockGeminiResponse = {
  success: true,
  data: {
    transformedImage: new Blob(['transformed'], { type: 'image/jpeg' }),
    description: 'A beautiful AI-generated transformation',
    tokenUsage: {
      input: 1000,
      output: 500,
      total: 1500,
    },
  },
}

export const mockGeminiError = {
  success: false,
  error: 'API request failed',
}

// Storage service mocks
export const mockStorageService = {
  saveProject: jest.fn().mockResolvedValue({ success: true, data: 'project-id' }),
  getProjects: jest.fn().mockResolvedValue({ 
    success: true, 
    data: { projects: [mockProjectHistory], hasMore: false } 
  }),
  searchProjects: jest.fn().mockResolvedValue({ 
    success: true, 
    data: { projects: [mockProjectHistory], hasMore: false } 
  }),
  deleteProject: jest.fn().mockResolvedValue({ success: true }),
  toggleFavorite: jest.fn().mockResolvedValue({ success: true }),
  getStorageInfo: jest.fn().mockResolvedValue({ success: true, data: mockStorageInfo }),
  cleanupStorage: jest.fn().mockResolvedValue({ success: true, data: 2 }),
  exportProjects: jest.fn().mockResolvedValue({ 
    success: true, 
    data: new Blob(['export'], { type: 'application/json' }) 
  }),
}

// API key service mocks
export const mockApiKeyService = {
  setApiKey: jest.fn().mockResolvedValue({ success: true }),
  getApiKey: jest.fn().mockResolvedValue({ success: true, data: 'test-api-key' }),
  validateApiKey: jest.fn().mockResolvedValue({ success: true, data: true }),
  clearApiKey: jest.fn().mockResolvedValue({ success: true }),
  isApiKeySet: jest.fn().mockReturnValue(true),
}

// Image compression mocks
export const mockImageCompression = {
  compressImage: jest.fn().mockResolvedValue(new Blob(['compressed'], { type: 'image/jpeg' })),
  compressImageAdvanced: jest.fn().mockResolvedValue({
    blob: new Blob(['compressed'], { type: 'image/jpeg' }),
    metrics: {
      originalSize: 1024,
      compressedSize: 512,
      compressionRatio: 0.5,
      processingTime: 100,
      quality: 0.8,
    },
  }),
  generateThumbnail: jest.fn().mockResolvedValue(new Blob(['thumb'], { type: 'image/jpeg' })),
  generateProgressiveThumbnail: jest.fn().mockResolvedValue({
    thumbnail: new Blob(['thumb'], { type: 'image/jpeg' }),
    blurPlaceholder: new Blob(['blur'], { type: 'image/jpeg' }),
  }),
  blobToDataUrl: jest.fn().mockResolvedValue('data:image/jpeg;base64,test'),
  dataUrlToBlob: jest.fn().mockReturnValue(new Blob(['test'], { type: 'image/jpeg' })),
}

// Performance monitor mocks
export const mockPerformanceMonitor = {
  trackCustomMetric: jest.fn(),
  startTiming: jest.fn().mockReturnValue(() => 100),
  getPerformanceSummary: jest.fn().mockReturnValue({
    averages: { LCP: 1500, FID: 50, CLS: 0.05 },
    latest: { LCP: 1400, FID: 45, CLS: 0.04, timestamp: Date.now(), route: '/' },
    issues: [],
  }),
}

// Test helpers
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })
  window.IntersectionObserver = mockIntersectionObserver
}

// File upload helpers
export const createMockFileList = (files: File[]) => {
  const fileList: { [key: number]: File; length: number; item: (index: number) => File; [Symbol.iterator]: () => Generator<File, void, unknown> } = {
    length: files.length,
    item: (index: number) => files[index],
    [Symbol.iterator]: function* () {
      for (let i = 0; i < files.length; i++) {
        yield files[i]
      }
    },
  }
  
  files.forEach((file, index) => {
    fileList[index] = file
  })
  
  return fileList as FileList
}

export const createDragEvent = (files: File[]) => {
  return {
    dataTransfer: {
      files: createMockFileList(files),
      types: ['Files'],
    },
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  }
}

// Accessibility test helpers
export const axeConfig = {
  rules: {
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'aria-labels': { enabled: true },
    'focus-management': { enabled: true },
  },
}

// Export everything for easy importing
export * from '@testing-library/react'
export { userEvent } 