import express from 'express';
import {
    getFavoriteClubs,
    searchClubs,
    addClubToFavorites,
    removeClubFromFavorites,
    incrementClubViewCount,
    getClubDetails
} from '../controllers/clubController';
import { authenticateApi } from '../middlewares/authMiddleware';

const router = express.Router();

// Alle club routes zijn beveiligd
router.use(authenticateApi);

// Favoriete clubs routes
router.get('/favorites', getFavoriteClubs);
router.post('/favorites', addClubToFavorites);
router.delete('/favorites/:clubId', removeClubFromFavorites);
router.put('/favorites/:clubId/view', incrementClubViewCount);

// Club search en details
router.get('/search', searchClubs);
router.get('/:clubId', getClubDetails);

export default router;