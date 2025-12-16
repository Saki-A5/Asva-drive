'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';

type Props = {
  role?: 'admin' | 'user';
  allowLocationForUsers?: boolean;
};

export default function PermissionsManager({ role = 'user', allowLocationForUsers = true }: Props) {
  const isAdmin = role === 'admin';

  const {
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
  } = usePermissions({ role, allowLocationForUsers });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'granted':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'denied':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'unsupported':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading permissions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Role: <span className="font-semibold uppercase">{role}</span>
        </p>
        {!isAdmin && (
          <p className="text-xs text-muted-foreground">
            Camera, microphone, file system, and storage are restricted to admins.
          </p>
        )}
      </div>

      {error && (
        <Card className="border-red-500">
          <CardContent className="p-4">
            <p className="text-red-500 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isAdmin && (
          <>
            {/* Camera Permission */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(camera)}
                  Camera
                </CardTitle>
                <CardDescription>Status: {camera}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={requestCamera}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={camera === 'granted' || camera === 'unsupported'}
                >
                  Request Camera Access
                </Button>
              </CardContent>
            </Card>

            {/* Microphone Permission */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(microphone)}
                  Microphone
                </CardTitle>
                <CardDescription>Status: {microphone}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={requestMicrophone}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={microphone === 'granted' || microphone === 'unsupported'}
                >
                  Request Microphone Access
                </Button>
              </CardContent>
            </Card>

            {/* Camera & Microphone Combined */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(camera === 'granted' && microphone === 'granted' ? 'granted' : 'prompt')}
                  Camera & Microphone
                </CardTitle>
                <CardDescription>Request both at once</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={requestCameraAndMicrophone}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={false}
                >
                  Request Both
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* Location Permission (optional for users, always for admin) */}
        {(isAdmin || allowLocationForUsers) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(location)}
                Location
              </CardTitle>
              <CardDescription>Status: {location}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={requestLocation}
                variant="outline"
                size="sm"
                className="w-full"
                disabled={location === 'granted' || location === 'unsupported'}
              >
                Request Location Access
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Notifications Permission (allowed for all) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(notifications)}
              Notifications
            </CardTitle>
            <CardDescription>Status: {notifications}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={requestNotifications}
              variant="outline"
              size="sm"
              className="w-full"
              disabled={notifications === 'granted' || notifications === 'unsupported'}
            >
              Request Notifications
            </Button>
          </CardContent>
        </Card>

        {isAdmin && (
          <>
            {/* File System Permission */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {fileSystem ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  File System
                </CardTitle>
                <CardDescription>
                  {fileSystem ? 'Supported' : 'Not supported'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={requestFileSystem}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={!fileSystem}
                >
                  Request File Access
                </Button>
              </CardContent>
            </Card>

            {/* Storage Permission */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(storage)}
                  Storage
                </CardTitle>
                <CardDescription>Status: {storage}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {storageInfo && (
                  <div className="text-sm space-y-1">
                    <p>Usage: {formatBytes(storageInfo.usage)}</p>
                    <p>Quota: {formatBytes(storageInfo.quota)}</p>
                  </div>
                )}
                <Button
                  onClick={requestPersistentStorage}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={storage === 'unsupported'}
                >
                  Request Persistent Storage
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <Button onClick={refresh} variant="outline" className="w-full">
            Refresh All Permissions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

