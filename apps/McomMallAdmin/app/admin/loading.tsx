import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
    return (
        <div className="p-8 space-y-6" aria-busy="true" aria-live="polite">
            <div className="space-y-2">
                <div className="h-8 w-64 rounded-lg bg-slate-200 animate-pulse" />
                <div className="h-4 w-96 max-w-full rounded bg-slate-100 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
                ))}
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-6">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading live data from the API…
                </div>
                <div className="mt-4 space-y-3">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-12 rounded-xl bg-slate-50 animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    );
}
