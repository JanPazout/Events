import React, { useState } from 'react';
import { User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type FormMode = 'login' | 'register';

export const AuthForm: React.FC = () => {
  const [mode, setMode] = useState<FormMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  
  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, nickname);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Došlo k chybě při zpracování požadavku');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {mode === 'login' ? 'Přihlášení' : 'Registrace'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'login' 
              ? 'Přihlaste se do svého účtu' 
              : 'Vytvořte si nový účet'}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {mode === 'register' && (
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                  Přezdívka
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="nickname"
                    name="nickname"
                    type="text"
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="input pl-10"
                    placeholder="Vaše přezdívka"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="vas@email.cz"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Heslo
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
          
          {error && (
            <div className="text-danger-600 text-sm font-medium">{error}</div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading 
                ? 'Načítání...' 
                : mode === 'login' 
                  ? 'Přihlásit se' 
                  : 'Registrovat se'}
            </button>
          </div>
          
          <div className="text-center text-sm">
            <button 
              type="button" 
              onClick={switchMode}
              className="text-primary-500 hover:text-primary-700 transition"
            >
              {mode === 'login'
                ? 'Nemáte účet? Zaregistrujte se'
                : 'Už máte účet? Přihlaste se'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};