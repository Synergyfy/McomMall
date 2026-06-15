import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { 
    Check, 
    ChevronRight, 
    ChevronLeft, 
    Building2, 
    Users, 
    MapPin, 
    Globe, 
    ShieldCheck,
    Info,
    LayoutDashboard,
    Heart,
    Store,
    Activity,
    CheckCircle2,
    Layers,
    Rocket
} from 'lucide-react';

interface WizardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const steps = [
    { id: 1, title: 'Basic Details', icon: Info },
    { id: 2, title: 'Hub Setup', icon: Building2 },
    { id: 3, title: 'Community', icon: Users },
    { id: 4, title: 'Management', icon: ShieldCheck },
    { id: 5, title: 'Review', icon: LayoutDashboard },
];

const FieldLabel = ({ children, tooltip }: { children: React.ReactNode, tooltip: string }) => (
    <div className="flex items-center gap-2">
        <Label className="flex items-center gap-1.5">
            {children}
        </Label>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[200px]">
                    <p>{tooltip}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
);

export function HighStreetActivationWizard({ open, onOpenChange }: WizardProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        borough: '',
        region: '',
        categories: '',
        description: '',
        hubType: 'both',
        hubAddress: '',
        hubManager: '',
        contact: '',
        hours: '',
        communityName: '',
        communityDescription: '',
        goals: '',
        boroughManager: 'James Wilson',
        moderators: ['Sarah Chen', 'Mike Ross'],
        campaignManagers: ['David G. (Lead)'],
        communityLeaders: ['Local influencers & business owners'],
    });

    const nextStep = () => setCurrentStep((s) => Math.min(s + 1, steps.length));
    const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

    const handleManagementAction = (type: string) => {
        // In production, these would open specific selection modals or API calls
        console.log(`Triggering ${type} action`);
        // Simulating some UI feedback
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <FieldLabel tooltip="The official name of the high street area being activated.">
                                High Street Name
                            </FieldLabel>
                            <Input 
                                id="name" 
                                placeholder="e.g. Oxford Street" 
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <FieldLabel tooltip="The administrative borough where this high street is located.">
                                    Borough
                                </FieldLabel>
                                <Select onValueChange={(v) => setFormData({ ...formData, borough: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select borough" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="westminster">Westminster</SelectItem>
                                        <SelectItem value="camden">Camden</SelectItem>
                                        <SelectItem value="tower-hamlets">Tower Hamlets</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <FieldLabel tooltip="Specific neighborhood or commercial zone within the borough.">
                                    Region
                                </FieldLabel>
                                <Input 
                                    id="region" 
                                    placeholder="e.g. West End" 
                                    value={formData.region}
                                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <FieldLabel tooltip="Primary business sectors represented on this high street (e.g., Fashion, Dining).">
                                Categories
                            </FieldLabel>
                            <Input 
                                id="categories" 
                                placeholder="e.g. Retail, Fashion, Dining" 
                                value={formData.categories}
                                onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <FieldLabel tooltip="A detailed overview of the high street's character and strategic goals.">
                                Description
                            </FieldLabel>
                            <Textarea 
                                id="description" 
                                placeholder="Describe the high street ecosystem..." 
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4 py-4">
                        <div className="grid gap-4">
                            <FieldLabel tooltip="Choose between a digital-only presence, a physical storefront hub, or a hybrid model.">
                                Hub Options
                            </FieldLabel>
                            <div className="grid grid-cols-3 gap-4">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div 
                                                onClick={() => setFormData({ ...formData, hubType: 'virtual' })}
                                                className={cn(
                                                    "border rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-orange-500 transition-all",
                                                    formData.hubType === 'virtual' ? "bg-orange-50 border-orange-500 ring-1 ring-orange-500" : "bg-white border-slate-200"
                                                )}
                                            >
                                                <Globe className={cn("h-6 w-6", formData.hubType === 'virtual' ? "text-orange-600" : "text-slate-400")} />
                                                <span className={cn("text-xs font-semibold", formData.hubType === 'virtual' ? "text-orange-900" : "text-slate-600")}>Virtual Hub</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Digital-only presence for the high street ecosystem.</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div 
                                                onClick={() => setFormData({ ...formData, hubType: 'physical' })}
                                                className={cn(
                                                    "border rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-orange-500 transition-all",
                                                    formData.hubType === 'physical' ? "bg-orange-50 border-orange-500 ring-1 ring-orange-500" : "bg-white border-slate-200"
                                                )}
                                            >
                                                <Building2 className={cn("h-6 w-6", formData.hubType === 'physical' ? "text-orange-600" : "text-slate-400")} />
                                                <span className={cn("text-xs font-semibold", formData.hubType === 'physical' ? "text-orange-900" : "text-slate-600")}>Physical Hub</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>A brick-and-mortar storefront or office location.</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div 
                                                onClick={() => setFormData({ ...formData, hubType: 'both' })}
                                                className={cn(
                                                    "border rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-orange-500 transition-all",
                                                    formData.hubType === 'both' ? "bg-orange-50 border-orange-500 ring-1 ring-orange-500" : "bg-white border-slate-200"
                                                )}
                                            >
                                                <Layers className={cn("h-6 w-6", formData.hubType === 'both' ? "text-orange-600" : "text-slate-400")} />
                                                <span className={cn("text-xs font-semibold", formData.hubType === 'both' ? "text-orange-900" : "text-slate-600")}>Both</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>A hybrid model combining digital and physical presence.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <FieldLabel tooltip="The physical street address of the Mcom Hub office or storefront.">
                                Hub Address
                            </FieldLabel>
                            <Input 
                                id="hubAddress" 
                                placeholder="Physical location if applicable" 
                                value={formData.hubAddress}
                                onChange={(e) => setFormData({ ...formData, hubAddress: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <FieldLabel tooltip="The lead official responsible for daily hub operations and business support.">
                                    Hub Manager
                                </FieldLabel>
                                <Input 
                                    id="hubManager" 
                                    placeholder="Assign manager" 
                                    value={formData.hubManager}
                                    onChange={(e) => setFormData({ ...formData, hubManager: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <FieldLabel tooltip="Primary email or phone number for hub-related inquiries.">
                                    Contact Details
                                </FieldLabel>
                                <Input 
                                    id="contact" 
                                    placeholder="Email or Phone" 
                                    value={formData.contact}
                                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <FieldLabel tooltip="When the physical hub is open to the public and businesses.">
                                Operational Hours
                            </FieldLabel>
                            <Input 
                                id="hours" 
                                placeholder="e.g. 09:00 - 18:00" 
                                value={formData.hours}
                                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                            />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <FieldLabel tooltip="The public name for the community group associated with this high street.">
                                Community Group Name
                            </FieldLabel>
                            <Input 
                                id="commName" 
                                placeholder="e.g. Oxford Street Traders" 
                                value={formData.communityName}
                                onChange={(e) => setFormData({ ...formData, communityName: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <FieldLabel tooltip="The purpose and mission statement for this local business community.">
                                Community Description
                            </FieldLabel>
                            <Textarea 
                                id="commDesc" 
                                placeholder="Community vision..." 
                                value={formData.communityDescription}
                                onChange={(e) => setFormData({ ...formData, communityDescription: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <FieldLabel tooltip="Key performance indicators (KPIs) for community growth and participation.">
                                Engagement Goals
                            </FieldLabel>
                            <Input 
                                id="goals" 
                                placeholder="e.g. 20% increase in local footfall" 
                                value={formData.goals}
                                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox id="visibility" />
                            <div className="flex items-center gap-2">
                                <label htmlFor="visibility" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Make group visible to all customers in borough
                                </label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p>If checked, all users in the borough will see this community in their feed.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-4 py-4">
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="h-5 w-5 text-orange-600" />
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-sm font-semibold">Borough Manager</p>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="h-3 w-3 text-slate-400 cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right">
                                                        <p>Highest level of authority for this borough.</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <p className="text-xs text-slate-500">{formData.boroughManager}</p>
                                    </div>
                                </div>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="sm" onClick={() => handleManagementAction('change-manager')}>Change</Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Select a different Borough Manager from the registry.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-sm font-semibold">Moderators</p>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="h-3 w-3 text-slate-400 cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right">
                                                        <p>Users responsible for managing community content and discussions.</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <p className="text-xs text-slate-500">{formData.moderators.join(', ')}</p>
                                    </div>
                                </div>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="sm" onClick={() => handleManagementAction('add-moderator')}>Add</Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Add additional moderators to the community group.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Activity className="h-5 w-5 text-emerald-600" />
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-sm font-semibold">Campaign Managers</p>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="h-3 w-3 text-slate-400 cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right">
                                                        <p>Design and execute marketing campaigns for this high street.</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <p className="text-xs text-slate-500">{formData.campaignManagers.join(', ')}</p>
                                    </div>
                                </div>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="sm" onClick={() => handleManagementAction('assign-campaign-manager')}>Assign</Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Assign specialized marketing personnel to this ecosystem.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Heart className="h-5 w-5 text-pink-600" />
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-sm font-semibold">Community Leaders</p>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="h-3 w-3 text-slate-400 cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right">
                                                        <p>Local business owners who advocate for the high street.</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <p className="text-xs text-slate-500">{formData.communityLeaders.join(', ')}</p>
                                    </div>
                                </div>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="sm" onClick={() => handleManagementAction('invite-leader')}>Invite</Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Send invites to influential local business owners.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto pr-2">
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                Summary Preview
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between border-b border-slate-200 pb-2">
                                    <span className="text-slate-500">High Street</span>
                                    <span className="font-semibold text-slate-900">Oxford Street</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200 pb-2">
                                    <span className="text-slate-500">Hub Setup</span>
                                    <span className="font-semibold text-slate-900">Virtual & Physical</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-orange-50/50 rounded-lg p-4 border border-orange-100">
                            <h4 className="text-sm font-bold text-orange-900 mb-3 flex items-center gap-2">
                                <Globe className="h-4 w-4 text-orange-600" />
                                Ecosystem Preview
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-[10px] uppercase font-bold text-orange-700/70">
                                <div className="bg-white p-2 rounded border border-orange-100 flex flex-col items-center gap-1">
                                    <Store className="h-4 w-4" />
                                    <span>Marketplace List</span>
                                </div>
                                <div className="bg-white p-2 rounded border border-orange-100 flex flex-col items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    <span>Comm. Group</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <h4 className="text-sm font-bold text-slate-900 mb-3">Activation Coverage</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Businesses Affected</span>
                                    <Badge variant="secondary">142 Shops</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Radius Coverage</span>
                                    <span className="font-semibold text-slate-900">0.5 miles</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
                            <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                            <p className="text-xs text-blue-700 leading-relaxed">
                                Activating this high street will notify all assigned managers and create the associated community groups immediately.
                            </p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-orange-600 mb-1">
                        <MapPin className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Ecosystem Activation</span>
                    </div>
                    <DialogTitle className="text-xl font-bold">High Street Activation Flow</DialogTitle>
                    <DialogDescription>
                        Complete the steps below to activate a new physical or virtual high street ecosystem.
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Tracker */}
                <div className="flex items-center justify-between px-2 py-4">
                    {steps.map((step, i) => (
                        <div key={step.id} className="flex items-center flex-1 last:flex-none">
                            <div className={cn(
                                "flex flex-col items-center gap-2 relative z-10",
                                currentStep >= step.id ? "text-orange-600" : "text-slate-400"
                            )}>
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                                    currentStep === step.id ? "border-orange-600 bg-orange-50" : 
                                    currentStep > step.id ? "border-orange-600 bg-orange-600 text-white" : "border-slate-200 bg-white"
                                )}>
                                    {currentStep > step.id ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <step.icon className="h-4 w-4" />
                                    )}
                                </div>
                                <span className="text-[10px] font-bold uppercase whitespace-nowrap">{step.title}</span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={cn(
                                    "flex-1 h-0.5 mx-2 -mt-4 transition-all duration-200",
                                    currentStep > step.id ? "bg-orange-600" : "bg-slate-200"
                                )} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="min-h-[300px]">
                    {renderStepContent()}
                </div>

                <DialogFooter className="border-t pt-4">
                    <div className="flex items-center justify-between w-full">
                        <Button
                            variant="ghost"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="gap-2"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Save Draft
                            </Button>
                            {currentStep === steps.length ? (
                                <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2 px-6">
                                    <Rocket className="h-4 w-4" />
                                    Activate High Street
                                </Button>
                            ) : (
                                <Button 
                                    onClick={nextStep}
                                    className="bg-slate-900 hover:bg-slate-800 text-white gap-2 px-6"
                                >
                                    Next Step
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
