import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { 
  createTool,
} from '../controllers/tool.controller.js';

const router = express.Router();

router.post('/', createTool);