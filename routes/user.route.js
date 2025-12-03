import express from 'express';
import { getUserTools } from '../controllers/tool.controller.js';

const router = express.Router();

router.get('/tools', getUserTools);

export default router;