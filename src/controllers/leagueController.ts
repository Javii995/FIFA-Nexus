// src/controllers/leagueController.ts - COMPLETE FIXED VERSION
import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { AuthRequest } from '../middlewares/authMiddleware';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const FUT_API_BASE_URL = 'https://api.futdatabase.com/api';
const FUT_API_KEY = process.env.FUT_API_KEY;

interface LeagueDetails {
    id: string;
    name: string;
    logo: string;
    country: string;
    founded?: string;
    clubs?: ClubInLeague[];
}

interface ClubInLeague {
    id: string;
    name: string;
    logo: string;
    country: string;
}

// Haal favoriete league van gebruiker op
export const getFavoriteLeague = async (req: AuthRequest, res: Response): Promise<void> => {
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

        if (!user.favoriteLeague) {
            res.status(200).json({
                success: true,
                favoriteLeague: null,
                message: 'Geen favoriete league ingesteld. Speel de quiz om er een toe te voegen!'
            });
            return;
        }

        // Haal gedetailleerde league informatie op
        const leagueDetails = await getLeagueDetailsFromAPI(user.favoriteLeague);

        res.status(200).json({
            success: true,
            favoriteLeague: leagueDetails
        });

    } catch (error) {
        console.error('Fout bij ophalen favoriete league:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het ophalen van je favoriete league'
        });
    }
};

// Stel favoriete league in
export const setFavoriteLeague = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { leagueId } = req.body;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Gebruiker niet gevonden'
            });
            return;
        }

        if (!leagueId) {
            res.status(400).json({
                success: false,
                message: 'League ID is verplicht'
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

        // Haal league details op om te controleren of het bestaat
        const leagueDetails = await getLeagueDetailsFromAPI(leagueId);

        // Je kan maximaal 1 league als favoriet hebben
        user.favoriteLeague = leagueId;
        await user.save();

        res.status(200).json({
            success: true,
            message: `${leagueDetails.name} ingesteld als je favoriete league!`,
            favoriteLeague: leagueDetails
        });

    } catch (error) {
        console.error('Fout bij instellen favoriete league:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het instellen van favoriete league'
        });
    }
};

// Verwijder favoriete league
export const removeFavoriteLeague = async (req: AuthRequest, res: Response): Promise<void> => {
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

        if (!user.favoriteLeague) {
            res.status(400).json({
                success: false,
                message: 'Je hebt geen favoriete league ingesteld'
            });
            return;
        }

        // Verwijder favoriete league
        user.favoriteLeague = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Favoriete league verwijderd'
        });

    } catch (error) {
        console.error('Fout bij verwijderen favoriete league:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het verwijderen van favoriete league'
        });
    }
};

// Haal clubs in een league op
export const getClubsInLeague = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { leagueId } = req.params;

        if (!leagueId) {
            res.status(400).json({
                success: false,
                message: 'League ID is verplicht'
            });
            return;
        }

        // Haal clubs in de league op van API
        const clubs = await getClubsInLeagueFromAPI(leagueId);

        res.status(200).json({
            success: true,
            clubs
        });

    } catch (error) {
        console.error('Fout bij ophalen clubs in league:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het ophalen van clubs in deze league'
        });
    }
};

// Haal alle beschikbare leagues op
export const getAllLeagues = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const leagues = await getAllLeaguesFromAPI();

        res.status(200).json({
            success: true,
            leagues
        });

    } catch (error) {
        console.error('Fout bij ophalen alle leagues:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het ophalen van leagues'
        });
    }
};

// Helper functie om league details op te halen van API
const getLeagueDetailsFromAPI = async (leagueId: string): Promise<LeagueDetails> => {
    try {
        if (!FUT_API_KEY) {
            throw new Error('Geen FUT API key geconfigureerd');
        }

        const response = await fetch(`${FUT_API_BASE_URL}/leagues/${leagueId}`, {
            headers: {
                'accept': 'application/json',
                'X-AUTH-TOKEN': FUT_API_KEY
            }
        });

        if (!response.ok) {
            throw new Error('League niet gevonden in API');
        }

        const data = await response.json();
        const league = data.league;

        // Haal ook clubs in deze league op
        const clubs = await getClubsInLeagueFromAPI(leagueId);

        return {
            id: league.id?.toString() || leagueId,
            name: league.name || 'Onbekende League',
            logo: league.logo || '/images/default-league.png',
            country: league.country || 'Onbekend',
            founded: league.founded || 'Onbekend',
            clubs
        };

    } catch (error) {
        console.error('Fout bij ophalen league details van API:', error);

        // Fallback data op basis van leagueId
        const fallbackLeagues: { [key: string]: LeagueDetails } = {
            '1': {
                id: '1',
                name: 'La Liga',
                logo: '/images/leagues/laliga.png',
                country: 'Spanje',
                founded: '1929',
                clubs: [
                    { id: '1', name: 'FC Barcelona', logo: '/images/clubs/barcelona.png', country: 'Spanje' },
                    { id: '2', name: 'Real Madrid', logo: '/images/clubs/real-madrid.png', country: 'Spanje' },
                    { id: '5', name: 'Atlético Madrid', logo: '/images/clubs/atletico.png', country: 'Spanje' }
                ]
            },
            '2': {
                id: '2',
                name: 'Premier League',
                logo: '/images/leagues/premier-league.png',
                country: 'Engeland',
                founded: '1992',
                clubs: [
                    { id: '3', name: 'Liverpool FC', logo: '/images/clubs/liverpool.png', country: 'Engeland' },
                    { id: '6', name: 'Manchester City', logo: '/images/clubs/manchester-city.png', country: 'Engeland' },
                    { id: '7', name: 'Chelsea FC', logo: '/images/clubs/chelsea.png', country: 'Engeland' }
                ]
            },
            '3': {
                id: '3',
                name: 'Bundesliga',
                logo: '/images/leagues/bundesliga.png',
                country: 'Duitsland',
                founded: '1963',
                clubs: [
                    { id: '4', name: 'Bayern München', logo: '/images/clubs/bayern.png', country: 'Duitsland' },
                    { id: '8', name: 'Borussia Dortmund', logo: '/images/clubs/dortmund.png', country: 'Duitsland' }
                ]
            }
        };

        return fallbackLeagues[leagueId] || {
            id: leagueId,
            name: 'Onbekende League',
            logo: '/images/default-league.png',
            country: 'Onbekend',
            founded: 'Onbekend',
            clubs: []
        };
    }
};

// Helper functie om clubs in een league op te halen
const getClubsInLeagueFromAPI = async (leagueId: string): Promise<ClubInLeague[]> => {
    try {
        if (!FUT_API_KEY) {
            throw new Error('Geen FUT API key geconfigureerd');
        }

        const response = await fetch(`${FUT_API_BASE_URL}/leagues/${leagueId}/clubs`, {
            headers: {
                'accept': 'application/json',
                'X-AUTH-TOKEN': FUT_API_KEY
            }
        });

        if (!response.ok) {
            throw new Error('Clubs in league niet gevonden');
        }

        const data = await response.json();

        return data.clubs?.map((club: any) => ({
            id: club.id?.toString() || '',
            name: club.name || 'Onbekende Club',
            logo: club.logo || '/images/default-club.png',
            country: club.country || 'Onbekend'
        })) || [];

    } catch (error) {
        console.error('Fout bij ophalen clubs in league van API:', error);

        // Fallback clubs per league
        const fallbackClubsByLeague: { [key: string]: ClubInLeague[] } = {
            '1': [ // La Liga
                { id: '1', name: 'FC Barcelona', logo: '/images/clubs/barcelona.png', country: 'Spanje' },
                { id: '2', name: 'Real Madrid', logo: '/images/clubs/real-madrid.png', country: 'Spanje' },
                { id: '5', name: 'Atlético Madrid', logo: '/images/clubs/atletico.png', country: 'Spanje' }
            ],
            '2': [ // Premier League
                { id: '3', name: 'Liverpool FC', logo: '/images/clubs/liverpool.png', country: 'Engeland' },
                { id: '6', name: 'Manchester City', logo: '/images/clubs/manchester-city.png', country: 'Engeland' },
                { id: '7', name: 'Chelsea FC', logo: '/images/clubs/chelsea.png', country: 'Engeland' }
            ],
            '3': [ // Bundesliga
                { id: '4', name: 'Bayern München', logo: '/images/clubs/bayern.png', country: 'Duitsland' },
                { id: '8', name: 'Borussia Dortmund', logo: '/images/clubs/dortmund.png', country: 'Duitsland' }
            ]
        };

        return fallbackClubsByLeague[leagueId] || [];
    }
};

// Helper functie om alle leagues op te halen
const getAllLeaguesFromAPI = async (): Promise<{ id: string; name: string; logo: string; country: string }[]> => {
    try {
        if (!FUT_API_KEY) {
            throw new Error('Geen FUT API key geconfigureerd');
        }

        const response = await fetch(`${FUT_API_BASE_URL}/leagues?limit=50`, {
            headers: {
                'accept': 'application/json',
                'X-AUTH-TOKEN': FUT_API_KEY
            }
        });

        if (!response.ok) {
            throw new Error('Leagues niet gevonden in API');
        }

        const data = await response.json();

        return data.leagues?.map((league: any) => ({
            id: league.id?.toString() || '',
            name: league.name || 'Onbekende League',
            logo: league.logo || '/images/default-league.png',
            country: league.country || 'Onbekend'
        })) || [];

    } catch (error) {
        console.error('Fout bij ophalen alle leagues van API:', error);

        // Fallback leagues
        return [
            { id: '1', name: 'La Liga', logo: '/images/leagues/laliga.png', country: 'Spanje' },
            { id: '2', name: 'Premier League', logo: '/images/leagues/premier-league.png', country: 'Engeland' },
            { id: '3', name: 'Bundesliga', logo: '/images/leagues/bundesliga.png', country: 'Duitsland' },
            { id: '4', name: 'Serie A', logo: '/images/leagues/serie-a.png', country: 'Italië' },
            { id: '5', name: 'Ligue 1', logo: '/images/leagues/ligue1.png', country: 'Frankrijk' }
        ];
    }
};