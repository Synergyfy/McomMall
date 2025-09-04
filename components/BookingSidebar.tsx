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
import { useSendMessage } from './../service/messaging/hook';
import { useRouter } from 'next/navigation';
import { useAuth } from './../service/auth/hook';

interface BookingSidebarProps {
  priceDisplay: string;
  phoneNumber: string;
  author: { id: string; name: string; avatarUrl: string; bio: string };
  isVerified?: boolean;
}

export default function BookingSidebar({
  priceDisplay,
  phoneNumber,
  author,
  isVerified,
}: BookingSidebarProps) {
  const router = useRouter();
  const { mutate: sendMessage } = useSendMessage();
  const { user } = useAuth();

  const handleStartConversation = () => {
    if (!user) {
      // Handle case where user is not logged in
      router.push('/login');
      return;
    }

    sendMessage(
      {
        content: `Hi, I'm interested in your listing.`,
        receiverId: author.id,
      },
      {
        onSuccess: (data) => {
          router.push(`/dashboard/messages?conversationId=${data.conversation.id}`);
        },
      }
    );
  };

  return (
    <div className="w-full space-y-6">
      {isVerified && (
        <Badge className="w-full justify-center py-3 text-md bg-green-600 hover:bg-green-700">
          <CheckCircle className="mr-2 h-5 w-5" />
          Verified Listing
        </Badge>
      )}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Booking</h3>
            <p className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full">
              {priceDisplay}
            </p>
          </div>
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Select Dates
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <User className="mr-2 h-4 w-4" />
              Guests
            </Button>
            <Button className="w-full bg-red-500 hover:bg-red-600 text-lg py-6">
              Book Now
            </Button>
          </div>
        </CardContent>
      </Card>

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
              {author.name.toLowerCase().replace(' ', '.')}@listedemo.pro
            </p>
          </div>
          <div className="mt-6 space-y-3">
            <Button
              className="w-full bg-red-500 hover:bg-red-600"
              onClick={handleStartConversation}
            >
              Chat Business Owner
            </Button>
            <Button
              variant="outline"
              className="w-full border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
            >
              Chat via WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
