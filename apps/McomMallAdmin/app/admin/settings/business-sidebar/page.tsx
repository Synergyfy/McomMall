'use client';

import { useState, useMemo } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import {
  GripVertical, Save, Edit2, Check, X, ChevronDown, ChevronRight,
  LayoutDashboard, Timer, Calendar, MessageSquare, Heart, Gift, LifeBuoy,
  Plus, List, BookOpen, ShoppingBag, Settings as SettingsIcon,
  Scan, Zap, History, CreditCard, Wallet, Coins, LogOut, UserPen, Users,
  SquareDashedKanban, Search, Settings2, Building2, ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useGetTiers, useUpdateTier } from '@/service/tiers/hook';
import { useGetAdminBusinesses, useUpdateBusiness } from '@/service/admin/hook';
import { AdminBusiness } from '@/service/admin/types';
import { Tier } from '@/app/admin/types/tier';

// Types
type SubNavItem = {
  id: string;
  label: string;
};

type NavItem = {
  id: string;
  label: string;
  icon: any;
  subItems?: SubNavItem[];
};

type NavGroup = {
  id: string;
  title: string;
  items: NavItem[];
};

// Real business sidebar data from menu-items.ts
const initialData: NavGroup[] = [
  {
    id: 'group-main',
    title: 'Main',
    items: [
      { id: 'nav-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'nav-activity-timer', label: 'Activity Timer', icon: Timer },
      { id: 'nav-my-bookings', label: 'My Bookings', icon: Calendar },
      { id: 'nav-messages', label: 'Messages', icon: MessageSquare },
      { id: 'nav-wishlist', label: 'My Wishlist', icon: Heart },
      { id: 'nav-coupon-voucher', label: 'Coupon-Voucher', icon: Gift },
      { id: 'nav-support-tickets', label: 'Support Tickets', icon: LifeBuoy },
    ]
  },
  {
    id: 'group-listing',
    title: 'Listing',
    items: [
      { id: 'nav-add-listing', label: 'Add Listing', icon: Plus },
      {
        id: 'nav-my-listings', label: 'My Listings', icon: List,
        subItems: [
          { id: 'sub-active', label: 'Active' },
          { id: 'sub-drafts', label: 'Drafts' },
          { id: 'sub-pending', label: 'Pending' },
          { id: 'sub-expired', label: 'Expired' },
        ]
      },
      { id: 'nav-reviews', label: 'Reviews', icon: SquareDashedKanban },
    ]
  },
  {
    id: 'group-product',
    title: 'Product',
    items: [
      { id: 'nav-product', label: 'Product', icon: SquareDashedKanban },
      { id: 'nav-add-product', label: 'Add Product', icon: Plus },
      { id: 'nav-orders', label: 'Orders', icon: ShoppingBag },
    ]
  },
  {
    id: 'group-service',
    title: 'Service',
    items: [
      { id: 'nav-service', label: 'Service', icon: SquareDashedKanban },
      { id: 'nav-add-service', label: 'Add Service', icon: Plus },
      {
        id: 'nav-bookings', label: 'Bookings', icon: BookOpen,
        subItems: [
          { id: 'sub-calendar', label: 'Calendar View' },
          { id: 'sub-book-pending', label: 'Pending' },
          { id: 'sub-book-approved', label: 'Approved' },
          { id: 'sub-book-cancelled', label: 'Cancelled' },
        ]
      },
    ]
  },
  {
    id: 'group-marketing',
    title: 'Marketing',
    items: [
      {
        id: 'nav-loyalty', label: 'Loyalty & Reward', icon: SettingsIcon,
        subItems: [
          { id: 'sub-loyalty-analytics', label: 'Analytics' },
          { id: 'sub-loyalty-members', label: 'Members' },
          { id: 'sub-loyalty-promotion', label: 'Promotion' },
          { id: 'sub-loyalty-time-bonus', label: 'Time Bonus' },
          { id: 'sub-loyalty-offers', label: 'Offers' },
        ]
      },
      {
        id: 'nav-gift-card', label: 'Gift Card', icon: SettingsIcon,
        subItems: [
          { id: 'sub-gc-analytics', label: 'Analytics' },
          { id: 'sub-gc-templates', label: 'Templates' },
          { id: 'sub-gc-assets', label: 'Assets' },
          { id: 'sub-gc-balance', label: 'Check Balance' },
        ]
      },
      {
        id: 'nav-voucher', label: 'Voucher', icon: SettingsIcon,
        subItems: [
          { id: 'sub-v-analytics', label: 'Analytics' },
          { id: 'sub-v-products', label: 'Voucher Products' },
          { id: 'sub-v-sold', label: 'Sold Vouchers' },
        ]
      },
      {
        id: 'nav-coupons', label: 'Coupons', icon: SettingsIcon,
        subItems: [
          { id: 'sub-c-analytics', label: 'Analytics' },
          { id: 'sub-c-products', label: 'Coupon Products' },
          { id: 'sub-c-sold', label: 'Sold Coupons' },
          { id: 'sub-c-redeem', label: 'Redeem Coupon' },
        ]
      },
      {
        id: 'nav-hotspot', label: 'Hotspot Campaigns', icon: Scan,
        subItems: [
          { id: 'sub-h-all', label: 'All Campaigns' },
          { id: 'sub-h-new', label: 'New Campaign' },
        ]
      },
      {
        id: 'nav-partnerships', label: 'Partnerships', icon: Users,
        subItems: [
          { id: 'sub-p-my', label: 'My Partners' },
          { id: 'sub-p-requests', label: 'Partnership Requests' },
        ]
      },
      { id: 'nav-group-circles', label: 'Group Circles', icon: Zap },
    ]
  },
  {
    id: 'group-purchases',
    title: 'My Purchases',
    items: [
      { id: 'nav-reward-history', label: 'Reward History', icon: History },
      { id: 'nav-hist-gift-card', label: 'Gift Card', icon: CreditCard },
      { id: 'nav-my-vouchers', label: 'My Vouchers', icon: CreditCard },
      { id: 'nav-my-coupons', label: 'My Coupons', icon: CreditCard },
    ]
  },
  {
    id: 'group-account',
    title: 'Account',
    items: [
      { id: 'nav-my-profile', label: 'My Profile', icon: UserPen },
      { id: 'nav-my-subscription', label: 'My Subscription', icon: CreditCard },
      { id: 'nav-wallet', label: 'Wallet', icon: Wallet },
      { id: 'nav-cashback', label: 'Cashback', icon: Coins },
      { id: 'nav-logout', label: 'Logout', icon: LogOut },
    ]
  }
];

// Flatten all items for selection
const ALL_FLAT_NAV_ITEMS = initialData.flatMap(group => group.items);

function NavItemRow({
  item,
  onUpdateItem,
  onUpdateSubItem
}: {
  item: NavItem;
  onUpdateItem: (id: string, newLabel: string) => void;
  onUpdateSubItem: (itemId: string, subId: string, newLabel: string) => void;
}) {
  const controls = useDragControls();
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.label);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editSubValue, setEditSubValue] = useState('');

  const hasSubItems = item.subItems && item.subItems.length > 0;

  const handleSave = () => {
    if (editValue.trim() && editValue !== item.label) {
      onUpdateItem(item.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleStartEditSub = (sub: SubNavItem) => {
    setEditingSubId(sub.id);
    setEditSubValue(sub.label);
  };

  const handleSaveSub = (subId: string) => {
    if (editSubValue.trim()) {
      onUpdateSubItem(item.id, subId, editSubValue.trim());
    }
    setEditingSubId(null);
  };

  return (
    <Reorder.Item
      value={item}
      id={item.id}
      dragListener={false}
      dragControls={controls}
      className="mb-2 select-none"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileDrag={{
        scale: 1.02,
        boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        cursor: "grabbing",
        zIndex: 50,
      }}
    >
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-3 shadow-sm group/item">
        <div
          className="cursor-grab hover:text-orange-500 transition-colors p-1"
          onPointerDown={(e) => controls.start(e)}
        >
          <GripVertical size={18} className="text-slate-400" />
        </div>
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-slate-50 text-slate-600 shrink-0">
          <item.icon size={16} />
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-8 text-sm flex-1 border-orange-200 focus-visible:ring-orange-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditValue(item.label);
                }
              }}
            />
            <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600" onClick={handleSave}>
              <Check size={14} />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="font-medium text-slate-700 text-sm truncate">{item.label}</span>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-slate-400 hover:text-orange-500 transition-all"
            >
              <Edit2 size={12} />
            </button>
          </div>
        )}

        {hasSubItems && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] font-semibold bg-orange-50 text-orange-600 border-orange-100">
              {item.subItems!.length} sub
            </Badge>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-slate-100 rounded-md transition-colors"
            >
              {expanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
            </button>
          </div>
        )}
      </div>

      {/* Sub-items */}
      {hasSubItems && expanded && (
        <div className="ml-12 mt-1 space-y-1 border-l-2 border-orange-200/50 pl-3">
          {item.subItems!.map((sub) => (
            <div key={sub.id} className="group/sub flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-500 bg-white/60 rounded-md border border-slate-100">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-300 shrink-0" />

              {editingSubId === sub.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editSubValue}
                    onChange={(e) => setEditSubValue(e.target.value)}
                    className="h-6 text-[11px] flex-1 border-orange-200 py-0"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveSub(sub.id);
                      if (e.key === 'Escape') setEditingSubId(null);
                    }}
                  />
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-emerald-600" onClick={() => handleSaveSub(sub.id)}>
                    <Check size={12} />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="flex-1 truncate">{sub.label}</span>
                  <button
                    onClick={() => handleStartEditSub(sub)}
                    className="p-1 text-slate-400 hover:text-orange-500 transition-all"
                  >
                    <Edit2 size={10} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </Reorder.Item>
  );
}

function SidebarPermissionsGrid({
  disabledNavIds,
  onToggle
}: {
  disabledNavIds: string[];
  onToggle: (id: string, checked: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {ALL_FLAT_NAV_ITEMS.map((nav) => {
        const isHidden = disabledNavIds.includes(nav.id);
        return (
          <div
            key={nav.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border transition-all",
              isHidden ? "bg-slate-50 border-slate-200 opacity-60" : "bg-white border-orange-100 shadow-sm"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn("p-2 rounded-md", isHidden ? "bg-slate-200 text-slate-500" : "bg-orange-50 text-orange-600")}>
                <nav.icon size={16} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-slate-700 truncate">{nav.label}</span>
                <span className="text-[10px] text-slate-400 font-mono">{nav.id}</span>
              </div>
            </div>
            <Switch
              checked={!isHidden}
              onCheckedChange={(checked) => onToggle(nav.id, checked)}
            />
          </div>
        );
      })}
    </div>
  );
}

function TierConfigTab() {
  const { data: tiers, isLoading } = useGetTiers();
  const updateTierMutation = useUpdateTier();

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading tiers...</div>;

  const handleToggle = (tier: Tier, navId: string, checked: boolean) => {
    const currentDisabled = tier.configuration.disabledNavIds || [];
    const newDisabled = checked
      ? currentDisabled.filter(id => id !== navId)
      : [...currentDisabled, navId];

    updateTierMutation.mutate({
      id: tier.id,
      data: {
        configuration: {
          ...tier.configuration,
          disabledNavIds: newDisabled
        }
      }
    });
  };

  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="space-y-4">
        {tiers?.map((tier: Tier) => (
          <AccordionItem
            key={tier.id}
            value={tier.id}
            className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50/50 transition-all group">
              <div className="flex items-center justify-between w-full pr-4 text-left">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                      {tier.name}
                    </span>
                    <span className="text-xs text-slate-500 line-clamp-1">{tier.description}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200">
                  {tier.configuration.disabledNavIds?.length || 0} hidden
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2 border-t border-slate-100">
              <div className="pt-4">
                <SidebarPermissionsGrid
                  disabledNavIds={tier.configuration.disabledNavIds || []}
                  onToggle={(id, checked) => handleToggle(tier, id, checked)}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function BusinessConfigTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: businessRes, isLoading } = useGetAdminBusinesses({ search: searchTerm, limit: 10 });
  const updateBusinessMutation = useUpdateBusiness();

  const [selectedBusiness, setSelectedBusiness] = useState<AdminBusiness | null>(null);

  const handleToggle = (business: AdminBusiness, navId: string, checked: boolean) => {
    const currentDisabled = business.disabledNavIds || [];
    const newDisabled = checked
      ? currentDisabled.filter(id => id !== navId)
      : [...currentDisabled, navId];

    // Optimistically update local state for the modal
    if (selectedBusiness?.id === business.id) {
      setSelectedBusiness({ ...selectedBusiness, disabledNavIds: newDisabled });
    }

    updateBusinessMutation.mutate({
      id: business.id,
      data: {
        disabledNavIds: newDisabled
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder="Search businesses by name, email or owner..."
          className="pl-10 h-11 bg-white border-slate-200 focus-visible:ring-orange-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-slate-500">Searching businesses...</div>
        ) : businessRes?.data.map((business: AdminBusiness) => (
          <Card key={business.id} className="hover:border-orange-200 transition-colors group">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {business.logo ? (
                    <img src={business.logo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="text-slate-400 h-5 w-5" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-slate-900 truncate">{business.name}</span>
                  <span className="text-xs text-slate-500 truncate">{business.owner}</span>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 group-hover:border-orange-500 group-hover:text-orange-600 transition-all"
                    onClick={() => setSelectedBusiness(business)}
                  >
                    <Settings2 className="h-4 w-4" />
                    Configure
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-orange-500" />
                      Sidebar Config: {business.name}
                    </DialogTitle>
                    <DialogDescription>
                      Customize the navigation specifically for this business. This will override their tier's default settings.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex-1 overflow-y-auto p-1 py-4">
                    <SidebarPermissionsGrid
                      disabledNavIds={selectedBusiness?.id === business.id ? (selectedBusiness.disabledNavIds || []) : (business.disabledNavIds || [])}
                      onToggle={(navId, checked) => handleToggle(business, navId, checked)}
                    />
                  </div>

                  <DialogFooter className="bg-slate-50 -mx-6 -mb-6 p-4 border-t border-slate-100">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Badge variant="outline" className="bg-white">
                          {business.disabledNavIds?.length || 0} items disabled
                        </Badge>
                        <span>Last updated: {new Date().toLocaleDateString()}</span>
                      </div>
                      <DialogTrigger asChild>
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8">
                          Done
                        </Button>
                      </DialogTrigger>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function BusinessSidebarManager() {
  const [groups, setGroups] = useState<NavGroup[]>(initialData);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');

  const handleReorder = (groupId: string, newItems: NavItem[]) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, items: newItems } : g));
  };

  const handleUpdateItem = (itemId: string, newLabel: string) => {
    setGroups(groups.map(group => ({
      ...group,
      items: group.items.map(item =>
        item.id === itemId ? { ...item, label: newLabel } : item
      )
    })));
  };

  const handleUpdateSubItem = (itemId: string, subId: string, newLabel: string) => {
    setGroups(groups.map(group => ({
      ...group,
      items: group.items.map(item =>
        item.id === itemId ? {
          ...item,
          subItems: item.subItems?.map(sub =>
            sub.id === subId ? { ...sub, label: newLabel } : sub
          )
        } : item
      )
    })));
  };

  const startEditing = (group: NavGroup) => {
    setEditingGroupId(group.id);
    setEditTitleValue(group.title);
  };

  const saveTitle = (groupId: string) => {
    if (!editTitleValue.trim()) return;
    setGroups(groups.map(g =>
      g.id === groupId ? { ...g, title: editTitleValue.trim() } : g
    ));
    setEditingGroupId(null);
  };

  const cancelEditing = () => {
    setEditingGroupId(null);
    setEditTitleValue('');
  };

  const handleSaveAll = () => {
    toast.success("Sidebar configuration saved", {
      description: "Changes will be reflected on business dashboards shortly."
    });
  };

  const totalItems = groups.reduce((acc, g) => acc + g.items.length, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sidebar Configuration</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage the navigation structure and visibility across Tiers and Businesses.
          </p>
        </div>
      </div>

      <Tabs defaultValue="global" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-slate-100/50 backdrop-blur border border-slate-200 rounded-xl">
          <TabsTrigger value="global" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all">
            Global Layout
          </TabsTrigger>
          <TabsTrigger value="tiers" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all">
            Tier Permissions
          </TabsTrigger>
          <TabsTrigger value="businesses" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all">
            Business Overrides
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white/50 backdrop-blur-xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Navigation Structure</CardTitle>
                <CardDescription>
                  Drag items to reorder. Use the pencil icon to rename sections, items, or sub-menus.
                </CardDescription>
              </div>
              <Button onClick={handleSaveAll} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                <Save className="h-4 w-4 mr-2" />
                Save Layout
              </Button>
            </CardHeader>
            <CardContent className="pt-6 bg-slate-50/50">
              <div className="space-y-8">
                {groups.map((group) => (
                  <div key={group.id} className="bg-slate-100/50 rounded-xl p-4 md:p-6 border border-slate-200/50">
                    <div className="flex items-center justify-between mb-4">
                      {editingGroupId === group.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editTitleValue}
                            onChange={(e) => setEditTitleValue(e.target.value)}
                            className="h-8 text-sm font-bold w-48 border-orange-200 focus-visible:ring-orange-500"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveTitle(group.id);
                              if (e.key === 'Escape') cancelEditing();
                            }}
                          />
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600" onClick={() => saveTitle(group.id)}>
                            <Check size={16} />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400" onClick={cancelEditing}>
                            <X size={16} />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group/header">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{group.title}</h3>
                          <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-200">
                            {group.items.length}
                          </Badge>
                          <button onClick={() => startEditing(group)} className="text-slate-400 hover:text-orange-500 p-1">
                            <Edit2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    <Reorder.Group
                      axis="y"
                      values={group.items}
                      onReorder={(newItems) => handleReorder(group.id, newItems)}
                      className="space-y-0"
                    >
                      {group.items.map(item => (
                        <NavItemRow
                          key={item.id}
                          item={item}
                          onUpdateItem={handleUpdateItem}
                          onUpdateSubItem={handleUpdateSubItem}
                        />
                      ))}
                    </Reorder.Group>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers">
          <TierConfigTab />
        </TabsContent>

        <TabsContent value="businesses">
          <BusinessConfigTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
