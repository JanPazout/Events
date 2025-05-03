import React, { useState, useEffect } from 'react';
import { User as UserIcon } from 'lucide-react';
import { api } from '../utils/api';
import { AuthUser } from '../types';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await api.getUsers();
        setUsers(usersData);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Chyba při načítání uživatelů');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Načítání uživatelů...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded relative mb-4">
        <strong className="font-bold">Chyba! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Uživatelé</h1>
      
      {users.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Žádní uživatelé</h3>
          <p className="text-gray-500 mt-1">
            V systému zatím nejsou registrováni žádní uživatelé.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div key={user.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {user.photoUrl ? (
                    <img 
                      src={user.photoUrl} 
                      alt={user.nickname}
                      className="h-16 w-16 rounded-full object-cover" 
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {user.nickname}
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};