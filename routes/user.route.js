import express from 'express';
import { getUserTools } from '../controllers/tool.controller.js';

const router = express.Router();

router.get('/tool', getUserTools);

export default router;