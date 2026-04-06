import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import produceRoutes from './routes/produce.js';
import cropRoutes from './routes/crops.js';
import dashboardRoutes from './routes/dashboard.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import mlRoutes from './routes/ml.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use('/api/auth', authRoutes);
app.use('/api/produce', produceRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ml', mlRoutes);

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);