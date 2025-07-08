// lib/useAuth.ts
import { useState, useEffect } from 'react';
import { getUserProfile, UserProfile } from './auth';

export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await getUserProfile();
      setUser(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication error');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: user?.isAuthenticated ?? false,
    refreshAuth
  };
};