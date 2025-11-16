/**
 * Device Identification
 * 
 * Generates and persists a unique device ID for sync tracking.
 */

const DEVICE_ID_KEY = 'thrive_device_id'
const DEVICE_NAME_KEY = 'thrive_device_name'

/**
 * Generate a unique device ID
 */
function generateDeviceId(): string {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 15)
  return `device_${timestamp}_${randomPart}`
}

/**
 * Get browser/device name
 */
function getBrowserName(): string {
  const ua = navigator.userAgent
  
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Edge')) return 'Edge'
  if (ua.includes('Opera')) return 'Opera'
  
  return 'Unknown Browser'
}

/**
 * Get platform name
 */
function getPlatformName(): string {
  const ua = navigator.userAgent
  
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Mac')) return 'macOS'
  if (ua.includes('Linux')) return 'Linux'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  
  return 'Unknown'
}

/**
 * Get or create device ID
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') {
    return 'server_device'
  }
  
  let deviceId = localStorage.getItem(DEVICE_ID_KEY)
  
  if (!deviceId) {
    deviceId = generateDeviceId()
    localStorage.setItem(DEVICE_ID_KEY, deviceId)
  }
  
  return deviceId
}

/**
 * Get or create device name
 */
export function getDeviceName(): string {
  if (typeof window === 'undefined') {
    return 'Server'
  }
  
  let deviceName = localStorage.getItem(DEVICE_NAME_KEY)
  
  if (!deviceName) {
    const browser = getBrowserName()
    const platform = getPlatformName()
    deviceName = `${browser} on ${platform}`
    localStorage.setItem(DEVICE_NAME_KEY, deviceName)
  }
  
  return deviceName
}

/**
 * Set custom device name
 */
export function setDeviceName(name: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DEVICE_NAME_KEY, name)
  }
}

/**
 * Get device info
 */
export function getDeviceInfo() {
  return {
    id: getDeviceId(),
    name: getDeviceName(),
    browser: getBrowserName(),
    platform: getPlatformName(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
  }
}
