import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { 
  createTool,
  getRecentTools,
  getTrendingTools,
  bookmarkTool,
  removeBookmark,
  getToolById,
  getToolsByUserId,
  incrementView,
  getCategoryStats,
  upvoteTool,
  downvoteTool,
} from '../controllers/tool.controller.js';

const router = express.Router();

router.post('/', verifyToken, createTool);
router.get('/recent', getRecentTools);
router.get('/trending', getTrendingTools);
router.get('/stats/categories', getCategoryStats);
router.get('/user/:userId', getToolsByUserId);
router.post('/:toolId/view', incrementView);
router.get('/:toolId', getToolById);
router.post('/:toolId/bookmark', verifyToken, bookmarkTool);
router.delete('/:toolId/bookmark', verifyToken, removeBookmark);
router.post('/:toolId/upvote', verifyToken, upvoteTool);
router.delete('/:toolId/upvote', verifyToken, downvoteTool);

export default router;