"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/leagueRoutes.ts
const express_1 = __importDefault(require("express"));
const leagueController_1 = require("../controllers/leagueController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Alle league routes zijn beveiligd
router.use(authMiddleware_1.authenticateApi);
// Favoriete league routes
router.get('/favorite', leagueController_1.getFavoriteLeague);
router.post('/favorite', leagueController_1.setFavoriteLeague);
router.delete('/favorite', leagueController_1.removeFavoriteLeague);
// League informatie routes
router.get('/', leagueController_1.getAllLeagues);
router.get('/:leagueId/clubs', leagueController_1.getClubsInLeague);
exports.default = router;
