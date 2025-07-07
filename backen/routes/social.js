const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Obtener todos los usuarios registrados (sin información sensible) - PÚBLICO
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('name email createdAt lastLogin')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener usuarios con sus posts públicos - PÚBLICO
router.get('/users-with-posts', async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('name email createdAt lastLogin')
      .sort({ createdAt: -1 });

    const usersWithPosts = await Promise.all(
      users.map(async (user) => {
        const posts = await Post.find({ 
          userId: user._id, 
          isPublished: true 
        })
        .sort({ createdAt: -1 })
        .limit(5); // Limitar a 5 posts más recientes por usuario

        return {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
          },
          posts,
          postsCount: posts.length
        };
      })
    );

    // Filtrar usuarios que tienen al menos un post
    const usersWithActivePosts = usersWithPosts.filter(userWithPosts => userWithPosts.postsCount > 0);

    res.json({
      success: true,
      usersWithPosts: usersWithActivePosts
    });
  } catch (error) {
    console.error('Error obteniendo usuarios con posts:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener todos los posts públicos con información del usuario - PÚBLICO
router.get('/posts', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const posts = await Post.find({ isPublished: true })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Post.countDocuments({ isPublished: true });

    res.json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error obteniendo posts públicos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener posts de un usuario específico - PÚBLICO
router.get('/users/:userId/posts', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!require('mongoose').Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de usuario inválido'
      });
    }

    const user = await User.findById(userId).select('name email createdAt');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    const posts = await Post.find({ 
      userId: userId, 
      isPublished: true 
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Post.countDocuments({ 
      userId: userId, 
      isPublished: true 
    });

    res.json({
      success: true,
      user,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error obteniendo posts del usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener estadísticas de la comunidad - PÚBLICO
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalPosts = await Post.countDocuments({ isPublished: true });
    
    // Contar total de likes
    const postsWithLikes = await Post.find({ isPublished: true }).select('likes');
    const totalLikes = postsWithLikes.reduce((total, post) => total + (post.likes?.length || 0), 0);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPosts,
        totalLikes
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;