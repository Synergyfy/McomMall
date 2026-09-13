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
  CheckCircle,
  ShieldCheck,
  ShieldAlert,
  Upload,
  Clock,
  XCircle,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import api from '@/service/api';
import { uploadFile } from '@/lib/upload';

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

// ─── ID VERIFICATION SCREEN ──────────────────────────────────────────────────
interface IdVerificationScreenProps {
  onNavigate: (screen: string) => void;
  businessName: string;
}

interface VerifyDoc {
  type: string;
  name: string;
  status: 'none' | 'pending' | 'approved' | 'rejected';
  url?: string;
  submittedAt?: string;
}

export const IdVerificationScreen: FC<IdVerificationScreenProps> = ({
  onNavigate,
  businessName,
}) => {
  const [docs, setDocs] = useState<VerifyDoc[]>([
    { type: 'proof_id', name: 'Director Identification (ID / Passport)', status: 'none' },
    { type: 'company_reg', name: 'Company Registration Certificate', status: 'none' },
    { type: 'proof_address', name: 'Proof of Business Address', status: 'none' },
  ]);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const storageKey = 'localmall_id_verification_docs';

  useEffect(() => {
    const savedDocs = localStorage.getItem(storageKey);
    if (savedDocs) {
      try {
        setDocs(JSON.parse(savedDocs));
      } catch (e) {
        console.error('Failed to parse ID verification documents storage', e);
      }
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get('businesses/my-profile');
        if (res.data) {
          setProfile(res.data);
        }
      } catch (err) {
        console.error('Error fetching business profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const isVerified = profile?.isVerified ?? false;
  const allUploaded = docs.every((d) => d.status !== 'none');
  const hasPending = docs.some((d) => d.status === 'pending');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingType(type);
    try {
      const res = await uploadFile(file);

      const updatedDocs = docs.map((doc) => {
        if (doc.type === type) {
          return {
            ...doc,
            status: 'pending' as const,
            url: res.secure_url,
            submittedAt: new Date().toLocaleDateString('en-GB'),
          };
        }
        return doc;
      });

      setDocs(updatedDocs);
      localStorage.setItem(storageKey, JSON.stringify(updatedDocs));
    } catch (err) {
      console.error('Error uploading ID verification document:', err);
    } finally {
      setUploadingType(null);
    }
  };

  const handleSubmitForReview = async () => {
    setSubmitting(true);
    try {
      await api.post('support-tickets', {
        subject: 'ID Verification Document Submission',
        description: `${businessName} submitted identity verification documents for manual review by the MCOM team.`,
        priority: 'high',
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting ID verification for review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusDisplay = (status: VerifyDoc['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="text-emerald-600 font-bold text-xs flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'pending':
        return (
          <span className="text-amber-600 font-bold text-xs flex items-center gap-1.5 bg-amber-50/70 border border-amber-100 px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 animate-pulse" /> Under Review
          </span>
        );
      case 'rejected':
        return (
          <span className="text-red-600 font-bold text-xs flex items-center gap-1.5 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return (
          <span className="text-gray-400 font-bold text-xs flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
            <AlertCircle className="w-3.5 h-3.5" /> Not Uploaded
          </span>
        );
    }
  };

  if (isVerified) {
    return (
      <div className="flex flex-col gap-6">
        <div className="bg-emerald-50/60 rounded-3xl p-5 border border-emerald-200 shadow-sm flex gap-3 items-start">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900">Identity Verified</h2>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Your identity documents have been reviewed and approved by the MCOM team. Your verified badge is active across the Local Mall.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('status')}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95 duration-150"
        >
          Back to Status <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight">ID Verification</h2>
        <p className="text-xs text-gray-400 mt-1">Upload official identity documents. Review normally takes 2–3 business days.</p>
      </div>

      {/* Info banner */}
      <div className="bg-orange-50/50 rounded-3xl p-5 border border-orange-100 shadow-sm flex gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-orange-800">Identity documents reviewed by the MCOM team</p>
          <p className="text-[10px] text-orange-700/80 mt-0.5 leading-relaxed">
            Complete all three required documents below, then submit for manual review. Verification unlocks collaborations, B2B networks, and live webinars.
          </p>
        </div>
      </div>

      {/* Document uploads */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-orange-500" /> Required Documents
        </h3>

        {docs.map((doc) => (
          <div
            key={doc.type}
            className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white border border-gray-150 text-gray-400 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{doc.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                  {doc.submittedAt ? `Submitted on ${doc.submittedAt}` : 'PDF or image accepted'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 shrink-0">
              {getStatusDisplay(doc.status)}
              {doc.status === 'none' && (
                <div className="relative">
                  {uploadingType === doc.type ? (
                    <span className="px-3 py-1.5 bg-white border border-gray-150 rounded-xl text-[10px] font-bold text-gray-500 flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 bg-white border border-gray-150 hover:bg-gray-100 rounded-xl text-[10px] font-bold text-gray-700 flex items-center gap-1.5 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" /> Upload
                      <input
                        type="file"
                        accept=".pdf, image/*"
                        onChange={(e) => handleUpload(e, doc.type)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submit actions */}
      <div className="flex flex-col gap-2.5">
        <button
          onClick={handleSubmitForReview}
          disabled={!allUploaded || submitting || hasPending}
          className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 duration-150 ${
            allUploaded && !submitting && !hasPending
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : hasPending ? 'Documents Under Review' : allUploaded ? 'Submit for Review' : `Upload ${docs.filter((d) => d.status === 'none').length} remaining`}
          {!submitting && !hasPending && allUploaded && <ChevronRight className="w-4 h-4" />}
        </button>

        {submitted && (
          <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Verification documents submitted for review!
          </p>
        )}
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
