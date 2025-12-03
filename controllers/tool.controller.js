import { Tool } from '../models/tool.model.js';

export const createTool = async (req, res) => {
  try {
    const { name, description, category, tags, links } = req.body;

    if (!name || !description || !category || !tags || !links) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const tool = new Tool({
      name,
      description,
      category,
      tags,
      links,
    });

    await tool.save();

    return res.status(201).json({ message: 'Tool created successfully' });
  } catch (error) {
    console.error('Create tool error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}