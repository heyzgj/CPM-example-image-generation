import { GeminiClient, ImageTransformationRequest, ImageTransformationResult } from './gemini-client';

/**
 * Gemini Service - High-level service for image transformations
 * Integrates with API key management and provides UI-friendly methods
 */
export class GeminiService {
  private static instance: GeminiService | null = null;
  private geminiClient: GeminiClient | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  /**
   * Initialize the service with API key service
   */
  async initialize(): Promise<void> {
    try {
      // Dynamically import the API key service to avoid circular dependencies
      const { apiKeyService } = await import('./api-key-service');
      this.geminiClient = new GeminiClient(apiKeyService);
    } catch (error) {
      console.error('Failed to initialize Gemini service:', error);
      throw new Error('Failed to initialize AI service');
    }
  }

  /**
   * Check if the service is ready to use
   */
  isInitialized(): boolean {
    return this.geminiClient !== null;
  }

  /**
   * Transform an image with AI
   */
  async transformImage(request: ImageTransformationRequest): Promise<ImageTransformationResult> {
    if (!this.geminiClient) {
      return {
        success: false,
        error: 'AI service not initialized. Please try refreshing the page.'
      };
    }

    return this.geminiClient.transformImage(request);
  }

  /**
   * Test the API connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.geminiClient) {
      return {
        success: false,
        error: 'AI service not initialized'
      };
    }

    return this.geminiClient.testConnection();
  }

  /**
   * Generate text using Gemini
   */
  async generateText(prompt: string): Promise<{ success: boolean; text?: string; error?: string }> {
    if (!this.geminiClient) {
      return {
        success: false,
        error: 'AI service not initialized'
      };
    }

    return this.geminiClient.generateText(prompt);
  }
}

// Export a singleton instance
export const geminiService = GeminiService.getInstance(); 