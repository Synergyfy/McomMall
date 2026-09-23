'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // eslint-disable-next-line no-console
        console.error('Admin segment error:', error);
    }, [error]);

    return (
        <div className="p-8">
            <Card className="border-rose-200 bg-rose-50 max-w-2xl mx-auto">
                <CardContent className="p-8 text-center space-y-4">
                    <AlertTriangle className="h-10 w-10 mx-auto text-rose-500" />
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
                        <p className="text-sm text-slate-600 mt-1">
                            {error.message || 'The admin section failed to load. Please try again.'}
                        </p>
                    </div>
                    <div className="flex justify-center gap-2">
                        <Button onClick={reset}>Try again</Button>
                        <Button variant="outline" onClick={() => (window.location.href = '/admin')}>
                            Back to dashboard
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
