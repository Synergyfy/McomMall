import { ShieldCheck } from 'lucide-react';

export default function SafetyCard() {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
      <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="font-semibold text-blue-900 text-sm">Safety First</h4>
        <p className="text-sm text-blue-700 mt-1 leading-relaxed">
          Never pay outside the platform. Use Help2Home's integrated system for secure dealings.
        </p>
      </div>
    </div>
  );
}
