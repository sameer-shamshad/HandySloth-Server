import express from 'express';
import { 
  createTool,
} from '../controllers/tool.controller.js';

const router = express.Router();

router.post('/', createTool);

export default router;