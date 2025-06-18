import type { StyleType } from "./schemas";

// API Endpoints
export const API_ENDPOINTS = {
  GEMINI_BASE: 'https://generativelanguage.googleapis.com/v1beta',
  MODELS: {
    GEMINI_2_FLASH: 'gemini-2.0-flash',
    GEMINI_2_FLASH_EXP: 'gemini-2.0-flash-exp',
    GEMINI_2_FLASH_LITE: 'gemini-2.0-flash-lite',
  }
} as const;

// Art style presets available in the app
export const STYLE_PRESETS: StyleType[] = [
  {
    id: "van-gogh",
    name: "Van Gogh",
    thumbnailUrl: "/styles/van-gogh.jpg", // These will be added later
  },
  {
    id: "watercolor",
    name: "Watercolor",
    thumbnailUrl: "/styles/watercolor.jpg",
  },
  {
    id: "oil-painting",
    name: "Oil Painting", 
    thumbnailUrl: "/styles/oil-painting.jpg",
  },
  {
    id: "pop-art",
    name: "Pop Art",
    thumbnailUrl: "/styles/pop-art.jpg",
  },
  {
    id: "anime",
    name: "Anime",
    thumbnailUrl: "/styles/anime.jpg",
  },
  {
    id: "sketch",
    name: "Sketch",
    thumbnailUrl: "/styles/sketch.jpg",
  },
  {
    id: "neo-tokyo",
    name: "Neo-Tokyo",
    thumbnailUrl: "/styles/neo-tokyo.jpg",
  },
  {
    id: "impressionist",
    name: "Impressionist",
    thumbnailUrl: "/styles/impressionist.jpg",
  },
];

// Upload constraints
export const UPLOAD_CONSTRAINTS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB in bytes
  allowedTypes: ['image/jpeg', 'image/png'] as const,
  maxImageDimension: 4096, // pixels
  minImageDimension: 64, // pixels
} as const;

// Error messages
export const ERROR_MESSAGES = {
  invalidFileType: 'Please upload a JPEG or PNG image file.',
  fileTooLarge: 'File size must be less than 10MB.',
  imageTooBig: 'Image dimensions must be less than 4096x4096 pixels.',
  imageTooSmall: 'Image dimensions must be at least 64x64 pixels.',
  networkError: 'Network error. Please check your connection and try again.',
  apiError: 'API error. Please check your API key and try again.',
  unknownError: 'An unexpected error occurred. Please try again.',
} as const;

// Storage keys for client-side storage
export const STORAGE_KEYS = {
  API_KEY: "gemini-api-key",
  apiKey: "gemini-api-key", // Keep both for compatibility
  userPreferences: "user-preferences",
  transformationHistory: "transformation-history",
} as const;

// App configuration
export const APP_CONFIG = {
  name: "AI Image Style Transfer",
  version: "1.0.0",
  description: "Transform your images with AI-powered artistic styles using Google's Gemini 2.0 Flash Preview.",
  maxTransformationsPerDay: 50, // Rate limiting
  cacheTimeout: 5 * 60 * 1000, // 5 minutes in milliseconds
} as const;

// UI constants
export const UI_CONSTANTS = {
  animationDuration: 300, // milliseconds
  toastTimeout: 5000, // milliseconds
  maxHistoryItems: 100,
  thumbnailSize: 256, // pixels
} as const;

// API configuration
export const API_CONFIG = {
  geminiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp:generateContent',
  requestTimeout: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second
} as const;

// Performance targets (from NFRs)
export const PERFORMANCE_TARGETS = {
  maxTransformationTime: 5000, // 5 seconds
  maxConcurrentUsers: 100,
  targetCoverage: 70, // 70% test coverage
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  apiKeySaved: 'API key saved successfully!',
  transformationComplete: 'Image transformation completed!',
  imageDownloaded: 'Image downloaded successfully!',
} as const; 