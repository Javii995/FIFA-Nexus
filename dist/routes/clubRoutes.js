"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/clubRoutes.ts
const express_1 = __importDefault(require("express"));
const clubController_1 = require("../controllers/clubController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Alle club routes zijn beveiligd
router.use(authMiddleware_1.authenticateApi);
// Favoriete clubs routes
router.get('/favorites', clubController_1.getFavoriteClubs);
router.post('/favorites', clubController_1.addClubToFavorites);
router.delete('/favorites/:clubId', clubController_1.removeClubFromFavorites);
router.put('/favorites/:clubId/view', clubController_1.incrementClubViewCount);
// Club search en details
router.get('/search', clubController_1.searchClubs);
router.get('/:clubId', clubController_1.getClubDetails);
exports.default = router;
