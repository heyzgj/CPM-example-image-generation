import { GeminiService } from '../gemini-service'
import { GeminiClient } from '../gemini-client'

// Mock the GeminiClient
jest.mock('../gemini-client')
const MockedGeminiClient = GeminiClient as jest.MockedClass<typeof GeminiClient>

// Mock the API key service
jest.mock('../api-key-service', () => ({
  apiKeyService: {
    getApiKey: jest.fn(),
    isApiKeySet: jest.fn(),
  }
}))

describe('GeminiService', () => {
  let geminiService: GeminiService
  let mockGeminiClient: jest.Mocked<GeminiClient>

  beforeEach(() => {
    jest.clearAllMocks()
    geminiService = GeminiService.getInstance()
    
    // Create a mock instance
    mockGeminiClient = {
      transformImage: jest.fn(),
      testConnection: jest.fn(),
      generateText: jest.fn(),
    } as Partial<GeminiClient> as jest.Mocked<GeminiClient>

    MockedGeminiClient.mockImplementation(() => mockGeminiClient)
  })

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await expect(geminiService.initialize()).resolves.not.toThrow()
      expect(geminiService.isInitialized()).toBe(true)
    })

    it('should handle initialization errors', async () => {
      MockedGeminiClient.mockImplementation(() => {
        throw new Error('Initialization failed')
      })

      await expect(geminiService.initialize()).rejects.toThrow('Failed to initialize AI service')
    })
  })

  describe('transformImage', () => {
    const mockRequest = {
      image: new File(['test image'], 'test.jpg', { type: 'image/jpeg' }),
      style: 'renaissance',
      prompt: 'Transform this image in Renaissance style'
    }

    it('should transform image successfully when initialized', async () => {
      await geminiService.initialize()
      
      const mockResult = {
        success: true,
        transformedImage: 'data:image/jpeg;base64,dGVzdA==',
        originalPrompt: 'Transform this image in Renaissance style',
        generatedText: 'A beautiful transformation',
        usage: { promptTokens: 1000, completionTokens: 500, totalTokens: 1500 }
      }

      mockGeminiClient.transformImage.mockResolvedValue(mockResult)

      const result = await geminiService.transformImage(mockRequest)

      expect(result).toEqual(mockResult)
      expect(mockGeminiClient.transformImage).toHaveBeenCalledWith(mockRequest)
    })

    it('should return error when not initialized', async () => {
      // Reset the client to simulate uninitialized state
      ;(geminiService as unknown as { geminiClient: null }).geminiClient = null
      
      const result = await geminiService.transformImage(mockRequest)

      expect(result.success).toBe(false)
      expect(result.error).toContain('AI service not initialized')
    })

    it('should handle transformation errors', async () => {
      await geminiService.initialize()
      
      const mockError = {
        success: false,
        error: 'Transformation failed'
      }

      mockGeminiClient.transformImage.mockResolvedValue(mockError)

      const result = await geminiService.transformImage(mockRequest)

      expect(result).toEqual(mockError)
    })
  })

  describe('testConnection', () => {
    it('should test connection successfully when initialized', async () => {
      await geminiService.initialize()
      
      const mockResult = { success: true }
      mockGeminiClient.testConnection.mockResolvedValue(mockResult)

      const result = await geminiService.testConnection()

      expect(result).toEqual(mockResult)
      expect(mockGeminiClient.testConnection).toHaveBeenCalled()
    })

    it('should return error when not initialized', async () => {
      // Reset the client to simulate uninitialized state
      ;(geminiService as unknown as { geminiClient: null }).geminiClient = null
      
      const result = await geminiService.testConnection()

      expect(result.success).toBe(false)
      expect(result.error).toContain('AI service not initialized')
    })
  })

  describe('generateText', () => {
    it('should generate text successfully when initialized', async () => {
      await geminiService.initialize()
      
      const mockResult = {
        success: true,
        text: 'Generated text'
      }

      mockGeminiClient.generateText.mockResolvedValue(mockResult)

      const result = await geminiService.generateText('test prompt')

      expect(result).toEqual(mockResult)
      expect(mockGeminiClient.generateText).toHaveBeenCalledWith('test prompt')
    })

    it('should return error when not initialized', async () => {
      // Reset the client to simulate uninitialized state
      ;(geminiService as unknown as { geminiClient: null }).geminiClient = null
      
      const result = await geminiService.generateText('test prompt')

      expect(result.success).toBe(false)
      expect(result.error).toContain('AI service not initialized')
    })
  })

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = GeminiService.getInstance()
      const instance2 = GeminiService.getInstance()

      expect(instance1).toBe(instance2)
    })
  })
}) 