import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StyleType, TransformationType } from './schemas';

interface AppState {
  // API Key management
  hasApiKey: boolean;
  apiKeyStatus: 'not-configured' | 'valid' | 'invalid' | 'checking';
  setApiKeyStatus: (status: AppState['apiKeyStatus']) => void;
  
  // Upload state
  uploadedFile: File | null;
  uploadPreviewUrl: string | null;
  selectedStyle: StyleType | null;
  setUploadedFile: (file: File | null) => void;
  setUploadPreviewUrl: (url: string | null) => void;
  setSelectedStyle: (style: StyleType | null) => void;
  
  // Transformation state
  isTransforming: boolean;
  transformationProgress: number;
  transformationError: string | null;
  setIsTransforming: (isTransforming: boolean) => void;
  setTransformationProgress: (progress: number) => void;
  setTransformationError: (error: string | null) => void;
  
  // History
  transformations: TransformationType[];
  addTransformation: (transformation: TransformationType) => void;
  removeTransformation: (id: string) => void;
  clearTransformations: () => void;
  
  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // Actions
  resetUploadState: () => void;
  resetTransformationState: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // API Key state
      hasApiKey: false,
      apiKeyStatus: 'not-configured',
      setApiKeyStatus: (status) => set({ 
        apiKeyStatus: status, 
        hasApiKey: status === 'valid' 
      }),
      
      // Upload state
      uploadedFile: null,
      uploadPreviewUrl: null,
      selectedStyle: null,
      setUploadedFile: (file) => set({ uploadedFile: file }),
      setUploadPreviewUrl: (url) => set({ uploadPreviewUrl: url }),
      setSelectedStyle: (style) => set({ selectedStyle: style }),
      
      // Transformation state
      isTransforming: false,
      transformationProgress: 0,
      transformationError: null,
      setIsTransforming: (isTransforming) => set({ isTransforming }),
      setTransformationProgress: (progress) => set({ transformationProgress: progress }),
      setTransformationError: (error) => set({ transformationError: error }),
      
      // History
      transformations: [],
      addTransformation: (transformation) => set((state) => ({
        transformations: [transformation, ...state.transformations]
      })),
      removeTransformation: (id) => set((state) => ({
        transformations: state.transformations.filter(t => t.id !== id)
      })),
      clearTransformations: () => set({ transformations: [] }),
      
      // UI state
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      // Actions
      resetUploadState: () => set({
        uploadedFile: null,
        uploadPreviewUrl: null,
        selectedStyle: null,
      }),
      resetTransformationState: () => set({
        isTransforming: false,
        transformationProgress: 0,
        transformationError: null,
      }),
    }),
    {
      name: 'style-genie-store', // unique name for localStorage
      partialize: (state) => ({
        // Only persist these fields
        apiKeyStatus: state.apiKeyStatus,
        hasApiKey: state.hasApiKey,
        transformations: state.transformations,
      }),
    }
  )
); 