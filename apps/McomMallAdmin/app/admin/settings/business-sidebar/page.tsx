'use client';

import { useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { GripVertical, Save, Edit2, Check, X, LayoutDashboard, Store, Users, Settings as SettingsIcon, BarChart3, CreditCard, Tag, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Mock initial data
type NavItem = {
  id: string;
  label: string;
  icon: any;
};

type NavGroup = {
  id: string;
  title: string;
  items: NavItem[];
};

const initialData: NavGroup[] = [
  {
    id: 'group-main',
    title: 'Main',
    items: [
      { id: 'nav-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'nav-analytics', label: 'Analytics', icon: BarChart3 },
    ]
  },
  {
    id: 'group-business',
    title: 'Business',
    items: [
      { id: 'nav-store', label: 'Store Front', icon: Store },
      { id: 'nav-customers', label: 'Customers', icon: Users },
      { id: 'nav-billing', label: 'Billing', icon: CreditCard },
    ]
  },
  {
    id: 'group-config',
    title: 'Configuration',
    items: [
      { id: 'nav-promotions', label: 'Promotions', icon: Tag },
      { id: 'nav-reports', label: 'Reports', icon: FileText },
      { id: 'nav-settings', label: 'Settings', icon: SettingsIcon },
    ]
  }
];

function NavItemRow({ item }: { item: NavItem }) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      id={item.id}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-3 mb-2 shadow-sm select-none"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileDrag={{ 
        scale: 1.02, 
        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        cursor: "grabbing"
      }}
    >
      <div 
        className="cursor-grab hover:text-orange-500 transition-colors p-1"
        onPointerDown={(e) => controls.start(e)}
      >
        <GripVertical size={18} className="text-slate-400" />
      </div>
      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-slate-50 text-slate-600">
        <item.icon size={16} />
      </div>
      <span className="font-medium text-slate-700 text-sm">{item.label}</span>
    </Reorder.Item>
  );
}

export default function BusinessSidebarManager() {
  const [groups, setGroups] = useState<NavGroup[]>(initialData);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');

  const handleReorder = (groupId: string, newItems: NavItem[]) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, items: newItems } : g));
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sidebar Configuration</h1>
          <p className="text-slate-500 text-sm mt-1">Manage the navigation structure of the Business Dashboard.</p>
        </div>
        <Button onClick={handleSaveAll} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">
          <Save className="h-4 w-4 mr-2" />
          Save Layout
        </Button>
      </div>

      <Card className="border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-xl">
        <CardHeader className="pb-4 border-b border-slate-100">
          <CardTitle className="text-lg">Navigation Structure</CardTitle>
          <CardDescription>Drag and drop items to reorder them within their groups. Click the edit icon to rename sections.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 bg-slate-50/50 rounded-b-xl">
          
          <div className="space-y-8">
            {groups.map((group) => (
              <div key={group.id} className="bg-slate-100/50 rounded-xl p-4 md:p-6 border border-slate-200/50">
                
                {/* Group Header */}
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
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => saveTitle(group.id)}>
                        <Check size={16} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={cancelEditing}>
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group/header">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{group.title}</h3>
                      <button 
                        onClick={() => startEditing(group)}
                        className="opacity-0 group-hover/header:opacity-100 text-slate-400 hover:text-orange-500 transition-all p-1"
                      >
                        <Edit2 size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Reorderable List */}
                <Reorder.Group 
                  axis="y" 
                  values={group.items} 
                  onReorder={(newItems) => handleReorder(group.id, newItems)}
                  className="space-y-0"
                >
                  {group.items.map(item => (
                    <NavItemRow key={item.id} item={item} />
                  ))}
                </Reorder.Group>
                
              </div>
            ))}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
