'use client';

import { FC, useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Award, 
  CircleDot, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  PhoneCall, 
  FileText,
  UserCheck,
  Building
} from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import api from '@/service/api';

interface StatusScreenProps {
  onNavigate: (screen: string) => void;
  businessName: string;
  mallData: any;
}

export const StatusScreen: FC<StatusScreenProps> = ({
  onNavigate,
  businessName,
  mallData,
}) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('businesses/my-profile');
        if (res.data) {
          setProfile(res.data);
        }
      } catch (err) {
        console.error('Error fetching business profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const business = mallData?.businesses?.find((b: any) => b.businessName === businessName) || profile;
  const isVerified = business?.isVerified ?? false;
  const isClaimed = business?.isClaimed ?? false;

  const milestones = [
    { title: 'Listing Created', desc: 'Added store address, description, and categories.', completed: true },
    { title: 'Geographic Check', desc: 'Assigned postcodes mapped to Borough boundary.', completed: !!mallData?.borough },
    { title: 'Business Claimed', desc: 'Confirmed business ownership credentials.', completed: isClaimed || isVerified },
    { title: 'ID Verification', desc: 'Identity documents reviewed by the MCOM team.', completed: isVerified },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Profile Card */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center font-black text-xl shadow-md border border-white shrink-0">
              {businessName.charAt(0)}
            </div>
            <div>
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Listing Profile</p>
              <h2 className="text-lg font-black text-gray-900 leading-tight">{businessName}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{mallData?.borough || 'Local'} Borough Mall</p>
            </div>
          </div>
          <div className="self-start sm:self-auto">
            <StatusBadge isVerified={isVerified} isClaimed={isClaimed} size="md" />
          </div>
        </div>
      </div>

      {/* Verification Milestones */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-orange-500" /> Verification Milestones
        </h3>

        <div className="relative border-l-2 border-gray-100 ml-3 pl-6 flex flex-col gap-6">
          {milestones.map((milestone, idx) => (
            <div key={idx} className="relative">
              {/* Timeline Marker */}
              <span className={`absolute -left-[35px] top-0 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                milestone.completed 
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-600' 
                  : 'bg-white border-gray-200 text-gray-300'
              }`}>
                {milestone.completed ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
              </span>
              
              <div>
                <p className={`text-xs font-bold ${milestone.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                  {milestone.title}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {milestone.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action panel */}
      {!isVerified && (
        <div className="bg-orange-50/50 rounded-3xl p-5 border border-orange-100 shadow-sm flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-orange-800">Unverified Account Status</p>
              <p className="text-[10px] text-orange-700/80 mt-0.5 leading-relaxed">
                Verify your identity documents and confirm ownership to unlock all local collaborations, B2B networks, and live webinars.
              </p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('support')}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95 duration-150"
          >
            Submit ID Verification Documents <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Assigned Account Manager */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-black text-gray-900 mb-4">Dedicated Support Manager</h3>
        <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 font-black text-sm">
              AM
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Mcom Support Manager</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Assigned to {mallData?.borough || 'Local'} District</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('support')}
            className="p-2 rounded-full hover:bg-gray-200 text-orange-600 transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
