"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBlacklistReason = exports.removeClubFromBlacklist = exports.addClubToBlacklist = exports.getBlacklistedClubs = void 0;
const User_1 = __importDefault(require("../models/User"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const FUT_API_BASE_URL = 'https://api.futdatabase.com/api';
const FUT_API_KEY = process.env.FUT_API_KEY;
// Haal blacklisted clubs van gebruiker op
const getBlacklistedClubs = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Gebruiker niet gevonden'
            });
            return;
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Gebruiker niet gevonden'
            });
            return;
        }
        // Haal gedetailleerde info op voor elke blacklisted club
        const blacklistedClubsDetails = await Promise.all(user.blacklistedClubs.map(async (blacklistedClub) => {
            try {
                const clubDetails = await getClubDetailsFromAPI(blacklistedClub.clubId);
                return {
                    ...clubDetails,
                    reason: blacklistedClub.reason
                };
            }
            catch (error) {
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
        }));
        res.status(200).json({
            success: true,
            blacklistedClubs: blacklistedClubsDetails
        });
    }
    catch (error) {
        console.error('Fout bij ophalen blacklisted clubs:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het ophalen van je blacklisted clubs'
        });
    }
};
exports.getBlacklistedClubs = getBlacklistedClubs;
// Voeg club toe aan blacklist
const addClubToBlacklist = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
        const user = await User_1.default.findById(userId);
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
    }
    catch (error) {
        console.error('Fout bij toevoegen club aan blacklist:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het toevoegen aan blacklist'
        });
    }
};
exports.addClubToBlacklist = addClubToBlacklist;
// Verwijder club uit blacklist
const removeClubFromBlacklist = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { clubId } = req.params;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Gebruiker niet gevonden'
            });
            return;
        }
        const user = await User_1.default.findById(userId);
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
    }
    catch (error) {
        console.error('Fout bij verwijderen club uit blacklist:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het verwijderen uit blacklist'
        });
    }
};
exports.removeClubFromBlacklist = removeClubFromBlacklist;
// Update reden voor blacklisted club
const updateBlacklistReason = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
        const user = await User_1.default.findById(userId);
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
    }
    catch (error) {
        console.error('Fout bij bijwerken blacklist reden:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het bijwerken van de reden'
        });
    }
};
exports.updateBlacklistReason = updateBlacklistReason;
// Helper functie om club details op te halen van API
const getClubDetailsFromAPI = async (clubId) => {
    var _a;
    try {
        if (!FUT_API_KEY) {
            throw new Error('Geen FUT API key geconfigureerd');
        }
        const response = await (0, node_fetch_1.default)(`${FUT_API_BASE_URL}/clubs/${clubId}`, {
            headers: {
                'accept': 'application/json',
                'X-AUTH-TOKEN': FUT_API_KEY
            }
        });
        if (!response.ok) {
            throw new Error('Club niet gevonden in API');
        }
        const data = await response.json();
        const club = data.club;
        return {
            id: ((_a = club.id) === null || _a === void 0 ? void 0 : _a.toString()) || clubId,
            name: club.name || 'Onbekende Club',
            logo: club.logo || '/images/default-club.png',
            country: club.country || 'Onbekend',
            league: club.league || 'Onbekende League'
        };
    }
    catch (error) {
        console.error('Fout bij ophalen club details van API:', error);
        // Fallback data op basis van clubId
        const fallbackClubs = {
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
