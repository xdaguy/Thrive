/**
 * Data Encryption Utilities
 * 
 * Encrypts sensitive data before storing in IndexedDB
 * Uses Web Crypto API for strong encryption
 */

// Encryption configuration
const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12 // 96 bits for GCM
const SALT_LENGTH = 16

interface EncryptedData {
  encrypted: string // Base64 encoded
  iv: string // Base64 encoded
  salt: string // Base64 encoded
}

/**
 * Derive encryption key from password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  )
  
  // Derive key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000, // OWASP recommendation
      hash: 'SHA-256'
    },
    keyMaterial,
    {
      name: ALGORITHM,
      length: KEY_LENGTH
    },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Generate device fingerprint as encryption password
 * Uses combination of browser/device properties
 */
function getDeviceFingerprint(): string {
  // Create a unique device ID from available info
  const components = [
    navigator.userAgent,
    navigator.language,
    navigator.hardwareConcurrency?.toString() || '',
    screen.width?.toString() || '',
    screen.height?.toString() || '',
    new Date().getTimezoneOffset().toString(),
  ]
  
  // Add a user-specific component (stored in localStorage)
  let deviceId = localStorage.getItem('device_id')
  if (!deviceId) {
    deviceId = crypto.randomUUID()
    localStorage.setItem('device_id', deviceId)
  }
  components.push(deviceId)
  
  // Hash all components together
  return components.join('|')
}

/**
 * Encrypt data
 */
export async function encryptData(data: any): Promise<EncryptedData> {
  try {
    const password = getDeviceFingerprint()
    
    // Generate salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
    
    // Derive key
    const key = await deriveKey(password, salt)
    
    // Convert data to bytes
    const encoder = new TextEncoder()
    const dataBytes = encoder.encode(JSON.stringify(data))
    
    // Encrypt
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv
      },
      key,
      dataBytes
    )
    
    // Convert to base64 for storage
    const encrypted = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)))
    const ivBase64 = btoa(String.fromCharCode(...iv))
    const saltBase64 = btoa(String.fromCharCode(...salt))
    
    return {
      encrypted,
      iv: ivBase64,
      salt: saltBase64
    }
  } catch (error) {
    console.error('Encryption failed:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt data
 */
export async function decryptData(encryptedData: EncryptedData): Promise<any> {
  try {
    const password = getDeviceFingerprint()
    
    // Decode from base64
    const encrypted = Uint8Array.from(atob(encryptedData.encrypted), c => c.charCodeAt(0))
    const iv = Uint8Array.from(atob(encryptedData.iv), c => c.charCodeAt(0))
    const salt = Uint8Array.from(atob(encryptedData.salt), c => c.charCodeAt(0))
    
    // Derive key
    const key = await deriveKey(password, salt)
    
    // Decrypt
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv
      },
      key,
      encrypted
    )
    
    // Convert back to string and parse JSON
    const decoder = new TextDecoder()
    const decryptedString = decoder.decode(decryptedBuffer)
    
    return JSON.parse(decryptedString)
  } catch (error) {
    console.error('Decryption failed:', error)
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Check if data is encrypted
 */
export function isEncrypted(data: any): data is EncryptedData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.encrypted === 'string' &&
    typeof data.iv === 'string' &&
    typeof data.salt === 'string'
  )
}

/**
 * Encrypt specific fields in an object
 */
export async function encryptFields(obj: any, fields: string[]): Promise<any> {
  const result = { ...obj }
  
  for (const field of fields) {
    if (result[field] !== undefined && result[field] !== null) {
      result[field] = await encryptData(result[field])
    }
  }
  
  return result
}

/**
 * Decrypt specific fields in an object
 */
export async function decryptFields(obj: any, fields: string[]): Promise<any> {
  const result = { ...obj }
  
  for (const field of fields) {
    if (isEncrypted(result[field])) {
      result[field] = await decryptData(result[field])
    }
  }
  
  return result
}

/**
 * Hash data (one-way, for verification)
 */
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
