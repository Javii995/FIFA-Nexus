import express from 'express';

const router = express.Router();

// Mock data
const blacklistedClubs = [
  { id: 1, name: 'Clubnaam 1', emblem: '/assets/club1.png', reason: 'Rivaliteit' },
  { id: 2, name: 'Clubnaam 2', emblem: '/assets/club2.png', reason: 'Persoonlijke voorkeur' },
  { id: 3, name: 'Clubnaam 3', emblem: '/assets/club3.png', reason: 'Slechte ervaringen' },
];

// Render blacklisted page
router.get('/blacklisted', (req, res) => {
  res.render('blacklisted', { blacklistedClubs });
});

export default router;