import { useState } from 'react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { User, Mail, Phone, Calendar, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookingRequest, DateSlot } from '@/types/booking';
import { cn } from '@/lib/utils';

interface BookingFormProps {
  selectedDate: string | null;
  selectedSlot?: DateSlot | null;
  onSubmit: (booking: BookingRequest) => Promise<{ success: boolean; error?: string; message?: string }>;
  loading: boolean;
}

export function BookingForm({ selectedDate, selectedSlot, onSubmit, loading }: BookingFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState<string | undefined>();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDisplayDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selectedDate || !name.trim() || !phone) {
      setError('Please enter your name and phone number');
      return;
    }

    if (!isValidPhoneNumber(phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    // Basic email validation (optional)
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError('Please enter a valid email address');
        return;
      }
    }

    const result = await onSubmit({
      date: selectedDate,
      name: name.trim(),
      phone,
      email: email.trim() || null,
    });

    if (result.success) {
      setSuccess(true);
      setName('');
      setPhone(undefined);
      setEmail('');
    } else {
      setError(result.error || 'Booking failed');
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setError(null);
  };

  const availabilityInfo = (() => {
    if (!selectedSlot) return null;
    if (selectedSlot.full || selectedSlot.remaining <= 0) {
      return { label: "Fully booked", tone: "destructive" as const };
    }
    const clamped = Math.max(0, Math.min(selectedSlot.remaining, 5));
    return { label: `${clamped} of 5 slots left`, tone: "success" as const };
  })();

  if (!selectedDate) {
    return (
      <div id="booking-form" className="bg-card rounded-xl shadow-card p-6 animate-fade-in">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Select a Date</h3>
          <p className="text-sm text-muted-foreground">
            Choose an available date from the calendar to book your appointment
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div id="booking-form" className="bg-card rounded-xl shadow-card p-6 animate-scale-in">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Booking Confirmed!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your appointment has been booked for {formatDisplayDate(selectedDate)}
          </p>
          <Button variant="outline" onClick={resetForm}>
            Book Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div id="booking-form" className="bg-card rounded-xl shadow-card p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">Book Appointment</h3>
        <p className="text-sm text-muted-foreground">
          {formatDisplayDate(selectedDate)}
        </p>
        {availabilityInfo && (
          <div
            className={cn(
              "mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold",
              availabilityInfo.tone === "destructive" && "bg-red-50 text-red-700 border border-red-200",
              availabilityInfo.tone === "success" && "bg-emerald-50 text-emerald-700 border border-emerald-200"
            )}
          >
            {availabilityInfo.label}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Full Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Phone Number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <PhoneInput
              international
              defaultCountry="CH"
              value={phone}
              onChange={setPhone}
              countrySelectProps={{
                className: "rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
              }}
              className="flex w-full items-center gap-2 rounded-lg border border-input bg-background pl-10 pr-3 py-2 focus-within:ring-2 focus-within:ring-primary/60 focus-within:border-primary/60"
              inputClassName="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Booking...
            </>
          ) : (
            'Confirm Booking'
          )}
        </Button>
      </form>
    </div>
  );
}
