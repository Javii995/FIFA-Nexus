"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
// Routes importeren
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const pageRoutes_1 = __importDefault(require("./routes/pageRoutes"));
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
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/', pageRoutes_1.default);
// Connectie met MongoDB
console.log('Verbinding maken met MongoDB Atlas...');
mongoose_1.default.connect(MONGODB_URI)
    .then(() => {
    console.log('Verbonden met MongoDB Atlas');
    app.listen(PORT, () => {
        console.log(`Server draait op http://localhost:3000`);
    });
})
    .catch((error) => {
    console.error('MongoDB verbindingsfout:', error);
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Er is iets misgegaan!');
});
exports.default = app;
