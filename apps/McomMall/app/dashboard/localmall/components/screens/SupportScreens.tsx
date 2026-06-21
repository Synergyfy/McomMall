'use client';

import { FC, useState, useEffect } from 'react';
import { 
  Award, 
  MapPin, 
  Check, 
  ChevronRight, 
  HelpCircle, 
  Mail, 
  PhoneCall, 
  FileText,
  Loader2,
  CheckCircle
} from 'lucide-react';
import api from '@/service/api';

// ─── HUB PARTICIPATION SCREEN ────────────────────────────────────────────────
interface HubParticipationScreenProps {
  onNavigate: (screen: string) => void;
  mallData: any;
}

export const HubParticipationScreen: FC<HubParticipationScreenProps> = ({
  onNavigate,
  mallData,
}) => {
  const points = mallData?.pointsBalance ?? 2400;

  const tiers = [
    { title: 'Bronze Member', minPoints: 0, benefits: ['Standard listing display', 'Basic analytics'], active: points >= 0 && points < 2500 },
    { title: 'Silver Tier', minPoints: 2500, benefits: ['Featured listing rotator access', 'Joint points campaigns'], active: points >= 2500 && points < 5000 },
    { title: 'Gold Champion', minPoints: 5000, benefits: ['Priority search sorting', 'Assigned manager direct helpline'], active: points >= 5000 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Hub Participation</h2>
        <p className="text-xs text-gray-400 mt-1">Unlock premium high street perks and rewards by building your ecosystem points.</p>
      </div>

      {/* Points balance */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
        <p className="text-[10px] font-bold text-white/75 uppercase tracking-wider">Ecosystem Points Balance</p>
        <p className="text-3xl font-black mt-1 tabular-nums">{points.toLocaleString()} pts</p>
      </div>

      {/* Tiers List */}
      <div className="flex flex-col gap-3">
        {tiers.map((t, idx) => (
          <div 
            key={idx}
            className={`p-5 rounded-3xl border shadow-sm flex flex-col gap-3 transition-colors ${
              t.active 
                ? 'bg-orange-50/20 border-orange-200' 
                : 'bg-white border-gray-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-gray-900 flex items-center gap-2">
                <Award className={`w-4.5 h-4.5 ${t.active ? 'text-orange-500' : 'text-gray-300'}`} /> {t.title}
              </h4>
              {t.active && (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 font-bold text-[9px] uppercase tracking-wider rounded-full">
                  Active Tier
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-400 font-semibold">Requirement: {t.minPoints.toLocaleString()} points</p>
            <div className="flex flex-col gap-1.5 border-t border-gray-50 pt-2">
              {t.benefits.map((b, bIdx) => (
                <div key={bIdx} className="flex items-center gap-2 text-[10px] text-gray-600 font-bold">
                  <CheckCircle className={`w-3.5 h-3.5 ${t.active ? 'text-emerald-500' : 'text-gray-300'}`} /> {b}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── ACCOUNT MANAGER SUPPORT SCREEN ──────────────────────────────────────────
interface AccountManagerSupportScreenProps {
  onNavigate: (screen: string) => void;
  boroughName: string;
}

export const AccountManagerSupportScreen: FC<AccountManagerSupportScreenProps> = ({
  onNavigate,
  boroughName,
}) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);

  const fetchTickets = async () => {
    try {
      const res = await api.get('support-tickets');
      setTickets(res.data || []);
    } catch (err) {
      console.error('Error fetching support tickets:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await api.post('support-tickets', {
        subject: subject.trim(),
        description: description.trim(),
        priority: 'medium',
      });
      setSuccess(true);
      setSubject('');
      setDescription('');
      fetchTickets();
    } catch (err) {
      console.error('Error submitting support ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Manager Direct Card */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Ecosystem Helpline</h2>
          <p className="text-xs text-gray-400 mt-1">Connect with your dedicated {boroughName} Support Manager.</p>
        </div>

        <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-650 flex items-center justify-center font-black text-sm shrink-0 border border-orange-200">
              AM
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">District Account Manager</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Assigned to Greenwich zone</p>
            </div>
          </div>
          <div className="flex gap-2">
            <a href="tel:+442079460958" className="p-2.5 bg-white border border-gray-150 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors active:scale-90">
              <PhoneCall className="w-4 h-4" />
            </a>
            <a href="mailto:support@mcommall.com" className="p-2.5 bg-white border border-gray-150 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors active:scale-90">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Support ticket submission form */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Submit Support Ticket</h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input 
            type="text"
            placeholder="Issue Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-3.5 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800"
            required
          />
          <textarea 
            placeholder="Describe the issue or verification assistance request..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="px-3.5 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800 h-24 resize-none"
            required
          />
          <button 
            type="submit"
            disabled={loading || success}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Support Ticket'}
          </button>
        </form>

        {success && (
          <p className="text-[11px] font-bold text-emerald-600 mt-2 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Support ticket submitted successfully!
          </p>
        )}
      </div>

      {/* History */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Ticket History</h3>
        {tickets.length > 0 ? (
          <div className="flex flex-col gap-3">
            {tickets.map((t) => (
              <div key={t.id} className="p-3 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-gray-900">{t.subject}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 font-bold text-[9px] uppercase tracking-wider rounded-full">
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 py-2">No past support requests or tickets submitted.</p>
        )}
      </div>
    </div>
  );
};
