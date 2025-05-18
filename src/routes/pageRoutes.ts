import express from 'express';
import { authenticate, AuthRequest } from '../middlewares/authMiddleware';

const router = express.Router();

// Debug route om gemakkelijk te testen
router.get('/test', (req, res) => {
    res.send('Test route werkt!');
});

// Startpagina - Landing page
router.get('/', (req, res) => {
    // Check of de gebruiker al is ingelogd via cookie
    if (req.cookies && req.cookies.token) {
        return res.redirect('/dashboard');
    }
    res.render('landing', { title: 'FIFA Nexus - Home' });
});

// Login pagina
router.get('/login', (req, res) => {
    // Check of de gebruiker al is ingelogd via cookie
    if (req.cookies && req.cookies.token) {
        return res.redirect('/dashboard');
    }
    res.render('login', { title: 'Login - FIFA Nexus' });
});

// Registratie pagina
router.get('/register', (req, res) => {
    // Check of de gebruiker al is ingelogd via cookie
    if (req.cookies && req.cookies.token) {
        return res.redirect('/dashboard');
    }
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

// Dashboard pagina (beveiligd)
router.get('/dashboard', authenticate, (req: AuthRequest, res) => {
    res.render('dashboard', {
        title: 'Dashboard - FIFA Nexus',
        user: req.user
    });
});

// Quiz pagina (beveiligd)
router.get('/quiz', authenticate, (req: AuthRequest, res) => {
    res.render('quiz', {
        title: 'Quiz - FIFA Nexus',
        user: req.user
    });
});

// Favoriete clubs pagina (beveiligd)
router.get('/favorite-clubs', authenticate, (req: AuthRequest, res) => {
    res.render('favorite-clubs', {
        title: 'Favoriete Clubs - FIFA Nexus',
        user: req.user
    });
});

// Blacklisted clubs pagina (beveiligd)
router.get('/blacklisted-clubs', authenticate, (req: AuthRequest, res) => {
    res.render('blacklisted-clubs', {
        title: 'Blacklisted Clubs - FIFA Nexus',
        user: req.user
    });
});

// Favoriete league pagina (beveiligd)
router.get('/favorite-league', authenticate, (req: AuthRequest, res) => {
    res.render('favorite-league', {
        title: 'Favoriete League - FIFA Nexus',
        user: req.user
    });
});

// 404 pagina
router.get('*', (req, res) => {
    res.status(404).render('404', { title: 'Pagina Niet Gevonden - FIFA Nexus' });
});

export default router;