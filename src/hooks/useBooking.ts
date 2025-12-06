// import { useState, useCallback } from 'react';
// import { DateSlot, BookingRequest, ApiResponse, AvailabilityResponse, BookingResponse } from '@/types/booking';

// // Replace with your deployed Apps Script Web App URL
// const API_URL = "https://script.google.com/macros/s/AKfycbxq5UaIc3LPR19euoCBkQi1sPD4jPjvf7GTWkTJ_pZaDixzmRSj4bk6d2idVHdAJHuYvg/exec";

// export function useBooking() {
//   const [dates, setDates] = useState<DateSlot[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [bookingInProgress, setBookingInProgress] = useState(false);

//   const fetchAvailability = useCallback(async () => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       const response = await fetch(`${API_URL}?action=availability`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
      
//       const result: ApiResponse<AvailabilityResponse> = await response.json();
      
//       if (result.success && result.data) {
//         setDates(result.data.dates);
//       } else {
//         throw new Error(result.error || 'Failed to fetch availability');
//       }
//     } catch (err) {
//       const message = err instanceof Error ? err.message : 'Failed to fetch availability';
//       setError(message);
//       console.error('Fetch availability error:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const bookDate = useCallback(async (booking: BookingRequest): Promise<ApiResponse<BookingResponse>> => {
//     setBookingInProgress(true);
//     setError(null);
    
//     try {
//       const response = await fetch(API_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           action: 'book',
//           ...booking,
//         }),
//       });
      
//       const result: ApiResponse<BookingResponse> = await response.json();
      
//       if (result.success) {
//         // Update local state to reflect the booking
//         setDates(prev => prev.map(d => 
//           d.date === booking.date 
//             ? { ...d, status: 'booked' as const, bookedBy: booking.name }
//             : d
//         ));
//       }
      
//       return result;
//     } catch (err) {
//       const message = err instanceof Error ? err.message : 'Failed to book date';
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
import { useState, useCallback } from 'react';
import { DateSlot, BookingRequest } from '@/types/booking';

// Your deployed Google Apps Script URL
const API_URL = "https://script.google.com/macros/s/AKfycbxq5UaIc3LPR19euoCBkQi1sPD4jPjvf7GTWkTJ_pZaDixzmRSj4bk6d2idVHdAJHuYvg/exec";

export function useBooking() {
  const [dates, setDates] = useState<DateSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const normalizeDate = useCallback((value: string): string => {
    if (!value) return value;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    const datePart = value.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart;

    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? value : parsed.toISOString().slice(0, 10);
  }, []);

  /**
   * JSONP GET request (bypasses CORS)
   */
  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const callbackName = "jsonp_callback_" + Math.random().toString(36).substring(2);

      const jsonpPromise = new Promise<any>((resolve, reject) => {
        (window as any)[callbackName] = (data: any) => {
          resolve(data);
          delete (window as any)[callbackName];
        };

        const script = document.createElement("script");
        script.src = `${API_URL}?action=availability&callback=${callbackName}`;
        script.onerror = reject;
        document.body.appendChild(script);
      });

      const result = await jsonpPromise;

      if (result.success && result.data?.dates) {
        const normalizedDates = result.data.dates
          .map((slot: DateSlot) => ({
            ...slot,
            date: normalizeDate(slot.date)
          }))
          .filter((slot: DateSlot) => !!slot.date);

        setDates(normalizedDates);
      } else {
        throw new Error(result.error || "Failed to fetch dates");
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch availability";
      setError(message);
      console.error("JSONP fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [normalizeDate]);

  /**
   * POST booking using no-cors
   * NOTE: Cannot read JSON response due to no-cors limitations
   */
  const bookDate = useCallback(async (booking: BookingRequest) => {
    setBookingInProgress(true);
    setError(null);

    try {
      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "book",
          ...booking
        })
      });

      // Since no-cors blocks the response, we manually update local state
      setDates(prev =>
        prev.map(d =>
          d.date === booking.date
            ? { ...d, status: "booked", bookedBy: booking.name }
            : d
        )
      );

      return { success: true };

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
