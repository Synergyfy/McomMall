import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, LayoutList, Timer } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TierTypeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectStandard: () => void;
    onSelectTrial: () => void;
}

export function TierTypeModal({ open, onOpenChange, onSelectStandard, onSelectTrial }: TierTypeModalProps) {
    const router = useRouter();

    const handleSeasonal = () => {
        onOpenChange(false);
        router.push('/admin/tiers/seasons');
    };

    const handleStandard = () => {
        onSelectStandard();
    };

    const handleTrial = () => {
        onSelectTrial();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-center">Select Tier Type</DialogTitle>
                    <DialogDescription className="text-center text-slate-500">
                        Choose the type of subscription tier you want to create.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    <Button
                        variant="outline"
                        className="h-auto py-8 flex flex-col items-center gap-4 hover:border-orange-500 hover:bg-orange-50 transition-all group"
                        onClick={handleStandard}
                    >
                        <div className="p-3 rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors">
                            <LayoutList className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-lg">Standard</div>
                            <div className="text-xs text-slate-500 mt-1">Regular monthly/annual pricing</div>
                        </div>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-auto py-8 flex flex-col items-center gap-4 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                        onClick={handleSeasonal}
                    >
                        <div className="p-3 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                            <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-lg">Seasonal</div>
                            <div className="text-xs text-slate-500 mt-1">Time-bounded promotional pricing</div>
                        </div>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-auto py-8 flex flex-col items-center gap-4 hover:border-purple-500 hover:bg-purple-50 transition-all group"
                        onClick={handleTrial}
                    >
                        <div className="p-3 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors">
                            <Timer className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-lg">Trial</div>
                            <div className="text-xs text-slate-500 mt-1">Free trial with limited duration</div>
                        </div>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

