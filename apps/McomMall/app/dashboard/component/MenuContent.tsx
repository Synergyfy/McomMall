'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Lock } from 'lucide-react';
import { useAppSelector } from '@/service/store/store';
import { logout } from '@/service/store/authSlice';
import { useGetTiers } from '@/service/tiers/hook';
import { useGetTrialStatus } from '@/service/payments/hooks';
import { useGetMyMembership } from '@/service/membership/hooks';
import { useGetCapabilityEffectiveConfig, useGetCapabilityUsage } from '@/service/system/hook';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  mainMenuItems,
  listingMenuItems,
  productMenuItems,
  serviceMenuItems,
  accountMenuItems,
  pluginMenuItems,
  historyMenuItems,
  marketingMenuItems,
  MenuItem,
} from '@/lib/menu-items';

interface MenuContentProps {
  onLinkClick?: () => void;
}

export const MenuContent = ({ onLinkClick }: MenuContentProps) => {
  const { userRole, packageInfo } = useAppSelector((state) => state.auth);
  const { data: tiers } = useGetTiers();
  const { data: trialStatus } = useGetTrialStatus();
  const { data: membership } = useGetMyMembership();
  const { data: capConfig } = useGetCapabilityEffectiveConfig();
  const { data: usage } = useGetCapabilityUsage();

  const currentTier = tiers?.find(
    t => t.name.toLowerCase() === packageInfo?.planType?.toLowerCase()
  );

  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    const allMenuItems = [
      ...mainMenuItems,
      ...listingMenuItems,
      ...productMenuItems,
      ...serviceMenuItems,
      ...accountMenuItems,
      ...pluginMenuItems,
      ...historyMenuItems,
      ...marketingMenuItems,
    ];

    const activeMenuItem = allMenuItems.find(item =>
      item.subMenu?.some(subItem => pathname.startsWith(subItem.href))
    );

    if (activeMenuItem) {
      setOpenSubMenus(prev => ({ ...prev, [activeMenuItem.title]: true }));
    }
  }, [pathname]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
    if (onLinkClick) {
      onLinkClick();
    }
  };

  const getLockInfo = (title: string) => {
    if (userRole === 'customer') return { allowed: true };

    // 1. Basic Membership Check
    if (userRole === 'owner' && !membership?.isActive) {
      const allowedTitles = [
        'Dashboard',
        'My Subscription',
        'My Profile',
        'Logout',
        'Settings',
      ];
      if (!allowedTitles.includes(title)) {
        return { allowed: false, reason: 'Active membership required' };
      }
    }

    // 2. Capability Quota Check
    if (capConfig?.quotas && usage) {
      const q = capConfig.quotas;
      const u = usage;

      if ((title === 'Add listing' || title === 'My listings' || title === 'Listing') && u.currentListings >= q.maxListings) {
        return { allowed: false, reason: "You've maxed out, upgrade to a higher tier", isMaxed: true };
      }
      if ((title === 'Product' || title === 'Add Product') && u.currentProducts >= q.maxProducts) {
        return { allowed: false, reason: "You've maxed out, upgrade to a higher tier", isMaxed: true };
      }
      if ((title === 'Service' || title === 'Add Service') && u.currentServices >= q.maxServices) {
        return { allowed: false, reason: "You've maxed out, upgrade to a higher tier", isMaxed: true };
      }
      if ((title === 'Coupons' || title === 'Coupon Products' || title === 'Voucher' || title === 'Coupon-Voucher') && u.currentCoupons >= q.maxCouponTemplates) {
        return { allowed: false, reason: "You've maxed out, upgrade to a higher tier", isMaxed: true };
      }
      if ((title === 'Gift Card' || title === 'Templates') && u.currentGiftCards >= q.maxGiftCardTemplates) {
        return { allowed: false, reason: "You've maxed out, upgrade to a higher tier", isMaxed: true };
      }
    }

    // 3. Fallback to current tier configuration
    if (currentTier) {
      const quotas = currentTier.configuration?.quotas;
      if (title === 'Product' && quotas && !quotas.allowProductListing) return { allowed: false, reason: 'Feature not included in your tier' };
      if (title === 'Service' && quotas && !quotas.allowServiceListing) return { allowed: false, reason: 'Feature not included in your tier' };
    }

    return { allowed: true };
  };

  const isAllowed = (title: string) => getLockInfo(title).allowed;

  const customerListingMenu = listingMenuItems.filter(item =>
    ['Reviews', 'Bookmarks'].includes(item.title)
  );

  const cashbackItem = accountMenuItems.find(item => item.title === 'Cashback');

  const customerMainMenu = [
    ...mainMenuItems
      .filter(item =>
        [
          'Dashboard',
          'My Bookings',
          'Messages',
          'Wallet',
          'My Wishlist',
          'Reward Hub',
          'Coupon-Voucher',
          'Terminal Cashback',
        ].includes(item.title)
      )
      .sort((a, b) => {
        const order = [
          'Dashboard',
          'My Bookings',
          'Messages',
          'Wallet',
          'My Wishlist',
          'Reward Hub',
          'Coupon-Voucher',
          'Terminal Cashback',
        ];
        return order.indexOf(a.title) - order.indexOf(b.title);
      }),
    ...(cashbackItem ? [cashbackItem] : []),
  ];

  const customerSupportMenu = mainMenuItems.filter(item =>
    ['Support Tickets'].includes(item.title)
  );

  const customerProductMenu = productMenuItems.filter(item =>
    ['Orders'].includes(item.title)
  );

  const customerAccountMenu = accountMenuItems.filter(item =>
    ['My Profile', 'Logout'].includes(item.title)
  );

  const toggleSubMenu = (title: string) => {
    if (!isAllowed(title)) return;
    setOpenSubMenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const renderMenuItems = (items: MenuItem[]) => (
    <ul className="space-y-1">
      {items.map((item, i) => {
        const lockInfo = getLockInfo(item.title);
        const allowed = lockInfo.allowed;
        const isParentActive =
          item.subMenu?.some(subItem => pathname.startsWith(subItem.href)) ??
          false;
        const isActive = pathname === item.href || isParentActive;

        const MenuItemContent = (
          <div className={`flex items-center space-x-2 ${!allowed ? 'filter blur-[1px]' : ''}`}>
            <item.icon
              className={`w-5 h-5 ${isActive ? 'text-orange-600' : 'text-orange-500'
                }`}
            />
            <div className="flex items-center gap-1.5">
              <span>{item.title}</span>
              {item.title === 'Activity Timer' && trialStatus?.isActive && (
                <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse shadow-[0_0_8px_rgba(234,88,12,0.6)]" />
              )}
            </div>
          </div>
        );

        const content = (
          <li key={i} className={!allowed ? 'cursor-not-allowed opacity-70' : ''}>
            <motion.div
              whileHover={allowed ? { scale: 1.02, backgroundColor: '#ffffff' } : {}}
              transition={{ duration: 0.2 }}
              className="rounded-2xl"
            >
              <div
                className={`flex items-center justify-between p-2 text-gray-700 transition-colors rounded-2xl ${allowed ? 'hover:text-orange-500 cursor-pointer hover:shadow hover:bg-white' : 'pointer-events-none'
                  } ${isActive ? 'bg-white text-orange-600' : ''
                  }`}
                onClick={() => allowed && item.subMenu && toggleSubMenu(item.title)}
              >
                <div className="flex items-center space-x-2">
                  {MenuItemContent}
                  {!allowed && <Lock className="w-3 h-3 text-gray-400" />}
                </div>
                {item.subMenu && (
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${openSubMenus[item.title] ? 'rotate-180' : ''
                      }`}
                  />
                )}
              </div>
            </motion.div>
            <AnimatePresence>
              {allowed && item.subMenu && openSubMenus[item.title] && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-4 mt-1 space-y-1 overflow-hidden"
                >
                  {item.subMenu.map((subItem, j) => {
                    const isSubMenuActive = pathname.startsWith(subItem.href);
                    return (
                      <li key={j}>
                        <Link
                          href={subItem.href}
                          className={`block py-1 text-gray-600 hover:text-orange-500 text-sm transition-colors pl-8 ${isSubMenuActive ? 'bg-white text-orange-600' : ''
                            }`}
                          onClick={onLinkClick}
                        >
                          {subItem.title}
                        </Link>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </li>
        );

        if (!allowed) {
          return (
            <TooltipProvider key={i}>
              <Tooltip>
                <TooltipTrigger asChild>
                  {content}
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-slate-900 text-white border-slate-800 p-3 shadow-xl max-w-[200px]">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium leading-tight">
                      {lockInfo.reason || `Upgrade to unlock ${item.title}`}
                    </p>
                    {lockInfo.isMaxed && (
                      <Link
                        href="/dashboard/my-subscription"
                        className="text-orange-400 text-xs font-bold hover:text-orange-300 transition-colors uppercase tracking-wider flex items-center gap-1"
                        onClick={onLinkClick}
                      >
                        Upgrade Now <ChevronDown className="w-3 h-3 rotate-270" />
                      </Link>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return (
          <div key={i}>
            {!item.subMenu ? (
              <Link
                href={item.href}
                className="block"
                onClick={e => {
                  if (item.title === 'Logout') {
                    e.preventDefault();
                    handleLogout();
                  } else if (onLinkClick) {
                    onLinkClick();
                  }
                }}
              >
                {content}
              </Link>
            ) : (
              content
            )}
          </div>
        );
      })}
    </ul>
  );

  return (
    <>
      {userRole !== 'customer' && (
        <>
          <nav>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 px-2">
              Main
            </h3>
            {renderMenuItems(mainMenuItems)}
          </nav>
          <nav className="mt-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 px-2">
              Listing
            </h3>
            {renderMenuItems(listingMenuItems)}
          </nav>
          <nav className="mt-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 px-2">
              Product
            </h3>
            {renderMenuItems(productMenuItems)}
          </nav>
          <nav className="mt-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 px-2">
              Service
            </h3>
            {renderMenuItems(serviceMenuItems)}
          </nav>
          <nav className="mt-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 px-2">
              MARKETING
            </h3>
            {renderMenuItems([...pluginMenuItems, ...marketingMenuItems])}
          </nav>
          <nav className="mt-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 px-2">
              MY PURCHASES
            </h3>
            {renderMenuItems(historyMenuItems)}
          </nav>
        </>
      )}

      {userRole === 'customer' && (
        <>
          <nav>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 px-2">
              Main
            </h3>
            {renderMenuItems(customerMainMenu)}
          </nav>
          <nav className="mt-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 px-2">
              Listing
            </h3>
            {renderMenuItems(customerListingMenu)}
          </nav>
          <nav className="mt-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 px-2">
              Store
            </h3>
            {renderMenuItems(customerProductMenu)}
          </nav>
          <nav className="mt-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 px-2">
              HISTORY
            </h3>
            {renderMenuItems(historyMenuItems)}
          </nav>
          <nav className="mt-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 px-2">
              Support
            </h3>
            {renderMenuItems(customerSupportMenu)}
          </nav>
          <nav className="mt-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 px-2">
              Account
            </h3>
            {renderMenuItems(customerAccountMenu)}
          </nav>
        </>
      )}

      {userRole !== 'customer' && (
        <nav className="mt-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 px-2">
            Account
          </h3>
          {renderMenuItems(accountMenuItems)}
        </nav>
      )}
    </>
  );
};
