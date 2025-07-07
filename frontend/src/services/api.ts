import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.mariacamilablog.com' 
  : 'https://localhost:3001/api';

// Create axios instance with HTTPS configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // For development with self-signed certificates
  ...(process.env.NODE_ENV === 'development' && {
    httpsAgent: new (require('https').Agent)({
      rejectUnauthorized: false
    })
  })
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    
    // Log error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.error || error.message
    });
    
    return Promise.reject(error);
  }
);

// Helper function to handle API responses
const handleResponse = <T>(response: AxiosResponse<T>): T => {
  return response.data;
};

// Helper function to handle API errors
const handleError = (error: any): never => {
  const message = error.response?.data?.error || error.message || 'An unexpected error occurred';
  throw new Error(message);
};

// Auth API
export const authAPI = {
  register: async (name: string, email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/register', { name, email, password });
      const data = handleResponse(response);
      
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const data = handleResponse(response);
      
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
  },

  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      const data = handleResponse(response);
      return data.user;
    } catch (error) {
      handleError(error);
    }
  },

  updateProfile: async (profileData: { name?: string; profileImage?: string }) => {
    try {
      const response = await apiClient.put('/auth/profile', profileData);
      const data = handleResponse(response);
      return data.user;
    } catch (error) {
      handleError(error);
    }
  }
};

// Site Settings API
export const siteSettingsAPI = {
  getSettings: async () => {
    try {
      const response = await apiClient.get('/site-settings');
      const data = handleResponse(response);
      return data.settings;
    } catch (error) {
      handleError(error);
    }
  },

  updateSettings: async (settings: { heroTitle: string; heroDescription: string }) => {
    try {
      const response = await apiClient.put('/site-settings', settings);
      const data = handleResponse(response);
      return data.settings;
    } catch (error) {
      handleError(error);
    }
  },

  getPublicSettings: async (userId?: string) => {
    try {
      const params = userId ? { userId } : {};
      const response = await apiClient.get('/site-settings/public', { params });
      const data = handleResponse(response);
      return data.settings;
    } catch (error) {
      handleError(error);
    }
  }
};

// Posts API
export const postsAPI = {
  getAll: async (userId?: string) => {
    try {
      const params = userId ? { userId } : {};
      const response = await apiClient.get('/posts', { params });
      const data = handleResponse(response);
      return data.posts || [];
    } catch (error) {
      handleError(error);
    }
  },

  getById: async (id: string) => {
    try {
      const response = await apiClient.get(`/posts/${id}`);
      const data = handleResponse(response);
      return data.post;
    } catch (error) {
      handleError(error);
    }
  },

  create: async (postData: { 
    title: string; 
    content: string; 
    date?: string; 
    image?: string;
    tags?: string[];
  }) => {
    try {
      const response = await apiClient.post('/posts', postData);
      const data = handleResponse(response);
      return data.post;
    } catch (error) {
      handleError(error);
    }
  },

  update: async (id: string, postData: { 
    title: string; 
    content: string; 
    date?: string; 
    image?: string;
    tags?: string[];
  }) => {
    try {
      const response = await apiClient.put(`/posts/${id}`, postData);
      const data = handleResponse(response);
      return data.post;
    } catch (error) {
      handleError(error);
    }
  },

  delete: async (id: string) => {
    try {
      const response = await apiClient.delete(`/posts/${id}`);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  toggleLike: async (id: string) => {
    try {
      const response = await apiClient.post(`/posts/${id}/like`);
      const data = handleResponse(response);
      return data;
    } catch (error) {
      handleError(error);
    }
  }
};

// Activities API
export const activitiesAPI = {
  getAll: async (userId?: string) => {
    try {
      const params = userId ? { userId } : {};
      const response = await apiClient.get('/activities', { params });
      const data = handleResponse(response);
      return data.activities || [];
    } catch (error) {
      handleError(error);
    }
  },

  getById: async (id: string) => {
    try {
      const response = await apiClient.get(`/activities/${id}`);
      const data = handleResponse(response);
      return data.activity;
    } catch (error) {
      handleError(error);
    }
  },

  getCategories: async () => {
    try {
      const response = await apiClient.get('/activities/categories');
      const data = handleResponse(response);
      return data.categories || [];
    } catch (error) {
      handleError(error);
    }
  },

  create: async (activityData: { 
    title: string; 
    description: string; 
    character?: string; 
    links?: string[]; 
    category?: string;
    difficulty?: string;
    estimatedTime?: number;
  }) => {
    try {
      const response = await apiClient.post('/activities', activityData);
      const data = handleResponse(response);
      return data.activity;
    } catch (error) {
      handleError(error);
    }
  },

  update: async (id: string, activityData: { 
    title: string; 
    description: string; 
    character?: string; 
    links?: string[]; 
    category?: string;
    difficulty?: string;
    estimatedTime?: number;
  }) => {
    try {
      const response = await apiClient.put(`/activities/${id}`, activityData);
      const data = handleResponse(response);
      return data.activity;
    } catch (error) {
      handleError(error);
    }
  },

  delete: async (id: string) => {
    try {
      const response = await apiClient.delete(`/activities/${id}`);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  uploadDocument: async (activityId: string, file: File, onProgress?: (progress: number) => void) => {
    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await apiClient.post(`/activities/${activityId}/upload-document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        }
      });
      const data = handleResponse(response);
      return data.document;
    } catch (error) {
      handleError(error);
    }
  },

  uploadImage: async (activityId: string, file: File, onProgress?: (progress: number) => void) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiClient.post(`/activities/${activityId}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        }
      });
      const data = handleResponse(response);
      return data.image;
    } catch (error) {
      handleError(error);
    }
  },

  deleteDocument: async (activityId: string, documentId: string) => {
    try {
      const response = await apiClient.delete(`/activities/${activityId}/documents/${documentId}`);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  deleteImage: async (activityId: string, imageId: string) => {
    try {
      const response = await apiClient.delete(`/activities/${activityId}/images/${imageId}`);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  }
};

// Images API
export const imagesAPI = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/images');
      const data = handleResponse(response);
      return data.images || [];
    } catch (error) {
      handleError(error);
    }
  },

  getById: async (id: string) => {
    try {
      const response = await apiClient.get(`/images/${id}`);
      const data = handleResponse(response);
      return data.image;
    } catch (error) {
      handleError(error);
    }
  },

  getPublic: async (tags?: string) => {
    try {
      const params = tags ? { tags } : {};
      const response = await apiClient.get('/images/public', { params });
      const data = handleResponse(response);
      return data.images || [];
    } catch (error) {
      handleError(error);
    }
  },

  upload: async (file: File, description?: string, tags?: string[], isPublic?: boolean, onProgress?: (progress: number) => void) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (description) formData.append('description', description);
      if (tags) formData.append('tags', tags.join(','));
      if (isPublic !== undefined) formData.append('isPublic', isPublic.toString());

      const response = await apiClient.post('/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        }
      });
      const data = handleResponse(response);
      return data.image;
    } catch (error) {
      handleError(error);
    }
  },

  update: async (id: string, updateData: { 
    description?: string; 
    tags?: string[]; 
    isPublic?: boolean 
  }) => {
    try {
      const response = await apiClient.put(`/images/${id}`, updateData);
      const data = handleResponse(response);
      return data.image;
    } catch (error) {
      handleError(error);
    }
  },

  delete: async (id: string) => {
    try {
      const response = await apiClient.delete(`/images/${id}`);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  }
};

// Social API - PÚBLICO (no requiere autenticación para ver)
export const socialAPI = {
  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/social/users');
      const data = handleResponse(response);
      return data.users || [];
    } catch (error) {
      handleError(error);
    }
  },

  getUsersWithPosts: async () => {
    try {
      const response = await apiClient.get('/social/users-with-posts');
      const data = handleResponse(response);
      return data.usersWithPosts || [];
    } catch (error) {
      handleError(error);
    }
  },

  getAllPublicPosts: async () => {
    try {
      const response = await apiClient.get('/social/posts');
      const data = handleResponse(response);
      return data.posts || [];
    } catch (error) {
      handleError(error);
    }
  },

  getStats: async () => {
    try {
      const response = await apiClient.get('/social/stats');
      const data = handleResponse(response);
      return data.stats || { totalUsers: 0, totalPosts: 0, totalLikes: 0 };
    } catch (error) {
      handleError(error);
    }
  }
};

// Health check API
export const healthAPI = {
  check: async () => {
    try {
      const response = await apiClient.get('/health');
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  }
};

// Export the axios instance for custom requests
export { apiClient };
export default apiClient;