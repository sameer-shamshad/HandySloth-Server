import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { 
  login, 
  register, 
  checkSession,
  refreshAccessToken,
} from '../controllers/authentication.controller.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/check-session', verifyToken, checkSession);
router.post('/refresh-access-token', refreshAccessToken);

export default router;