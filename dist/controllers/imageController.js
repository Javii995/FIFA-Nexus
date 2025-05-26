"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testImageRoute = exports.getClubImage = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const FUT_API_BASE_URL = 'https://api.futdatabase.com/api';
const FUT_API_KEY = process.env.FUT_API_KEY;
// Proxy club images van FUT API
const getClubImage = async (req, res) => {
    var _a;
    try {
        const { clubId } = req.params;
        console.log('🖼️ Image request voor club:', clubId);
        if (!clubId) {
            console.log('❌ Geen club ID');
            res.status(400).send('Club ID is verplicht');
            return;
        }
        if (!FUT_API_KEY) {
            console.log('❌ Geen API key, gebruik fallback');
            res.redirect('/images/default-club.png');
            return;
        }
        const imageUrl = `${FUT_API_BASE_URL}/clubs/${clubId}/image`;
        console.log('🌐 Ophalen image van:', imageUrl);
        const response = await (0, node_fetch_1.default)(imageUrl, {
            headers: {
                'X-AUTH-TOKEN': FUT_API_KEY
            }
        });
        console.log('📡 API Response status:', response.status);
        if (!response.ok) {
            console.log('❌ API response niet OK, gebruik fallback');
            res.redirect('/images/default-club.png');
            return;
        }
        // Set juiste content type
        const contentType = response.headers.get('content-type') || 'image/png';
        res.setHeader('Content-Type', contentType);
        // Cache de image voor 1 uur
        res.setHeader('Cache-Control', 'public, max-age=3600');
        console.log('✅ Image doorgestuurd, content-type:', contentType);
        // Stream de image data
        (_a = response.body) === null || _a === void 0 ? void 0 : _a.pipe(res);
    }
    catch (error) {
        console.error('❌ Fout bij ophalen club image:', error);
        res.redirect('/images/default-club.png');
    }
};
exports.getClubImage = getClubImage;
// Test route
const testImageRoute = (req, res) => {
    res.json({
        message: 'Image routes werken!',
        clubId: req.params.clubId || 'geen ID'
    });
};
exports.testImageRoute = testImageRoute;
