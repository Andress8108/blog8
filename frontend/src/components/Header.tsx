import React, { useState, useEffect } from 'react';
import { User, LogOut, BookOpen, Menu, X, Settings, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SidebarMenu } from './SidebarMenu';
import { healthAPI } from '../services/api';

interface HeaderProps {
  onAuthClick: () => void;
  currentView: 'home' | 'activities' | 'personal' | 'reflections' | 'dashboard' | 'social';
  onViewChange: (view: 'home' | 'activities' | 'personal' | 'reflections' | 'dashboard' | 'social') => void;
}

export const Header: React.FC<HeaderProps> = ({ onAuthClick, currentView, onViewChange }) => {
  const { user, logout } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Check API connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await healthAPI.check();
        setIsOnline(true);
      } catch (error) {
        setIsOnline(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className={`bg-white shadow-lg fixed top-0 left-0 right-0 z-40 border-b-4 border-black transition-transform duration-300 ${
        isVisible ? 'transform translate-y-0' : 'transform -translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            {/* Left side with menu button */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg border-2 border-black bg-teal-500 text-white hover:bg-teal-600 transition-colors"
              >
                <Menu size={20} />
              </button>
              <button
                onClick={() => onViewChange('social')}
                className={`p-1.5 sm:p-2 rounded-lg border-2 border-black transition-colors ${
                  currentView === 'social'
                    ? 'bg-pink-500 text-white'
                    : 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:from-teal-600 hover:to-emerald-700'
                }`}
                title="Ver Comunidad Social"
              >
                <BookOpen size={20} />
              </button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
                  Mi Blog Personal
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Por María Camila Guerrero Roqueme</p>
              </div>
            </div>

            {/* Right side with connection status and user info */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Connection Status Indicator */}
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border-2 border-black ${
                isOnline 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                <span className="hidden sm:inline">
                  {isOnline ? 'Conectado' : 'Sin conexión'}
                </span>
              </div>

              {user ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-700">¡Bienvenido/a!</p>
                    <p className="text-lg font-bold text-teal-600">
                      {user.name}
                    </p>
                  </div>
                  <div className="sm:hidden">
                    <p className="text-sm font-bold text-teal-600">
                      {user.name.split(' ')[0]}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => onViewChange('dashboard')}
                      className={`p-1.5 sm:p-2 rounded-full border-2 border-black transition-colors ${
                        currentView === 'dashboard' 
                          ? 'bg-teal-500 text-white' 
                          : 'bg-teal-100 text-teal-600 hover:bg-teal-200'
                      }`}
                      title="Dashboard"
                    >
                      <Settings size={16} />
                    </button>
                    <div className="bg-teal-100 p-1.5 sm:p-2 rounded-full border-2 border-black">
                      {user.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt="Profile" 
                          className="w-4 h-4 rounded-full object-cover"
                        />
                      ) : (
                        <User className="text-teal-600" size={16} />
                      )}
                    </div>
                    <button
                      onClick={logout}
                      className="text-gray-600 hover:text-red-600 transition-colors p-1.5 sm:p-2 rounded-full hover:bg-red-50 border-2 border-black"
                      title="Cerrar sesión"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={onAuthClick}
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-full font-semibold hover:from-teal-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-1 sm:gap-2 border-2 border-black text-sm sm:text-base"
                >
                  <User size={16} />
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                  <span className="sm:hidden">Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Menu */}
      <SidebarMenu 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentView={currentView}
        onViewChange={(view) => {
          onViewChange(view);
          setIsSidebarOpen(false);
        }}
      />
    </>
  );
};