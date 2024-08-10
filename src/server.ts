import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import projectRoutes from './routes/projectRoutes';

dotenv.config();
connectDB();

const app = express();

app.use(express.json()); //Middleware para que express pueda entender json

//Router


app.use('/api/projects', projectRoutes);


export default app;