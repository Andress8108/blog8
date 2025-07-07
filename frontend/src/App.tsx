import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { BlogPost } from './components/BlogPost';
import { Footer } from './components/Footer';
import { ActivityView } from './components/ActivityView';
import { Dashboard } from './components/Dashboard';
import { SocialView } from './components/SocialView';
import { useAuth } from './context/AuthContext';
import { postsAPI, activitiesAPI, siteSettingsAPI } from './services/api';
import { blogPosts } from './data/blogPosts';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';

const characterImages = [
  '/12.png',
  '/13.png',
  '/14.png',
  '/15.png',
  '/16.png'
];

function AppContent() {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'activities' | 'personal' | 'reflections' | 'dashboard' | 'social'>('home');
  const [refreshKey, setRefreshKey] = useState(0);
  const [posts, setPosts] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState({
    heroTitle: 'Bienvenidos a Mi Mundo',
    heroDescription: 'Un espacio donde comparto mis pensamientos, experiencias y momentos especiales. Cada historia es una ventana a mi corazón y mis reflexiones sobre la vida.'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for auth modal events from social view
  useEffect(() => {
    const handleOpenAuthModal = () => {
      setIsAuthModalOpen(true);
    };

    window.addEventListener('openAuthModal', handleOpenAuthModal);
    return () => window.removeEventListener('openAuthModal', handleOpenAuthModal);
  }, []);

  // Load data from API or fallback to default
  useEffect(() => {
    loadData();
  }, [user, refreshKey]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (user && isOnline) {
        // Load user's data from API
        const [postsData, activitiesData, settingsData] = await Promise.all([
          postsAPI.getAll(user.id),
          activitiesAPI.getAll(user.id),
          siteSettingsAPI.getPublicSettings(user.id)
        ]);
        setPosts(postsData.length > 0 ? postsData : blogPosts);
        setActivities(activitiesData || []);
        setSiteSettings(settingsData || siteSettings);
      } else {
        // Use default data for non-authenticated users or offline mode
        setPosts(blogPosts);
        setActivities([]);
        // Try to load public settings if available
        if (isOnline) {
          try {
            const settingsData = await siteSettingsAPI.getPublicSettings();
            setSiteSettings(settingsData || siteSettings);
          } catch (err) {
            // Use default settings if API fails
          }
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Error de conexión. Mostrando contenido por defecto.');
      // Fallback to default data
      setPosts(blogPosts);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDataUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleLike = async (postId: string) => {
    if (!user || !isOnline) return;
    
    try {
      await postsAPI.toggleLike(postId);
      // Refresh posts to get updated like count
      const updatedPosts = await postsAPI.getAll(user.id);
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando contenido...</p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard onDataUpdate={handleDataUpdate} />;
      case 'activities':
        return <ActivityView key={refreshKey} />;
      case 'social':
        return <SocialView />;
      case 'personal':
        return (
          <section className="py-16 px-4 sm:px-6 lg:px-8 pt-32">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                  Vida Personal
                </h2>
                <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                  Momentos especiales y experiencias de mi día a día
                </p>
              </div>
              <div className="space-y-8">
                {posts.filter((_: any, index: number) => index % 2 === 0).map((post: any, index: number) => (
                  <BlogPost
                    key={`${post._id || post.id}-${refreshKey}`}
                    post={post}
                    characterImage={characterImages[index % characterImages.length]}
                    index={index}
                    onLike={user ? handleLike : undefined}
                  />
                ))}
              </div>
            </div>
          </section>
        );
      case 'reflections':
        return (
          <section className="py-16 px-4 sm:px-6 lg:px-8 pt-32">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                  Reflexiones
                </h2>
                <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                  Pensamientos profundos y aprendizajes de vida
                </p>
              </div>
              <div className="space-y-8">
                {posts.filter((_: any, index: number) => index % 2 === 1).map((post: any, index: number) => (
                  <BlogPost
                    key={`${post._id || post.id}-${refreshKey}`}
                    post={post}
                    characterImage={characterImages[index % characterImages.length]}
                    index={index}
                    onLike={user ? handleLike : undefined}
                  />
                ))}
              </div>
            </div>
          </section>
        );
      default:
        return (
          <>
            {/* Connection Status Banner */}
            {!isOnline && (
              <div className="fixed top-20 left-0 right-0 z-30 bg-amber-500 text-white p-2 text-center text-sm">
                <div className="flex items-center justify-center gap-2">
                  <WifiOff size={16} />
                  <span>Sin conexión a internet. Mostrando contenido offline.</span>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="fixed top-20 left-0 right-0 z-30 bg-red-500 text-white p-2 text-center text-sm">
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Hero Section */}
            <section className={`relative py-20 px-4 sm:px-6 lg:px-8 ${(!isOnline || error) ? 'pt-40' : 'pt-32'}`}>
              <div className="max-w-4xl mx-auto text-center">
                <div className="mb-8">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 animate-fade-in">
                    {siteSettings.heroTitle}
                  </h1>
                  <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                    {siteSettings.heroDescription}
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <div className="bg-white/80 backdrop-blur-sm rounded-full p-3 sm:p-4 shadow-lg border-2 border-black">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full flex items-center justify-center border-2 border-black">
                      <span className="text-2xl sm:text-4xl font-bold text-white">MC</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements - Hidden on mobile */}
              <div className="hidden sm:block absolute top-20 left-10 w-20 h-20 bg-teal-200 rounded-full opacity-50 animate-float border-2 border-black"></div>
              <div className="hidden sm:block absolute top-40 right-20 w-16 h-16 bg-emerald-200 rounded-full opacity-50 animate-float-delayed border-2 border-black"></div>
              <div className="hidden sm:block absolute bottom-20 left-1/4 w-12 h-12 bg-cyan-200 rounded-full opacity-50 animate-float border-2 border-black"></div>
            </section>

            {/* Blog Posts Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                    Mis Últimas Reflexiones
                  </h2>
                  <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                    Descubre mis pensamientos más recientes y acompáñame en este viaje de autodescubrimiento
                  </p>
                </div>

                {posts.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-black">
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      {user ? 'Aún no has creado ningún post' : 'No hay posts disponibles'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {user ? 'Ve al dashboard para crear tu primer post' : 'Regístrate para ver contenido personalizado'}
                    </p>
                    {user && (
                      <button
                        onClick={() => setCurrentView('dashboard')}
                        className="bg-teal-500 text-white px-6 py-2 rounded-lg border-2 border-black hover:bg-teal-600 transition-colors"
                      >
                        Ir al Dashboard
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {posts.map((post: any, index: number) => (
                      <BlogPost
                        key={`${post._id || post.id}-${refreshKey}`}
                        post={post}
                        characterImage={characterImages[index % characterImages.length]}
                        index={index}
                        onLike={user ? handleLike : undefined}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5DC' }}>
      <Header 
        onAuthClick={() => setIsAuthModalOpen(true)} 
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      
      {renderContent()}

      <Footer />
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;