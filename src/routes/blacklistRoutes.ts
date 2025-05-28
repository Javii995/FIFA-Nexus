import express from 'express';
import {
    getBlacklistedClubs,
    addClubToBlacklist,
    removeClubFromBlacklist,
    updateBlacklistReason
} from '../controllers/blacklistController';
import { authenticateApi } from '../middlewares/authMiddleware';

const router = express.Router();

// Alle blacklist routes zijn beveiligd
router.use(authenticateApi);

// Blacklist routes
router.get('/', getBlacklistedClubs);
router.post('/', addClubToBlacklist);
router.delete('/:clubId', removeClubFromBlacklist);
router.put('/:clubId/reason', updateBlacklistReason);

export default router;