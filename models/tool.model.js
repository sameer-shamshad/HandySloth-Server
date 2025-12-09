import { Schema, model, ObjectId } from 'mongoose';

// Tool Category Enum
export const TOOL_CATEGORIES = [
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

export const TOOL_TAGS = [
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

const ratingSchema = new Schema({
  userId: { type: ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  feedback: { type: String, trim: true, default: '' },
}, { _id: false });

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
  primaryCategory: {
    type: String,
    required: [true, 'The primary category is required.'],
    enum: {
      values: TOOL_CATEGORIES,
      message: 'The primary category is invalid.'
    },
  },
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
  ratings: [ratingSchema],
  views: [{ type: ObjectId, ref: 'User', default: [] }],
  votes: [{ type: ObjectId, ref: 'User', default: [] }],
  bookmarks: [{ type: ObjectId, ref: 'User', default: [] }],
}, {
  timestamps: true,
});

toolSchema.index({ category: 1 });
toolSchema.index({ tags: 1 });
toolSchema.index({ views: -1 });
toolSchema.index({ createdAt: -1 });
toolSchema.index({ bookmarks: -1 });
toolSchema.index({ name: 'text' });

export const Tool = model('Tool', toolSchema);