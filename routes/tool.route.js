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
} from '../controllers/tool.controller.js';

const router = express.Router();

router.post('/', verifyToken, createTool);
router.get('/recent', (req, res, next) => {
  console.log('getRecentTools');
  next();
}, getRecentTools);
router.get('/trending', getTrendingTools);
router.get('/user/:userId', getToolsByUserId);
router.get('/:toolId', getToolById);
router.post('/:toolId/bookmark', verifyToken, bookmarkTool);
router.delete('/:toolId/bookmark', verifyToken, removeBookmark);

export default router;