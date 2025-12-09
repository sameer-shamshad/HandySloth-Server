import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { 
  createTool,
  updateTool,
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
  rateTool,
  getToolsByPrimaryCategory,
  getMostPopularAlternative,
} from '../controllers/tool.controller.js';

const router = express.Router();

router.post('/', verifyToken, createTool);
router.put('/:toolId', verifyToken, updateTool);
router.get('/recent', getRecentTools);
router.get('/trending', getTrendingTools);
router.get('/category/:primaryCategory', getToolsByPrimaryCategory);
router.get('/popular-alternative/:primaryCategory', getMostPopularAlternative);
router.get('/stats/categories', getCategoryStats);
router.get('/user/:userId', getToolsByUserId);
router.post('/:toolId/view', verifyToken, incrementView);
router.get('/:toolId', getToolById);
router.post('/:toolId/bookmark', verifyToken, bookmarkTool);
router.delete('/:toolId/bookmark', verifyToken, removeBookmark);
router.post('/:toolId/upvote', verifyToken, upvoteTool);
router.delete('/:toolId/upvote', verifyToken, downvoteTool);
router.post('/:toolId/rating', verifyToken, rateTool);

export default router;