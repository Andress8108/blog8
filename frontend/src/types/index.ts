export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  profileImage?: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface BlogPost {
  id: string;
  _id?: string;
  title: string;
  content: string;
  date: string;
  image?: string;
  tags?: string[];
  userId?: string;
  isPublished?: boolean;
  views?: number;
  likes?: Array<{
    userId: string;
    createdAt: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Activity {
  id: string;
  _id?: string;
  title: string;
  description: string;
  character: string;
  links?: string[];
  documents?: Array<{
    _id?: string;
    name: string;
    data?: string;
    size?: number;
    mimeType?: string;
    uploadedAt?: string;
  }>;
  images?: Array<{
    _id?: string;
    name: string;
    data?: string;
    size?: number;
    mimeType?: string;
    uploadedAt?: string;
  }>;
  userId?: string;
  isPublished?: boolean;
  category?: 'academic' | 'personal' | 'professional' | 'creative' | 'other';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CharacterImage {
  id: string;
  _id?: string;
  name: string;
  data: string;
  size: number;
  mimeType: string;
  userId?: string;
  isPublic?: boolean;
  tags?: string[];
  description?: string;
  createdAt?: string;
}

export interface SiteSettings {
  heroTitle: string;
  heroDescription: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  updateProfile: (profileData: { name?: string; profileImage?: string }) => Promise<boolean>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PostsResponse {
  posts: BlogPost[];
  pagination?: PaginationInfo;
}

export interface ActivitiesResponse {
  activities: Activity[];
  pagination?: PaginationInfo;
}

export interface ImagesResponse {
  images: CharacterImage[];
  pagination?: PaginationInfo;
}

export interface UserWithPosts {
  user: User;
  posts: BlogPost[];
  postsCount: number;
}