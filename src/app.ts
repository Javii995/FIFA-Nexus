import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';

// Routes importeren
import authRoutes from './routes/authRoutes';
import pageRoutes from './routes/pageRoutes';

// Laad environment variables
dotenv.config();

// Express app initialiseren
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fifa-nexus';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(session({
    secret: process.env.JWT_SECRET || 'fallback_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1 dag
}));

// Static files instellen
app.use(express.static(path.join(__dirname, '../public')));

// View engine instellen
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/', pageRoutes);

// Connectie met MongoDB
// Wijzig de MongoDB verbinding in src/app.ts als volgt:
console.log('Verbinding maken met MongoDB Atlas...');
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Verbonden met MongoDB Atlas');
        // Start de server nadat de database verbinding is gemaakt
        app.listen(PORT, () => {
            console.log(`Server draait op http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB verbindingsfout:', error);
    });

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Er is iets misgegaan!');
});

export default app;