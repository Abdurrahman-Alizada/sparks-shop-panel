// types.ts
export interface Reservation {
    id: string;
    userId: string;
    userName: string;
    productsId: string;
    productsName: string;
    time: string;
    status: 'pending' | 'accepted' | 'rejected';
  }
  
  export interface OpeningTime {
    day: string;
    fromHour: string;
    fromMinute: string;
    fromAmPm: string;
    toHour: string;
    toMinute: string;
    toAmPm: string;
    isOff: boolean;
  }