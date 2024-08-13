import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { corsConfig } from './config/cors';
import { connectDB } from './config/db';
import projectRoutes from './routes/projectRoutes';

dotenv.config();
connectDB();

const app = express();
app.use(cors(corsConfig));

//Login
app.use(morgan('dev')); //Middleware para ver las peticiones en consola

// Leer datos del formulario
app.use(express.json()); //Middleware para que express pueda entender json

//Router

app.use('/api/projects', projectRoutes);


export default app;