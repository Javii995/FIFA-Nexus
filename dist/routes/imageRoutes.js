"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/imageRoutes.ts - COMPLETE WITH LEAGUE ROUTES
const express_1 = __importDefault(require("express"));
const imageController_1 = require("../controllers/imageController");
const router = express_1.default.Router();
// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Image routes werken!' });
});
// Test route met ID
router.get('/test/:clubId', imageController_1.testImageRoute);
// Image proxy routes
router.get('/clubs/:clubId', imageController_1.getClubImage);
router.get('/leagues/:leagueId', imageController_1.getLeagueImage);
exports.default = router;
