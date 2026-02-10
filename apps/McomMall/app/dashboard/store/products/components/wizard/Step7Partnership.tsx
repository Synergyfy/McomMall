import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, Check, Store, Package, Handshake } from 'lucide-react';
import { useSearchPartnerItems } from '@/service/partnerships/hooks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Step7PartnershipProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step7Partnership({ formData, updateFormData, onNext, onBack }: Step7PartnershipProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: searchResults, isLoading } = useSearchPartnerItems(searchQuery);

  const selectedItem = formData.plusItem;

  const handleSelect = (item: any) => {
    updateFormData({ plusItem: item });
    setDialogOpen(false);
  };

  const handleRemove = () => {
    updateFormData({ plusItem: null });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Add a "Plus" Integration</h2>
        <p className="text-slate-500 max-w-lg mx-auto">
          Partner with other businesses to offer a bundled service or product. Increase your reach and value.
        </p>
      </div>

      <Card className="max-w-3xl mx-auto border-dashed border-2 border-slate-200 shadow-none bg-slate-50/50">
        <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
            {!selectedItem ? (
                <>
                    <div className="h-20 w-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-2">
                        <Handshake className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-slate-800">No Plus Item Selected</h3>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto">
                            You can link a complementary product or service from another business.
                        </p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg" className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 shadow-lg shadow-slate-900/20">
                                <Search className="w-4 h-4 mr-2" />
                                Search for Partners
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-3xl">
                            <div className="p-6 pb-2 border-b border-slate-100">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black text-slate-900">Find a Plus Item</DialogTitle>
                                    <DialogDescription className="font-medium text-slate-500">
                                        Search for products or services to bundle with yours.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="relative mt-6">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input 
                                        className="pl-12 h-14 text-lg rounded-2xl border-slate-200 bg-slate-50 focus:bg-white transition-all shadow-inner" 
                                        placeholder="Search by name, category, or business..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center h-40 space-y-4">
                                        <div className="h-8 w-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
                                        <p className="text-sm font-bold text-slate-400">Searching...</p>
                                    </div>
                                ) : searchQuery.length < 2 ? (
                                    <div className="flex flex-col items-center justify-center h-40 text-slate-400 space-y-2">
                                        <Search className="h-10 w-10 opacity-20" />
                                        <p className="font-medium text-sm">Type at least 2 characters to search</p>
                                    </div>
                                ) : searchResults?.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-40 text-slate-400 space-y-2">
                                        <Package className="h-10 w-10 opacity-20" />
                                        <p className="font-medium text-sm">No items found matching "{searchQuery}"</p>
                                    </div>
                                ) : (
                                    searchResults?.map((item: any) => (
                                        <div key={`${item.type}-${item.id}`} className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all cursor-pointer" onClick={() => handleSelect(item)}>
                                            <div className="h-16 w-16 rounded-xl bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-slate-400">
                                                        {item.type === 'product' ? <Package className="h-6 w-6" /> : <Store className="h-6 w-6" />}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 uppercase tracking-wider font-bold border-0", item.type === 'product' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700')}>
                                                        {item.type}
                                                    </Badge>
                                                    {item.isPartner && (
                                                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-green-100 text-green-700 font-bold border-0 flex items-center gap-1">
                                                            <Handshake className="h-2 w-2" /> Partner
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h4 className="font-bold text-slate-900 truncate">{item.title}</h4>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <Avatar className="h-4 w-4">
                                                        <AvatarImage src={item.owner.profilePicture} />
                                                        <AvatarFallback className="text-[8px]">{item.owner.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <p className="text-xs text-slate-500 font-medium truncate">Owned by {item.owner.name}</p>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="ghost" className="text-orange-600 font-bold bg-orange-100 hover:bg-orange-200 rounded-lg h-9 w-9 p-0 group-hover:scale-110 transition-transform">
                                                <Plus className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </>
            ) : (
                <div className="w-full">
                    <div className="flex items-center justify-between w-full p-4 bg-white rounded-2xl border border-orange-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2">
                             <Badge className="bg-orange-500 text-white border-0 font-bold text-[10px]">SELECTED</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                                {selectedItem.image ? (
                                    <img src={selectedItem.image} alt={selectedItem.title} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-slate-400">
                                        <Package className="h-8 w-8" />
                                    </div>
                                )}
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-lg text-slate-900">{selectedItem.title}</h4>
                                <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                                    Owned by {selectedItem.owner.name}
                                    {selectedItem.isPartner ? (
                                        <span className="text-green-600 flex items-center gap-1 text-xs bg-green-50 px-1.5 py-0.5 rounded-md">
                                            <Check className="h-3 w-3" /> Partner
                                        </span>
                                    ) : (
                                        <span className="text-amber-600 flex items-center gap-1 text-xs bg-amber-50 px-1.5 py-0.5 rounded-md">
                                            Requesting Partnership
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" onClick={handleRemove} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 font-bold">
                            Remove
                        </Button>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>

      <div className="flex justify-between pt-8 border-t border-slate-100">
        <Button variant="ghost" onClick={onBack} className="font-bold text-slate-500 hover:text-slate-800">
          Back
        </Button>
        <Button onClick={onNext} className="bg-slate-900 text-white font-bold rounded-xl px-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
          Continue
        </Button>
      </div>
    </div>
  );
}
