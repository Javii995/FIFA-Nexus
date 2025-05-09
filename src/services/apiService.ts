import { Club, League, ApiResponse } from '../types/api.types';

const BASE_URL = 'https://api.futdatabase.com/api';
const API_KEY = process.env.API_KEY || '7404c788-760e-1b06-4ede-6798a07e9926';

async function fetchFromApi<T>(endpoint: string): Promise<T> {
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
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
}

export const apiService = {
  getClubs: (): Promise<ApiResponse<Club>> =>
    fetchFromApi('/clubs'),

  getClubById: (id: number): Promise<Club> =>
    fetchFromApi(`/clubs/${id}`),

  getLeagues: (): Promise<ApiResponse<League>> =>
    fetchFromApi('/leagues'),

  getLeagueById: (id: number): Promise<League> =>
    fetchFromApi(`/leagues/${id}`),

  getClubsByLeague: (leagueId: number): Promise<ApiResponse<Club>> =>
    fetchFromApi(`/leagues/${leagueId}/clubs`)
};