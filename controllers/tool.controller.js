import mongoose from 'mongoose';
import { Tool, TOOL_CATEGORIES } from '../models/tool.model.js';
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
      primaryCategory: validatedData.primaryCategory,
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
    const limit = parseInt(req.query.limit) || 5;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const tools = await Tool.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('_id logo name primaryCategory shortDescription links bookmarks');

    const total = await Tool.countDocuments();

    return res.status(200).json({
      tools,
      pagination: {
        page,
        limit,
        totalTools:total,
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
    const limit = parseInt(req.query.limit) || 5;
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
        $project: {
          __v: 0,
          tags: 0,
          views: 0,
          votes: 0,
          author: 0,
          createdAt: 0,
          updatedAt: 0,
          bookmarks: 0,
          category: 0,
          fullDetail: 0,
          toolImages: 0,
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
      tool: { _id: tool._id }
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
    tool.bookmarks = tool.bookmarks.filter(bookmarkId => bookmarkId.toString() !== userId.toString());
    await tool.save();

    return res.status(200).json({ 
      message: 'Bookmark removed successfully.',
      tool: { _id: tool._id }
    });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};

export const upvoteTool = async (req, res) => {
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

    // Check if already voted
    if (tool.votes.includes(userId)) {
      return res.status(400).json({ message: 'Tool is already upvoted.' });
    }

    // Add vote
    tool.votes.push(userId);
    await tool.save();

    return res.status(200).json({ 
      message: 'Tool upvoted successfully.',
      tool: { _id: tool._id, votes: tool.votes }
    });
  } catch (error) {
    console.error('Upvote tool error:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};

export const downvoteTool = async (req, res) => {
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

    // Check if voted
    if (!tool.votes.includes(userId)) {
      return res.status(400).json({ message: 'Tool is not upvoted.' });
    }

    // Remove vote
    tool.votes = tool.votes.filter(voteId => voteId.toString() !== userId.toString());
    await tool.save();

    return res.status(200).json({ 
      message: 'Vote removed successfully.',
      tool: { _id: tool._id, votes: tool.votes }
    });
  } catch (error) {
    console.error('Downvote tool error:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};

export const getToolById = async (req, res) => {
  try {
    const { toolId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(toolId)) {
      return res.status(400).json({ message: 'The tool id is invalid.' });
    }

    const tool = await Tool.findById(toolId)
      .populate('author', 'username')
      .select('-__v');

    if (!tool) {
      return res.status(404).json({ message: 'Tool not found.' });
    }

    // Find most popular alternative tool (excluding current tool) and calculate total saved
    const alternativeResult = await Tool.aggregate([
      // Match tools with same primaryCategory, excluding current tool
      { 
        $match: { 
          primaryCategory: tool.primaryCategory,
          _id: { $ne: new mongoose.Types.ObjectId(toolId) }
        } 
      },
      
      // Use $facet to perform multiple operations
      {
        $facet: {
          // Find the most bookmarked tool (excluding current)
          mostBookmarked: [
            {
              $addFields: {
                bookmarksCount: { $size: { $ifNull: ['$bookmarks', []] } }
              }
            },
            { $sort: { bookmarksCount: -1 } },
            { $limit: 1 },
            {
              $project: {
                _id: 1,
                name: 1,
                logo: 1,
                primaryCategory: 1,
                shortDescription: 1,
                links: 1,
                bookmarks: 1
              }
            }
          ],
          // Calculate total saved (sum of all bookmarks in this category, excluding current tool)
          totalSaved: [
            {
              $group: {
                _id: null,
                total: { $sum: { $size: { $ifNull: ['$bookmarks', []] } } }
              }
            }
          ]
        }
      }
    ]);

    // Extract results
    const alternativeTool = alternativeResult[0]?.mostBookmarked[0] || null;
    const totalSaved = alternativeResult[0]?.totalSaved[0]?.total || 0;

    return res.status(200).json({ 
      tool,
      alternative: {
        tool: alternativeTool,
        totalSaved
      }
    });
  } catch (error) {
    console.error('Get tool by ID error:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};

export const getToolsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format.' });
    }

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const tools = await Tool.find({ author: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('_id');

    const total = await Tool.countDocuments({ author: userId });

    const toolIds = tools.map(tool => tool._id);

    return res.status(200).json({
      toolIds,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get tools by user ID error:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};

export const getUserToolIds = async (req, res) => {
  try {
    const { userId } = req;
    
    if (!userId) {
      return res.status(401).json({ message: 'The user id is missing. Please authenticate.' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'The user id is invalid.' });
    }

    const tools = await Tool.find({ author: userId }).select('_id').lean();

    const toolIds = tools.map(tool => tool._id.toString());

    return res.status(200).json({
      toolIds,
      message: 'User tool IDs fetched successfully.'
    });
  } catch (error) {
    console.error('Get user tools error:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};

export const getBookmarkedToolIds = async (req, res) => {
  try {
    const { userId } = req;

    if (!userId) {
      return res.status(401).json({ message: 'The user id is missing. Please authenticate.' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'The user id is invalid.' });
    }

    const tools = await Tool.find({ bookmarks: userId }).select('_id').lean();

    const toolIds = tools.map(tool => tool._id.toString());

    return res.status(200).json({
      bookmarkedToolIds: toolIds,
      message: 'Bookmarked tool IDs fetched successfully.'
    });
  } catch (error) {
    console.error('Get bookmarked tool IDs error:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};

export const getBookmarkedTools = async (req, res) => {
  try {
    const { userId } = req;
    const limit = parseInt(req.query.limit) || 5;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(401).json({ message: 'The user id is missing. Please authenticate.' });
    }

    const userIdString = String(userId).trim();
    
    if (!mongoose.Types.ObjectId.isValid(userIdString)) {
      return res.status(400).json({ message: 'The user id is invalid.' });
    }

    const tools = await Tool.find({ bookmarks: userIdString })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('_id logo name');

    const total = await Tool.countDocuments({ bookmarks: userIdString });

    return res.status(200).json({
      bookmarkedTools: tools,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      message: 'Bookmarked tools fetched successfully.'
    });
  } catch (error) {
    console.error('Get bookmarked tools error:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};

export const getVotedToolIds = async (req, res) => {
  try {
    const { userId } = req;

    if (!userId) {
      return res.status(401).json({ message: 'The user id is missing. Please authenticate.' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'The user id is invalid.' });
    }

    const tools = await Tool.find({ votes: userId }).select('_id').lean();
    
    const toolIds = tools.map(tool => tool._id.toString());
    
    return res.status(200).json({ 
      votedToolIds: toolIds, 
      message: 'Voted tool IDs fetched successfully.' 
    });
  } catch (error) {
    console.error('Get voted tool IDs error:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};

export const incrementView = async (req, res) => {
  try {
    const { toolId } = req.params;
    const { userId } = req;

    if (!userId) {
      return res.status(401).json({ message: 'The user id is missing. Please authenticate.' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'The user id is invalid.' });
    }

    if (!mongoose.Types.ObjectId.isValid(toolId)) {
      return res.status(400).json({ message: 'The tool id is invalid.' });
    }

    const tool = await Tool.findById(toolId);

    if (!tool) {
      return res.status(404).json({ message: 'Tool not found.' });
    }

    // If user is authenticated, add their userId to views array (if not already present)
    if (!tool.views.includes(userId)) {
      tool.views.push(userId);
      await tool.save();
    }

    return res.status(200).json({ 
      message: 'View incremented successfully.',
      viewsCount: tool.views.length
    });
  } catch (error) {
    console.error('Increment view error:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};

export const getToolsByPrimaryCategory = async (req, res) => {
  try {
    const { primaryCategory } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    if (!primaryCategory || primaryCategory.trim() === '') {
      return res.status(400).json({ message: 'Primary category is required and cannot be empty.' });
    }

    const validCategories = TOOL_CATEGORIES.filter(cat => cat !== '');

    if (!validCategories.includes(primaryCategory)) {
      return res.status(400).json({ message: 'Invalid primary category.' });
    }

    const tools = await Tool.find({ primaryCategory })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('_id name logo primaryCategory bookmarks shortDescription links');

    const total = await Tool.countDocuments({ primaryCategory });

    return res.status(200).json({
      tools,
      pagination: {
        page,
        limit,
        totalTools: total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get tools by primary category error:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};

export const getMostPopularAlternative = async (req, res) => {
  try {
    const { primaryCategory } = req.params;
    
    if (!primaryCategory || primaryCategory.trim() === '') {
      return res.status(400).json({ message: 'Primary category is required and cannot be empty.' });
    }

    const validCategories = TOOL_CATEGORIES.filter(cat => cat !== '');

    if (!validCategories.includes(primaryCategory)) {
      return res.status(400).json({ message: 'Invalid primary category.' });
    }

    // Use aggregation to find most bookmarked tool and calculate total saved
    const result = await Tool.aggregate([
      { $match: { primaryCategory: primaryCategory } },
      
      // Use $facet to perform multiple operations
      {
        $facet: {
          // Find the most bookmarked tool
          mostBookmarked: [
            {
              $addFields: {
                bookmarksCount: { $size: { $ifNull: ['$bookmarks', []] } }
              }
            },
            { $sort: { bookmarksCount: -1 } },
            { $limit: 1 },
            {
              $project: {
                _id: 1,
                name: 1,
              }
            }
          ],
          // Calculate total saved (sum of all bookmarks in this category)
          totalSaved: [
            {
              $group: {
                _id: null,
                total: { $sum: { $size: { $ifNull: ['$bookmarks', []] } } },
                totalAlternatives: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    // Extract results
    const mostBookmarkedTool = result[0]?.mostBookmarked[0] || null;
    const totalSaved = result[0]?.totalSaved[0]?.total || 0;
    const totalAlternatives = result[0]?.totalSaved[0]?.totalAlternatives || 0;

    // If no tools found in this category
    if (!mostBookmarkedTool) {
      return res.status(200).json({
        tool: null,
        totalSaved: 0,
        totalAlternatives: 0,
        message: 'No tools found in this category.'
      });
    }

    // Remove bookmarksCount from the response (it was just for sorting)
    const { bookmarksCount, ...tool } = mostBookmarkedTool;

    return res.status(200).json({
      tool,
      totalSaved,
      totalAlternatives,
      message: 'Most popular alternative tool fetched successfully.'
    });
  } catch (error) {
    console.error('Get most popular alternative error:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};

export const getCategoryStats = async (req, res) => {
  try {
    const stats = await Tool.aggregate([
      // Group by primaryCategory and calculate stats
      {
        $group: {
          _id: '$primaryCategory',
          totalTools: { $sum: 1 },
          totalVotes: { $sum: { $size: { $ifNull: ['$votes', []] } } },
          totalBookmarks: { $sum: { $size: { $ifNull: ['$bookmarks', []] } } }
        }
      },
      { // Project to rename _id to name
        $project: {
          _id: 0,
          name: '$_id',
          totalTools: 1,
          totalVotes: 1,
          totalBookmarks: 1
        }
      },
      { $sort: { name: 1 } }
    ]);

    return res.status(200).json({ stats, message: 'Category stats fetched successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};