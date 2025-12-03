import { Schema, model, ObjectId } from 'mongoose';

// Tool Category Enum
const TOOL_CATEGORIES = [
  '',
  'Data Analytics',
  'AI Tools',
  'Development',
  'Design',
  'Marketing',
  'Productivity',
  'Social Media',
  'Content Creation',
  'E-commerce',
  'Other'
];

// Tool Tag Enum
const TOOL_TAGS = [
  'Free',
  'Paid',
  'Open Source',
  'Web-based',
  'Desktop',
  'Mobile',
  'API',
  'Plugin',
  'No Signup',
  'Cloud',
  'Self-hosted',
  'AI Powered'
];

// Social Links Schema
const socialLinksSchema = new Schema({
  telegram: {
    type: String,
    default: '',
    trim: true
  },
  x: {
    type: String,
    default: '',
    trim: true
  },
  website: {
    type: String,
    default: '',
    trim: true
  }
}, { _id: false });

// Tool Schema
const toolSchema = new Schema({
  author: { type: ObjectId, ref: 'User', required: true },
  name: {
    trim: true,
    type: String,
    required: [true, 'The tool name is required.'],
  },
  logo: { type: String, trim: true, default: '' },
  shortDescription: {
    trim: true,
    type: String,
    maxlength: [500, 'The short description cannot exceed 500 characters.']
  },
  fullDetail: {
    trim: true,
    type: String,
    maxlength: [5000, 'The full detail cannot exceed 5000 characters.']
  },
  toolImages: [{ type: String, trim: true, default: [] }],
  category: [{
    type: String,
    required: [true, 'The category is required.'],
    enum: {
      values: TOOL_CATEGORIES,
      message: 'The category is invalid.'
    },
  }],
  tags: [{
    type: String,
    enum: {
      values: TOOL_TAGS,
      message: 'The tag is invalid.'
    }
  }],
  links: {
    type: socialLinksSchema,
    required: true,
    default: () => ({
      telegram: '',
      x: '',
      website: ''
    })
  },
  views: [{ type: ObjectId, ref: 'User', default: [] }],
  bookmarks: [{ type: ObjectId, ref: 'User', default: [] }],
}, {
  timestamps: true,
});

// Indexes for better query performance
toolSchema.index({ category: 1 });
toolSchema.index({ tags: 1 });
toolSchema.index({ views: -1 }); // For trending tools
toolSchema.index({ createdAt: -1 }); // For recent tools 
toolSchema.index({ bookmarks: -1 }); // For most bookmarked
toolSchema.index({ name: 'text' }); // Text search

export const Tool = model('Tool', toolSchema);