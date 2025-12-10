// export interface DateSlot {
//   date: string;
//   booked: number;
//   remaining: number;
//   full: boolean;
// }


// export interface BookingRequest {
//   date: string;
//   name: string;
//   email: string;
// }

// export interface BookingResponse {
//   date: string;
//   slot: number;
//   name: string;
// }

// export interface AvailabilityResponse {
//   dates: DateSlot[];
// }

// export interface ApiResponse<T = unknown> {
//   success: boolean;
//   data?: T;
//   error?: string;
//   message?: string;
// }
export interface DateSlot {
  date: string;
  remaining: number;
  full: boolean;
  // optionally keep booked count if you use it in UI:
  booked?: number;
}

export interface BookingRequest {
  date: string;
  name: string;
  phone: string;        // required
  email?: string | null; // optional
}

export interface BookingResponse {
  booking: {
    date: string;
    slot: number;
    name: string;
    phone: string;
    email?: string | null;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AvailabilityResponse {
  dates: DateSlot[];
}

