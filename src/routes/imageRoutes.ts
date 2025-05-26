// src/routes/imageRoutes.ts
import express from 'express';
import { getClubImage, testImageRoute } from '../controllers/imageController';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Image routes werken!' });
});

// Test route met ID
router.get('/test/:clubId', testImageRoute);

// Image proxy routes
router.get('/clubs/:clubId', getClubImage);

export default router;