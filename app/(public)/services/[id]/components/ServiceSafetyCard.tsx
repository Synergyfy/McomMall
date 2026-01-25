import { ShieldCheck } from 'lucide-react';

export default function ServiceSafetyCard() {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
      <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="font-semibold text-blue-900 text-sm">Service Guarantee</h4>
        <p className="text-sm text-blue-700 mt-1 leading-relaxed">
          Book with confidence. All services are vetted and payments are held securely until completion.
        </p>
      </div>
    </div>
  );
}
