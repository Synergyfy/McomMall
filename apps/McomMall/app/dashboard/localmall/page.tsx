'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import api from '@/service/api';
import { RootState } from '@/service/store/store';
import { pickCentralBusiness } from '@/lib/central-business';
import { LocalMallShell } from './components/LocalMallShell';
import { LocalMallTab } from './components/shared/LocalMallBottomNav';

// Import Screen Modules
import { HomeScreen, CustomerMallHome } from './components/screens/HomeScreen';
import { StatusScreen } from './components/screens/StatusScreen';
import { BoroughScreen, SublocationScreen } from './components/screens/LocationSetupScreens';
import { 
  HighStreetScreen, 
  MapScreen, 
  ClusterScreen, 
  BoroughFeedScreen, 
  RankingsScreen 
} from './components/screens/HighStreetScreens';
import { 
  DiscoverScreen, 
  BusinessProfileScreen, 
  CommunityScreen, 
  InterestScreen 
} from './components/screens/DiscoveryScreens';
import { 
  PartnershipsScreen, 
  PartnerMatchesScreen, 
  RequestPartnerScreen, 
  ShareExchangeScreen, 
  CampaignBuilderScreen 
} from './components/screens/PartnershipScreens';
import { 
  VisibilitySettingsScreen, 
  AudienceSettingsScreen, 
  BoostVisibilityScreen 
} from './components/screens/VisibilityScreens';
import { 
  ExpoHubScreen, 
  VirtualBoothSetupScreen, 
  EventDemoManagementScreen 
} from './components/screens/ExpoScreens';
import { 
  SearchFilterScreen, 
  SystemNoticeScreen, 
  NotificationsCenterScreen, 
  MessagesCenterScreen, 
  MessageTemplatesScreen, 
  ScheduledMessagesScreen 
} from './components/screens/OverlayScreens';
import { 
  HubParticipationScreen, 
  AccountManagerSupportScreen,
  IdVerificationScreen 
} from './components/screens/SupportScreens';

export default function LocalMallPage() {
  const router = useRouter();
  const { userRole, userName } = useSelector((state: RootState) => state.auth);
  const isCustomer = String(userRole).toLowerCase() === 'customer';
  const [activeTab, setActiveTab] = useState<LocalMallTab>('home');
  const [screenStack, setScreenStack] = useState<string[]>(['home']);
  const [businessName, setBusinessName] = useState('');
  const [boroughName, setBoroughName] = useState('');
  const [mallName, setMallName] = useState('');
  const [highStreetName, setHighStreetName] = useState('');
  const [postcode, setPostcode] = useState('');
  const [mallData, setMallData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchUnreadNotifications = async () => {
    try {
      const res = await api.get('notifications');
      const notifications = res.data || [];
      const unread = Array.isArray(notifications)
        ? notifications.filter((n: any) => !n.seen).length
        : 0;
      setUnreadNotifications(unread);
    } catch (err) {
      console.error('Error fetching unread notifications count:', err);
    }
  };

  const fetchEcosystemData = async (resolvedPostcode?: string) => {
    try {
      // Customers resolve their mall from the Central profile attached to the
      // JWT. Never reuse the legacy business postcode stored in localStorage.
      const pc = isCustomer
        ? ''
        : resolvedPostcode || postcode || localStorage.getItem('businessPostcode') || '';
      const url = pc
        ? `localmall/customer/feed?postcode=${encodeURIComponent(pc)}`
        : 'localmall/customer/feed';

      const res = await api.get(url);
      if (res.data) {
        setMallData(res.data);
        if (res.data.borough) {
          setBoroughName(res.data.borough);
        }
        if (res.data.mallName) {
          setMallName(res.data.mallName);
        }
        if (res.data.highStreet) {
          setHighStreetName(res.data.highStreet);
        }
      }
    } catch (err) {
      console.error('Error fetching LocalMall feed ecosystem data:', err);
    }
  };

  useEffect(() => {
    if (!userRole) return;

    const loadProfile = async () => {
      if (isCustomer) {
        // The customer's mall is the Central-assigned one; the feed endpoint
        // already reads the customer's postcode from the authenticated user.
        try {
          const res = await api.get('users/me');
          const customer = res.data;
          const name =
            customer?.fullName ||
            [customer?.firstName, customer?.lastName]
              .filter(Boolean)
              .join(' ') ||
            userName ||
            '';
          setBusinessName(name);
          if (customer?.postcode) {
            setPostcode(customer.postcode);
          }
        } catch (err) {
          console.error('Error loading customer profile details:', err);
        }
        await fetchEcosystemData();
        return;
      }

      let resolvedPostcode =
        localStorage.getItem('businessPostcode') || '';

      try {
        const res = await api.get('listings/mine', {
          params: { page: 1, limit: 10 },
        });
        const business = pickCentralBusiness<any>(res.data?.data);
        if (business) {
          setBusinessName(business.businessName || '');
          if (business.location?.postcode) {
            resolvedPostcode = business.location.postcode;
            localStorage.setItem('businessPostcode', resolvedPostcode);
          }
        }
      } catch (err) {
        console.error('Error loading business profile details:', err);
      }

      if (resolvedPostcode) {
        setPostcode(resolvedPostcode);
      }
      await fetchEcosystemData(resolvedPostcode);
    };

    loadProfile().finally(() => setLoading(false));
    fetchUnreadNotifications();
  }, [isCustomer, userName, userRole]);

  const handleNavigate = (screen: string) => {
    setScreenStack((prev) => [...prev, screen]);
    if (screen === 'notifications') {
      fetchUnreadNotifications();
    }
  };

  const handleBack = () => {
    if (screenStack.length > 1) {
      setScreenStack((prev) => prev.slice(0, -1));
    } else {
      router.push('/dashboard');
    }
  };

  const handleTabChange = (tab: LocalMallTab) => {
    setActiveTab(tab);
    setScreenStack([tab]);
  };

  const handlePostcodeResolved = (newPostcode: string, newBorough: string) => {
    if (isCustomer) return;
    setPostcode(newPostcode);
    setBoroughName(newBorough);
    fetchEcosystemData(newPostcode);
  };

  const renderActiveScreen = () => {
    const currentScreen = screenStack[screenStack.length - 1];

    if (currentScreen.startsWith('profile:')) {
      const bizId = currentScreen.split(':')[1];
      return (
        <BusinessProfileScreen
          onNavigate={handleNavigate}
          businessId={bizId}
          mallData={mallData}
          isCustomer={isCustomer}
        />
      );
    }

    // Customers browse the shops assigned to their local mall. Partnership,
    // visibility and expo management screens are business-only.
    if (isCustomer) {
      switch (currentScreen) {
        case 'home':
          return (
            <CustomerMallHome
              onNavigate={handleNavigate}
              mallData={mallData}
              customerName={businessName || userName || ''}
            />
          );
        case 'discover':
          return (
            <DiscoverScreen
              onNavigate={handleNavigate}
              mallData={mallData}
              isCustomer={isCustomer}
            />
          );
        case 'map':
          return (
            <MapScreen
              onNavigate={handleNavigate}
              mallData={mallData}
              boroughName={boroughName}
            />
          );
        case 'notifications':
          return (
            <NotificationsCenterScreen onNavigate={handleNavigate} />
          );
        case 'search':
          return (
            <SearchFilterScreen
              onNavigate={handleNavigate}
              mallData={mallData}
              isCustomer={isCustomer}
            />
          );
        case 'notice':
          return <SystemNoticeScreen onNavigate={handleNavigate} />;
        default:
          return (
            <CustomerMallHome
              onNavigate={handleNavigate}
              mallData={mallData}
              customerName={businessName || userName || ''}
            />
          );
      }
    }

    switch (currentScreen) {
      // Home & Entry Screens
      case 'home':
        return (
          <HomeScreen 
            onNavigate={handleNavigate} 
            mallData={mallData} 
            businessName={businessName} 
            boroughName={boroughName} 
          />
        );
      case 'status':
        return <StatusScreen onNavigate={handleNavigate} businessName={businessName} mallData={mallData} />;
      case 'borough':
        return (
          <BoroughScreen 
            onNavigate={handleNavigate} 
            onPostcodeResolved={handlePostcodeResolved} 
            businessName={businessName} 
          />
        );
      case 'sublocation':
        return <SublocationScreen onNavigate={handleNavigate} businessName={businessName} />;
      
      // High Street Views
      case 'highstreet':
        return <HighStreetScreen onNavigate={handleNavigate} mallData={mallData} boroughName={boroughName} />;
      case 'map':
        return <MapScreen onNavigate={handleNavigate} mallData={mallData} boroughName={boroughName} />;
      case 'clusters':
        return <ClusterScreen onNavigate={handleNavigate} mallData={mallData} />;
      case 'feed':
        return <BoroughFeedScreen onNavigate={handleNavigate} boroughName={boroughName} mallData={mallData} />;
      case 'rankings':
        return <RankingsScreen onNavigate={handleNavigate} mallData={mallData} />;

      // Partnerships & B2B
      case 'partnerships':
        return <PartnershipsScreen onNavigate={handleNavigate} businessName={businessName} />;
      case 'partner-matches':
        return <PartnerMatchesScreen onNavigate={handleNavigate} />;
      case 'request-partner':
        return <RequestPartnerScreen onNavigate={handleNavigate} />;
      case 'share-exchange':
        return <ShareExchangeScreen onNavigate={handleNavigate} mallData={mallData} />;
      case 'campaign-builder':
        return <CampaignBuilderScreen onNavigate={handleNavigate} />;
      
      // Visibility Settings
      case 'visibility':
        return <VisibilitySettingsScreen onNavigate={handleNavigate} businessName={businessName} />;
      case 'audience':
        return <AudienceSettingsScreen onNavigate={handleNavigate} />;
      case 'boost':
        return <BoostVisibilityScreen onNavigate={handleNavigate} />;

      // Discovery & Community
      case 'community':
        return <CommunityScreen onNavigate={handleNavigate} mallData={mallData} />;
      case 'discover':
        return <DiscoverScreen onNavigate={handleNavigate} mallData={mallData} />;
      case 'interest':
        return (
          <InterestScreen
            onNavigate={handleNavigate}
            mallData={mallData}
            businessName={businessName}
          />
        );

      // Expo Hub
      case 'expo':
        return <ExpoHubScreen onNavigate={handleNavigate} />;
      case 'booth-setup':
        return <VirtualBoothSetupScreen onNavigate={handleNavigate} />;
      case 'event-demo':
        return <EventDemoManagementScreen onNavigate={handleNavigate} />;

      // Support & Tiers
      case 'hub-participation':
        return <HubParticipationScreen onNavigate={handleNavigate} mallData={mallData} />;
      case 'support':
        return <AccountManagerSupportScreen onNavigate={handleNavigate} boroughName={boroughName} />;
      case 'id-verification':
        return <IdVerificationScreen onNavigate={handleNavigate} businessName={businessName} />;

      // Global Header/Notifications Triggers
      case 'notifications':
        return <NotificationsCenterScreen onNavigate={handleNavigate} />;
      case 'messages':
        return <MessagesCenterScreen onNavigate={handleNavigate} />;
      case 'message-templates':
        return <MessageTemplatesScreen onNavigate={handleNavigate} />;
      case 'scheduled-messages':
        return <ScheduledMessagesScreen onNavigate={handleNavigate} />;
      case 'search':
        return <SearchFilterScreen onNavigate={handleNavigate} mallData={mallData} />;
      case 'notice':
        return <SystemNoticeScreen onNavigate={handleNavigate} />;

      default:
        return (
          <HomeScreen 
            onNavigate={handleNavigate} 
            mallData={mallData} 
            businessName={businessName} 
            boroughName={boroughName} 
          />
        );
    }
  };

  return (
    <LocalMallShell
      businessName={businessName}
      boroughName={boroughName}
      mallName={mallName}
      highStreetName={highStreetName}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      screenStack={screenStack}
      onBack={handleBack}
      onNotificationsClick={() => handleNavigate('notifications')}
      onSearchClick={() => handleNavigate('search')}
      onStatusClick={() => handleNavigate('status')}
      unreadNotifications={unreadNotifications}
      isCustomer={isCustomer}
    >
      {loading ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
          <p className="text-xs text-gray-500">
            Loading your local mall from MCOM Central…
          </p>
        </div>
      ) : (
        renderActiveScreen()
      )}
    </LocalMallShell>
  );
}
