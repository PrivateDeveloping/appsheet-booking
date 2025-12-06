import { useState } from 'react';
import { User, Mail, Calendar, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookingRequest } from '@/types/booking';
import { cn } from '@/lib/utils';

interface BookingFormProps {
  selectedDate: string | null;
  onSubmit: (booking: BookingRequest) => Promise<{ success: boolean; error?: string; message?: string }>;
  loading: boolean;
}

export function BookingForm({ selectedDate, onSubmit, loading }: BookingFormProps) {
  const [name, setName] = useState('');
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

    if (!selectedDate || !name.trim() || !email.trim()) {
      setError('Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    const result = await onSubmit({
      date: selectedDate,
      name: name.trim(),
      email: email.trim(),
    });

    if (result.success) {
      setSuccess(true);
      setName('');
      setEmail('');
    } else {
      setError(result.error || 'Booking failed');
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setError(null);
  };

  if (!selectedDate) {
    return (
      <div className="bg-card rounded-xl shadow-card p-6 animate-fade-in">
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
      <div className="bg-card rounded-xl shadow-card p-6 animate-scale-in">
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
    <div className="bg-card rounded-xl shadow-card p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">Book Appointment</h3>
        <p className="text-sm text-muted-foreground">
          {formatDisplayDate(selectedDate)}
        </p>
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
