"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// Routes importeren
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const pageRoutes_1 = __importDefault(require("./routes/pageRoutes"));
const quizRoutes_1 = __importDefault(require("./routes/quizRoutes"));
const clubRoutes_1 = __importDefault(require("./routes/clubRoutes"));
const blacklistRoutes_1 = __importDefault(require("./routes/blacklistRoutes"));
const leagueRoutes_1 = __importDefault(require("./routes/leagueRoutes"));
const imageRoutes_1 = __importDefault(require("./routes/imageRoutes"));
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
dotenv_1.default.config();
// Express app initialiseren
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fifa-nexus';
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    secret: process.env.JWT_SECRET || 'fallback_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1 dag
}));
// Static files instellen
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// View engine instellen
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, '../views'));
// Eenvoudige homeroute voor testen
app.get('/test', (req, res) => {
    res.send('FIFA Nexus Server is actief!');
});
// Routes registreren
app.use('/api/auth', authRoutes_1.default); // Authenticatie routes
app.use('/api/quiz', quizRoutes_1.default); // Quiz functionaliteit
app.use('/api/clubs', clubRoutes_1.default); // Club beheer (favorieten)
app.use('/api/blacklist', blacklistRoutes_1.default); // Blacklist beheer
app.use('/api/leagues', leagueRoutes_1.default); // League beheer
app.use('/api/images', imageRoutes_1.default);
app.use('/', pageRoutes_1.default); // Deze moet laatste blijven
// Connectie met MongoDB en server starten
console.log('Verbinding maken met MongoDB Atlas...');
mongoose_1.default.connect(MONGODB_URI)
    .then(() => {
    console.log('Verbonden met MongoDB Atlas');
    // Start de server nadat de database verbinding is gemaakt
    app.listen(PORT, () => {
        console.log(`Server draait op http://localhost:${PORT}`);
        console.log('');
        console.log('📊 Beschikbare API endpoints:');
        console.log('🔐 Auth: /api/auth/login, /api/auth/register');
        console.log('🎮 Quiz: /api/quiz/start, /api/quiz/answer');
        console.log('⭐ Clubs: /api/clubs/favorites, /api/clubs/search');
        console.log('🚫 Blacklist: /api/blacklist/');
        console.log('🏆 Leagues: /api/leagues/favorite');
        console.log('');
        console.log('🌐 Pagina\'s: /login, /register, /dashboard, /quiz');
        console.log('');
    });
})
    .catch((error) => {
    console.error('MongoDB verbindingsfout:', error);
    process.exit(1); // Stop de applicatie bij database verbindingsfout
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Er is iets misgegaan!');
});
