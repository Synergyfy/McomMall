'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
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
  marketingMenuItems,
  MenuItem,
} from '@/lib/menu-items';

interface MenuContentProps {
  onLinkClick?: () => void;
}

export const MenuContent = ({ onLinkClick }: MenuContentProps) => {
  const { userRole } = useSelector((state: RootState) => state.auth);
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

  const toggleSubMenu = (title: string) => {
    setOpenSubMenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const renderMenuItems = (items: MenuItem[]) => (
    <ul className="space-y-1">
      {items.map((item, i) => {
        const isParentActive =
          item.subMenu?.some(subItem => pathname.startsWith(subItem.href)) ??
          false;
        const isActive = pathname === item.href || isParentActive;

        const MenuItemContent = (
          <div className="flex items-center space-x-2">
            <item.icon
              className={`w-5 h-5 ${
                isActive ? 'text-orange-600' : 'text-orange-500'
              }`}
            />
            <span>{item.title}</span>
          </div>
        );

        return (
          <li key={i}>
            <motion.div
              whileHover={{ scale: 1.02, backgroundColor: '#ffffff' }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl"
            >
              <div
                className={`flex items-center justify-between p-2 text-gray-700 hover:text-orange-500 transition-colors cursor-pointer rounded-2xl hover:shadow hover:bg-white ${
                  isActive ? 'bg-white text-orange-600' : ''
                }`}
                onClick={() => item.subMenu && toggleSubMenu(item.title)}
              >
                {item.subMenu ? (
                  <div className="flex items-center space-x-2">
                    {MenuItemContent}
                  </div>
                ) : (
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
                    {MenuItemContent}
                  </Link>
                )}
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
                  {item.subMenu.map((subItem, j) => {
                    const isSubMenuActive = pathname.startsWith(subItem.href);
                    return (
                      <li key={j}>
                        <Link
                          href={subItem.href}
                          className={`block py-1 text-gray-600 hover:text-orange-500 text-sm transition-colors pl-8 ${
                            isSubMenuActive ? 'bg-white text-orange-600' : ''
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