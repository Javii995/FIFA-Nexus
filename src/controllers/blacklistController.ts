// src/controllers/blacklistController.ts
import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { AuthRequest } from '../middlewares/authMiddleware';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const FUT_API_BASE_URL = 'https://api.futdatabase.com/api';
const FUT_API_KEY = process.env.FUT_API_KEY;

interface BlacklistedClubDetails {
    id: string;
    name: string;
    logo: string;
    country: string;
    league: string;
    reason: string;
}

// Haal blacklisted clubs van gebruiker op
export const getBlacklistedClubs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Gebruiker niet gevonden'
            });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Gebruiker niet gevonden'
            });
            return;
        }

        // Haal gedetailleerde info op voor elke blacklisted club
        const blacklistedClubsDetails = await Promise.all(
            user.blacklistedClubs.map(async (blacklistedClub) => {
                try {
                    const clubDetails = await getClubDetailsFromAPI(blacklistedClub.clubId);
                    return {
                        ...clubDetails,
                        reason: blacklistedClub.reason
                    };
                } catch (error) {
                    console.error(`Fout bij ophalen details voor blacklisted club ${blacklistedClub.clubId}:`, error);
                    // Fallback data
                    return {
                        id: blacklistedClub.clubId,
                        name: 'Onbekende Club',
                        logo: '/images/default-club.png',
                        country: 'Onbekend',
                        league: 'Onbekende League',
                        reason: blacklistedClub.reason
                    };
                }
            })
        );

        res.status(200).json({
            success: true,
            blacklistedClubs: blacklistedClubsDetails
        });

    } catch (error) {
        console.error('Fout bij ophalen blacklisted clubs:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het ophalen van je blacklisted clubs'
        });
    }
};

// Voeg club toe aan blacklist
export const addClubToBlacklist = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { clubId, reason } = req.body;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Gebruiker niet gevonden'
            });
            return;
        }

        if (!clubId || !reason || reason.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: 'Club ID en reden zijn verplicht'
            });
            return;
        }

        if (reason.trim().length > 200) {
            res.status(400).json({
                success: false,
                message: 'Reden mag maximaal 200 karakters bevatten'
            });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Gebruiker niet gevonden'
            });
            return;
        }

        // Controleer of club al geblacklist is
        const existingBlacklist = user.blacklistedClubs.find(bc => bc.clubId === clubId);

        if (existingBlacklist) {
            res.status(400).json({
                success: false,
                message: 'Club staat al in je blacklist'
            });
            return;
        }

        // Haal club details op
        const clubDetails = await getClubDetailsFromAPI(clubId);

        // Voeg toe aan blacklist
        user.blacklistedClubs.push({
            clubId,
            reason: reason.trim()
        });

        // Verwijder uit favorieten als het daar in staat
        user.favoriteClubs = user.favoriteClubs.filter(fc => fc.clubId !== clubId);

        await user.save();

        res.status(200).json({
            success: true,
            message: `${clubDetails.name} toegevoegd aan blacklist!`,
            club: {
                ...clubDetails,
                reason: reason.trim()
            }
        });

    } catch (error) {
        console.error('Fout bij toevoegen club aan blacklist:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het toevoegen aan blacklist'
        });
    }
};

// Verwijder club uit blacklist
export const removeClubFromBlacklist = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { clubId } = req.params;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Gebruiker niet gevonden'
            });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Gebruiker niet gevonden'
            });
            return;
        }

        // Controleer of club in blacklist staat
        const blacklistedClub = user.blacklistedClubs.find(bc => bc.clubId === clubId);

        if (!blacklistedClub) {
            res.status(404).json({
                success: false,
                message: 'Club staat niet in je blacklist'
            });
            return;
        }

        // Verwijder uit blacklist
        user.blacklistedClubs = user.blacklistedClubs.filter(bc => bc.clubId !== clubId);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Club verwijderd uit blacklist'
        });

    } catch (error) {
        console.error('Fout bij verwijderen club uit blacklist:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het verwijderen uit blacklist'
        });
    }
};

// Update reden voor blacklisted club
export const updateBlacklistReason = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { clubId } = req.params;
        const { reason } = req.body;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Gebruiker niet gevonden'
            });
            return;
        }

        if (!reason || reason.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: 'Reden is verplicht'
            });
            return;
        }

        if (reason.trim().length > 200) {
            res.status(400).json({
                success: false,
                message: 'Reden mag maximaal 200 karakters bevatten'
            });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Gebruiker niet gevonden'
            });
            return;
        }

        // Zoek club in blacklist
        const blacklistedClub = user.blacklistedClubs.find(bc => bc.clubId === clubId);

        if (!blacklistedClub) {
            res.status(404).json({
                success: false,
                message: 'Club staat niet in je blacklist'
            });
            return;
        }

        // Update reden
        blacklistedClub.reason = reason.trim();
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Blacklist reden bijgewerkt',
            newReason: reason.trim()
        });

    } catch (error) {
        console.error('Fout bij bijwerken blacklist reden:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het bijwerken van de reden'
        });
    }
};

// Helper functie om club details op te halen van API
const getClubDetailsFromAPI = async (clubId: string): Promise<{ id: string; name: string; logo: string; country: string; league: string }> => {
    try {
        const response = await fetch(`${FUT_API_BASE_URL}/clubs/${clubId}`, {
            headers: {
                'Authorization': `Bearer ${FUT_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Club niet gevonden in API');
        }

        const data = await response.json();
        const club = data.club;

        return {
            id: club.id?.toString() || clubId,
            name: club.name || 'Onbekende Club',
            logo: club.logo || '/images/default-club.png',
            country: club.country || 'Onbekend',
            league: club.league || 'Onbekende League'
        };

    } catch (error) {
        console.error('Fout bij ophalen club details van API:', error);

        // Fallback data op basis van clubId
        const fallbackClubs: { [key: string]: any } = {
            '1': {
                id: '1',
                name: 'FC Barcelona',
                logo: '/images/clubs/barcelona.png',
                country: 'Spanje',
                league: 'La Liga'
            },
            '2': {
                id: '2',
                name: 'Real Madrid',
                logo: '/images/clubs/real-madrid.png',
                country: 'Spanje',
                league: 'La Liga'
            },
            '3': {
                id: '3',
                name: 'Liverpool FC',
                logo: '/images/clubs/liverpool.png',
                country: 'Engeland',
                league: 'Premier League'
            },
            '4': {
                id: '4',
                name: 'Bayern München',
                logo: '/images/clubs/bayern.png',
                country: 'Duitsland',
                league: 'Bundesliga'
            }
        };

        return fallbackClubs[clubId] || {
            id: clubId,
            name: 'Onbekende Club',
            logo: '/images/default-club.png',
            country: 'Onbekend',
            league: 'Onbekende League'
        };
    }
};