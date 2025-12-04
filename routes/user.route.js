import express from 'express';
import { getUserTools, getBookmarkedTools } from '../controllers/tool.controller.js';

const router = express.Router();

router.get('/tools', getUserTools);
router.get('/bookmarks', getBookmarkedTools);

export default router;