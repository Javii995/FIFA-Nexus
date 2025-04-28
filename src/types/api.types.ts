
export interface Club {
    id: number;
    name: string;
    emblem: string;
    league_id: number;
    country?: string;
  }
  
  
  export interface League {
    id: number;
    name: string;
    emblem: string;
    country?: string;
  }
  
  
  export interface ApiResponse<T> {
    data: T[];
    meta: {
      pagination?: {
        total: number;
        count: number;
        per_page: number;
        current_page: number;
        total_pages: number;
      }
    }
  }