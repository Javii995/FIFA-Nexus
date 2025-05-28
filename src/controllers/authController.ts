import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// nieuwe gebruiker toevoegen
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password } = req.body;

        // Check of gebruiker al bestaat
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'Email of gebruikersnaam is al in gebruik'
            });
            return;
        }

        // aanmaken
        const user = new User({
            username,
            email,
            password
        });

        await user.save();

        // JWT token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 dag token opslaan in lokaal geheugen
        });

        res.status(201).json({
            success: true,
            message: 'Gebruiker succesvol geregistreerd',
            token
        });
    } catch (error) {
        console.error('Registratie fout:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het registreren'
        });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Ongeldige gebruikersnaam of wachtwoord'
            });
            return;
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: 'Ongeldige gebruikersnaam of wachtwoord'
            });
            return;
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

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
    } catch (error) {
        console.error('Login fout:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het inloggen'
        });
    }
};

// Uitloggen
export const logout = (req: Request, res: Response): void => {
    // Clear de cookie
    res.clearCookie('token');

    res.status(200).json({
        success: true,
        message: 'Succesvol uitgelogd'
    });
};

// Wachtwoord vergeten functionaliteit
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        // Genereer random token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Zoek gebruiker op basis van email
        const user = await User.findOne({ email });

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
    } catch (error) {
        console.error('Fout bij wachtwoord vergeten:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het verwerken van je aanvraag'
        });
    }
};

// Wachtwoord resetten functionaliteit
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Zoek gebruiker met geldig reset token
        const user = await User.findOne({
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
    } catch (error) {
        console.error('Fout bij resetten wachtwoord:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het resetten van je wachtwoord'
        });
    }
};

// Huidige gebruiker ophalen
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
        // @ts-ignore - We zullen user toevoegen aan req object in onze middleware
        const userId = req.user.id;

        const user = await User.findById(userId).select('-password');

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
    } catch (error) {
        console.error('Fout bij ophalen gebruiker:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het ophalen van gebruikersgegevens'
        });
    }
};