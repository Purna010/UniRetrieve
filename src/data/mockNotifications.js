// Mock notifications
export const mockNotifications = [
  {
    id: 'n1',
    type: 'match',
    title: 'Possible Match Found!',
    message: 'Your lost Navy Blue Backpack has a 94% match with a reported found item.',
    time: '2025-04-01T15:00:00',
    read: false,
    link: '/match/m1',
  },
  {
    id: 'n2',
    type: 'message',
    title: 'New Message from Priya Mehta',
    message: 'I can meet you at the library entrance tomorrow at 10 AM.',
    time: '2025-04-01T16:30:00',
    read: false,
    link: '/chat/conv1',
  },
  {
    id: 'n3',
    type: 'claim',
    title: 'Claim Request Approved',
    message: 'Your claim for Student ID Card has been approved. Visit security office for pickup.',
    time: '2025-04-03T18:00:00',
    read: true,
    link: '/my-items',
  },
  {
    id: 'n4',
    type: 'system',
    title: 'Item Verified on Blockchain',
    message: 'Your reported item Navy Blue Backpack has been registered on the blockchain.',
    time: '2025-04-01T10:50:00',
    read: true,
    link: '/my-items',
  },
];
