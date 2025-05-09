
import { apiService } from './services/apiService';

async function testApi() {
  try {
    console.log('API testen...');
    
    
    console.log('Clubs ophalen...');
    const clubs = await apiService.getClubs();
    
    
    if (clubs && clubs.items) {
      console.log(`${clubs.items.length} clubs gevonden!`);
      console.log('Eerste club:', clubs.items[0]);
    } else {
      console.log('Geen clubs.items in het antwoord.');
    }
    

    console.log('Leagues ophalen...');
    const leagues = await apiService.getLeagues();
    
    if (leagues && leagues.items) {
      console.log(`${leagues.items.length} leagues gevonden!`);
    } else {
      console.log('Geen leagues.items in het antwoord.');
    }
    
  } catch (error) {
    console.error('API test mislukt:', error);
  }
}


testApi();