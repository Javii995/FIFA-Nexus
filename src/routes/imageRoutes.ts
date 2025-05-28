// src/routes/imageRoutes.ts - COMPLETE WITH LEAGUE ROUTES
import express from 'express';
import { getClubImage, getLeagueImage, testImageRoute } from '../controllers/imageController';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Image routes werken!' });
});

// Test route met ID
router.get('/test/:clubId', testImageRoute);

// Image proxy routes
router.get('/clubs/:clubId', getClubImage);
router.get('/leagues/:leagueId', getLeagueImage);

export default router;