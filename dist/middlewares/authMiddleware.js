"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateApi = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
// Middleware om te controleren of een gebruiker is ingelogd voor pagina's
const authenticate = (req, res, next) => {
    try {
        // Haal token op uit authorization header of uit de cookies
        const authHeader = req.headers.authorization;
        let token = '';
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        if (!token) {
            // Als er geen token is, stuur terug naar login pagina
            return res.redirect('/login');
        }
        // Verifieer token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Voeg user toe aan request object
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error('Auth middleware fout:', error);
        // Bij een ongeldige token, stuur terug naar login pagina
        return res.redirect('/login');
    }
};
exports.authenticate = authenticate;
// Aparte middleware voor API routes
const authenticateApi = (req, res, next) => {
    try {
        // Haal token op uit authorization header of uit de cookies
        const authHeader = req.headers.authorization;
        let token = '';
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Toegang geweigerd. Geen token verstrekt.'
            });
        }
        // Verifieer token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Voeg user toe aan request object
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error('Auth middleware fout:', error);
        return res.status(401).json({
            success: false,
            message: 'Ongeldige token. Toegang geweigerd.'
        });
    }
};
exports.authenticateApi = authenticateApi;
