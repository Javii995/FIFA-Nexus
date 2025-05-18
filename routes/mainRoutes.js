import express from 'express';

const router = express.Router();

// Mock data
const blacklistedClubs = [
  { id: 1, name: 'Clubnaam 1', emblem: '/assets/club1.png', reason: 'Rivaliteit' },
  { id: 2, name: 'Clubnaam 2', emblem: '/assets/club2.png', reason: 'Persoonlijke voorkeur' },
];

const favoriteClubs = [
  { id: 1, name: 'Clubnaam 1', emblem: '/assets/club1.png' },
  { id: 2, name: 'Clubnaam 2', emblem: '/assets/club2.png' },
];

const favoriteLeagues = [
  { id: 1, name: 'League 1', emblem: '/assets/league1.png' },
  { id: 2, name: 'League 2', emblem: '/assets/league2.png' },
];

const questions = [
  {
    text: 'Welke club heeft dit embleem?',
    options: ['Club A', 'Club B', 'Club C', 'Club D'],
    correct: 1,
  },
];

let score = 0;
let highScore = 10;

// Routes
router.get('/blacklisted', (req, res) => {
  res.render('blacklisted', { blacklistedClubs });
});

router.get('/favorite-club', (req, res) => {
  res.render('favorite-club', { favoriteClubs });
});

router.get('/favorite-league', (req, res) => {
  res.render('favorite-league', { favoriteLeagues });
});

router.get('/home', (req, res) => {
  res.render('home');
});

router.get('/landing', (req, res) => {
  res.render('landing');
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/quiz-landing', (req, res) => {
  res.render('quiz-landing');
});

router.get('/quiz', (req, res) => {
  const question = questions[Math.floor(Math.random() * questions.length)];
  res.render('quiz', { question, score, highScore });
});

router.get('/registratie', (req, res) => {
  res.render('registratie');
});

router.get('/wachtwoord-vergeten', (req, res) => {
  res.render('wachtwoord-vergeten');
});

export default router;