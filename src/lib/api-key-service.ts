/**
 * API Key Management Service
 * Handles secure storage, validation, and management of Gemini API keys
 */

import { encryptApiKey, decryptApiKey, validateApiKeyFormat } from './crypto-utils';
import { STORAGE_KEYS, API_ENDPOINTS } from './constants';

export interface ApiKeyStatus {
  isConfigured: boolean;
  isValid: boolean;
  lastValidated: Date | null;
  error: string | null;
}

export interface StoredApiKey {
  encryptedKey: string;
  salt: string;
  iv: string;
  createdAt: string;
  lastUsed: string;
  isActive: boolean;
}

/**
 * IndexedDB configuration
 */
const DB_CONFIG = {
  name: 'SecureKeyStore',
  version: 1,
  objectStore: 'apiKeys',
  keyPath: 'id',
} as const;

/**
 * IndexedDB utility class
 */
class IndexedDBStore {
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(DB_CONFIG.objectStore)) {
          db.createObjectStore(DB_CONFIG.objectStore, { keyPath: DB_CONFIG.keyPath });
        }
      };
    });
  }

  async store(key: string, data: StoredApiKey): Promise<void> {
    if (!this.db) await this.initialize();
    if (!this.db) throw new Error('IndexedDB not available');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DB_CONFIG.objectStore], 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.objectStore);
      const request = store.put({ id: key, ...data });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async retrieve(key: string): Promise<StoredApiKey | null> {
    if (!this.db) await this.initialize();
    if (!this.db) throw new Error('IndexedDB not available');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DB_CONFIG.objectStore], 'readonly');
      const store = transaction.objectStore(DB_CONFIG.objectStore);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // Remove the 'id' field before returning
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id: _id, ...storedData } = result;
          resolve(storedData as StoredApiKey);
        } else {
          resolve(null);
        }
      };
    });
  }

  async delete(key: string): Promise<void> {
    if (!this.db) await this.initialize();
    if (!this.db) throw new Error('IndexedDB not available');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DB_CONFIG.objectStore], 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.objectStore);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

/**
 * API Key Management Service
 */
class ApiKeyService {
  private currentApiKey: string | null = null;
  private lastValidationTime: Date | null = null;
  private validationCache: Map<string, { isValid: boolean; timestamp: Date }> = new Map();
  private idbStore = new IndexedDBStore();
  private useIndexedDB = true;

  /**
   * Store an API key securely
   */
  async storeApiKey(apiKey: string): Promise<void> {
    // Validate format first
    if (!validateApiKeyFormat(apiKey)) {
      throw new Error('Invalid API key format. Gemini API keys should start with "AIza" and be 39 characters long.');
    }

    try {
      // Encrypt the API key
      const { encryptedKey, salt, iv } = await encryptApiKey(apiKey);
      
      // Prepare storage object
      const storedKey: StoredApiKey = {
        encryptedKey,
        salt,
        iv,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        isActive: true,
      };

      // Try IndexedDB first, fallback to localStorage
      try {
        if (this.useIndexedDB) {
          await this.idbStore.store(STORAGE_KEYS.API_KEY, storedKey);
          console.log('API key stored successfully in IndexedDB');
        }
      } catch (idbError) {
        console.warn('IndexedDB failed, falling back to localStorage:', idbError);
        this.useIndexedDB = false;
        localStorage.setItem(STORAGE_KEYS.API_KEY, JSON.stringify(storedKey));
        console.log('API key stored successfully in localStorage (fallback)');
      }
      
      // Clear validation cache
      this.validationCache.clear();
      this.currentApiKey = apiKey;
      
    } catch (error) {
      console.error('Failed to store API key:', error);
      throw new Error('Failed to store API key securely');
    }
  }

  /**
   * Retrieve and decrypt the stored API key
   */
  async getApiKey(): Promise<string | null> {
    // Return cached key if available
    if (this.currentApiKey) {
      return this.currentApiKey;
    }

    try {
      let storedKey: StoredApiKey | null = null;

      // Try IndexedDB first, fallback to localStorage
      if (this.useIndexedDB) {
        try {
          storedKey = await this.idbStore.retrieve(STORAGE_KEYS.API_KEY);
        } catch (idbError) {
          console.warn('IndexedDB retrieval failed, falling back to localStorage:', idbError);
          this.useIndexedDB = false;
        }
      }

      // Fallback to localStorage if IndexedDB failed or returned null
      if (!storedKey) {
        const storedData = localStorage.getItem(STORAGE_KEYS.API_KEY);
        if (storedData) {
          storedKey = JSON.parse(storedData);
        }
      }

      if (!storedKey) {
        return null;
      }

      // Decrypt the API key
      const apiKey = await decryptApiKey(
        storedKey.encryptedKey,
        storedKey.salt,
        storedKey.iv
      );

      // Update last used timestamp
      storedKey.lastUsed = new Date().toISOString();
      
      // Store updated timestamp
      try {
        if (this.useIndexedDB) {
          await this.idbStore.store(STORAGE_KEYS.API_KEY, storedKey);
        } else {
          localStorage.setItem(STORAGE_KEYS.API_KEY, JSON.stringify(storedKey));
        }
      } catch (error) {
        console.warn('Failed to update last used timestamp:', error);
      }

      // Cache the decrypted key
      this.currentApiKey = apiKey;
      return apiKey;
    } catch (error) {
      console.error('Failed to retrieve API key:', error);
      throw new Error('Failed to retrieve API key');
    }
  }

  /**
   * Validate API key against Gemini API
   */
  async validateApiKey(apiKey?: string): Promise<boolean> {
    const keyToValidate = apiKey || await this.getApiKey();
    
    if (!keyToValidate) {
      return false;
    }

    // Check validation cache (5 minute cache)
    const cached = this.validationCache.get(keyToValidate);
    if (cached && Date.now() - cached.timestamp.getTime() < 5 * 60 * 1000) {
      return cached.isValid;
    }

    try {
      // Test the API key with a minimal request
      const response = await fetch(`${API_ENDPOINTS.GEMINI_BASE}/models/gemini-2.0-flash:generateContent?key=${keyToValidate}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello'
            }]
          }]
        })
      });

      const isValid = response.status !== 401 && response.status !== 403;
      
      // Cache the result
      this.validationCache.set(keyToValidate, {
        isValid,
        timestamp: new Date()
      });

      this.lastValidationTime = new Date();
      
      return isValid;
    } catch (error) {
      console.error('API key validation failed:', error);
      
      // Cache negative result for shorter time (1 minute)
      this.validationCache.set(keyToValidate, {
        isValid: false,
        timestamp: new Date()
      });
      
      return false;
    }
  }

  /**
   * Get current API key status
   */
  async getApiKeyStatus(): Promise<ApiKeyStatus> {
    try {
      const apiKey = await this.getApiKey();
      
      if (!apiKey) {
        return {
          isConfigured: false,
          isValid: false,
          lastValidated: null,
          error: null,
        };
      }

      // Check if we have a recent validation result
      const cached = this.validationCache.get(apiKey);
      let isValid = false;
      let error: string | null = null;

      if (cached && Date.now() - cached.timestamp.getTime() < 5 * 60 * 1000) {
        isValid = cached.isValid;
      } else {
        // Validate the key
        try {
          isValid = await this.validateApiKey(apiKey);
        } catch {
          error = 'Failed to validate API key';
        }
      }

      return {
        isConfigured: true,
        isValid,
        lastValidated: this.lastValidationTime,
        error,
      };
    } catch {
      return {
        isConfigured: false,
        isValid: false,
        lastValidated: null,
        error: 'Failed to retrieve API key status',
      };
    }
  }

  /**
   * Delete stored API key
   */
  async deleteApiKey(): Promise<void> {
    try {
      // Try IndexedDB first
      if (this.useIndexedDB) {
        try {
          await this.idbStore.delete(STORAGE_KEYS.API_KEY);
        } catch (idbError) {
          console.warn('IndexedDB deletion failed, trying localStorage:', idbError);
          this.useIndexedDB = false;
        }
      }

      // Also clear localStorage (for fallback cases)
      localStorage.removeItem(STORAGE_KEYS.API_KEY);

      this.currentApiKey = null;
      this.validationCache.clear();
      this.lastValidationTime = null;
      console.log('API key deleted successfully');
    } catch (error) {
      console.error('Failed to delete API key:', error);
      throw new Error('Failed to delete API key');
    }
  }

  /**
   * Check if API key is configured
   */
  async hasApiKey(): Promise<boolean> {
    try {
      // Check IndexedDB first if available
      if (this.useIndexedDB) {
        const storedKey = await this.idbStore.retrieve(STORAGE_KEYS.API_KEY);
        if (storedKey) return true;
      }
      
      // Fallback to localStorage
      const storedData = localStorage.getItem(STORAGE_KEYS.API_KEY);
      return !!storedData;
    } catch {
      // Fallback to localStorage only
      const storedData = localStorage.getItem(STORAGE_KEYS.API_KEY);
      return !!storedData;
    }
  }

  /**
   * Get API key metadata (without exposing the key)
   */
  async getApiKeyMetadata(): Promise<{
    createdAt: Date | null;
    lastUsed: Date | null;
    hasKey: boolean;
  }> {
    try {
      let storedKey: StoredApiKey | null = null;

      // Try IndexedDB first
      if (this.useIndexedDB) {
        try {
          storedKey = await this.idbStore.retrieve(STORAGE_KEYS.API_KEY);
        } catch {
          this.useIndexedDB = false;
        }
      }

      // Fallback to localStorage
      if (!storedKey) {
        const storedData = localStorage.getItem(STORAGE_KEYS.API_KEY);
        if (storedData) {
          storedKey = JSON.parse(storedData);
        }
      }
      
      if (!storedKey) {
        return {
          createdAt: null,
          lastUsed: null,
          hasKey: false,
        };
      }

      return {
        createdAt: new Date(storedKey.createdAt),
        lastUsed: new Date(storedKey.lastUsed),
        hasKey: true,
      };
    } catch (error) {
      console.error('Failed to get API key metadata:', error);
      return {
        createdAt: null,
        lastUsed: null,
        hasKey: false,
      };
    }
  }

  /**
   * Update API key (replace existing)
   */
  async updateApiKey(newApiKey: string): Promise<void> {
    // Delete existing key first
    await this.deleteApiKey();
    
    // Store new key
    await this.storeApiKey(newApiKey);
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.currentApiKey = null;
    this.validationCache.clear();
    this.lastValidationTime = null;
  }

  /**
   * Test API connection with current key
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const isValid = await this.validateApiKey();
      
      if (isValid) {
        return { success: true };
      } else {
        return { 
          success: false, 
          error: 'API key is invalid or has insufficient permissions' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      };
    }
  }
}

// Export singleton instance
export const apiKeyService = new ApiKeyService(); 