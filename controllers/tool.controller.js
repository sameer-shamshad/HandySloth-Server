import mongoose from 'mongoose';
import { Tool } from '../models/tool.model.js';
import { createToolSchema } from '../validations/tool.validation.js';

export const createTool = async (req, res) => {
  try {
    const { userId } = req;
    
    if (!userId) {
      return res.status(401).json({ message: 'The user id is missing. Please authenticate.' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'The user id is invalid.' });
    }

    // Validate request body with Zod
    const validationResult = createToolSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return res.status(400).json({ message: 'Validation failed.', details: errors });
    }

    const validatedData = validationResult.data;

    const tool = new Tool({
      author: userId,
      name: validatedData.name,
      logo: validatedData.logo,
      shortDescription: validatedData.shortDescription,
      fullDetail: validatedData.fullDetail,
      category: validatedData.category,
      toolImages: validatedData.toolImages.filter(img => img && img.trim()),
      tags: validatedData.tags,
      links: validatedData.links || {
        telegram: '',
        x: '',
        website: ''
      },
    });

    await tool.save();

    return res.status(201).json({  message: 'Tool created successfully.', tool });
  } catch (error) {
    console.error('Create tool error:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};

export const getRecentTools = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const tools = await Tool.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('author', 'username')
      .select('-__v');

    const total = await Tool.countDocuments();

    return res.status(200).json({
      tools,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get recent tools error:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};

export const getTrendingTools = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Aggregate to sort by views array length
    const tools = await Tool.aggregate([
      {
        $addFields: {
          viewsCount: { $size: { $ifNull: ['$views', []] } }
        }
      },
      { $sort: { viewsCount: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $unwind: {
          path: '$author',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          __v: 0,
          'author.password': 0,
          'author.refreshToken': 0,
          'author.__v': 0
        }
      }
    ]);

    const total = await Tool.countDocuments();

    return res.status(200).json({
      tools,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get trending tools error:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};

export const bookmarkTool = async (req, res) => {
  try {
    const { userId } = req;
    const { toolId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'The user id is missing. Please authenticate.' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(toolId)) {
      return res.status(400).json({ message: 'The user id or tool id is invalid.' });
    }

    const tool = await Tool.findById(toolId);

    if (!tool) {
      return res.status(404).json({ message: 'Tool not found.' });
    }

    // Check if already bookmarked
    if (tool.bookmarks.includes(userId)) {
      return res.status(400).json({ message: 'Tool is already bookmarked.' });
    }

    // Add bookmark
    tool.bookmarks.push(userId);
    await tool.save();

    return res.status(200).json({ 
      message: 'Tool bookmarked successfully.',
      tool: {
        id: tool._id,
        bookmarks: tool.bookmarks
      }
    });
  } catch (error) {
    console.error('Bookmark tool error:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};

export const removeBookmark = async (req, res) => {
  try {
    const { userId } = req;
    const { toolId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'The user id is missing. Please authenticate.' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(toolId)) {
      return res.status(400).json({ message: 'Invalid user ID or tool ID format.' });
    }

    const tool = await Tool.findById(toolId);

    if (!tool) {
      return res.status(404).json({ message: 'Tool not found.' });
    }

    // Check if bookmarked
    if (!tool.bookmarks.includes(userId)) {
      return res.status(400).json({ message: 'Tool is not bookmarked.' });
    }

    // Remove bookmark
    tool.bookmarks = tool.bookmarks.filter(
      bookmarkId => bookmarkId.toString() !== userId.toString()
    );
    await tool.save();

    return res.status(200).json({ 
      message: 'Bookmark removed successfully.',
      tool: {
        id: tool._id,
        bookmarks: tool.bookmarks
      }
    });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};