// src/routes/leagueRoutes.ts
import express from 'express';
import {
    getFavoriteLeague,
    setFavoriteLeague,
    removeFavoriteLeague,
    getClubsInLeague,
    getAllLeagues
} from '../controllers/leagueController';
import { authenticateApi } from '../middlewares/authMiddleware';

const router = express.Router();

// Alle league routes zijn beveiligd
router.use(authenticateApi);

// Favoriete league routes
router.get('/favorite', getFavoriteLeague);
router.post('/favorite', setFavoriteLeague);
router.delete('/favorite', removeFavoriteLeague);

// League informatie routes
router.get('/', getAllLeagues);
router.get('/:leagueId/clubs', getClubsInLeague);

export default router;