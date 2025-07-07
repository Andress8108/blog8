import React, { useState, useEffect } from 'react';
import { User, Calendar, Heart, Eye, MessageCircle, Users, Clock, Mail } from 'lucide-react';
import { socialAPI, postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserWithPosts, BlogPost } from '../types';

export const SocialView: React.FC = () => {
  const { user } = useAuth();
  const [usersWithPosts, setUsersWithPosts] = useState<UserWithPosts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await socialAPI.getUsersWithPosts();
      setUsersWithPosts(data);
    } catch (err) {
      console.error('Failed to load social data:', err);
      setError('Error al cargar los datos sociales');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    
    try {
      await postsAPI.toggleLike(postId);
      // Refresh data to get updated like count
      await loadSocialData();
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `Hace ${diffInWeeks} semana${diffInWeeks > 1 ? 's' : ''}`;
    
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-7xl mx-auto text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando comunidad...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 pt-32">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full border-2 border-black">
              <Users className="text-white" size={32} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
              Comunidad Social
            </h2>
          </div>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre y conecta con otros miembros de nuestra comunidad. 
            Explora sus historias, pensamientos y experiencias compartidas.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-lg border-2 border-black text-center">
            <Users size={32} className="mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{usersWithPosts.length}</h3>
            <p className="text-blue-100">Usuarios Activos</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-lg border-2 border-black text-center">
            <MessageCircle size={32} className="mx-auto mb-2" />
            <h3 className="text-2xl font-bold">
              {usersWithPosts.reduce((total, userWithPosts) => total + userWithPosts.postsCount, 0)}
            </h3>
            <p className="text-green-100">Posts Publicados</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg border-2 border-black text-center">
            <Heart size={32} className="mx-auto mb-2" />
            <h3 className="text-2xl font-bold">
              {usersWithPosts.reduce((total, userWithPosts) => 
                total + userWithPosts.posts.reduce((postTotal, post) => 
                  postTotal + (post.likes?.length || 0), 0), 0)}
            </h3>
            <p className="text-purple-100">Likes Totales</p>
          </div>
        </div>

        {/* Users and Posts */}
        {usersWithPosts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-black">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Aún no hay usuarios con posts públicos
            </h3>
            <p className="text-gray-500 mb-4">
              Sé el primero en compartir tu historia con la comunidad
            </p>
            {user && (
              <button
                onClick={() => window.location.hash = '#dashboard'}
                className="bg-pink-500 text-white px-6 py-2 rounded-lg border-2 border-black hover:bg-pink-600 transition-colors"
              >
                Crear Mi Primer Post
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {usersWithPosts.map((userWithPosts, userIndex) => (
              <div key={userWithPosts.user.id} className="bg-white rounded-2xl shadow-lg border-4 border-black overflow-hidden">
                {/* User Header */}
                <div className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-black">
                        <User className="text-teal-600" size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{userWithPosts.user.name}</h3>
                        <div className="flex items-center gap-4 text-teal-100 text-sm">
                          <div className="flex items-center gap-1">
                            <Mail size={14} />
                            <span>{userWithPosts.user.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>Miembro desde {formatDate(userWithPosts.user.createdAt!)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-white/20 rounded-lg px-3 py-1 border border-white/30">
                        <span className="text-sm font-medium">
                          {userWithPosts.postsCount} post{userWithPosts.postsCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Posts */}
                <div className="p-6 space-y-6">
                  {userWithPosts.posts.map((post: BlogPost, postIndex: number) => (
                    <article key={post._id || post.id} className="border-2 border-gray-200 rounded-lg p-6 hover:border-teal-300 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>{post.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>{getTimeAgo(post.createdAt!)}</span>
                            </div>
                            {post.views !== undefined && (
                              <div className="flex items-center gap-1">
                                <Eye size={14} />
                                <span>{post.views} vista{post.views !== 1 ? 's' : ''}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 leading-relaxed mb-4">
                        {post.content}
                      </p>

                      {post.image && (
                        <div className="mb-4">
                          <img 
                            src={post.image} 
                            alt={post.title}
                            className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2 flex-wrap">
                          {post.tags && post.tags.length > 0 ? (
                            post.tags.slice(0, 3).map((tag, tagIndex) => (
                              <span 
                                key={tagIndex}
                                className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium border border-teal-300"
                              >
                                #{tag}
                              </span>
                            ))
                          ) : (
                            <>
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-300">
                                #personal
                              </span>
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium border border-green-300">
                                #vida
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {user && (
                            <button
                              onClick={() => handleLike(post._id || post.id)}
                              className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors px-3 py-1 rounded-full hover:bg-red-50 border border-red-200"
                            >
                              <Heart size={16} className={post.likes && post.likes.length > 0 ? 'fill-current' : ''} />
                              <span className="text-sm font-medium">{post.likes?.length || 0}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {!user && (
          <div className="mt-12 text-center bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border-2 border-black p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              ¡Únete a Nuestra Comunidad!
            </h3>
            <p className="text-gray-600 mb-6">
              Regístrate para compartir tus propias historias y conectar con otros miembros
            </p>
            <button
              onClick={() => {
                // Trigger auth modal - you'll need to pass this function from parent
                const event = new CustomEvent('openAuthModal');
                window.dispatchEvent(event);
              }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 border-2 border-black"
            >
              Registrarse Ahora
            </button>
          </div>
        )}
      </div>
    </section>
  );
};