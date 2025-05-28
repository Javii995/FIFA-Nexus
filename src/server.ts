import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes';
import pageRoutes from './routes/pageRoutes';
import quizRoutes from './routes/quizRoutes';
import clubRoutes from './routes/clubRoutes';
import blacklistRoutes from './routes/blacklistRoutes';
import leagueRoutes from './routes/leagueRoutes';
import imageRoutes from './routes/imageRoutes';


// Onbehandelde fouten afvangen
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

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
app.use(cookieParser());
app.use(session({
    secret: process.env.JWT_SECRET || 'fallback_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1 dag
}));

app.use(express.static(path.join(__dirname, '../public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.get('/test', (req, res) => {
    res.send('FIFA Nexus Server is actief!');
});

app.use('/api/auth', authRoutes);           // Authenticatie routes
app.use('/api/quiz', quizRoutes);          // Quiz functionaliteit
app.use('/api/clubs', clubRoutes);         // Club beheer (favorieten)
app.use('/api/blacklist', blacklistRoutes); // Blacklist beheer
app.use('/api/leagues', leagueRoutes);     // League beheer
app.use('/api/images', imageRoutes);
app.use('/', pageRoutes);

// Connectie met MongoDB en server starten
console.log('Verbinding maken met MongoDB Atlas...');
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Verbonden met MongoDB Atlas');
        app.listen(PORT, () => {
            console.log(`Server draait op http://localhost:${PORT}`);
            console.log('');
            console.log(' Beschikbare API endpoints:');
            console.log(' Auth: /api/auth/login, /api/auth/register');
            console.log(' Quiz: /api/quiz/start, /api/quiz/answer');
            console.log(' Clubs: /api/clubs/favorites, /api/clubs/search');
            console.log(' Blacklist: /api/blacklist/');
            console.log(' Leagues: /api/leagues/favorite');
            console.log('');
            console.log(' Pagina\'s: /login, /register, /dashboard, /quiz');
            console.log('');
        });
    })
    .catch((error) => {
        console.error('MongoDB verbindingsfout:', error);
        process.exit(1);
    });

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Er is iets misgegaan!');
});

