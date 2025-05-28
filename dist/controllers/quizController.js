"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentQuizSession = exports.saveQuizScore = exports.getQuizStats = exports.setFavoriteLeague = exports.addToBlacklist = exports.addToFavorites = exports.answerQuestion = exports.startQuiz = void 0;
const User_1 = __importDefault(require("../models/User"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const FUT_API_BASE_URL = 'https://api.futdatabase.com/api';
const FUT_API_KEY = process.env.FUT_API_KEY;
// Tijdelijke opslag voor actieve quiz sessies
const activeQuizSessions = new Map();
// Fallback data voor als API niet werkt
const FALLBACK_CLUBS = [
    // Premier League
    {
        id: '1',
        name: 'Arsenal FC',
        logo: '/images/clubs/arsenal.png',
        country: 'Engeland',
        league: 'Premier League'
    },
    {
        id: '2',
        name: 'Chelsea FC',
        logo: '/images/clubs/chelsea.png',
        country: 'Engeland',
        league: 'Premier League'
    },
    {
        id: '3',
        name: 'Liverpool FC',
        logo: '/images/clubs/liverpool.png',
        country: 'Engeland',
        league: 'Premier League'
    },
    {
        id: '4',
        name: 'Manchester City',
        logo: '/images/clubs/manchester-city.png',
        country: 'Engeland',
        league: 'Premier League'
    },
    {
        id: '5',
        name: 'Manchester United',
        logo: '/images/clubs/manchester-united.png',
        country: 'Engeland',
        league: 'Premier League'
    },
    {
        id: '6',
        name: 'Tottenham Hotspur',
        logo: '/images/clubs/tottenham.png',
        country: 'Engeland',
        league: 'Premier League'
    },
    {
        id: '7',
        name: 'Newcastle United',
        logo: '/images/clubs/newcastle.png',
        country: 'Engeland',
        league: 'Premier League'
    },
    {
        id: '8',
        name: 'Aston Villa',
        logo: '/images/clubs/aston-villa.png',
        country: 'Engeland',
        league: 'Premier League'
    },
    // La Liga
    {
        id: '9',
        name: 'FC Barcelona',
        logo: '/images/clubs/barcelona.png',
        country: 'Spanje',
        league: 'La Liga'
    },
    {
        id: '10',
        name: 'Real Madrid',
        logo: '/images/clubs/real-madrid.png',
        country: 'Spanje',
        league: 'La Liga'
    },
    {
        id: '11',
        name: 'Atlético Madrid',
        logo: '/images/clubs/atletico.png',
        country: 'Spanje',
        league: 'La Liga'
    },
    {
        id: '12',
        name: 'Sevilla FC',
        logo: '/images/clubs/sevilla.png',
        country: 'Spanje',
        league: 'La Liga'
    },
    {
        id: '13',
        name: 'Valencia CF',
        logo: '/images/clubs/valencia.png',
        country: 'Spanje',
        league: 'La Liga'
    },
    {
        id: '14',
        name: 'Real Sociedad',
        logo: '/images/clubs/real-sociedad.png',
        country: 'Spanje',
        league: 'La Liga'
    },
    // Bundesliga
    {
        id: '15',
        name: 'Bayern München',
        logo: '/images/clubs/bayern.png',
        country: 'Duitsland',
        league: 'Bundesliga'
    },
    {
        id: '16',
        name: 'Borussia Dortmund',
        logo: '/images/clubs/dortmund.png',
        country: 'Duitsland',
        league: 'Bundesliga'
    },
    {
        id: '17',
        name: 'RB Leipzig',
        logo: '/images/clubs/leipzig.png',
        country: 'Duitsland',
        league: 'Bundesliga'
    },
    {
        id: '18',
        name: 'Bayer Leverkusen',
        logo: '/images/clubs/leverkusen.png',
        country: 'Duitsland',
        league: 'Bundesliga'
    },
    {
        id: '19',
        name: 'Eintracht Frankfurt',
        logo: '/images/clubs/frankfurt.png',
        country: 'Duitsland',
        league: 'Bundesliga'
    },
    // Serie A
    {
        id: '20',
        name: 'Juventus',
        logo: '/images/clubs/juventus.png',
        country: 'Italië',
        league: 'Serie A'
    },
    {
        id: '21',
        name: 'AC Milan',
        logo: '/images/clubs/milan.png',
        country: 'Italië',
        league: 'Serie A'
    },
    {
        id: '22',
        name: 'Inter Milan',
        logo: '/images/clubs/inter.png',
        country: 'Italië',
        league: 'Serie A'
    },
    {
        id: '23',
        name: 'AS Roma',
        logo: '/images/clubs/roma.png',
        country: 'Italië',
        league: 'Serie A'
    },
    {
        id: '24',
        name: 'SSC Napoli',
        logo: '/images/clubs/napoli.png',
        country: 'Italië',
        league: 'Serie A'
    },
    {
        id: '25',
        name: 'Atalanta',
        logo: '/images/clubs/atalanta.png',
        country: 'Italië',
        league: 'Serie A'
    },
    // Ligue 1
    {
        id: '26',
        name: 'Paris Saint-Germain',
        logo: '/images/clubs/psg.png',
        country: 'Frankrijk',
        league: 'Ligue 1'
    },
    {
        id: '27',
        name: 'Olympique Marseille',
        logo: '/images/clubs/marseille.png',
        country: 'Frankrijk',
        league: 'Ligue 1'
    },
    {
        id: '28',
        name: 'Olympique Lyon',
        logo: '/images/clubs/lyon.png',
        country: 'Frankrijk',
        league: 'Ligue 1'
    },
    {
        id: '29',
        name: 'AS Monaco',
        logo: '/images/clubs/monaco.png',
        country: 'Frankrijk',
        league: 'Ligue 1'
    },
    // Eredivisie
    {
        id: '30',
        name: 'Ajax Amsterdam',
        logo: '/images/clubs/ajax.png',
        country: 'Nederland',
        league: 'Eredivisie'
    },
    {
        id: '31',
        name: 'PSV Eindhoven',
        logo: '/images/clubs/psv.png',
        country: 'Nederland',
        league: 'Eredivisie'
    },
    {
        id: '32',
        name: 'Feyenoord Rotterdam',
        logo: '/images/clubs/feyenoord.png',
        country: 'Nederland',
        league: 'Eredivisie'
    },
    // Primeira Liga
    {
        id: '33',
        name: 'FC Porto',
        logo: '/images/clubs/porto.png',
        country: 'Portugal',
        league: 'Primeira Liga'
    },
    {
        id: '34',
        name: 'Benfica',
        logo: '/images/clubs/benfica.png',
        country: 'Portugal',
        league: 'Primeira Liga'
    },
    {
        id: '35',
        name: 'Sporting CP',
        logo: '/images/clubs/sporting.png',
        country: 'Portugal',
        league: 'Primeira Liga'
    },
    // Belgische competitie
    {
        id: '36',
        name: 'Club Brugge',
        logo: '/images/clubs/club-brugge.png',
        country: 'België',
        league: 'Pro League'
    },
    {
        id: '37',
        name: 'RSC Anderlecht',
        logo: '/images/clubs/anderlecht.png',
        country: 'België',
        league: 'Pro League'
    },
    {
        id: '38',
        name: 'KRC Genk',
        logo: '/images/clubs/genk.png',
        country: 'België',
        league: 'Pro League'
    },
    // Overige Europa
    {
        id: '39',
        name: 'Celtic FC',
        logo: '/images/clubs/celtic.png',
        country: 'Schotland',
        league: 'Scottish Premiership'
    },
    {
        id: '40',
        name: 'Rangers FC',
        logo: '/images/clubs/rangers.png',
        country: 'Schotland',
        league: 'Scottish Premiership'
    }
];
const FALLBACK_LEAGUES = [
    {
        id: '1',
        name: 'Premier League',
        logo: '/images/leagues/premier-league.png',
        country: 'Engeland'
    },
    {
        id: '2',
        name: 'La Liga',
        logo: '/images/leagues/laliga.png',
        country: 'Spanje'
    },
    {
        id: '3',
        name: 'Bundesliga',
        logo: '/images/leagues/bundesliga.png',
        country: 'Duitsland'
    },
    {
        id: '4',
        name: 'Serie A',
        logo: '/images/leagues/serie-a.png',
        country: 'Italië'
    },
    {
        id: '5',
        name: 'Ligue 1',
        logo: '/images/leagues/ligue1.png',
        country: 'Frankrijk'
    },
    {
        id: '6',
        name: 'Eredivisie',
        logo: '/images/leagues/eredivisie.png',
        country: 'Nederland'
    },
    {
        id: '7',
        name: 'Primeira Liga',
        logo: '/images/leagues/primeira-liga.png',
        country: 'Portugal'
    },
    {
        id: '8',
        name: 'Pro League',
        logo: '/images/leagues/pro-league.png',
        country: 'België'
    },
    {
        id: '9',
        name: 'Scottish Premiership',
        logo: '/images/leagues/scottish-premiership.png',
        country: 'Schotland'
    },
    {
        id: '10',
        name: 'Champions League',
        logo: '/images/leagues/champions-league.png',
        country: 'Europa'
    },
    {
        id: '11',
        name: 'Europa League',
        logo: '/images/leagues/europa-league.png',
        country: 'Europa'
    },
    {
        id: '12',
        name: 'Conference League',
        logo: '/images/leagues/conference-league.png',
        country: 'Europa'
    }
];
// Haal clubs op van de FUT Database API met IMAGE PROXY
const getRandomClubs = async (count = 20) => {
    var _a, _b, _c;
    try {
        if (!FUT_API_KEY) {
            console.log('Geen FUT API key gevonden, gebruik fallback data');
            throw new Error('Geen API key');
        }
        console.log('Proberen clubs op te halen van FUT API...');
        // Probeer verschillende pagina's om variatie te krijgen
        const randomPage = Math.floor(Math.random() * 5) + 1;
        const url = `${FUT_API_BASE_URL}/clubs?page=${randomPage}`;
        const response = await (0, node_fetch_1.default)(url, {
            headers: {
                'accept': 'application/json',
                'X-AUTH-TOKEN': FUT_API_KEY
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.log('API Error response:', errorText);
            throw new Error(`API response niet OK: ${response.status}`);
        }
        const data = await response.json();
        console.log('API Response ontvangen, items:', ((_a = data.items) === null || _a === void 0 ? void 0 : _a.length) || 0);
        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
            const clubs = data.items.slice(0, count).map((club) => {
                var _a, _b;
                // Gebruik de echte club ID en maak IMAGE PROXY URL
                const clubId = (_a = club.id) === null || _a === void 0 ? void 0 : _a.toString();
                return {
                    id: clubId || Math.random().toString(),
                    name: club.name || 'Onbekende Club',
                    logo: clubId ? `/api/images/clubs/${clubId}` : '/images/default-club.png', // ✅ IMAGE PROXY
                    country: 'API Club',
                    league: ((_b = club.league) === null || _b === void 0 ? void 0 : _b.toString()) || 'API League'
                };
            });
            console.log(`✅ ${clubs.length} clubs succesvol opgehaald van FUT API`);
            console.log('Eerste club ID:', (_b = clubs[0]) === null || _b === void 0 ? void 0 : _b.id, 'Logo:', (_c = clubs[0]) === null || _c === void 0 ? void 0 : _c.logo);
            return clubs;
        }
        else {
            throw new Error('Geen clubs gevonden in API response');
        }
    }
    catch (error) {
        console.error('❌ FUT API fout, gebruik fallback data:', error);
        // Shuffle fallback data voor variatie
        const shuffled = [...FALLBACK_CLUBS].sort(() => 0.5 - Math.random());
        console.log(`📦 Gebruik ${shuffled.length} fallback clubs`);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }
};
// Probeer leagues van API met IMAGE PROXY
const getRandomLeagues = async (count = 10) => {
    try {
        if (!FUT_API_KEY) {
            throw new Error('Geen API key');
        }
        console.log('Proberen leagues op te halen van FUT API...');
        const response = await (0, node_fetch_1.default)(`${FUT_API_BASE_URL}/leagues?limit=${count}`, {
            headers: {
                'accept': 'application/json',
                'X-AUTH-TOKEN': FUT_API_KEY
            }
        });
        if (!response.ok) {
            throw new Error('API leagues fout');
        }
        const data = await response.json();
        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
            const leagues = data.items.map((league) => {
                var _a;
                const leagueId = (_a = league.id) === null || _a === void 0 ? void 0 : _a.toString();
                return {
                    id: leagueId || Math.random().toString(),
                    name: league.name || 'Onbekende League',
                    logo: leagueId ? `/api/images/leagues/${leagueId}` : '/images/default-league.png', // ✅ IMAGE PROXY
                    country: league.country || 'Onbekend'
                };
            });
            console.log(`✅ ${leagues.length} leagues succesvol opgehaald van FUT API`);
            return leagues;
        }
        else {
            throw new Error('Geen leagues gevonden');
        }
    }
    catch (error) {
        console.error('Fout bij ophalen leagues, gebruik fallback:', error);
        console.log('📦 Gebruik fallback leagues...');
        const shuffled = [...FALLBACK_LEAGUES].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }
};
// Genereer een quiz vraag
const generateQuizQuestion = async (userId, allClubs, allLeagues, isClubQuestion) => {
    try {
        // Haal de gebruiker op om blacklisted clubs te vermijden
        const user = await User_1.default.findById(userId);
        const blacklistedClubIds = (user === null || user === void 0 ? void 0 : user.blacklistedClubs.map(bc => bc.clubId)) || [];
        if (isClubQuestion) {
            // Filter blacklisted clubs eruit
            const availableClubs = allClubs.filter(club => !blacklistedClubIds.includes(club.id));
            if (availableClubs.length < 4) {
                console.log('Niet genoeg clubs beschikbaar na blacklist filter, gebruik alle clubs');
                // Gebruik alle clubs als fallback
                const allAvailable = allClubs.length >= 4 ? allClubs : FALLBACK_CLUBS;
                if (allAvailable.length < 4)
                    return null;
                const correctAnswer = allAvailable[Math.floor(Math.random() * allAvailable.length)];
                const wrongAnswers = allAvailable
                    .filter(club => club.id !== correctAnswer.id)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3);
                const options = [correctAnswer, ...wrongAnswers]
                    .sort(() => 0.5 - Math.random());
                return {
                    type: 'club',
                    correctAnswer,
                    options
                };
            }
            // Kies willekeurig juiste antwoord
            const correctAnswer = availableClubs[Math.floor(Math.random() * availableClubs.length)];
            // Kies 3 andere willekeurige clubs voor foute antwoorden
            const wrongAnswers = availableClubs
                .filter(club => club.id !== correctAnswer.id)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);
            // Combineer en schud alle opties
            const options = [correctAnswer, ...wrongAnswers]
                .sort(() => 0.5 - Math.random());
            return {
                type: 'club',
                correctAnswer,
                options
            };
        }
        else {
            // League vraag
            if (allLeagues.length < 4) {
                return null;
            }
            const correctAnswer = allLeagues[Math.floor(Math.random() * allLeagues.length)];
            const wrongAnswers = allLeagues
                .filter(league => league.id !== correctAnswer.id)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);
            const options = [correctAnswer, ...wrongAnswers]
                .sort(() => 0.5 - Math.random());
            return {
                type: 'league',
                correctAnswer,
                options
            };
        }
    }
    catch (error) {
        console.error('Fout bij genereren quiz vraag:', error);
        return null;
    }
};
// Start nieuwe quiz
const startQuiz = async (req, res) => {
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
        console.log('🎮 Starten quiz voor gebruiker:', userId);
        // Haal clubs en leagues op
        const [clubs, leagues] = await Promise.all([
            getRandomClubs(30),
            getRandomLeagues(15)
        ]);
        console.log(`📊 Beschikbaar: ${clubs.length} clubs, ${leagues.length} leagues`);
        // Genereer eerste vraag (club vraag)
        const firstQuestion = await generateQuizQuestion(userId, clubs, leagues, true);
        if (!firstQuestion) {
            res.status(500).json({
                success: false,
                message: 'Kon geen quiz vraag genereren'
            });
            return;
        }
        // Sla quiz sessie op
        activeQuizSessions.set(userId, {
            questions: [firstQuestion],
            currentQuestion: 0,
            score: 0,
            startTime: new Date()
        });
        console.log('✅ Quiz gestart voor gebruiker:', userId);
        res.status(200).json({
            success: true,
            message: 'Quiz gestart',
            question: {
                type: firstQuestion.type,
                image: firstQuestion.correctAnswer.logo,
                options: firstQuestion.options.map(option => ({
                    id: option.id,
                    name: option.name
                }))
            },
            score: 0,
            questionNumber: 1
        });
    }
    catch (error) {
        console.error('❌ Fout bij starten quiz:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het starten van de quiz'
        });
    }
};
exports.startQuiz = startQuiz;
// src/controllers/quizController.ts - DEEL 2
// Beantwoord quiz vraag
const answerQuestion = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { answerId } = req.body;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Gebruiker niet gevonden'
            });
            return;
        }
        const session = activeQuizSessions.get(userId);
        if (!session) {
            res.status(400).json({
                success: false,
                message: 'Geen actieve quiz sessie gevonden'
            });
            return;
        }
        const currentQuestion = session.questions[session.currentQuestion];
        const isCorrect = currentQuestion.correctAnswer.id === answerId;
        console.log(`📝 Antwoord verwerken: ${isCorrect ? 'CORRECT' : 'FOUT'} (${answerId})`);
        if (isCorrect) {
            session.score += 1;
        }
        // Als antwoord fout is, beëindig de quiz
        if (!isCorrect) {
            // Verwijder sessie
            activeQuizSessions.delete(userId);
            // Update hoogste score als nodig
            const user = await User_1.default.findById(userId);
            let isNewHighScore = false;
            if (user && session.score > user.quizHighScore) {
                user.quizHighScore = session.score;
                await user.save();
                isNewHighScore = true;
                console.log(`🏆 Nieuwe high score: ${session.score}`);
            }
            console.log(`❌ Quiz beëindigd - Score: ${session.score}`);
            res.status(200).json({
                success: true,
                gameOver: true,
                finalScore: session.score,
                isNewHighScore,
                correctAnswer: {
                    id: currentQuestion.correctAnswer.id,
                    name: currentQuestion.correctAnswer.name
                }
            });
            return;
        }
        // Als antwoord correct is, genereer volgende vraag
        const [clubs, leagues] = await Promise.all([
            getRandomClubs(30),
            getRandomLeagues(15)
        ]);
        // Afwisselen tussen club en league vragen
        const isNextClubQuestion = currentQuestion.type === 'league';
        const nextQuestion = await generateQuizQuestion(userId, clubs, leagues, isNextClubQuestion);
        if (!nextQuestion) {
            // Geen meer vragen beschikbaar, beëindig quiz
            activeQuizSessions.delete(userId);
            const user = await User_1.default.findById(userId);
            let isNewHighScore = false;
            if (user && session.score > user.quizHighScore) {
                user.quizHighScore = session.score;
                await user.save();
                isNewHighScore = true;
            }
            console.log(`🏁 Quiz voltooid - alle vragen beantwoord - Score: ${session.score}`);
            res.status(200).json({
                success: true,
                gameOver: true,
                finalScore: session.score,
                isNewHighScore,
                message: 'Alle beschikbare vragen zijn beantwoord!'
            });
            return;
        }
        // Voeg vraag toe en update sessie
        session.questions.push(nextQuestion);
        session.currentQuestion += 1;
        console.log(`➡️ Volgende vraag geladen: ${nextQuestion.type} (Score: ${session.score})`);
        res.status(200).json({
            success: true,
            correct: true,
            question: {
                type: nextQuestion.type,
                image: nextQuestion.correctAnswer.logo,
                options: nextQuestion.options.map(option => ({
                    id: option.id,
                    name: option.name
                }))
            },
            score: session.score,
            questionNumber: session.currentQuestion + 1
        });
    }
    catch (error) {
        console.error('❌ Fout bij beantwoorden vraag:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het verwerken van je antwoord'
        });
    }
};
exports.answerQuestion = answerQuestion;
// Voeg club toe aan favorieten
const addToFavorites = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { clubId, clubName } = req.body;
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
        // Controleer of club al in favorieten staat
        const existingFavorite = user.favoriteClubs.find(fc => fc.clubId === clubId);
        if (existingFavorite) {
            res.status(400).json({
                success: false,
                message: 'Club staat al in je favorieten'
            });
            return;
        }
        // Voeg toe aan favorieten
        user.favoriteClubs.push({
            clubId,
            viewCount: 0
        });
        await user.save();
        console.log(`⭐ ${clubName} toegevoegd aan favorieten voor gebruiker ${userId}`);
        res.status(200).json({
            success: true,
            message: `${clubName} toegevoegd aan favorieten!`
        });
    }
    catch (error) {
        console.error('❌ Fout bij toevoegen aan favorieten:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het toevoegen aan favorieten'
        });
    }
};
exports.addToFavorites = addToFavorites;
// Voeg club toe aan blacklist
const addToBlacklist = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { clubId, clubName, reason } = req.body;
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
                message: 'Reden is verplicht voor blacklisting'
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
        // Voeg toe aan blacklist
        user.blacklistedClubs.push({
            clubId,
            reason: reason.trim()
        });
        await user.save();
        console.log(`🚫 ${clubName} toegevoegd aan blacklist voor gebruiker ${userId}`);
        res.status(200).json({
            success: true,
            message: `${clubName} toegevoegd aan blacklist!`
        });
    }
    catch (error) {
        console.error('❌ Fout bij toevoegen aan blacklist:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het toevoegen aan blacklist'
        });
    }
};
exports.addToBlacklist = addToBlacklist;
// Stel favoriete league in
const setFavoriteLeague = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { leagueId, leagueName } = req.body;
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
        // Je kan maximaal 1 league als favoriet hebben
        user.favoriteLeague = leagueId;
        await user.save();
        console.log(`🏆 ${leagueName} ingesteld als favoriete league voor gebruiker ${userId}`);
        res.status(200).json({
            success: true,
            message: `${leagueName} ingesteld als je favoriete league!`
        });
    }
    catch (error) {
        console.error('❌ Fout bij instellen favoriete league:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het instellen van favoriete league'
        });
    }
};
exports.setFavoriteLeague = setFavoriteLeague;
// Haal quiz statistieken op
const getQuizStats = async (req, res) => {
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
        res.status(200).json({
            success: true,
            stats: {
                highScore: user.quizHighScore,
                favoriteClubsCount: user.favoriteClubs.length,
                blacklistedClubsCount: user.blacklistedClubs.length,
                hasFavoriteLeague: !!user.favoriteLeague
            }
        });
    }
    catch (error) {
        console.error('❌ Fout bij ophalen quiz statistieken:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het ophalen van statistieken'
        });
    }
};
exports.getQuizStats = getQuizStats;
// Sla quiz score op met naam
const saveQuizScore = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { playerName, score } = req.body;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Gebruiker niet gevonden'
            });
            return;
        }
        if (!playerName || playerName.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: 'Speler naam is verplicht'
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
        // Update hoogste score en speler naam
        if (score > user.quizHighScore) {
            user.quizHighScore = score;
            await user.save();
            console.log(`🏆 Score opgeslagen: ${score} voor ${playerName}`);
        }
        res.status(200).json({
            success: true,
            message: 'Score succesvol opgeslagen!'
        });
    }
    catch (error) {
        console.error('❌ Fout bij opslaan quiz score:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het opslaan van de score'
        });
    }
};
exports.saveQuizScore = saveQuizScore;
// Haal huidige quiz sessie op
const getCurrentQuizSession = async (req, res) => {
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
        const session = activeQuizSessions.get(userId);
        if (!session) {
            res.status(404).json({
                success: false,
                message: 'Geen actieve quiz sessie gevonden'
            });
            return;
        }
        const currentQuestion = session.questions[session.currentQuestion];
        res.status(200).json({
            success: true,
            session: {
                question: {
                    type: currentQuestion.type,
                    image: currentQuestion.correctAnswer.logo,
                    options: currentQuestion.options.map(option => ({
                        id: option.id,
                        name: option.name
                    }))
                },
                score: session.score,
                questionNumber: session.currentQuestion + 1
            }
        });
    }
    catch (error) {
        console.error('❌ Fout bij ophalen quiz sessie:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het ophalen van de quiz sessie'
        });
    }
};
exports.getCurrentQuizSession = getCurrentQuizSession;
