'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  PermissionStatus,
  requestCameraPermission,
  requestMicrophonePermission,
  requestCameraAndMicrophonePermission,
  requestLocationPermission,
  requestNotificationPermission,
  requestFileSystemPermission,
  requestPersistentStorage as requestPersistentStoragePermission,
  checkCameraPermission,
  checkMicrophonePermission,
  checkLocationPermission,
  checkNotificationPermission,
  checkStoragePermission,
  checkFileSystemSupport,
  getAllPermissionStatuses,
  getStorageInfo
} from '@/utils/permissions';

export interface UsePermissionsOptions {
  role?: 'admin' | 'user';
  allowLocationForUsers?: boolean;
}

export interface UsePermissionsReturn {
  // Status
  camera: PermissionStatus;
  microphone: PermissionStatus;
  location: PermissionStatus;
  notifications: PermissionStatus;
  fileSystem: boolean;
  storage: PermissionStatus;
  storageInfo: { quota: number; usage: number; usageDetails?: any } | null;
  
  // Request functions
  requestCamera: () => Promise<void>;
  requestMicrophone: () => Promise<void>;
  requestCameraAndMicrophone: () => Promise<void>;
  requestLocation: () => Promise<void>;
  requestNotifications: () => Promise<void>;
  requestFileSystem: () => Promise<void>;
  requestPersistentStorage: () => Promise<void>;
  
  // Refresh all permissions
  refresh: () => Promise<void>;
  
  // Loading state
  loading: boolean;
  error: string | null;
}

export function usePermissions(options: UsePermissionsOptions = {}): UsePermissionsReturn {
  const { role = 'user', allowLocationForUsers = true } = options;
  const isAdmin = role === 'admin';
  const allowLocation = isAdmin || allowLocationForUsers;

  const [camera, setCamera] = useState<PermissionStatus>('prompt');
  const [microphone, setMicrophone] = useState<PermissionStatus>('prompt');
  const [location, setLocation] = useState<PermissionStatus>('prompt');
  const [notifications, setNotifications] = useState<PermissionStatus>('prompt');
  const [fileSystem, setFileSystem] = useState<boolean>(false);
  const [storage, setStorage] = useState<PermissionStatus>('prompt');
  const [storageInfo, setStorageInfo] = useState<{ quota: number; usage: number; usageDetails?: any } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statuses = await getAllPermissionStatuses();
      setCamera(statuses.camera);
      setMicrophone(statuses.microphone);
      setLocation(statuses.location);
      setNotifications(statuses.notifications);
      setFileSystem(statuses.fileSystem);
      setStorage(statuses.storage);
      
      const info = await getStorageInfo();
      setStorageInfo(info);
    } catch (err: any) {
      setError(err.message || 'Failed to check permissions');
    } finally {
      setLoading(false);
    }
  }, []);

  const requestCamera = useCallback(async () => {
    if (!isAdmin) {
      setError('Only admins can request camera access.');
      return;
    }
    setError(null);
    const result = await requestCameraPermission();
    if (result.error) {
      setError(result.error);
    }
    setCamera(result.status);
  }, []);

  const requestMicrophone = useCallback(async () => {
    if (!isAdmin) {
      setError('Only admins can request microphone access.');
      return;
    }
    setError(null);
    const result = await requestMicrophonePermission();
    if (result.error) {
      setError(result.error);
    }
    setMicrophone(result.status);
  }, []);

  const requestCameraAndMicrophone = useCallback(async () => {
    if (!isAdmin) {
      setError('Only admins can request camera and microphone access.');
      return;
    }
    setError(null);
    const result = await requestCameraAndMicrophonePermission();
    if (result.error) {
      setError(result.error);
    }
    // Update both statuses
    const [camStatus, micStatus] = await Promise.all([
      checkCameraPermission(),
      checkMicrophonePermission()
    ]);
    setCamera(camStatus);
    setMicrophone(micStatus);
  }, []);

  const requestLocation = useCallback(async () => {
    if (!allowLocation) {
      setError('Location requests are disabled for this role.');
      return;
    }
    setError(null);
    const result = await requestLocationPermission();
    if (result.error) {
      setError(result.error);
    }
    setLocation(result.status);
  }, []);

  const requestNotifications = useCallback(async () => {
    setError(null);
    const result = await requestNotificationPermission();
    if (result.error) {
      setError(result.error);
    }
    setNotifications(result.status);
  }, []);

  const requestFileSystem = useCallback(async () => {
    if (!isAdmin) {
      setError('Only admins can request file system access.');
      return;
    }
    setError(null);
    const result = await requestFileSystemPermission();
    if (result.error) {
      setError(result.error);
    }
    setFileSystem(checkFileSystemSupport());
  }, []);

  const requestPersistentStorage = useCallback(async () => {
    if (!isAdmin) {
      setError('Only admins can request persistent storage.');
      return;
    }
    setError(null);
    const result = await requestPersistentStoragePermission();
    if (result.error) {
      setError(result.error);
    }
    const storageResult = await checkStoragePermission();
    setStorage(storageResult.status);
    const info = await getStorageInfo();
    setStorageInfo(info);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    camera,
    microphone,
    location,
    notifications,
    fileSystem,
    storage,
    storageInfo,
    requestCamera,
    requestMicrophone,
    requestCameraAndMicrophone,
    requestLocation,
    requestNotifications,
    requestFileSystem,
    requestPersistentStorage,
    refresh,
    loading,
    error
  };
}

