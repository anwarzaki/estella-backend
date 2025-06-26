import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import perfumeRoutes from './routes/perfumeRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import feedRoutes from './routes/feedRoutes.js';

dotenv.config();
connectDB();

const app = express();


app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5000'], 
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/perfume',perfumeRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/feeds',feedRoutes);

const PORT = process.env.PORT || 5001 ;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});
