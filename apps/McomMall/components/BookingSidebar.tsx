// app/components/listing-detail/BookingSidebar.tsx
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  CalendarDays,
  CheckCircle,
  MessageSquare,
  Phone,
  User,
  Badge,
} from 'lucide-react';
import { useSendMessage } from '@/service/messaging/hook';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/service/auth/hook';
import { useCreateBooking } from '@/service/bookings/hook';
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { ListingType } from '@/service/listings/types';
import { SuccessDialog } from './ui/SuccessDialog';

interface BookingSidebarProps {
  priceDisplay: string;
  phoneNumber: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    bio: string;
  };
  isVerified?: boolean;
  currentUserId?: string;
  businessId: string;
  listingType: ListingType[];
}

export default function BookingSidebar({
  priceDisplay,
  phoneNumber,
  author,
  isVerified,
  currentUserId,
  businessId,
  listingType,
}: BookingSidebarProps) {
  const router = useRouter();
  const { mutate: sendMessage } = useSendMessage();
  const { user } = useAuth();
  const createBookingMutation = useCreateBooking();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleStartConversation = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    sendMessage({
      content: `Hi, I'm interested in your listing.`,
      receiverId: author.id,
    });
  };

  const handleBooking = () => {
    if (!date) return;
    const startDateTime = new Date(date);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    startDateTime.setHours(startHour, startMinute);

    const endDateTime = new Date(date);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    endDateTime.setHours(endHour, endMinute);

    createBookingMutation.mutate(
      {
        businessId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
        },
      }
    );
  };

  const isService = listingType?.includes('SERVICE');

  return (
    <div className="w-full space-y-6">
      <SuccessDialog
        isOpen={isSuccess}
        onClose={() => setIsSuccess(false)}
        title="Booking Successful!"
        description="Your booking has been confirmed. You will receive a confirmation email shortly."
      />
      {isVerified && (
        <Badge className="w-full justify-center py-3 text-md bg-green-600 hover:bg-green-700">
          <CheckCircle className="mr-2 h-5 w-5" />
          Verified Listing
        </Badge>
      )}
      {isService && (
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Booking</h3>
              <p className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full">
                {priceDisplay}
              </p>
            </div>
            <div className="space-y-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="start-time"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Start Time
                  </label>
                  <select
                    id="start-time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                  >
                    {Array.from({ length: 13 }, (_, i) => i + 8).map(hour => (
                      <option key={hour} value={`${hour}:00`}>{`${hour}:00`}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="end-time"
                    className="block text-sm font-medium text-gray-700"
                  >
                    End Time
                  </label>
                  <select
                    id="end-time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                  >
                    {Array.from({ length: 13 }, (_, i) => i + 9).map(hour => (
                      <option key={hour} value={`${hour}:00`}>{`${hour}:00`}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Button
                className="w-full bg-red-500 hover:bg-red-600 text-lg py-6"
                onClick={handleBooking}
                disabled={createBookingMutation.isPending}
              >
                {createBookingMutation.isPending ? 'Booking...' : 'Book Now'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={author.avatarUrl} alt={author.name} />
              <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-gray-500">Added By</p>
              <h4 className="text-lg font-bold">{author.name}</h4>
            </div>
          </div>
          <p className="text-gray-600 mt-4">{author.bio}</p>
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <p className="flex items-center">
              <Phone className="mr-2 h-4 w-4 text-gray-400" /> {phoneNumber}
            </p>
            <p className="flex items-center">
              <MessageSquare className="mr-2 h-4 w-4 text-gray-400" />{' '}
              {author.email ||
                `${author.name.toLowerCase().replace(' ', '.')}@listedemo.pro`}
            </p>
          </div>
          <div className="mt-6 space-y-3">
            {author.id !== currentUserId && (
              <Button
                className="w-full bg-red-500 hover:bg-red-600"
                onClick={handleStartConversation}
              >
                Chat Business Owner
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
