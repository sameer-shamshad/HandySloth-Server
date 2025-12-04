import { PORT } from './config/env.config.js';
import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';

import { connectMongoDB } from './config/mongo.config.js';
import toolRoutes from './routes/tool.route.js';
import authenticationRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import { verifyToken } from './middlewares/verifyToken.js';

const app = express();

connectMongoDB(); // Connect to MongoDB

app.use(cors({
  origin: '*',
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authenticationRoutes);
app.use('/api/tool', toolRoutes);
app.use('/api/user', verifyToken, userRoutes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));