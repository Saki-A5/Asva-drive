import { auth } from '@/lib/firebaseClient';
import axios from 'axios';

/**
 * Refreshes the session cookie by getting a fresh ID token from Firebase
 * and sending it to the refresh API endpoint
 * @returns Promise that resolves to true if refresh was successful, false otherwise
 */
export const refreshSession = async (): Promise<boolean> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.warn('No current user found. Cannot refresh session.');
      return false;
    }

    // Force refresh the ID token to get a fresh one
    const idToken = await currentUser.getIdToken(true);

    // Send the fresh ID token to the refresh endpoint
    const response = await axios.post('/api/refresh', { idToken });
    
    if (response.status === 200) {
      console.log('Session refreshed successfully');
      return true;
    }
    
    return false;
  } catch (error: any) {
    console.error('Error refreshing session:', error);
    return false;
  }
};

/**
 * Refreshes the session cookie periodically
 * Can be used to set up automatic session refresh intervals
 * @param intervalMinutes - Interval in minutes to refresh (default: 55 minutes)
 * @returns Function to clear the interval
 */
export const setupAutoRefresh = (intervalMinutes: number = 55): (() => void) => {
  const intervalMs = intervalMinutes * 60 * 1000;
  
  // Refresh immediately
  refreshSession();
  
  // Set up interval to refresh periodically
  const intervalId = setInterval(() => {
    refreshSession();
  }, intervalMs);

  // Return function to clear the interval
  return () => clearInterval(intervalId);
};

