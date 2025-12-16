'use client';

import { useEffect, useState } from 'react';
import PermissionsManager from '../components/PermissionsManager';
import Sidenav from '../components/Sidenav';
import Loginnav from '../components/Loginnav';

export default function PermissionsPage() {
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [loadingRole, setLoadingRole] = useState<boolean>(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (!res.ok) {
          setLoadingRole(false);
          return;
        }
        const data = await res.json();
        const fetchedRole = data?.user?.role === 'admin' ? 'admin' : 'user';
        setRole(fetchedRole);
      } catch (err) {
        console.error('Failed to fetch role', err);
      } finally {
        setLoadingRole(false);
      }
    };

    fetchRole();
  }, []);

  return (
    <Sidenav>
      <Loginnav />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Device Permissions</h1>
        <p className="text-muted-foreground mb-6">
          Manage device permissions for camera, microphone, location, notifications, file system, and storage.
        </p>
        {loadingRole ? (
          <p className="text-sm text-muted-foreground">Loading your access level...</p>
        ) : (
          <PermissionsManager role={role} allowLocationForUsers />
        )}
      </div>
    </Sidenav>
  );
}

