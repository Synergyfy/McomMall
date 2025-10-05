"use client";
import {
  DollarSign,
  ShoppingBag,
  Gift,
  Tag,
  Users,
  Wallet,
  Package,
  Briefcase,
  List,
  ArrowDown,
  ArrowUp,
  Star,
  Ticket,
  ShoppingCart,
  Handshake,
  Book,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CustomerStatsDto,
  OwnerStatsDto,
} from "@/service/stats/types";
import { UserRole } from "@/service/auth/types";
import { CURRENCY } from "@/lib/utils";

interface StatsCardsProps {
  stats: OwnerStatsDto | CustomerStatsDto;
  role: UserRole;
}

const OwnerStatsMap = [
  {
    key: "totalAmountEarnedFromProductOrders",
    label: "Product Sales",
    icon: DollarSign,
    color: "text-green-500",
  },
  {
    key: "totalAmountEarnedFromGiftCard",
    label: "Gift Card Sales",
    icon: Gift,
    color: "text-blue-500",
  },
  {
    key: "totalAmountSpentForPromotions",
    label: "Promotion Spending",
    icon: Tag,
    color: "text-red-500",
  },
  {
    key: "totalOffersRedeemed",
    label: "Offers Redeemed",
    icon: Users,
    color: "text-yellow-500",
  },
  {
    key: "totalAmountSpentOnCoupon",
    label: "Coupon Spending",
    icon: Ticket,
    color: "text-red-500",
  },
  {
    key: "totalAmountOfVoucherPurchased",
    label: "Vouchers Purchased",
    icon: ShoppingCart,
    color: "text-purple-500",
  },
  {
    key: "totalAmountOfProduct",
    label: "Total Products",
    icon: Package,
    color: "text-indigo-500",
  },
  {
    key: "totalAmountOfService",
    label: "Total Services",
    icon: Briefcase,
    color: "text-pink-500",
  },
  {
    key: "totalAmountOfListing",
    label: "Total Listings",
    icon: List,
    color: "text-gray-500",
  },
  {
    key: "totalWalletBalance",
    label: "Wallet Balance",
    icon: Wallet,
    color: "text-green-700",
  },
];

const CustomerStatsMap = [
  {
    key: "totalAmountSpentOnProductOrdered",
    label: "Product Spending",
    icon: ShoppingBag,
    color: "text-green-500",
  },
  {
    key: "totalNumberOfProductOrdered",
    label: "Products Ordered",
    icon: Package,
    color: "text-blue-500",
  },
  {
    key: "totalNumberOfServiceBooked",
    label: "Services Booked",
    icon: Book,
    color: "text-purple-500",
  },
  {
    key: "totalNumberOfPromotionsParticipating",
    label: "Promotions Joined",
    icon: Handshake,
    color: "text-yellow-500",
  },
  {
    key: "totalNumberOfPointsEarned",
    label: "Points Earned",
    icon: Star,
    color: "text-green-500",
  },
  {
    key: "totalNumberOfPointsRedeemed",
    label: "Points Redeemed",
    icon: Star,
    color: "text-red-500",
  },
  {
    key: "totalAmountSpentOnVoucher",
    label: "Voucher Spending",
    icon: Ticket,
    color: "text-indigo-500",
  },
  {
    key: "totalAmountSpentOnGiftCards",
    label: "Gift Card Spending",
    icon: Gift,
    color: "text-pink-500",
  },
];

const StatsCards: React.FC<StatsCardsProps> = ({ stats, role }) => {
  const statsMap =
    role === UserRole.OWNER ? OwnerStatsMap : CustomerStatsMap;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsMap.map(({ key, label, icon: Icon, color }) => {
        const value = stats[key as keyof typeof stats];
        const isCurrency =
          key.toLowerCase().includes("amount") ||
          key.toLowerCase().includes("balance") ||
          key.toLowerCase().includes("spending");
        return (
          <Card key={key} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className={`h-5 w-5 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isCurrency ? CURRENCY : ""}
                {value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;