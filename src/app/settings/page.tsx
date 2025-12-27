'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogOut } from 'lucide-react';
import axios from 'axios';
import { getAuth, signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import PermissionsManager from '../components/PermissionsManager';
import Image from 'next/image';
import * as lorelei from '@dicebear/lorelei';
import * as notionists from '@dicebear/notionists';
import * as openPeeps from '@dicebear/open-peeps';
import { getAvatarUrl as getAvatarUrlUtil, AvatarStyle } from '@/utils/avatar';

type SettingsSection = 'general' | 'account' | 'permissions' | 'avatar';

// Generate unique seeds for avatar examples - consistent across renders
const generateSeeds = (styleName: string, count: number): string[] => {
  const baseSeeds = [
    'alice', 'bob', 'charlie', 'diana', 'eve', 'frank', 'grace', 'henry',
    'ivy', 'jack', 'kate', 'liam', 'maya', 'noah', 'olivia', 'peter',
    'quinn', 'ruby', 'sam', 'tara', 'uma', 'victor', 'willa', 'xander',
    'yara', 'zoe', 'adam', 'bella', 'carlos', 'daisy', 'ethan', 'fiona'
  ];
  
  return Array.from({ length: count }, (_, i) => {
    // Use base seed names plus style and index for variety
    const baseSeed = baseSeeds[i % baseSeeds.length];
    return `${styleName}-${baseSeed}-${i}-variant`;
  });
};

type UserInfo = {
  name?: string;
  email?: string;
  matricNumber?: string;
  college?: string;
  department?: string;
  currentLevel?: string;
  avatarStyle?: string;
  avatarSeed?: string;
  [key: string]: string | undefined;
};

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<SettingsSection>('avatar');
  const [user, setUser] = useState<UserInfo | null>(null);
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [loadingRole, setLoadingRole] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [selectedAvatarStyle, setSelectedAvatarStyle] = useState<AvatarStyle>('lorelei');
  const [selectedAvatarSeed, setSelectedAvatarSeed] = useState<string>('');
  
  // General settings state
  const [startPage, setStartPage] = useState<'dashboard' | 'files'>('dashboard');
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'system'>('light');
  const [openPdf, setOpenPdf] = useState<'new-tab' | 'preview'>('new-tab');
  
  // Account edit state
  const [editingFields, setEditingFields] = useState({
    name: '',
    college: '',
    department: '',
    currentLevel: '',
  });

  useEffect(() => {
    const fetchUserAndRole = async () => {
      try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (!res.ok) {
          setLoadingRole(false);
          return;
        }

        const data = await res.json();
        const fetchedUser = data?.user ?? {};
        setUser({
          name: fetchedUser.name,
          email: fetchedUser.email,
          matricNumber: fetchedUser.matricNumber,
          college: fetchedUser.college,
          department: fetchedUser.department,
          currentLevel: fetchedUser.currentLevel,
          avatarStyle: fetchedUser.avatarStyle,
          avatarSeed: fetchedUser.avatarSeed,
        });

        // Initialize edit fields
        setEditingFields({
          name: fetchedUser.name || '',
          college: fetchedUser.college || '',
          department: fetchedUser.department || '',
          currentLevel: fetchedUser.currentLevel || '',
        });

        // Set selected avatar style and seed
        if (fetchedUser.avatarStyle && ['lorelei', 'notionists', 'open-peeps'].includes(fetchedUser.avatarStyle)) {
          setSelectedAvatarStyle(fetchedUser.avatarStyle as AvatarStyle);
          setSelectedAvatarSeed(fetchedUser.avatarSeed || '');
        }

        const fetchedRole = fetchedUser.role === 'admin' ? 'admin' : 'user';
        setRole(fetchedRole);
      } catch (error) {
        console.error('Failed to fetch user info', error);
      } finally {
        setLoadingRole(false);
      }
    };

    fetchUserAndRole();

    // Load saved preferences from localStorage
    const savedStartPage = localStorage.getItem('startPage') as 'dashboard' | 'files' | null;
    const savedAppearance = localStorage.getItem('appearance') as 'light' | 'dark' | 'system' | null;
    const savedOpenPdf = localStorage.getItem('openPdf') as 'new-tab' | 'preview' | null;
    
    if (savedStartPage) setStartPage(savedStartPage);
    if (savedAppearance) {
      setAppearance(savedAppearance);
      setTheme(savedAppearance);
    }
    if (savedOpenPdf) setOpenPdf(savedOpenPdf);
  }, [setTheme]);

  // Sync appearance state with theme changes
  useEffect(() => {
    if (theme && !localStorage.getItem('appearance')) {
      setAppearance(theme as 'light' | 'dark' | 'system');
    }
  }, [theme]);

  const handleSaveAccount = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/auth/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: editingFields.name,
          college: editingFields.college,
          department: editingFields.department,
          currentLevel: editingFields.currentLevel,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      const data = await res.json();
      setUser({
        ...user,
        name: data.user.name,
        college: data.user.college,
        department: data.user.department,
        currentLevel: data.user.currentLevel,
      });
      
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile', error);
      alert(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleStartPageChange = (value: 'dashboard' | 'files') => {
    setStartPage(value);
    localStorage.setItem('startPage', value);
  };

  const handleAppearanceChange = (value: 'light' | 'dark' | 'system') => {
    setAppearance(value);
    localStorage.setItem('appearance', value);
    setTheme(value);
  };

  const handleOpenPdfChange = (value: 'new-tab' | 'preview') => {
    setOpenPdf(value);
    localStorage.setItem('openPdf', value);
  };

  const handleAvatarStyleChange = async (style: AvatarStyle, seed: string) => {
    setSelectedAvatarStyle(style);
    setSelectedAvatarSeed(seed);
    setSavingAvatar(true);
    try {
      const res = await fetch('/api/auth/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          avatarStyle: style,
          avatarSeed: seed,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update avatar');
      }

      const data = await res.json();
      setUser({
        ...user,
        avatarStyle: data.user.avatarStyle,
        avatarSeed: data.user.avatarSeed,
      });
    } catch (error: any) {
      console.error('Failed to update avatar', error);
      alert(error.message || 'Failed to update avatar');
    } finally {
      setSavingAvatar(false);
    }
  };

  // Avatar styles available - 20 examples per category with unique seeds (memoized for consistency)
  const avatarStyleOptions: Array<{ name: AvatarStyle; label: string; style: any; examples: string[] }> = useMemo(() => [
    { 
      name: 'lorelei', 
      label: 'Lorelei', 
      style: lorelei,
      examples: generateSeeds('lorelei', 20)
    },
    { 
      name: 'notionists', 
      label: 'Notionists', 
      style: notionists,
      examples: generateSeeds('notionists', 20)
    },
    { 
      name: 'open-peeps', 
      label: 'Open Peeps', 
      style: openPeeps,
      examples: generateSeeds('open-peeps', 20)
    },
  ], []);

  const getAvatarUrl = (styleName: AvatarStyle, seed: string) => {
    return getAvatarUrlUtil(styleName, seed);
  };

  const renderGeneral = () => (
    <div className="space-y-8">
      {/* Storage */}
      <section className="border p-4 rounded-xl border-border/100 bg-card">
        <h2 className="text-lg font-bold mb-4">Storage</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>5.8GB used from 20GB</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-[30%] bg-primary rounded-full" />
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push('/files')}>
            View items taking storage
          </Button>
        </div>
      </section>

      {/* Start Page */}
      <section className="border p-4 rounded-xl border-border/100 bg-card">
        <h2 className="text-lg font-bold mb-4">Start Page</h2>
        <div className="space-y-3 text-sm">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="start-page"
              checked={startPage === 'dashboard'}
              onChange={() => handleStartPageChange('dashboard')}
              className="h-4 w-4 accent-primary"
            />
            <span>Dashboard</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="start-page"
              checked={startPage === 'files'}
              onChange={() => handleStartPageChange('files')}
              className="h-4 w-4 accent-primary"
            />
            <span>My Files</span>
          </label>
        </div>
      </section>

      {/* Appearance */}
      <section className="border p-4 rounded-xl border-border/100 bg-card">
        <h2 className="text-lg font-bold mb-4">Appearance</h2>
        <div className="space-y-3 text-sm">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="appearance"
              checked={appearance === 'light'}
              onChange={() => handleAppearanceChange('light')}
              className="h-4 w-4 accent-primary"
            />
            <span>Light</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="appearance"
              checked={appearance === 'dark'}
              onChange={() => handleAppearanceChange('dark')}
              className="h-4 w-4 accent-primary"
            />
            <span>Dark</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="appearance"
              checked={appearance === 'system'}
              onChange={() => handleAppearanceChange('system')}
              className="h-4 w-4 accent-primary"
            />
            <span>System Default</span>
          </label>
        </div>
      </section>

      {/* Open PDFs */}
      <section className="border p-4 rounded-xl border-border/100 bg-card">
        <h2 className="text-lg font-bold mb-4">Open PDFs</h2>
        <div className="space-y-3 text-sm">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="open-pdf"
              checked={openPdf === 'new-tab'}
              onChange={() => handleOpenPdfChange('new-tab')}
              className="h-4 w-4 accent-primary"
            />
            <span>New Tab</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="open-pdf"
              checked={openPdf === 'preview'}
              onChange={() => handleOpenPdfChange('preview')}
              className="h-4 w-4 accent-primary"
            />
            <span>Preview</span>
          </label>
        </div>
      </section>

      {/* Account Actions */}
      <section className="border p-4 rounded-xl border-border/100 bg-card">
        <h2 className="text-lg font-bold mb-4">Account Actions</h2>
        <Button
          onClick={handleLogout}
          variant="destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </section>
    </div>
  );

  const renderAccount = () => (
    <div className="space-y-8">
      <section className="border p-4 rounded-xl border-border/100 bg-card">
        <h2 className="text-lg font-bold mb-4">Account</h2>
        <div className="space-y-6 text-sm">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Matriculation Number</p>
            <p className="rounded-md border bg-background px-3 py-2">
              {user?.matricNumber || 'Not set'}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Name</p>
            <Input
              value={editingFields.name}
              onChange={(e) => setEditingFields({ ...editingFields, name: e.target.value })}
              className="rounded-md border bg-background px-3 py-2"
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Email</p>
            <p className="rounded-md border bg-background px-3 py-2">
              {user?.email || 'Not set'}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">College</p>
            <Input
              value={editingFields.college}
              onChange={(e) => setEditingFields({ ...editingFields, college: e.target.value })}
              className="rounded-md border bg-background px-3 py-2"
              placeholder="Enter your college"
            />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Department</p>
            <Input
              value={editingFields.department}
              onChange={(e) => setEditingFields({ ...editingFields, department: e.target.value })}
              className="rounded-md border bg-background px-3 py-2"
              placeholder="Enter your department"
            />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Current Level</p>
            <Input
              value={editingFields.currentLevel}
              onChange={(e) => setEditingFields({ ...editingFields, currentLevel: e.target.value })}
              className="rounded-md border bg-background px-3 py-2"
              placeholder="e.g., 100, 200, 300, 400"
            />
          </div>

          <div className="space-y-2 pt-2">
            <Button
              onClick={handleSaveAccount}
              disabled={saving}
              size="sm"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground">Password</p>
            <Link href="/forgot-password">
              <Button size="sm" variant="outline">
                Change password
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      await axios.post('/api/logout');
      router.push('/login');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const renderPermissions = () => (
    <div className="space-y-4">
      <section className="border p-4 rounded-xl border-border/100 bg-card">
        <h2 className="text-lg font-bold mb-2">Permissions</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Manage device permissions for camera, microphone, location, notifications, file system,
          and storage.
        </p>
        {loadingRole ? (
          <p className="text-sm text-muted-foreground">Loading your access level...</p>
        ) : (
          <PermissionsManager role={role} allowLocationForUsers />
        )}
      </section>
    </div>
  );

  const renderAvatar = () => (
    <div className="space-y-8">
      <section className="border p-4 rounded-xl border-border/100 bg-card">
        <h2 className="text-lg font-bold mb-4">Avatar Customization</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Choose an avatar style that represents you. Your avatar will be generated based on your email or name.
        </p>

        {/* Current Avatar Preview */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-3">Current Avatar</p>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary">
              <img
                src={user?.avatarSeed && user?.avatarStyle
                  ? getAvatarUrl(user.avatarStyle as AvatarStyle, user.avatarSeed)
                  : selectedAvatarSeed
                  ? getAvatarUrl(selectedAvatarStyle, selectedAvatarSeed)
                  : getAvatarUrl(selectedAvatarStyle, user?.email || user?.name || 'default')
                }
                alt="Current avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold">
                {avatarStyleOptions.find(opt => opt.name === selectedAvatarStyle)?.label || 'Lorelei'}
              </p>
              <p className="text-xs text-muted-foreground">Style: {selectedAvatarStyle}</p>
            </div>
          </div>
        </div>

        {/* Avatar Style Grid - Show all examples from each collection */}
        <div className="space-y-8">
          {avatarStyleOptions.map((option) => {
            const isSelected = selectedAvatarStyle === option.name;
            return (
              <div key={option.name} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">{option.label}</h3>
                  {isSelected && (
                    <span className="text-xs text-primary font-medium">Selected</span>
                  )}
                </div>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                  {option.examples.map((exampleSeed, index) => {
                    const exampleAvatarUrl = getAvatarUrl(option.name, exampleSeed);
                    const isThisSelected = selectedAvatarStyle === option.name && selectedAvatarSeed === exampleSeed;
                    return (
                      <button
                        key={`${option.name}-${index}-${exampleSeed}`}
                        onClick={() => handleAvatarStyleChange(option.name, exampleSeed)}
                        disabled={savingAvatar}
                        className={`relative p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                          isThisSelected
                            ? 'border-primary bg-primary/20 ring-2 ring-primary ring-offset-2'
                            : isSelected
                            ? 'border-primary/50 bg-primary/5 hover:border-primary'
                            : 'border-border hover:border-primary/50'
                        } ${savingAvatar ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${
                            isThisSelected ? 'border-primary' : 'border-border'
                          }`}>
                            <img
                              src={exampleAvatarUrl}
                              alt={`${option.label} example ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {isThisSelected && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-primary-foreground"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {savingAvatar && (
          <p className="text-sm text-muted-foreground mt-4 text-center">Saving avatar...</p>
        )}
      </section>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#02427E] to-[#05081A]">
      {/* Left Sidebar - Settings Navigation */}
      <div className="hidden lg:flex flex-col border-r border-border/80 bg-gradient-to-br from-[#02427E] to-[#05081A] p-4 text-white transition-all duration-300 w-56">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/dashboard"
            className="flex items-center">
            <Image
              src="/asva logo.png"
              alt="ASVA Logo"
              width={0}
              height={0}
              className="h-6 w-6 min-w-[24px] block"
              style={{ flexShrink: 0 }}
            />
            <span className="pl-2 font-semibold text-xl tracking-wide">
              ASVA HUB
            </span>
          </Link>
        </div>

        {/* Back to Dashboard */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold rounded-lg text-[10px] px-2 py-1 hover:bg-accent hover:text-accent-foreground transition mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </Link>

        {/* Settings Navigation */}
        <nav className="flex flex-col space-y-1">
          <button
            onClick={() => setActiveSection('avatar')}
            className={`flex items-center gap-2 font-semibold rounded-lg text-[10px] px-2 py-1 transition ${
              activeSection === 'avatar'
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <span className="text-sm">Avatar</span>
          </button>
          <button
            onClick={() => setActiveSection('general')}
            className={`flex items-center gap-2 font-semibold rounded-lg text-[10px] px-2 py-1 transition ${
              activeSection === 'general'
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <span className="text-sm">General</span>
          </button>
          <button
            onClick={() => setActiveSection('account')}
            className={`flex items-center gap-2 font-semibold rounded-lg text-[10px] px-2 py-1 transition ${
              activeSection === 'account'
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <span className="text-sm">Account</span>
          </button>
          <button
            onClick={() => setActiveSection('permissions')}
            className={`flex items-center gap-2 font-semibold rounded-lg text-[10px] px-2 py-1 transition ${
              activeSection === 'permissions'
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <span className="text-sm">Permissions</span>
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 bg-background text-foreground mr-2 rounded-2xl shadow-lg lg:px-4 pl-12 pb-12 overflow-hidden flex flex-col">
        <div className="px-6 flex flex-col flex-1 min-h-0 overflow-y-auto">
          <div className="flex items-center gap-4 mb-6 pt-6">
            <h1 className="font-bold text-xl">Settings</h1>
          </div>

          {/* Mobile navigation */}
          <div className="lg:hidden mb-6 flex gap-2 border-b pb-4">
            <button
              onClick={() => setActiveSection('avatar')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                activeSection === 'avatar'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              Avatar
            </button>
            <button
              onClick={() => setActiveSection('general')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                activeSection === 'general'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveSection('account')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                activeSection === 'account'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              Account
            </button>
            <button
              onClick={() => setActiveSection('permissions')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                activeSection === 'permissions'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              Permissions
            </button>
          </div>

          <div className="space-y-8">
            {activeSection === 'avatar' && renderAvatar()}
            {activeSection === 'general' && renderGeneral()}
            {activeSection === 'account' && renderAccount()}
            {activeSection === 'permissions' && renderPermissions()}
          </div>
        </div>
      </main>
    </div>
  );
}
