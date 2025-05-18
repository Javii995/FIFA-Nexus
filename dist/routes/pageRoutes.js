"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Startpagina - Landing page
router.get('/', (req, res) => {
    res.render('landing', { title: 'FIFA Nexus - Home' });
});
// Login pagina
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login - FIFA Nexus' });
});
// Registratie pagina
router.get('/register', (req, res) => {
    res.render('register', { title: 'Registratie - FIFA Nexus' });
});
// Wachtwoord vergeten pagina
router.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { title: 'Wachtwoord Vergeten - FIFA Nexus' });
});
// Wachtwoord reset pagina
router.get('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    res.render('reset-password', {
        title: 'Wachtwoord Reset - FIFA Nexus',
        token
    });
});
// Beveiligde pagina's, alleen toegankelijk voor ingelogde gebruikers
router.get('/dashboard', authMiddleware_1.authenticate, (req, res) => {
    res.render('dashboard', {
        title: 'Dashboard - FIFA Nexus',
        user: req.user
    });
});
// Quiz pagina
router.get('/quiz', authMiddleware_1.authenticate, (req, res) => {
    res.render('quiz', {
        title: 'Quiz - FIFA Nexus',
        user: req.user
    });
});
// Favoriete clubs pagina
router.get('/favorite-clubs', authMiddleware_1.authenticate, (req, res) => {
    res.render('favorite-clubs', {
        title: 'Favoriete Clubs - FIFA Nexus',
        user: req.user
    });
});
// Blacklisted clubs pagina
router.get('/blacklisted-clubs', authMiddleware_1.authenticate, (req, res) => {
    res.render('blacklisted-clubs', {
        title: 'Blacklisted Clubs - FIFA Nexus',
        user: req.user
    });
});
// Favoriete league pagina
router.get('/favorite-league', authMiddleware_1.authenticate, (req, res) => {
    res.render('favorite-league', {
        title: 'Favoriete League - FIFA Nexus',
        user: req.user
    });
});
// 404 pagina
router.get('*', (req, res) => {
    res.status(404).render('404', { title: 'Pagina Niet Gevonden - FIFA Nexus' });
});
exports.default = router;
