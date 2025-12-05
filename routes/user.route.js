import express from 'express';
import { getUserToolIds, getBookmarkedTools } from '../controllers/tool.controller.js';
import { getUserInfo, getUserById } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/', getUserInfo);
router.get('/:userId', getUserById);
router.get('/tools', getUserToolIds);
router.get('/bookmarks', getBookmarkedTools);

export default router;