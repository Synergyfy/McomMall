'use client';

import { MessageSquare } from 'lucide-react';
import { useSendMessage } from '@/service/messaging/hook';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/service/auth/hook';
import { Button } from './ui/button';

interface ChatIconProps {
  receiverId: string;
  listingName: string;
}

export default function ChatIcon({ receiverId, listingName }: ChatIconProps) {
  const router = useRouter();
  const { mutate: sendMessage } = useSendMessage();
  const { user } = useAuth();

  const handleStartConversation = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    sendMessage({
      content: `Hi, I'm interested in your listing: ${listingName}`,
      receiverId: receiverId,
    });
  };

  return (
    <Button variant="outline" size="icon" onClick={handleStartConversation}>
      <MessageSquare className="h-4 w-4" />
    </Button>
  );
}
