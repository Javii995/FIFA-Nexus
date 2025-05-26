// src/controllers/imageController.ts
import { Request, Response } from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const FUT_API_BASE_URL = 'https://api.futdatabase.com/api';
const FUT_API_KEY = process.env.FUT_API_KEY;

// Proxy club images van FUT API
export const getClubImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clubId } = req.params;

        console.log('🖼️ Image request voor club:', clubId);

        if (!clubId) {
            console.log('❌ Geen club ID');
            res.status(400).send('Club ID is verplicht');
            return;
        }

        if (!FUT_API_KEY) {
            console.log('❌ Geen API key, gebruik fallback');
            res.redirect('/images/default-club.png');
            return;
        }

        const imageUrl = `${FUT_API_BASE_URL}/clubs/${clubId}/image`;
        console.log('🌐 Ophalen image van:', imageUrl);

        const response = await fetch(imageUrl, {
            headers: {
                'X-AUTH-TOKEN': FUT_API_KEY
            }
        });

        console.log('📡 API Response status:', response.status);

        if (!response.ok) {
            console.log('❌ API response niet OK, gebruik fallback');
            res.redirect('/images/default-club.png');
            return;
        }

        // Set juiste content type
        const contentType = response.headers.get('content-type') || 'image/png';
        res.setHeader('Content-Type', contentType);

        // Cache de image voor 1 uur
        res.setHeader('Cache-Control', 'public, max-age=3600');

        console.log('✅ Image doorgestuurd, content-type:', contentType);

        // Stream de image data
        response.body?.pipe(res);

    } catch (error) {
        console.error('❌ Fout bij ophalen club image:', error);
        res.redirect('/images/default-club.png');
    }
};

// Test route
export const testImageRoute = (req: Request, res: Response): void => {
    res.json({
        message: 'Image routes werken!',
        clubId: req.params.clubId || 'geen ID'
    });
};