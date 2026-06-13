import { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import type { UserProfile } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = dbService.subscribeAuth((userData) => {
      setUser(userData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await dbService.login(email, password);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión.');
      setLoading(false);
      throw err;
    }
  };

  const register = async (email: string, username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await dbService.register(email, username, password);
    } catch (err: any) {
      setError(err.message || 'Error al registrar el usuario.');
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await dbService.logout();
    } catch (err: any) {
      setError(err.message || 'Error al cerrar sesión.');
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    setError
  };
};
