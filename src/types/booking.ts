export interface DateSlot {
  date: string;
  booked: number;
  remaining: number;
  full: boolean;
}


export interface BookingRequest {
  date: string;
  name: string;
  email: string;
}

export interface BookingResponse {
  date: string;
  slot: number;
  name: string;
}

export interface AvailabilityResponse {
  dates: DateSlot[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
