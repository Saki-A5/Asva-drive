/**
 * Comprehensive device permissions utility for web applications
 * Handles: Camera, Microphone, Location, Notifications, Calendar, File System, and Storage permissions
 */

export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unsupported';

export interface PermissionResult {
  status: PermissionStatus;
  error?: string;
}

/**
 * Camera Permission
 */
export async function requestCameraPermission(): Promise<PermissionResult> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { status: 'unsupported', error: 'Camera API not supported in this browser' };
    }

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // Stop the stream immediately as we only needed it to request permission
    stream.getTracks().forEach(track => track.stop());

    // If we got here without throwing, permission was effectively granted
    return { status: 'granted' };
  } catch (error: any) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return { status: 'denied', error: 'Camera permission denied' };
    }
    return { status: 'denied', error: error.message || 'Failed to request camera permission' };
  }
}

export async function checkCameraPermission(): Promise<PermissionStatus> {
  try {
    // Many browsers don't expose camera via Permissions API; treat as prompt by default
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return 'unsupported';
    }
    return 'prompt';
  } catch {
    return 'unsupported';
  }
}

/**
 * Microphone Permission
 */
export async function requestMicrophonePermission(): Promise<PermissionResult> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { status: 'unsupported', error: 'Microphone API not supported in this browser' };
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop the stream immediately as we only needed it to request permission
    stream.getTracks().forEach(track => track.stop());

    // If we got here without throwing, permission was effectively granted
    return { status: 'granted' };
  } catch (error: any) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return { status: 'denied', error: 'Microphone permission denied' };
    }
    return { status: 'denied', error: error.message || 'Failed to request microphone permission' };
  }
}

export async function checkMicrophonePermission(): Promise<PermissionStatus> {
  try {
    // Many browsers don't expose microphone via Permissions API; treat as prompt by default
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return 'unsupported';
    }
    return 'prompt';
  } catch {
    return 'unsupported';
  }
}

/**
 * Camera and Microphone Permission (combined)
 */
export async function requestCameraAndMicrophonePermission(): Promise<PermissionResult> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { status: 'unsupported', error: 'Media devices API not supported in this browser' };
    }

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    stream.getTracks().forEach(track => track.stop());

    // If we got here without throwing, both permissions were effectively granted
    return { status: 'granted' };
  } catch (error: any) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return { status: 'denied', error: 'Media permissions denied' };
    }
    return { status: 'denied', error: error.message || 'Failed to request media permissions' };
  }
}

/**
 * Location Permission
 */
export async function requestLocationPermission(): Promise<PermissionResult> {
  try {
    if (!navigator.geolocation) {
      return { status: 'unsupported', error: 'Geolocation API not supported in this browser' };
    }

    // Request permission by attempting to get position
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async () => {
          // Check the actual permission status
          try {
            const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
            resolve({ status: permissionStatus.state as PermissionStatus });
          } catch {
            resolve({ status: 'granted' });
          }
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            resolve({ status: 'denied', error: 'Location permission denied' });
          } else {
            resolve({ status: 'denied', error: error.message || 'Failed to request location permission' });
          }
        },
        { timeout: 1000 }
      );
    });
  } catch (error: any) {
    return { status: 'denied', error: error.message || 'Failed to request location permission' };
  }
}

export async function checkLocationPermission(): Promise<PermissionStatus> {
  try {
    if (!navigator.permissions) {
      return 'unsupported';
    }
    const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    return permissionStatus.state as PermissionStatus;
  } catch {
    return 'unsupported';
  }
}

/**
 * Notification Permission
 */
export async function requestNotificationPermission(): Promise<PermissionResult> {
  try {
    if (!('Notification' in window)) {
      return { status: 'unsupported', error: 'Notifications not supported in this browser' };
    }

    const permission = await Notification.requestPermission();
    return { status: permission as PermissionStatus };
  } catch (error: any) {
    return { status: 'denied', error: error.message || 'Failed to request notification permission' };
  }
}

export async function checkNotificationPermission(): Promise<PermissionStatus> {
  try {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission as PermissionStatus;
  } catch {
    return 'unsupported';
  }
}

/**
 * Calendar Permission
 * Note: There's no native browser Calendar API permission.
 * This checks for Web Share API support which can be used to share calendar events,
 * and the ability to create/download .ics files for calendar integration.
 * 
 * On mobile devices:
 * - Web Share API is widely supported and can share to calendar apps
 * - .ics files can be downloaded and opened in calendar apps
 * 
 * On desktop:
 * - .ics files can be downloaded and imported into calendar apps
 * - Web Share API support varies by browser
 */
export async function requestCalendarPermission(): Promise<PermissionResult> {
  try {
    // Check if we're on a mobile device (better calendar integration support)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Check if Web Share API is available (can be used to share calendar events)
    if ('share' in navigator) {
      // Web Share API is available - we can share calendar events
      // On mobile, this opens the native share sheet with calendar apps
      // The permission is requested when share() is called, so we return 'prompt'
      // to indicate it's available but requires user interaction
      return { 
        status: 'prompt',
        // Add helpful message for mobile users
        ...(isMobile ? {} : {})
      };
    }
    
    // If Web Share API is not available, we can still create .ics files
    // (which is always possible, so we return 'granted' for file-based calendar access)
    // On mobile, .ics files typically open directly in the calendar app
    return { status: 'granted' };
  } catch (error: any) {
    return { status: 'denied', error: error.message || 'Failed to check calendar access' };
  }
}

export async function checkCalendarPermission(): Promise<PermissionStatus> {
  try {
    // Check if we're on a mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Check if Web Share API is available
    if ('share' in navigator) {
      // Web Share API is available - can share calendar events
      // On mobile devices, this is the preferred method as it opens native calendar apps
      // Since there's no persistent permission state for Web Share API,
      // we return 'prompt' to indicate it's available
      return 'prompt';
    }
    
    // Web Share API not available, but we can still create .ics files
    // This is always available and works on both mobile and desktop
    // On mobile, .ics files typically open directly in the calendar app
    return 'granted';
  } catch {
    return 'unsupported';
  }
}

/**
 * File System Permission (File System Access API)
 */
export async function requestFileSystemPermission(): Promise<PermissionResult> {
  try {
    if (!('showOpenFilePicker' in window)) {
      return { status: 'unsupported', error: 'File System Access API not supported in this browser' };
    }

    // Request permission by attempting to open a file picker
    // Note: This will show a file picker dialog, which is the way to request permission
    const fileHandle = await (window as any).showOpenFilePicker({
      multiple: false,
      types: [{
        description: 'Test file',
        accept: { 'text/*': ['.txt'] }
      }]
    });
    
    // Close the file handle immediately
    if (fileHandle && fileHandle.length > 0) {
      await fileHandle[0].close?.();
    }
    
    return { status: 'granted' };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { status: 'denied', error: 'File system permission cancelled' };
    }
    if (error.name === 'SecurityError') {
      return { status: 'denied', error: 'File system permission denied' };
    }
    return { status: 'denied', error: error.message || 'Failed to request file system permission' };
  }
}

/**
 * Check if File System Access API is available
 */
export function checkFileSystemSupport(): boolean {
  return 'showOpenFilePicker' in window || 'showDirectoryPicker' in window;
}

/**
 * Storage Permission (IndexedDB, localStorage, etc.)
 * Note: Storage APIs don't require explicit permission, but we can check if they're available
 */
export async function checkStoragePermission(): Promise<PermissionResult> {
  try {
    // Check localStorage
    const testKey = '__storage_test__';
    try {
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (e) {
      return { status: 'denied', error: 'localStorage is not available' };
    }

    // Check IndexedDB
    if (!('indexedDB' in window)) {
      return { status: 'unsupported', error: 'IndexedDB not supported' };
    }

    return { status: 'granted' };
  } catch (error: any) {
    return { status: 'denied', error: error.message || 'Storage not available' };
  }
}

/**
 * Request persistent storage (for browsers that support it)
 */
export async function requestPersistentStorage(): Promise<PermissionResult> {
  try {
    if (!navigator.storage || !navigator.storage.persist) {
      return { status: 'unsupported', error: 'Persistent storage API not supported' };
    }

    const isPersistent = await navigator.storage.persist();
    if (isPersistent) {
      return { status: 'granted' };
    } else {
      return { status: 'denied', error: 'Persistent storage permission denied' };
    }
  } catch (error: any) {
    return { status: 'denied', error: error.message || 'Failed to request persistent storage' };
  }
}

/**
 * Check storage quota and usage
 */
export async function getStorageInfo(): Promise<{
  quota: number;
  usage: number;
  usageDetails?: any;
} | null> {
  try {
    if (!navigator.storage || !navigator.storage.estimate) {
      return null;
    }

    const estimate = await navigator.storage.estimate();
    return {
      quota: estimate.quota || 0,
      usage: estimate.usage || 0,
      usageDetails: (estimate as any).usageDetails
    };
  } catch {
    return null;
  }
}

/**
 * Get all permission statuses at once
 */
export async function getAllPermissionStatuses(): Promise<{
  camera: PermissionStatus;
  microphone: PermissionStatus;
  location: PermissionStatus;
  notifications: PermissionStatus;
  calendar: PermissionStatus;
  fileSystem: boolean;
  storage: PermissionStatus;
}> {
  const [camera, microphone, location, notifications, calendar, fileSystem, storage] = await Promise.all([
    checkCameraPermission(),
    checkMicrophonePermission(),
    checkLocationPermission(),
    checkNotificationPermission(),
    checkCalendarPermission(),
    Promise.resolve(checkFileSystemSupport()),
    checkStoragePermission().then(result => result.status)
  ]);

  return {
    camera,
    microphone,
    location,
    notifications,
    calendar,
    fileSystem,
    storage
  };
}

