import express from 'express';
import mailRoutes from './routes/mailRoutes.js';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://172.16.0.2:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Serve uploaded files BEFORE body parser for upload routes
app.use('/uploads', express.static('uploads'));

// Routes BEFORE body parser to allow multer to process multipart data
app.use('/api', mailRoutes);

// Body parser middleware - place AFTER routes that need multer
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Webmail Backend running on http://localhost:${PORT}`);
});
