"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apiService_1 = require("./services/apiService");
async function testApi() {
    try {
        console.log('API testen...');
        console.log('Clubs ophalen...');
        const clubs = await apiService_1.apiService.getClubs();
        if (clubs && clubs.items) {
            console.log(`${clubs.items.length} clubs gevonden!`);
            console.log('Eerste club:', clubs.items[0]);
        }
        else {
            console.log('Geen clubs.items in het antwoord.');
        }
        console.log('Leagues ophalen...');
        const leagues = await apiService_1.apiService.getLeagues();
        if (leagues && leagues.items) {
            console.log(`${leagues.items.length} leagues gevonden!`);
        }
        else {
            console.log('Geen leagues.items in het antwoord.');
        }
    }
    catch (error) {
        console.error('API test mislukt:', error);
    }
}
testApi();
