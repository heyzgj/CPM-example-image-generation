/**
 * Secure cryptographic utilities for API key management
 * Uses Web Crypto API for client-side encryption
 */

// Crypto configuration
const CRYPTO_CONFIG = {
  algorithm: 'AES-GCM',
  keyLength: 256,
  ivLength: 12, // 96 bits
  tagLength: 128, // 128 bits
} as const;

/**
 * Generates a cryptographic key for encryption/decryption
 * Note: Currently unused but kept for potential future use
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: CRYPTO_CONFIG.algorithm,
      length: CRYPTO_CONFIG.keyLength,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Derives a key from a password using PBKDF2
 */
async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    {
      name: CRYPTO_CONFIG.algorithm,
      length: CRYPTO_CONFIG.keyLength,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts data using AES-GCM
 */
async function encryptData(data: string, key: CryptoKey): Promise<{
  encryptedData: ArrayBuffer;
  iv: Uint8Array;
}> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(CRYPTO_CONFIG.ivLength));
  
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: CRYPTO_CONFIG.algorithm,
      iv: iv,
    },
    key,
    encoder.encode(data)
  );

  return { encryptedData, iv };
}

/**
 * Decrypts data using AES-GCM
 */
async function decryptData(
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<string> {
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: CRYPTO_CONFIG.algorithm,
      iv: iv,
    },
    key,
    encryptedData
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
}

/**
 * Generates a device-specific identifier for key derivation
 */
function getDeviceFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset().toString(),
    navigator.hardwareConcurrency?.toString() || '4',
  ];
  
  return components.join('|');
}

/**
 * Creates a salt for key derivation
 */
function createSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Encrypts an API key for secure storage
 */
export async function encryptApiKey(apiKey: string): Promise<{
  encryptedKey: string;
  salt: string;
  iv: string;
}> {
  try {
    // Create salt and derive key from device fingerprint
    const salt = createSalt();
    const deviceFingerprint = getDeviceFingerprint();
    const cryptoKey = await deriveKeyFromPassword(deviceFingerprint, salt);
    
    // Encrypt the API key
    const { encryptedData, iv } = await encryptData(apiKey, cryptoKey);
    
    // Convert to base64 for storage
    return {
      encryptedKey: btoa(String.fromCharCode(...Array.from(new Uint8Array(encryptedData)))),
      salt: btoa(String.fromCharCode(...Array.from(salt))),
      iv: btoa(String.fromCharCode(...Array.from(iv))),
    };
  } catch (error) {
    console.error('Failed to encrypt API key:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypts an API key from secure storage
 */
export async function decryptApiKey(
  encryptedKey: string,
  salt: string,
  iv: string
): Promise<string> {
  try {
    // Convert from base64
    const saltBytes = new Uint8Array(
      atob(salt).split('').map(char => char.charCodeAt(0))
    );
    const ivBytes = new Uint8Array(
      atob(iv).split('').map(char => char.charCodeAt(0))
    );
    const encryptedBytes = new Uint8Array(
      atob(encryptedKey).split('').map(char => char.charCodeAt(0))
    ).buffer;
    
    // Derive key from device fingerprint
    const deviceFingerprint = getDeviceFingerprint();
    const cryptoKey = await deriveKeyFromPassword(deviceFingerprint, saltBytes);
    
    // Decrypt the API key
    return await decryptData(encryptedBytes, cryptoKey, ivBytes);
  } catch (error) {
    console.error('Failed to decrypt API key:', error);
    throw new Error('Decryption failed - API key may be corrupted');
  }
}

/**
 * Validates if a string is a valid Gemini API key format
 */
export function validateApiKeyFormat(apiKey: string): boolean {
  // Gemini API keys typically start with "AIza" and are 39 characters long
  const geminiKeyRegex = /^AIza[A-Za-z0-9_-]{35}$/;
  return geminiKeyRegex.test(apiKey);
}

/**
 * Securely clears sensitive data from memory
 * Note: JavaScript doesn't allow direct memory manipulation,
 * but this function provides a consistent API for security practices
 */
export function secureClear(sensitiveString: string): void {
  // JavaScript doesn't allow direct memory manipulation,
  // but we can help GC by nullifying references
  // Note: The parameter reassignment is intentional for clearing
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sensitiveString = '';
} 