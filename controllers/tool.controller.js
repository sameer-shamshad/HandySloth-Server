import mongoose from 'mongoose';
import { Tool } from '../models/tool.model.js';
import { createToolSchema } from '../validations/tool.validation.js';

export const createTool = async (req, res) => {
  try {
    const { userId } = req;
    
    if (!userId) {
      return res.status(401).json({ error: 'The user id is missing. Please authenticate.' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'The user id is invalid.' });
    }

    // Validate request body with Zod
    const validationResult = createToolSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return res.status(400).json({ error: 'Validation failed.', details: errors });
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
    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
};