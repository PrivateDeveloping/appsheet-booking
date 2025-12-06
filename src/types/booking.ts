export interface DateSlot {
  date: string; // YYYY-MM-DD format
  status: 'available' | 'booked';
  bookedBy?: string;
  bookedAt?: string;
}

export interface BookingRequest {
  date: string;
  name: string;
  email: string;
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

export interface BookingResponse {
  booking: DateSlot;
}
