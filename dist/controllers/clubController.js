"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClubDetails = exports.incrementClubViewCount = exports.removeClubFromFavorites = exports.addClubToFavorites = exports.searchClubs = exports.getFavoriteClubs = void 0;
const User_1 = __importDefault(require("../models/User"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const FUT_API_BASE_URL = 'https://api.futdatabase.com/api';
const FUT_API_KEY = process.env.FUT_API_KEY;
// Haal favoriete clubs van gebruiker op
const getFavoriteClubs = async (req, res) => {
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
        // Haal gedetailleerde info op voor elke favoriete club
        const favoriteClubsDetails = await Promise.all(user.favoriteClubs.map(async (favoriteClub) => {
            try {
                const clubDetails = await getClubDetailsFromAPI(favoriteClub.clubId);
                return {
                    ...clubDetails,
                    viewCount: favoriteClub.viewCount
                };
            }
            catch (error) {
                console.error(`Fout bij ophalen details voor club ${favoriteClub.clubId}:`, error);
                // Fallback data
                return {
                    id: favoriteClub.clubId,
                    name: 'Onbekende Club',
                    logo: '/images/default-club.png',
                    country: 'Onbekend',
                    league: 'Onbekende League',
                    viewCount: favoriteClub.viewCount
                };
            }
        }));
        res.status(200).json({
            success: true,
            favoriteClubs: favoriteClubsDetails
        });
    }
    catch (error) {
        console.error('Fout bij ophalen favoriete clubs:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het ophalen van je favoriete clubs'
        });
    }
};
exports.getFavoriteClubs = getFavoriteClubs;
// Zoek clubs in de database
const searchClubs = async (req, res) => {
    var _a;
    try {
        const { query } = req.query;
        if (!query || typeof query !== 'string' || query.trim().length < 2) {
            res.status(400).json({
                success: false,
                message: 'Zoekterm moet minimaal 2 karakters bevatten'
            });
            return;
        }
        try {
            const response = await (0, node_fetch_1.default)(`${FUT_API_BASE_URL}/clubs/search?q=${encodeURIComponent(query)}&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${FUT_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('API zoeken gefaald');
            }
            const data = await response.json();
            const searchResults = ((_a = data.clubs) === null || _a === void 0 ? void 0 : _a.map((club) => {
                var _a;
                return ({
                    id: ((_a = club.id) === null || _a === void 0 ? void 0 : _a.toString()) || '',
                    name: club.name || 'Onbekende Club',
                    logo: club.logo || '/images/default-club.png',
                    country: club.country || 'Onbekend',
                    league: club.league || 'Onbekende League'
                });
            })) || [];
            res.status(200).json({
                success: true,
                clubs: searchResults
            });
        }
        catch (apiError) {
            console.error('API zoeken gefaald, gebruik fallback:', apiError);
            // Fallback zoekresultaten
            const fallbackResults = [
                {
                    id: '1',
                    name: 'FC Barcelona',
                    logo: '/images/clubs/barcelona.png',
                    country: 'Spanje',
                    league: 'La Liga'
                },
                {
                    id: '2',
                    name: 'Real Madrid',
                    logo: '/images/clubs/real-madrid.png',
                    country: 'Spanje',
                    league: 'La Liga'
                }
            ].filter(club => club.name.toLowerCase().includes(query.toLowerCase()));
            res.status(200).json({
                success: true,
                clubs: fallbackResults
            });
        }
    }
    catch (error) {
        console.error('Fout bij zoeken clubs:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het zoeken'
        });
    }
};
exports.searchClubs = searchClubs;
// Voeg club toe aan favorieten (via zoeken)
const addClubToFavorites = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { clubId } = req.body;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Gebruiker niet gevonden'
            });
            return;
        }
        if (!clubId) {
            res.status(400).json({
                success: false,
                message: 'Club ID is verplicht'
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
        // Controleer of club al in favorieten staat
        const existingFavorite = user.favoriteClubs.find(fc => fc.clubId === clubId);
        if (existingFavorite) {
            res.status(400).json({
                success: false,
                message: 'Club staat al in je favorieten'
            });
            return;
        }
        // Haal club details op
        const clubDetails = await getClubDetailsFromAPI(clubId);
        // Voeg toe aan favorieten
        user.favoriteClubs.push({
            clubId,
            viewCount: 0
        });
        await user.save();
        res.status(200).json({
            success: true,
            message: `${clubDetails.name} toegevoegd aan favorieten!`,
            club: clubDetails
        });
    }
    catch (error) {
        console.error('Fout bij toevoegen club aan favorieten:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het toevoegen aan favorieten'
        });
    }
};
exports.addClubToFavorites = addClubToFavorites;
// Verwijder club uit favorieten
const removeClubFromFavorites = async (req, res) => {
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
        // Verwijder uit favorieten
        user.favoriteClubs = user.favoriteClubs.filter(fc => fc.clubId !== clubId);
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Club verwijderd uit favorieten'
        });
    }
    catch (error) {
        console.error('Fout bij verwijderen club uit favorieten:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het verwijderen uit favorieten'
        });
    }
};
exports.removeClubFromFavorites = removeClubFromFavorites;
// Verhoog 'gezien' teller voor club
const incrementClubViewCount = async (req, res) => {
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
        // Zoek club in favorieten
        const favoriteClub = user.favoriteClubs.find(fc => fc.clubId === clubId);
        if (!favoriteClub) {
            res.status(404).json({
                success: false,
                message: 'Club niet gevonden in je favorieten'
            });
            return;
        }
        // Verhoog view count
        favoriteClub.viewCount += 1;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Gezien teller verhoogd',
            newViewCount: favoriteClub.viewCount
        });
    }
    catch (error) {
        console.error('Fout bij verhogen view count:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het bijwerken van de teller'
        });
    }
};
exports.incrementClubViewCount = incrementClubViewCount;
// Haal gedetailleerde club informatie op
const getClubDetails = async (req, res) => {
    var _a;
    try {
        const { clubId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!clubId) {
            res.status(400).json({
                success: false,
                message: 'Club ID is verplicht'
            });
            return;
        }
        const clubDetails = await getClubDetailsFromAPI(clubId);
        // Haal view count op als gebruiker ingelogd is
        let viewCount = 0;
        if (userId) {
            const user = await User_1.default.findById(userId);
            const favoriteClub = user === null || user === void 0 ? void 0 : user.favoriteClubs.find(fc => fc.clubId === clubId);
            viewCount = (favoriteClub === null || favoriteClub === void 0 ? void 0 : favoriteClub.viewCount) || 0;
        }
        res.status(200).json({
            success: true,
            club: {
                ...clubDetails,
                viewCount
            }
        });
    }
    catch (error) {
        console.error('Fout bij ophalen club details:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het ophalen van club details'
        });
    }
};
exports.getClubDetails = getClubDetails;
// Helper functie om club details op te halen van API
const getClubDetailsFromAPI = async (clubId) => {
    var _a, _b;
    try {
        const response = await (0, node_fetch_1.default)(`${FUT_API_BASE_URL}/clubs/${clubId}`, {
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
        // Haal ook spelers op
        let players = [];
        try {
            const playersResponse = await (0, node_fetch_1.default)(`${FUT_API_BASE_URL}/clubs/${clubId}/players?limit=10`, {
                headers: {
                    'Authorization': `Bearer ${FUT_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            if (playersResponse.ok) {
                const playersData = await playersResponse.json();
                players = ((_a = playersData.players) === null || _a === void 0 ? void 0 : _a.map((player) => {
                    var _a;
                    return ({
                        id: ((_a = player.id) === null || _a === void 0 ? void 0 : _a.toString()) || '',
                        name: player.name || 'Onbekende Speler',
                        position: player.position || 'Onbekend',
                        nationality: player.nationality || 'Onbekend',
                        rating: player.rating || 0
                    });
                })) || [];
            }
        }
        catch (playersError) {
            console.error('Fout bij ophalen spelers:', playersError);
        }
        return {
            id: ((_b = club.id) === null || _b === void 0 ? void 0 : _b.toString()) || clubId,
            name: club.name || 'Onbekende Club',
            logo: club.logo || '/images/default-club.png',
            country: club.country || 'Onbekend',
            league: club.league || 'Onbekende League',
            founded: club.founded || 'Onbekend',
            stadium: club.stadium || 'Onbekend',
            players
        };
    }
    catch (error) {
        console.error('Fout bij ophalen club details van API:', error);
        // Fallback data
        return {
            id: clubId,
            name: 'Onbekende Club',
            logo: '/images/default-club.png',
            country: 'Onbekend',
            league: 'Onbekende League',
            founded: 'Onbekend',
            stadium: 'Onbekend',
            players: []
        };
    }
};
