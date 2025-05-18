import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Interface voor de JWT payload
interface JwtPayload {
    id: string;
    username: string;
}

// Interface voor Request met user property
export interface AuthRequest extends Request {
    user?: JwtPayload;
}

// Middleware om te controleren of een gebruiker is ingelogd voor pagina's
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Haal token op uit authorization header of uit de cookies
        const authHeader = req.headers.authorization;
        let token = '';

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            // Als er geen token is, stuur terug naar login pagina
            return res.redirect('/login');
        }

        // Verifieer token
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        // Voeg user toe aan request object
        req.user = decoded;

        next();
    } catch (error) {
        console.error('Auth middleware fout:', error);

        // Bij een ongeldige token, stuur terug naar login pagina
        return res.redirect('/login');
    }
};

// Aparte middleware voor API routes
export const authenticateApi = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Haal token op uit authorization header of uit de cookies
        const authHeader = req.headers.authorization;
        let token = '';

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Toegang geweigerd. Geen token verstrekt.'
            });
        }

        // Verifieer token
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        // Voeg user toe aan request object
        req.user = decoded;

        next();
    } catch (error) {
        console.error('Auth middleware fout:', error);

        return res.status(401).json({
            success: false,
            message: 'Ongeldige token. Toegang geweigerd.'
        });
    }
};