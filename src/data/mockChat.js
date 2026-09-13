// Mock chat data for UniRetrieve

export const mockConversations = [
  {
    id: 'conv1',
    matchId: 'm1',
    participants: [
      { id: 'user_1', name: 'Anush Kumar', avatar: null, role: 'owner', status: 'online' },
      { id: 'admin_1', name: 'Swaroop Gudigar', avatar: null, role: 'finder', status: 'online' },
    ],
    itemTitle: 'Navy Blue Backpack',
    lastMessage: 'I can meet you at the library entrance tomorrow at 10 AM.',
    lastMessageTime: '2025-04-01T16:30:00',
    unread: 1,
  },
  {
    id: 'conv2',
    matchId: 'm2',
    participants: [
      { id: 'u5', name: 'Rohit Verma', avatar: null, role: 'owner', status: 'offline' },
      { id: 'u8', name: 'Security Office', avatar: null, role: 'finder', status: 'online' },
    ],
    itemTitle: 'Student ID Card',
    lastMessage: 'Your ID has been verified. Please bring your college ID for pickup.',
    lastMessageTime: '2025-04-03T18:45:00',
    unread: 0,
  },
];

export const mockMessages = {
  conv1: [
    {
      id: 'msg1',
      senderId: 'admin_1',
      senderName: 'Swaroop Gudigar',
      text: 'Hi! I found a navy blue backpack near the library exit. Saw your post and it looks like a match!',
      time: '2025-04-01T15:05:00',
      type: 'text',
    },
    {
      id: 'msg2',
      senderId: 'user_1',
      senderName: 'Anush Kumar',
      text: 'Oh thank you so much! Does it have a red keychain on the zipper?',
      time: '2025-04-01T15:08:00',
      type: 'text',
    },
    {
      id: 'msg3',
      senderId: 'admin_1',
      senderName: 'Swaroop Gudigar',
      text: 'Yes! It does have a red keychain. And it has some textbooks inside.',
      time: '2025-04-01T15:10:00',
      type: 'text',
    },
    {
      id: 'msg4',
      senderId: 'user_1',
      senderName: 'Anush Kumar',
      text: 'That\'s definitely mine. I left it while rushing to class. Where can I meet you to get it?',
      time: '2025-04-01T15:12:00',
      type: 'text',
    },
    {
      id: 'msg5',
      senderId: 'admin_1',
      senderName: 'Swaroop Gudigar',
      text: 'I can meet you at the library entrance tomorrow at 10 AM.',
      time: '2025-04-01T16:30:00',
      type: 'text',
    },
  ],
  conv2: [
    {
      id: 'msg1',
      senderId: 'u8',
      senderName: 'Security Office',
      text: 'We have found an ID card with your name and student number. The card is currently at the security office.',
      time: '2025-04-03T17:00:00',
      type: 'text',
    },
    {
      id: 'msg2',
      senderId: 'u5',
      senderName: 'Rohit Verma',
      text: 'Great! I lost it at the sports complex. What do I need to bring for pickup?',
      time: '2025-04-03T17:30:00',
      type: 'text',
    },
    {
      id: 'msg3',
      senderId: 'u8',
      senderName: 'Security Office',
      text: 'Your ID has been verified. Please bring your college ID for pickup.',
      time: '2025-04-03T18:45:00',
      type: 'text',
    },
  ],
};

export const demoUsers = [
  {
    id: 'admin_1',
    name: 'Swaroop Gudigar',
    email: 'swaroop@univ.edu',
    studentId: 'ADMIN001',
    avatar: null,
    role: 'admin',
    department: 'Campus Security',
    year: 'Staff',
  },
  {
    id: 'user_1',
    name: 'Anush Kumar',
    email: 'anush@univ.edu',
    studentId: 'STU2023001',
    avatar: null,
    role: 'user',
    department: 'Computer Science',
    year: '3rd Year',
  }
];
