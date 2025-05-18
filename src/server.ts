import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';

// Routes importeren
import authRoutes from './routes/authRoutes';  // Zorg ervoor dat deze paden correct zijn
import pageRoutes from './routes/pageRoutes';  // Zorg ervoor dat deze paden correct zijn

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

// Static files instellen
app.use(express.static(path.join(__dirname, '../public')));

// View engine instellen
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Eenvoudige homeroute voor testen
app.get('/test', (req, res) => {
    res.send('FIFA Nexus Server is actief!');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/', pageRoutes);

// Connectie met MongoDB en server starten
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
        process.exit(1);  // Stop de applicatie bij database verbindingsfout
    });

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Er is iets misgegaan!');
});