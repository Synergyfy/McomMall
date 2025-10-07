'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { RootState } from '@/service/store/store';
import { logout } from '@/service/store/authSlice';
import {
  mainMenuItems,
  listingMenuItems,
  productMenuItems,
  serviceMenuItems,
  accountMenuItems,
  pluginMenuItems,
  historyMenuItems,
  MenuItem,
  barterExchangeMenuItems,
} from '@/lib/menu-items';

interface MenuContentProps {
  onLinkClick?: () => void;
}

export const MenuContent = ({ onLinkClick }: MenuContentProps) => {
  const { userRole } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>(
    {}
  );

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
    if (onLinkClick) {
      onLinkClick();
    }
  };

  const customerListingMenu = listingMenuItems.filter(item =>
    ['Reviews', 'Bookmarks'].includes(item.title)
  );

  const customerMainMenu = mainMenuItems.filter(item =>
    ['My Bookings', 'Messages', 'Wallet', 'My Wishlist'].includes(item.title)
  );

  const customerProductMenu = productMenuItems.filter(item =>
    ['Orders'].includes(item.title)
  );

  const customerAccountMenu = accountMenuItems.filter(item =>
    ['My Profile', 'Logout'].includes(item.title)
  );


 
  // Customer section
const customerBarterExchangeMenu = barterExchangeMenuItems.filter(item =>
  [
    "Barter Exchange", 
    "Add Exchange", 
    "Exchange History", 
    "Proposals", 
    "Items listing", 
    "Messages", 
    "Rules & Policies"
  ].includes(item.title)
);

// Admin section
const adminBarterExchangeMenu = barterExchangeMenuItems.filter(item =>
  [
    "Admin Dashboard", 
    "User Management", 
    "Fraud & Safety", 
    "Settings & Integrations"
  ].includes(item.title)
);

  const toggleSubMenu = (title: string) => {
    setOpenSubMenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const renderMenuItems = (items: MenuItem[]) => (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i}>
          <motion.div
            whileHover={{ scale: 1.02, backgroundColor: '#ffffff' }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl"
          >
            <div
              className="flex items-center justify-between p-2 text-gray-700 hover:text-orange-500 transition-colors cursor-pointer rounded-2xl hover:shadow hover:bg-white"
              onClick={() => item.subMenu && toggleSubMenu(item.title)}
            >
              <Link
                href={item.href}
                className="flex items-center space-x-2"
                onClick={e => {
                  if (item.title === 'Logout') {
                    e.preventDefault();
                    handleLogout();
                  } else if (onLinkClick) {
                    onLinkClick();
                  }
                }}
              >
                <item.icon className="w-5 h-5 text-orange-500" />
                <span>{item.title}</span>
              </Link>
              {item.subMenu && (
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    openSubMenus[item.title] ? 'rotate-180' : ''
                  }`}
                />
              )}
            </div>
          </motion.div>
          <AnimatePresence>
            {item.subMenu && openSubMenus[item.title] && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="ml-4 mt-1 space-y-1 overflow-hidden"
              >
                {item.subMenu.map((subItem, j) => (
                  <li key={j}>
                    <Link
                      href={subItem.href}
                      className="block py-1 text-gray-600 hover:text-orange-500 text-sm transition-colors pl-8"
                      onClick={onLinkClick}
                    >
                      {subItem.title}
                    </Link>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </li>
      ))}
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
          {/* Bertar Exchange section for non-customer role */}
          <nav className="mt-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 px-2">
              Bertar Exchange
            </h3>
            {renderMenuItems(adminBarterExchangeMenu)}
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
            {renderMenuItems(pluginMenuItems)}
          </nav>
          <nav className="mt-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 px-2">
              HISTORY
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
          {/* Bertar Exchange section for customer role */}
          <nav className="mt-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 px-2">
              Barter Exchange
            </h3>
            {renderMenuItems(customerBarterExchangeMenu)}
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
