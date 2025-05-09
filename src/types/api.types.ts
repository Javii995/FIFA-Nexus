export interface Club {
    id: number;
    name: string;
    league: number | null;
    
  }
  
  export interface League {
    id: number;
    name: string;

  }
  
  export interface ApiResponse<T> {
    pagination: {
      countCurrent: number;
      countTotal: number;
      pageCurrent: number;
      pageTotal: number;
      itemsPerPage: number;
    };
    items: T[];
  }