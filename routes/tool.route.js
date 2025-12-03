import express from 'express';
import { 
  createTool,
  getRecentTools,
  getTrendingTools,
  bookmarkTool,
  removeBookmark,
} from '../controllers/tool.controller.js';

const router = express.Router();

router.post('/', createTool);
router.get('/recent', getRecentTools);
router.get('/trending', getTrendingTools);
router.post('/:toolId/bookmark', bookmarkTool);
router.delete('/:toolId/bookmark', removeBookmark);

export default router;