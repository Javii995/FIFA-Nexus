"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.resetPassword = exports.forgotPassword = exports.logout = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// JWT Secret uit environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
// Email configuratie - FIX: createTransport ipv createTransporter
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
// Registratie van een nieuwe gebruiker
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Check of gebruiker al bestaat
        const existingUser = await User_1.default.findOne({
            $or: [{ email }, { username }]
        });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'Email of gebruikersnaam is al in gebruik'
            });
            return;
        }
        // Maak nieuwe gebruiker aan
        const user = new User_1.default({
            username,
            email,
            password
        });
        await user.save();
        // Genereer JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
        // Sla token op in cookie
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 dag
        });
        res.status(201).json({
            success: true,
            message: 'Gebruiker succesvol geregistreerd',
            token
        });
    }
    catch (error) {
        console.error('Registratie fout:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het registreren'
        });
    }
};
exports.register = register;
// Login functionaliteit
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        // Zoek gebruiker op basis van username
        const user = await User_1.default.findOne({ username });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Ongeldige gebruikersnaam of wachtwoord'
            });
            return;
        }
        // Controleer wachtwoord
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: 'Ongeldige gebruikersnaam of wachtwoord'
            });
            return;
        }
        // Genereer token
        const token = jsonwebtoken_1.default.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
        // Sla token op in cookie
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 dag
        });
        res.status(200).json({
            success: true,
            message: 'Inloggen succesvol',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    }
    catch (error) {
        console.error('Login fout:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het inloggen'
        });
    }
};
exports.login = login;
// Uitloggen
const logout = (req, res) => {
    // Clear de cookie
    res.clearCookie('token');
    res.status(200).json({
        success: true,
        message: 'Succesvol uitgelogd'
    });
};
exports.logout = logout;
// Wachtwoord vergeten functionaliteit
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        // Genereer random token
        const resetToken = crypto_1.default.randomBytes(20).toString('hex');
        // Zoek gebruiker op basis van email
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Geen gebruiker gevonden met dit e-mailadres'
            });
            return;
        }
        // Sla token op in database met vervaldatum (1 uur)
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 uur
        await user.save();
        // Maak reset URL
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
        // Stuur e-mail
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'FIFA Nexus - Wachtwoord resetten',
            html: `
        <h1>Wachtwoord Reset</h1>
        <p>Je hebt een wachtwoord reset aangevraagd. Klik op de link hieronder om je wachtwoord te resetten:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset je wachtwoord</a>
        <p>Deze link is 1 uur geldig.</p>
        <p>Als je deze aanvraag niet hebt gedaan, kun je deze e-mail negeren.</p>
      `
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json({
            success: true,
            message: 'E-mail voor wachtwoord reset is verstuurd'
        });
    }
    catch (error) {
        console.error('Fout bij wachtwoord vergeten:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het verwerken van je aanvraag'
        });
    }
};
exports.forgotPassword = forgotPassword;
// Wachtwoord resetten functionaliteit
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        // Zoek gebruiker met geldig reset token
        const user = await User_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Ongeldige of verlopen reset token'
            });
            return;
        }
        // Update wachtwoord
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Wachtwoord succesvol gewijzigd'
        });
    }
    catch (error) {
        console.error('Fout bij resetten wachtwoord:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het resetten van je wachtwoord'
        });
    }
};
exports.resetPassword = resetPassword;
// Huidige gebruiker ophalen
const getCurrentUser = async (req, res) => {
    try {
        // @ts-ignore - We zullen user toevoegen aan req object in onze middleware
        const userId = req.user.id;
        const user = await User_1.default.findById(userId).select('-password');
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Gebruiker niet gevonden'
            });
            return;
        }
        res.status(200).json({
            success: true,
            user
        });
    }
    catch (error) {
        console.error('Fout bij ophalen gebruiker:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het ophalen van gebruikersgegevens'
        });
    }
};
exports.getCurrentUser = getCurrentUser;
