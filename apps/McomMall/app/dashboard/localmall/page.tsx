'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/service/api';
import { LocalMallShell } from './components/LocalMallShell';
import { LocalMallTab } from './components/shared/LocalMallBottomNav';

// Import Screen Modules
import { HomeScreen } from './components/screens/HomeScreen';
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
  RotatorSettingsScreen, 
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
  AccountManagerSupportScreen 
} from './components/screens/SupportScreens';

export default function LocalMallPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<LocalMallTab>('home');
  const [screenStack, setScreenStack] = useState<string[]>(['home']);
  const [businessName, setBusinessName] = useState('My Business Storefront');
  const [boroughName, setBoroughName] = useState('Greenwich');
  const [postcode, setPostcode] = useState('');
  const [mallData, setMallData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchEcosystemData = async (resolvedPostcode?: string) => {
    try {
      const pc = resolvedPostcode || postcode || localStorage.getItem('businessPostcode') || '';
      const url = pc 
        ? `localmall/customer/feed?postcode=${encodeURIComponent(pc)}` 
        : 'localmall/customer/feed';
      
      const res = await api.get(url);
      if (res.data) {
        setMallData(res.data);
        if (res.data.borough) {
          setBoroughName(res.data.borough);
        }
      }
    } catch (err) {
      console.error('Error fetching LocalMall feed ecosystem data:', err);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get('businesses/my-profile');
        if (res.data) {
          setBusinessName(res.data.businessName || 'My Business Storefront');
          if (res.data.location?.postcode) {
            setPostcode(res.data.location.postcode);
            localStorage.setItem('businessPostcode', res.data.location.postcode);
            fetchEcosystemData(res.data.location.postcode);
            return;
          }
        }
      } catch (err) {
        console.error('Error loading business profile details:', err);
      }
      
      // Fallback if profile fails
      const storedPostcode = localStorage.getItem('businessPostcode') || '';
      if (storedPostcode) {
        setPostcode(storedPostcode);
      }
      fetchEcosystemData(storedPostcode);
    };

    loadProfile().finally(() => setLoading(false));
  }, []);

  const handleNavigate = (screen: string) => {
    setScreenStack((prev) => [...prev, screen]);
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
    setPostcode(newPostcode);
    setBoroughName(newBorough);
    fetchEcosystemData(newPostcode);
  };

  const renderActiveScreen = () => {
    const currentScreen = screenStack[screenStack.length - 1];

    if (currentScreen.startsWith('profile:')) {
      const bizId = currentScreen.split(':')[1];
      return <BusinessProfileScreen onNavigate={handleNavigate} businessId={bizId} />;
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
        return <BoroughFeedScreen onNavigate={handleNavigate} boroughName={boroughName} />;
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
      case 'rotator':
        return <RotatorSettingsScreen onNavigate={handleNavigate} />;
      case 'boost':
        return <BoostVisibilityScreen onNavigate={handleNavigate} />;

      // Discovery & Community
      case 'community':
        return <CommunityScreen onNavigate={handleNavigate} mallData={mallData} />;
      case 'discover':
        return <DiscoverScreen onNavigate={handleNavigate} mallData={mallData} />;
      case 'interest':
        return <InterestScreen onNavigate={handleNavigate} />;

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
      activeTab={activeTab}
      onTabChange={handleTabChange}
      screenStack={screenStack}
      onBack={handleBack}
      onNotificationsClick={() => handleNavigate('notifications')}
      onSearchClick={() => handleNavigate('search')}
      onStatusClick={() => handleNavigate('status')}
    >
      {renderActiveScreen()}
    </LocalMallShell>
  );
}
