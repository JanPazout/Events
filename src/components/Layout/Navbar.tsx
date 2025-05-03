import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, MessageCircle, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  if (!user) return null;
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="text-primary-600 font-bold text-xl flex items-center">
                <Calendar className="w-6 h-6 mr-2" />
                <span>Rodinné Události</span>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-4">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              <Calendar className="w-5 h-5 mr-1.5" />
              <span className="hidden sm:inline">Události</span>
            </Link>
            
            <Link 
              to="/chat" 
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              <MessageCircle className="w-5 h-5 mr-1.5" />
              <span className="hidden sm:inline">Chat</span>
            </Link>
            
            <Link 
              to="/users" 
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              <Users className="w-5 h-5 mr-1.5" />
              <span className="hidden sm:inline">Uživatelé</span>
            </Link>
            
            <Link 
              to="/profile" 
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              <User className="w-5 h-5 mr-1.5" />
              <span className="hidden sm:inline">Profil</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="ml-2 inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-danger-600 hover:bg-gray-50"
            >
              <LogOut className="w-5 h-5 mr-1.5" />
              <span className="hidden sm:inline">Odhlásit</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};