export interface Hotspot {
  id: string;
  x: number; // Percentage from left
  y: number; // Percentage from top
  link: string;
}

export interface Campaign {
  id: string;
  name: string;
  imageUrl: string;
  hotspots: Hotspot[];
}

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Summer Sale Showcase',
    imageUrl: '/placeholder-image-1.jpg',
    hotspots: [
      { id: 'hs1', x: 25, y: 50, link: '/products/summer-dress' },
      { id: 'hs2', x: 70, y: 30, link: '/products/sun-hat' },
    ],
  },
  {
    id: '2',
    name: 'Winter Collection',
    imageUrl: '/placeholder-image-2.jpg',
    hotspots: [],
  },
];
