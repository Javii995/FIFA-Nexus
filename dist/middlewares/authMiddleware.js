"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
// Middleware om te controleren of een gebruiker is ingelogd
const authenticate = (req, res, next) => {
    try {
        // Haal token op uit authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Toegang geweigerd. Geen token verstrekt.'
            });
            return;
        }
        const token = authHeader.split(' ')[1];
        // Verifieer token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Voeg user toe aan request object
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error('Auth middleware fout:', error);
        res.status(401).json({
            success: false,
            message: 'Ongeldige token. Toegang geweigerd.'
        });
    }
};
exports.authenticate = authenticate;
