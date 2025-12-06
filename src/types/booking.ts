export interface DateSlot {
  date: string; // YYYY-MM-DD
  remaining: number; // how many slots left (0-5)
  full: boolean; // convenience flag for UI
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
