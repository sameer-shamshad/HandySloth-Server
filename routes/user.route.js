import express from 'express';
import { getUserToolIds, getBookmarkedToolIds, getBookmarkedTools, getVotedToolIds } from '../controllers/tool.controller.js';
import { getUserInfo, getUserById } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/', getUserInfo);
router.get('/tools/ids', getUserToolIds);
router.get('/bookmarks/ids', getBookmarkedToolIds);
router.get('/bookmarks', getBookmarkedTools);
router.get('/votes/ids', getVotedToolIds);
router.get('/:userId', getUserById);

export default router;