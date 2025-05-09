"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiService = void 0;
const BASE_URL = 'https://api.futdatabase.com/api';
const API_KEY = process.env.API_KEY || '7404c788-760e-1b06-4ede-6798a07e9926';
async function fetchFromApi(endpoint) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            headers: {
                'X-AUTH-TOKEN': API_KEY,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`API error: ${response.status} - ${await response.text()}`);
        }
        return await response.json();
    }
    catch (error) {
        console.error(`Error fetching from ${endpoint}:`, error);
        throw error;
    }
}
exports.apiService = {
    getClubs: () => fetchFromApi('/clubs'),
    getClubById: (id) => fetchFromApi(`/clubs/${id}`),
    getLeagues: () => fetchFromApi('/leagues'),
    getLeagueById: (id) => fetchFromApi(`/leagues/${id}`),
    getClubsByLeague: (leagueId) => fetchFromApi(`/leagues/${leagueId}/clubs`)
};
