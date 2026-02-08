export interface Message {
  id: number;
  sender: 'user' | 'contact';
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: number;
  contactName: string;
  avatar: string;
  messages: Message[];
}

export const conversations: Conversation[] = [
  {
    id: 1,
    contactName: 'Alice',
    avatar: '/avatars/alice.png',
    messages: [
      { id: 1, sender: 'contact', text: 'Hey, how are you?', timestamp: '10:00 AM' },
      { id: 2, sender: 'user', text: 'I am good, thanks! How about you?', timestamp: '10:01 AM' },
      { id: 3, sender: 'contact', text: 'Doing great! Just wanted to check in.', timestamp: '10:02 AM' },
    ],
  },
  {
    id: 2,
    contactName: 'Bob',
    avatar: '/avatars/bob.png',
    messages: [
      { id: 1, sender: 'contact', text: 'Can we reschedule our meeting?', timestamp: '11:30 AM' },
      { id: 2, sender: 'user', text: 'Sure, when works for you?', timestamp: '11:31 AM' },
    ],
  },
  {
    id: 3,
    contactName: 'Charlie',
    avatar: '/avatars/charlie.png',
    messages: [
      { id: 1, sender: 'contact', text: 'Here is the document you requested.', timestamp: '2:00 PM' },
    ],
  },
    {
    id: 4,
    contactName: 'David',
    avatar: '/avatars/david.png',
    messages: [
      { id: 1, sender: 'contact', text: 'Happy Birthday!', timestamp: '5:00 PM' },
      { id: 2, sender: 'user', text: 'Thank you!', timestamp: '5:01 PM' },
    ],
  },
  {
    id: 5,
    contactName: 'Eve',
    avatar: '/avatars/eve.png',
    messages: [
        { id: 1, sender: 'contact', text: 'Are we still on for tomorrow?', timestamp: 'Yesterday' },
        { id: 2, sender: 'user', text: 'Yes, see you then!', timestamp: 'Yesterday' },
    ],
  },
];
