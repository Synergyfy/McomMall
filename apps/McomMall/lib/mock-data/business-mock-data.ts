export interface BusinessDetails {
  id: string;
  name: string;
  category: string;
  distance: string;
  rating: number;
  reviewCount: string;
  heroImage: string;
  statusTag: string;
  points: number;
  nextTierPoints: number;
  tierName: string;
  flashSaleTitle: string;
  flashSaleDesc: string;
  promoColor: string;
  promoIcon: string;
  events: Array<{ date: string; day: string; title: string; desc: string; time: string }>;
  rewards: Array<{ title: string; cost: number; image: string; tag: string; tagColor: string }>;
}

export const BUSINESS_MOCK_DATA: Record<string, BusinessDetails> = {
  "brew-co": {
    id: "brew-co",
    name: "Brew & Co.",
    category: "Coffee",
    distance: "0.2 miles away",
    rating: 4.8,
    reviewCount: "840 Reviews",
    heroImage: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600",
    statusTag: "OPEN NOW",
    points: 750,
    nextTierPoints: 1000,
    tierName: "Caffeinated Explorer",
    flashSaleTitle: "Morning Refill Pass",
    flashSaleDesc: "Get 2x points on all pour-overs until noon.",
    promoColor: "bg-amber-500",
    promoIcon: "coffee",
    events: [
      {
        date: "OCT",
        day: "12",
        title: "Coffee Tasting Masterclass",
        desc: "Learn from local roasters.",
        time: "10:00 AM"
      }
    ],
    rewards: [
      {
        title: "Free Latte",
        cost: 250,
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600",
        tag: "LEVEL 1",
        tagColor: "bg-emerald-600"
      },
      {
        title: "Custom Ceramic Mug",
        cost: 600,
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600",
        tag: "GOLD ONLY",
        tagColor: "bg-amber-600"
      }
    ]
  },
  "iron-soul": {
    id: "iron-soul",
    name: "Iron & Soul Gym",
    category: "Fitness",
    distance: "0.5 miles away",
    rating: 4.9,
    reviewCount: "310 Reviews",
    heroImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600",
    statusTag: "OPEN NOW",
    points: 420,
    nextTierPoints: 800,
    tierName: "Fitness Enthusiast",
    flashSaleTitle: "Double Points Today",
    flashSaleDesc: "Join any group class today and receive double points on completion.",
    promoColor: "bg-emerald-600",
    promoIcon: "dumbbell",
    events: [
      {
        date: "OCT",
        day: "14",
        title: "Yoga Workshop",
        desc: "Vinyasa flow class for all levels.",
        time: "6:00 PM"
      }
    ],
    rewards: [
      {
        title: "Free Session",
        cost: 200,
        image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600",
        tag: "EVERYONE",
        tagColor: "bg-emerald-600"
      },
      {
        title: "Premium Gym Towel",
        cost: 400,
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600",
        tag: "GOLD ONLY",
        tagColor: "bg-amber-600"
      }
    ]
  },
  "urban-threads": {
    id: "urban-threads",
    name: "Urban Threads",
    category: "Premium Streetwear",
    distance: "0.2 miles away",
    rating: 4.8,
    reviewCount: "1.2k Reviews",
    heroImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=600",
    statusTag: "OPEN NOW",
    points: 850,
    nextTierPoints: 1000,
    tierName: "Urban Elite Tier",
    flashSaleTitle: "Flash Sale: 2x Points",
    flashSaleDesc: "Earn double rewards on all urban jackets until midnight.",
    promoColor: "bg-indigo-600",
    promoIcon: "bolt",
    events: [
      {
        date: "OCT",
        day: "12",
        title: "Sneaker Head Meetup",
        desc: "Limited entry • 5:00 PM",
        time: "5:00 PM"
      }
    ],
    rewards: [
      {
        title: "Exclusive Watch Pack",
        cost: 2000,
        image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600",
        tag: "GOLD ONLY",
        tagColor: "bg-amber-600"
      },
      {
        title: "20% Off Vests",
        cost: 500,
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=600",
        tag: "EVERYONE",
        tagColor: "bg-emerald-600"
      }
    ]
  }
};
