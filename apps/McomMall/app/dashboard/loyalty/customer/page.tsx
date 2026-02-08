import { Gift, Coins, Award } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CURRENCY } from '@/lib/utils';

interface EarnOffer {
  id: number;
  title: string;
  description: string;
}

interface ClaimableReward {
  id: number;
  title: string;
  description: string;
  points: number;
}

interface RedeemedReward {
  id: number;
  title: string;
  description: string;
}

const userPoints = 8000;

const earnOffers: EarnOffer[] = [
  {
    id: 1,
    title: 'Earn 10 points',
    description: `For every ${CURRENCY}1.00 you spend on your total purchase`,
  },
  { id: 2, title: 'Earn 2X points', description: 'On all Bookings' },
];

const claimableRewards: ClaimableReward[] = [
  {
    id: 1,
    title: `Save ${CURRENCY}1`,
    description: 'On your total purchase',
    points: 1000,
  },
  {
    id: 2,
    title: `Save ${CURRENCY}5`,
    description: 'On your total purchase',
    points: 5000,
  },
  {
    id: 3,
    title: `Save ${CURRENCY}15`,
    description: 'On your total purchase',
    points: 15000,
  },
];

const redeemedRewards: RedeemedReward[] = [
  { id: 1, title: `Save ${CURRENCY}1`, description: 'On your total purchase' },
];

const RewardsHeader = ({ points }: { points: number }) => (
  <header className="bg-orange-600 text-white p-6 rounded-lg">
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Gift size={48} />
        <div>
          <h1 className="text-2xl font-bold">Rewards</h1>
        </div>
      </div>
      <div className="text-right">
        <p className="text-3xl font-bold">{points.toLocaleString()}</p>
        <p className="text-sm">Points</p>
      </div>
    </div>
    <div className="mt-4">
      <Button
        variant="secondary"
        className="w-auto px-4 py-2 h-auto text-sm bg-white text-orange-600 hover:bg-gray-100"
      >
        View Points History
      </Button>
    </div>
  </header>
);

const EarnTab = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-800">
        Shop more to earn points and claim rewards
      </h2>
      <p className="text-gray-600 mt-1">
        Start earning points and rewards by buying qualifying items or opting
        into hand-picked savings.
      </p>
    </div>
    <div className="space-y-4">
      {earnOffers.map(offer => (
        <Card key={offer.id}>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Coins className="text-gray-700" size={32} />
              <div>
                <h3 className="font-bold text-lg text-gray-800">
                  {offer.title}
                </h3>
                <p className="text-gray-600">{offer.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const ClaimTab = ({ userPoints }: { userPoints: number }) => (
  <div className="space-y-4">
    {claimableRewards.map(reward => (
      <Card key={reward.id}>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center space-x-4">
            <Award className="text-gray-700" size={32} />
            <div>
              <h3 className="font-bold text-lg text-gray-800">
                {reward.title}
              </h3>
              <p className="text-gray-600">{reward.description}</p>
            </div>
          </div>
          <Button disabled={userPoints < reward.points} className="w-full">
            Claim for {reward.points.toLocaleString()}
          </Button>
        </CardContent>
      </Card>
    ))}
  </div>
);

const RewardsTab = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-800">
        You have {redeemedRewards.length} reward ready to use!
      </h2>
      <p className="text-gray-600 mt-1">
        You can apply rewards to your cart or save them for later.
      </p>
    </div>
    <div className="space-y-4">
      {redeemedRewards.map(reward => (
        <Card key={reward.id} className="border-orange-600 border-2">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center space-x-4">
              <Award className="text-gray-700" size={32} />
              <div>
                <h3 className="font-bold text-lg text-gray-800">
                  {reward.title}
                </h3>
                <p className="text-gray-600">{reward.description}</p>
              </div>
            </div>
            <Button className="w-full">Apply discount to cart</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default function RewardsPage() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-8">
          <RewardsHeader points={userPoints} />
          <Tabs defaultValue="earn" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rewards">Rewards</TabsTrigger>
              <TabsTrigger value="earn">Earn</TabsTrigger>
              <TabsTrigger value="claim">Claim</TabsTrigger>
            </TabsList>
            <TabsContent value="rewards" className="mt-6">
              <RewardsTab />
            </TabsContent>
            <TabsContent value="earn" className="mt-6">
              <EarnTab />
            </TabsContent>
            <TabsContent value="claim" className="mt-6">
              <ClaimTab userPoints={userPoints} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
