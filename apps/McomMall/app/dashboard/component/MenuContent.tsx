'use client';

import { useState, useEffect } from 'react';
import Link from 'next/navigation';
import { useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { Plus, Minus, ChevronDown, LogOut } from 'lucide-react';
import { RootState } from '@/service/store/store';
import { useLogout } from '@/service/auth/hook';
import { useGetUserListings } from '@/service/listings/hook';
import {
  mainMenuItems,
  listingMenuItems,
  productMenuItems,
  serviceMenuItems,
  accountMenuItems,
  pluginMenuItems,
  historyMenuItems,
  marketingMenuItems,
  storefrontMenuItems,
  MenuItem,
} from '@/lib/menu-items';

interface MenuContentProps {
  onLinkClick?: () => void;
  isCollapsed?: boolean;
}

export const MenuContent = ({ onLinkClick, isCollapsed }: MenuContentProps) => {
  const { userRole } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const logout = useLogout();
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [expandedSection, setExpandedSection] = useState<string | null>('Main');

  const { data: listingsData } = useGetUserListings(1, 100);
  const listings = listingsData?.data || [];

  const hasProducts = listings.some(l => l.listingType?.includes('RETAIL'));
  const hasServices = listings.some(l => l.listingType?.includes('SERVICE'));

  const showProducts = listings.length === 0 || hasProducts;
  const showServices = listings.length === 0 || hasServices;

  useEffect(() => {
    if (isCollapsed) {
      setOpenSubMenus({});
      setExpandedSection(null);
    }
  }, [isCollapsed]);

  const toggleSection = (section: string) => {
    setExpandedSection(prev => (prev === section ? null : section));
  };

  const toggleSubMenu = (id: string) => {
    setOpenSubMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogout = () => {
    logout();
    router.push('/signin');
    if (onLinkClick) onLinkClick();
  };

  const renderMenuItems = (items: MenuItem[]) => (
    <div className="space-y-1">
      {items.map((item, index) => {
        const Icon = item.icon;
        const hasSubItems = item.subMenu && item.subMenu.length > 0;
        const isOpen = openSubMenus[item.title];
        const isActive = pathname === item.href;

        if (item.title === 'Logout') {
          return (
            <button
              key={index}
              onClick={handleLogout}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors text-red-600 hover:bg-red-50 ${isCollapsed ? 'justify-center' : ''}`}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="ml-3 font-semibold">{item.title}</span>}
            </button>
          );
        }

        return (
          <div key={index}>
            {hasSubItems ? (
              <button
                onClick={() => toggleSubMenu(item.title)}
                className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-gray-200 text-gray-700 ${isCollapsed ? 'justify-center' : ''}`}
              >
                <div className="flex items-center">
                  <Icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="ml-3 font-semibold">{item.title}</span>}
                </div>
                {!isCollapsed && (
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                )}
              </button>
            ) : (
              <a
                href={item.href || '#'}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(item.href);
                  if (onLinkClick) onLinkClick();
                }}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive ? 'bg-orange-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'} ${isCollapsed ? 'justify-center' : ''}`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                {!isCollapsed && <span className="ml-3 font-semibold">{item.title}</span>}
              </a>
            )}
            {!isCollapsed && hasSubItems && isOpen && (
              <div className="mt-1 ml-9 space-y-1">
                {item.subMenu!.map((subItem, subIndex) => {
                  const isSubActive = pathname === subItem.href;
                  return (
                    <a
                      key={subIndex}
                      href={subItem.href || '#'}
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(subItem.href);
                        if (onLinkClick) onLinkClick();
                      }}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isSubActive ? 'text-orange-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      {subItem.title}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderSection = (title: string, items: MenuItem[]) => (
    <nav className="mt-6">
      <div
        className="flex items-center justify-between px-2 mb-2 cursor-pointer group"
        onClick={() => toggleSection(title)}
      >
        {!isCollapsed && (
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">
            {title}
          </h3>
        )}
        {!isCollapsed && (
          expandedSection === title ? (
            <Minus className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
          ) : (
            <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
          )
        )}
      </div>
      {(isCollapsed || expandedSection === title) && renderMenuItems(items)}
    </nav>
  );

  return (
    <div className="flex flex-col space-y-2">
      <nav>
        <div className="flex items-center justify-between px-2 mb-2 cursor-pointer group" onClick={() => toggleSection('Main')}>
          {!isCollapsed && <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">Main</h3>}
          {!isCollapsed && (
            expandedSection === 'Main' ? (
              <Minus className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
            ) : (
              <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
            )
          )}
        </div>
        {(isCollapsed || expandedSection === 'Main') && renderMenuItems(mainMenuItems)}
      </nav>
      {userRole !== 'customer' && renderSection('Storefront', storefrontMenuItems)}
      {userRole !== 'customer' && renderSection('Listing', listingMenuItems)}
      {userRole !== 'customer' && showProducts && renderSection('Product', productMenuItems)}
      {userRole !== 'customer' && showServices && renderSection('Service', serviceMenuItems)}
      {userRole !== 'customer' && renderSection('Marketing', [...pluginMenuItems, ...marketingMenuItems])}
      {renderSection('My Purchases', historyMenuItems)}
      <nav className="mt-6">
        <div className="flex items-center justify-between px-2 mb-2 cursor-pointer group" onClick={() => toggleSection('Account')}>
          {!isCollapsed && <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">Account</h3>}
          {!isCollapsed && (
            expandedSection === 'Account' ? (
              <Minus className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
            ) : (
              <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
            )
          )}
        </div>
        {(isCollapsed || expandedSection === 'Account') && renderMenuItems(accountMenuItems)}
      </nav>
    </div>
  );
};
