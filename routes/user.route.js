import express from 'express';
import { getUserTools, getBookmarkedTools } from '../controllers/tool.controller.js';
import { getUserInfo, getUserById } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/', getUserInfo);
router.get('/tools', getUserTools);
router.get('/bookmarks', getBookmarkedTools);
router.get('/:userId', getUserById);

export default router;