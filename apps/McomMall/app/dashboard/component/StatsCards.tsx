"use client";
import React from "react";
import { useRouter } from "next/navigation";
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
  Star,
  Ticket,
  ShoppingCart,
  Handshake,
  Book,
} from "lucide-react";
import {
  CustomerStatsDto,
  OwnerStatsDto,
} from "@/service/stats/types";
import { UserRole } from "@/service/auth/types";
import { formatCurrency } from "@/lib/utils";
import { useWallet } from "@/service/wallet/hook";

interface StatsCardsProps {
  stats: OwnerStatsDto | CustomerStatsDto;
  role: UserRole;
}

interface StatItemConfig {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  isCurrency: boolean;
  href?: string;
}

const OwnerStatsMap: StatItemConfig[] = [
  {
    key: "totalAmountEarnedFromProductOrders",
    label: "Product Sales",
    icon: DollarSign,
    color: "text-emerald-500",
    isCurrency: true,
  },
  {
    key: "totalAmountEarnedFromGiftCard",
    label: "Gift Card Sales",
    icon: Gift,
    color: "text-blue-500",
    isCurrency: true,
  },
  {
    key: "totalAmountSpentForPromotions",
    label: "Promotion Spending",
    icon: Tag,
    color: "text-rose-500",
    isCurrency: true,
  },
  {
    key: "totalOffersRedeemed",
    label: "Offers Redeemed",
    icon: Users,
    color: "text-amber-500",
    isCurrency: false,
  },
  {
    key: "totalAmountSpentOnCoupon",
    label: "Coupon Spending",
    icon: Ticket,
    color: "text-rose-500",
    isCurrency: true,
  },
  {
    key: "totalAmountOfVoucherPurchased",
    label: "Vouchers Purchased",
    icon: ShoppingCart,
    color: "text-purple-500",
    isCurrency: true,
  },
  {
    key: "totalAmountOfProduct",
    label: "Total Products",
    icon: Package,
    color: "text-indigo-500",
    isCurrency: false,
  },
  {
    key: "totalAmountOfService",
    label: "Total Services",
    icon: Briefcase,
    color: "text-pink-500",
    isCurrency: false,
  },
  {
    key: "totalAmountOfListing",
    label: "Total Listings",
    icon: List,
    color: "text-slate-500",
    isCurrency: false,
  },
  {
    key: "totalWalletBalance",
    label: "Wallet Balance",
    icon: Wallet,
    color: "text-emerald-700",
    isCurrency: true,
    href: "/dashboard/wallet",
  },
];

const CustomerStatsMap: StatItemConfig[] = [
  {
    key: "totalAmountSpentOnProductOrdered",
    label: "Product Spending",
    icon: ShoppingBag,
    color: "text-emerald-500",
    isCurrency: true,
  },
  {
    key: "totalNumberOfProductOrdered",
    label: "Products Ordered",
    icon: Package,
    color: "text-blue-500",
    isCurrency: false,
  },
  {
    key: "totalNumberOfServiceBooked",
    label: "Services Booked",
    icon: Book,
    color: "text-purple-500",
    isCurrency: false,
  },
  {
    key: "totalNumberOfPromotionsParticipating",
    label: "Promotions Joined",
    icon: Handshake,
    color: "text-amber-500",
    isCurrency: false,
  },
  {
    key: "totalNumberOfPointsEarned",
    label: "Points Earned",
    icon: Star,
    color: "text-emerald-500",
    isCurrency: false,
  },
  {
    key: "totalNumberOfPointsRedeemed",
    label: "Points Redeemed",
    icon: Star,
    color: "text-rose-500",
    isCurrency: false,
  },
  {
    key: "totalAmountSpentOnVoucher",
    label: "Voucher Spending",
    icon: Ticket,
    color: "text-indigo-500",
    isCurrency: true,
  },
  {
    key: "totalAmountSpentOnGiftCards",
    label: "Gift Card Spending",
    icon: Gift,
    color: "text-pink-500",
    isCurrency: true,
  },
];

const formatStatValue = (value: number | undefined | null, isCurrency: boolean) => {
  if (value === undefined || value === null) {
    return isCurrency ? formatCurrency(0) : "0";
  }
  if (isCurrency) {
    return formatCurrency(value);
  }
  return value.toLocaleString("en-US");
};

const StatsCards: React.FC<StatsCardsProps> = ({ stats, role }) => {
  const router = useRouter();
  const { data: walletData } = useWallet();
  const statsMap =
    role === UserRole.OWNER ? OwnerStatsMap : CustomerStatsMap;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full">
      {statsMap.map(({ key, label, icon: Icon, color, isCurrency, href }) => {
        let value: number | string | undefined | null = (stats as Record<string, any>)?.[key];
        let displayValue: string | null = null;

        // Ensure wallet balance matches the central wallet source of truth in
        // real-time. Never render a misleading 0 when the load failed.
        if (key === "totalWalletBalance" && walletData) {
          const liveBalance =
            walletData.centralWallet?.balance ??
            walletData.wallet?.balance;
          const numericBalance =
            typeof liveBalance === "number" ? liveBalance : Number(liveBalance);

          if (walletData.success !== false && Number.isFinite(numericBalance)) {
            value = numericBalance;
          } else {
            displayValue = "—";
          }
        }

        return (
          <div 
            key={key} 
            onClick={() => href && router.push(href)}
            className={`hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 p-3 sm:p-4 flex flex-col justify-between gap-3 border border-slate-100/80 bg-white shadow-sm h-full rounded-2xl ${
              href ? "cursor-pointer hover:border-orange-300 hover:ring-2 hover:ring-orange-100" : ""
            }`}
          >
            <div className="flex flex-col gap-1.5 w-full min-w-0">
              <div className="flex items-center justify-between gap-1 w-full">
                <div className="p-1.5 rounded-lg bg-slate-50 shrink-0">
                  <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${color}`} />
                </div>
                {href && (
                  <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                    View
                  </span>
                )}
              </div>
              <span 
                className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider line-clamp-2 leading-tight" 
                title={label}
              >
                {label}
              </span>
            </div>

            <div className="text-sm min-[360px]:text-base sm:text-lg md:text-xl font-black text-slate-800 tracking-tight">
              {displayValue ?? formatStatValue(value as number, isCurrency)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;