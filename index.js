import { PORT } from './config/env.config.js';
import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';

import { connectMongoDB } from './config/mongo.config.js';
import authenticationRoutes from './routes/authentication.route.js';

const app = express();

connectMongoDB(); // Connect to MongoDB

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authenticationRoutes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));