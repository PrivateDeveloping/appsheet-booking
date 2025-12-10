import { useEffect, useState } from 'react';
import { Calendar, BookOpen, RefreshCw, AlertCircle } from 'lucide-react';
import { BookingCalendar } from '@/components/BookingCalendar';
import { BookingForm } from '@/components/BookingForm';
import { SetupGuide } from '@/components/SetupGuide';
import { Button } from '@/components/ui/button';
import { useBooking } from '@/hooks/useBooking';
import { useToast } from '@/hooks/use-toast';
import { BookingRequest } from '@/types/booking';

const Index = () => {
  const { dates, loading, error, bookingInProgress, fetchAvailability, bookDate } = useBooking();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if API URL is configured
    const isConfigured = !window.location.href.includes('YOUR_APPS_SCRIPT');
    if (isConfigured) {
      fetchAvailability();
    }
  }, [fetchAvailability]);

  const handleBooking = async (booking: BookingRequest) => {
    const result = await bookDate(booking);
    
    if (result.success) {
      toast({
        title: "Booking Confirmed!",
        description: `Your appointment for ${booking.date} has been booked.`,
      });
      setSelectedDate(null);
    } else {
      toast({
        title: "Booking Failed",
        description: result.error || "Unable to complete booking",
        variant: "destructive",
      });
    }
    
    return result;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Booking System</h1>
                <p className="text-sm text-muted-foreground">Powered by Google Sheets</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGuide(!showGuide)}
                className="gap-2"
              >
                <BookOpen className="w-4 h-4" />
                {showGuide ? 'Hide' : 'Show'} Guide
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAvailability()}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Connection Error</p>
              <p className="text-sm text-destructive/80">{error}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Make sure you've deployed your Apps Script and updated the API_URL in the code.
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <BookingCalendar
              dates={dates}
              loading={loading}
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>

          {/* Booking Form Section */}
          <div className="lg:col-span-1">
            <BookingForm
              selectedDate={selectedDate}
              selectedSlot={dates.find((d) => d.date === selectedDate) || null}
              onSubmit={handleBooking}
              loading={bookingInProgress}
            />
          </div>
        </div>

        {/* Setup Guide */}
        {showGuide && (
          <div className="mt-12 animate-fade-in">
            <SetupGuide />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>React + Google Apps Script + Google Sheets</p>
          <p className="mt-1">A minimal serverless booking system</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
