// export interface DateSlot {
//   date: string; // YYYY-MM-DD format
//   status: 'available' | 'booked';
//   bookedBy?: string;
//   bookedAt?: string;
// }

// export interface BookingRequest {
//   date: string;
//   name: string;
//   email: string;
// }

// export interface ApiResponse<T = unknown> {
//   success: boolean;
//   data?: T;
//   error?: string;
//   message?: string;
// }

// export interface AvailabilityResponse {
//   dates: DateSlot[];
// }

// export interface BookingResponse {
//   booking: DateSlot;
// }
export interface DateSlot {
  date: string; // YYYY-MM-DD
  status: "available" | "booked";
  bookedBy?: string | null;
  bookedAt?: string | null;
  email?: string | null;
}

export interface BookingRequest {
  date: string;
  name: string;
  email: string;
}

/**
 * Generic API wrapper for all responses
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Availability endpoint returns:
 * {
 *   success: boolean,
 *   data: { dates: DateSlot[] }
 * }
 */
export interface AvailabilityResponse {
  dates: DateSlot[];
}

/**
 * Booking endpoint returns:
 * {
 *   success: boolean,
 *   message: string,
 *   data: { booking: DateSlot }
 * }
 */
export interface BookingResponse {
  booking: DateSlot;
}
