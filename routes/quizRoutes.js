import express from 'express';

const router = express.Router();

// Mock data
const questions = [
  {
    text: 'Welke club heeft dit embleem?',
    options: ['Club A', 'Club B', 'Club C', 'Club D'],
    correct: 1,
  },
  {
    text: 'Welke league heeft dit embleem?',
    options: ['League A', 'League B', 'League C', 'League D'],
    correct: 2,
  },
];

let score = 0;
let highScore = 10;

// Render quiz page
router.get('/quiz', (req, res) => {
  const question = questions[Math.floor(Math.random() * questions.length)];
  res.render('quiz', { question, score, highScore });
});

export default router;