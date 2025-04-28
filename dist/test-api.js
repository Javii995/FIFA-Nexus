"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apiService_1 = require("./services/apiService");
async function testApi() {
    try {
        console.log('API testen...');
        console.log('Clubs ophalen...');
        const clubs = await apiService_1.apiService.getClubs();
        console.log(`${clubs.data.length} clubs gevonden!`);
        console.log('Eerste club:', clubs.data[0]);
        console.log('Leagues ophalen...');
        const leagues = await apiService_1.apiService.getLeagues();
        console.log(`${leagues.data.length} leagues gevonden!`);
    }
    catch (error) {
        console.error('API test mislukt:', error);
    }
}
testApi();
