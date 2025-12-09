import { z } from 'zod';
import mongoose from 'mongoose';
import { TOOL_CATEGORIES, TOOL_TAGS } from '../models/tool.model.js';

const VALID_PRIMARY_CATEGORIES = TOOL_CATEGORIES.filter(cat => cat !== '');

// Custom ObjectId validation
const objectIdSchema = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: 'Invalid ObjectId format.' }
);

const linksSchema = z.object({
  telegram: z.string().trim().default('').optional(),
  x: z.string().trim().default('').optional(),
  website: z.string().trim().default('').optional(),
}).default({
  telegram: '',
  x: '',
  website: ''
});

// Create tool schema
export const createToolSchema = z.object({
  name: z.string().trim().min(1, 'Tool name is required and must be a non-empty string.'),
  logo: z.string().trim().default('').optional(),
  primaryCategory: z.enum(
    VALID_PRIMARY_CATEGORIES,
    { errorMap: () => ({ message: 'The primary category is required and cannot be empty.' }) }
  ),
  category: z.array(z.enum(TOOL_CATEGORIES, { errorMap: () => ({ message: 'The category is invalid.' }) })).min(1, 'At least one category is required.'),
  shortDescription: z.string().trim().max(500, 'The short description cannot exceed 500 characters.').optional().default(''),
  fullDetail: z.string().trim().max(5000, 'The full detail cannot exceed 5000 characters.').optional().default(''),
  toolImages: z.array(z.string().trim().min(1)).max(5, 'Maximum 5 images are allowed.').default([]),
  tags: z.array(z.enum(TOOL_TAGS, { errorMap: () => ({ message: 'The tag is invalid.' }) })).default([]),
  links: linksSchema.optional()
});

// Update tool schema - same as create schema (all fields required, _id comes from route params)
export const updateToolSchema = createToolSchema;

