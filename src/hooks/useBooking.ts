import { useState, useCallback } from 'react';
import { DateSlot, BookingRequest, ApiResponse, AvailabilityResponse, BookingResponse } from '@/types/booking';

// Replace with your deployed Apps Script Web App URL
const API_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL';

export function useBooking() {
  const [dates, setDates] = useState<DateSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}?action=availability`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result: ApiResponse<AvailabilityResponse> = await response.json();
      
      if (result.success && result.data) {
        setDates(result.data.dates);
      } else {
        throw new Error(result.error || 'Failed to fetch availability');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch availability';
      setError(message);
      console.error('Fetch availability error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const bookDate = useCallback(async (booking: BookingRequest): Promise<ApiResponse<BookingResponse>> => {
    setBookingInProgress(true);
    setError(null);
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'book',
          ...booking,
        }),
      });
      
      const result: ApiResponse<BookingResponse> = await response.json();
      
      if (result.success) {
        // Update local state to reflect the booking
        setDates(prev => prev.map(d => 
          d.date === booking.date 
            ? { ...d, status: 'booked' as const, bookedBy: booking.name }
            : d
        ));
      }
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to book date';
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
