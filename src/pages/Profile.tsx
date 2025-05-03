import React, { useState } from 'react';
import { User, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  if (!user) return null;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await updateProfile({
        ...user,
        nickname,
        photoUrl
      });
      
      setSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Chyba při aktualizaci profilu');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Váš profil</h1>
      
      <div className="card">
        <div className="flex flex-col items-center sm:flex-row sm:items-start mb-6">
          <div className="relative">
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt={nickname}
                className="h-28 w-28 rounded-full object-cover"
              />
            ) : (
              <div className="h-28 w-28 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
            <h2 className="text-xl font-medium">{user.nickname}</h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Chyba! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-secondary-50 border border-secondary-200 text-secondary-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Úspěch! </strong>
              <span className="block sm:inline">Profil byl úspěšně aktualizován.</span>
            </div>
          )}
          
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
              Přezdívka
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="input mt-1"
              required
            />
          </div>
          
          <div>
            <label htmlFor="photoUrl" className="block text-sm font-medium text-gray-700">
              URL profilového obrázku
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <div className="relative flex items-stretch flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Camera className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  id="photoUrl"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="input pl-10"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Zadejte URL adresu vašeho obrázku. Pro testovací účely můžete použít např. <code>https://i.pravatar.cc/300</code>
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`btn-primary ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Ukládání...' : 'Uložit změny'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};