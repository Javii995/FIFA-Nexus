"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/quizRoutes.ts
const express_1 = __importDefault(require("express"));
const quizController_1 = require("../controllers/quizController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Alle quiz routes zijn beveiligd
router.use(authMiddleware_1.authenticateApi);
// Quiz game routes
router.post('/start', quizController_1.startQuiz);
router.post('/answer', quizController_1.answerQuestion);
router.get('/current-session', quizController_1.getCurrentQuizSession);
// Favorieten en blacklist routes
router.post('/favorites/add', quizController_1.addToFavorites);
router.post('/blacklist/add', quizController_1.addToBlacklist);
router.post('/favorite-league/set', quizController_1.setFavoriteLeague);
// Statistieken en scores
router.get('/stats', quizController_1.getQuizStats);
router.post('/save-score', quizController_1.saveQuizScore);
exports.default = router;
