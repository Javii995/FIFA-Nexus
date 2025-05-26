// src/routes/quizRoutes.ts
import express from 'express';
import {
    startQuiz,
    answerQuestion,
    addToFavorites,
    addToBlacklist,
    setFavoriteLeague,
    getQuizStats,
    saveQuizScore,
    getCurrentQuizSession
} from '../controllers/quizController';
import { authenticateApi } from '../middlewares/authMiddleware';

const router = express.Router();

// Alle quiz routes zijn beveiligd
router.use(authenticateApi);

// Quiz game routes
router.post('/start', startQuiz);
router.post('/answer', answerQuestion);
router.get('/current-session', getCurrentQuizSession);

// Favorieten en blacklist routes
router.post('/favorites/add', addToFavorites);
router.post('/blacklist/add', addToBlacklist);
router.post('/favorite-league/set', setFavoriteLeague);

// Statistieken en scores
router.get('/stats', getQuizStats);
router.post('/save-score', saveQuizScore);

export default router;