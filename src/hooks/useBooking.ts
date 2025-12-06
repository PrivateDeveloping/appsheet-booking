// import { useState, useCallback } from "react";
// import {
//   DateSlot,
//   BookingRequest,
//   BookingResponse,
//   AvailabilityResponse,
//   ApiResponse
// } from "@/types/booking";

// export function useBooking() {
//   const [dates, setDates] = useState<DateSlot[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [bookingInProgress, setBookingInProgress] = useState(false);

//   // Normalize date to YYYY-MM-DD
//   const normalizeDate = useCallback((value: string): string => {
//     if (!value) return value;
//     if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
//     return value.split("T")[0];
//   }, []);

//   /**
//    * 🔹 GET availability from Vercel API
//    */
//   const fetchAvailability = useCallback(async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const response = await fetch("/api/availability");

//       // ⭐ FIX: Proper typing
//       const result: ApiResponse<AvailabilityResponse> = await response.json();

//       if (!result.success || !result.data) {
//         throw new Error(result.error || "Failed to load availability");
//       }

//       const normalized = result.data.dates.map((slot: DateSlot) => ({
//         ...slot,
//         date: normalizeDate(slot.date)
//       }));

//       setDates(normalized);
//     } catch (err) {
//       const message = err instanceof Error ? err.message : "Failed to fetch availability";
//       setError(message);
//       console.error("Availability error:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [normalizeDate]);

//   /**
//    * 🔹 POST booking using Vercel API
//    */
//   const bookDate = useCallback(async (booking: BookingRequest) => {
//     setBookingInProgress(true);
//     setError(null);

//     try {
//       const response = await fetch("/api/book", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(booking),
//       });

//       // ⭐ FIX: Proper typing
//       const result: ApiResponse<BookingResponse> = await response.json();

//       if (!result.success || !result.data) {
//         throw new Error(result.error || "Booking failed");
//       }

//       // Update UI optimistically
//       setDates((prev) =>
//         prev.map((d) =>
//           d.date === booking.date
//             ? { ...d, status: "booked", bookedBy: booking.name }
//             : d
//         )
//       );

//       return result;
//     } catch (err) {
//       const message = err instanceof Error ? err.message : "Failed to book date";
//       setError(message);
//       console.error("Booking error:", err);
//       return { success: false, error: message };
//     } finally {
//       setBookingInProgress(false);
//     }
//   }, []);

//   return {
//     dates,
//     loading,
//     error,
//     bookingInProgress,
//     fetchAvailability,
//     bookDate,
//   };
// }
// import { useState, useCallback } from "react";
// import {
//   DateSlot,
//   BookingRequest,
//   BookingResponse,
//   AvailabilityResponse,
//   ApiResponse
// } from "@/types/booking";

// export function useBooking() {
//   const [dates, setDates] = useState<DateSlot[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [bookingInProgress, setBookingInProgress] = useState(false);

//   const normalizeDate = useCallback((value: string): string => {
//     if (!value) return value;
//     return value.split("T")[0];
//   }, []);

//   /**
//    * GET availability
//    */
//   const fetchAvailability = useCallback(async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const response = await fetch("/api/availability");
//       const result: ApiResponse<AvailabilityResponse> = await response.json();

//       if (!result.success || !result.data) {
//         throw new Error(result.error || "Failed to load availability");
//       }

//       const formatted = result.data.dates.map((d) => ({
//         date: normalizeDate(d.date),
//         remaining: d.remaining,
//         full: d.full
//       }));

//       setDates(formatted);
//     } catch (err) {
//       const message = err instanceof Error ? err.message : "Failed to fetch availability";
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   }, [normalizeDate]);

//   /**
//    * POST booking
//    */
//   const bookDate = useCallback(async (booking: BookingRequest) => {
//     setBookingInProgress(true);
//     setError(null);

//     try {
//       const response = await fetch("/api/book", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(booking),
//       });

//       const result: ApiResponse<BookingResponse> = await response.json();

//       if (!result.success || !result.data) {
//         throw new Error(result.error || "Booking failed");
//       }

//       // Update frontend slots visually
//       setDates((prev) =>
//         prev.map((d) =>
//           d.date === booking.date
//             ? {
//                 ...d,
//                 remaining: Math.max(0, d.remaining - 1),
//                 full: d.remaining - 1 <= 0
//               }
//             : d
//         )
//       );

//       return result;
//     } catch (err) {
//       const message = err instanceof Error ? err.message : "Failed to book date";
//       setError(message);
//       return { success: false, error: message };
//     } finally {
//       setBookingInProgress(false);
//     }
//   }, []);

//   return {
//     dates,
//     loading,
//     error,
//     bookingInProgress,
//     fetchAvailability,
//     bookDate,
//   };
// }
import { useState, useCallback } from "react";
import {
  DateSlot,
  BookingRequest,
  BookingResponse,
  AvailabilityResponse,
  ApiResponse
} from "@/types/booking";

export function useBooking() {
  const [dates, setDates] = useState<DateSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const normalizeDate = useCallback((value: string): string => {
    if (!value) return value;
    return value.split("T")[0];
  }, []);

  /**
   * GET availability
   */
  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/availability");
      const result: ApiResponse<AvailabilityResponse> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to load availability");
      }

      const formatted = result.data.dates.map((d) => ({
        date: normalizeDate(d.date),
        booked: d.booked,
        remaining: d.remaining,
        full: d.full
      }));

      setDates(formatted);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch availability";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [normalizeDate]);

  /**
   * POST booking
   */
  const bookDate = useCallback(async (booking: BookingRequest) => {
    setBookingInProgress(true);
    setError(null);

    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      });

      const result: ApiResponse<BookingResponse> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Booking failed");
      }

      // Update UI immediately (no refresh needed)
      setDates((prev) =>
        prev.map((d) =>
          d.date === booking.date
            ? {
                ...d,
                booked: (d.booked ?? 0) + 1,
                remaining: Math.max(0, d.remaining - 1),
                full: (d.booked ?? 0) + 1 >= 5
              }
            : d
        )
      );

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to book date";
      setError(message);
      return { success: false, error: message };
    } finally {
      setBookingInProgress(false);
    }
  }, []);

  return {
    dates,
    loading,
    error,
    bookingInProgress,
    fetchAvailability,
    bookDate,
  };
}
