"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/blacklistRoutes.ts
const express_1 = __importDefault(require("express"));
const blacklistController_1 = require("../controllers/blacklistController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Alle blacklist routes zijn beveiligd
router.use(authMiddleware_1.authenticateApi);
// Blacklist routes
router.get('/', blacklistController_1.getBlacklistedClubs);
router.post('/', blacklistController_1.addClubToBlacklist);
router.delete('/:clubId', blacklistController_1.removeClubFromBlacklist);
router.put('/:clubId/reason', blacklistController_1.updateBlacklistReason);
exports.default = router;
