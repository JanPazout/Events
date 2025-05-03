import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthUser } from '../types';
import { api } from '../utils/api';
import { initSocket, disconnectSocket } from '../utils/socket';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const userJson = localStorage.getItem('user');
      
      if (token && userJson) {
        try {
          const userData = JSON.parse(userJson) as AuthUser;
          setUser(userData);
          
          // Initialize socket connection
          initSocket(token);
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    };
    
    loadUser();
    
    return () => {
      disconnectSocket();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { token, user } = await api.login(email, password);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      
      // Initialize socket connection
      initSocket(token);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Chyba při přihlášení');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, nickname: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { token, user } = await api.register(email, password, nickname);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      
      // Initialize socket connection
      initSocket(token);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Chyba při registraci');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setUser(null);
    
    // Disconnect socket
    disconnectSocket();
  };

  const updateProfile = async (userData: Partial<AuthUser>) => {
    try {
      const updatedUser = await api.updateProfile(userData);
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Chyba při aktualizaci profilu');
      }
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};