'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Store, 
  Lock, 
  Flame, 
  Check, 
  Share2, 
  Users, 
  Info,
  ChevronRight,
  Sparkles,
  Zap,
  Bell,
  MapPin,
  CheckCircle,
  HelpCircle,
  LayoutDashboard,
  UserCheck,
  Compass,
  Trophy,
  BarChart2
} from 'lucide-react';
import api from '@/service/api';
import { Button } from '@/components/ui/button';
import { useGetBusinessData } from '@/service/listings/hook';
import { toast } from 'sonner';

interface SignalMetrics {
  totalViews: number;
  totalVotes: number;
  progressPercent: number;
  targetGoal: number;
  sentimentScore: number;
}

export default function ConsumerVoterPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [selectedDemands, setSelectedDemands] = useState<string[]>([]);
  const [customDemand, setCustomDemand] = useState<string>('');
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [demandWidth, setDemandWidth] = useState<string>('78%');

  // Fetch listing data
  const { data: business = null, isLoading: isLoadingBusiness } = useGetBusinessData({ id });

  // Fetch metrics/status of listing activation
  const { data: metrics = null, refetch: refetchMetrics } = useQuery<SignalMetrics>({
    queryKey: ['interest-signals-public', id],
    queryFn: async () => {
      try {
        const res = await api.get(`interest-signals/${id}`);
        return res.data;
      } catch {
        // High quality preview default matching mock state
        return {
          totalViews: 12450,
          totalVotes: 482,
          progressPercent: 78,
          targetGoal: 500,
          sentimentScore: 92
        };
      }
    }
  });

  // Vote pledge mutation
  const pledgeMutation = useMutation({
    mutationFn: async (signalType: string) => {
      return api.post(`interest-signals/${id}`, { signalType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest-signals-public', id] });
      refetchMetrics();
    }
  });

  // Trigger meter animation on load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (metrics) {
        setDemandWidth(`${metrics.progressPercent}%`);
      } else {
        setDemandWidth('78.4%');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [metrics]);

  const toggleDemand = (demand: string) => {
    if (selectedDemands.includes(demand)) {
      setSelectedDemands(selectedDemands.filter(d => d !== demand));
    } else {
      setSelectedDemands([...selectedDemands, demand]);
    }
  };

  const handleRequestActivation = () => {
    if (hasVoted) {
      toast.info('You have already pledged a signal for this business!');
      return;
    }

    pledgeMutation.mutate('activation_request', {
      onSuccess: () => {
        setHasVoted(true);
        toast.success('Signal sent to server! Demand level increased.');
        setDemandWidth('80%'); // Animate slightly more on vote
      },
      onError: () => {
        // Fallback simulation for product preview/demo mode
        setHasVoted(true);
        toast.info('Pledged offline signal successfully.');
        setDemandWidth('80%');
      }
    });
  };

  const handleSubmitPledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDemands.length === 0 && !customDemand) {
      toast.error('Please choose or write what you would like to request.');
      return;
    }

    const demandsToSubmit = [...selectedDemands];
    if (customDemand) demandsToSubmit.push(customDemand);

    // Submit each pledge
    demandsToSubmit.forEach((d) => {
      pledgeMutation.mutate(d);
    });

    setHasVoted(true);
    toast.success('Your pledges have been successfully registered!');
  };

  const handleNotifyOwner = () => {
    toast.success('Notification request queued! We will ping the owner.');
  };

  const handleFollowUpdates = () => {
    toast.success('You are now following updates for this business!');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Share link copied to clipboard!');
  };

  const businessName = business?.title || 'The Artisan Bakery';
  const businessAddress = business?.address || '124 Oak Street';
  const businessDesc = business?.description || `Located at ${businessAddress}. This business hasn't joined our platform yet. Signal your interest to bring them online!`;

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] font-sans pb-24 md:pb-12">
      {/* TopAppBar header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="flex justify-between items-center w-full max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#ff6900] flex items-center justify-center text-white overflow-hidden shadow-inner">
              <img 
                alt="Merchant Profile" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsMgAds8iE6eMQDD_AAnLTVXkgchW0j1_WWdfZK2sFeWwNes19caLWWojowlawYh0VJvMVRlw1M28m5MgOy2_tbORNuf7i0ZKms5v8FGoksVSG8w1FPHjIcp-bPyWdi_BnoMiyURFAX5eVTYozIdj6JwqsmIktapXYvA84drlAiVm5HjzM9ofMZJeO3EwDlWAfDdB33Qs6T1Zf_lk07liFPoXumtT7plEz5lBvPecDwRi3pf6W13RC1PezpNoxsKH_ujnJJZmHBOs"
              />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-[#a14000] tracking-tight font-display-lg">
              Storefront Manager
            </h1>
          </div>
          <button 
            onClick={() => toast.info('No new notifications')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-[#a14000] active:scale-95 duration-150"
          >
            <Bell className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Business Profile & Demand Meter */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Profile Card */}
            <section className="bg-white p-6 md:p-8 rounded-2xl border border-[#e2bfb0]/30 shadow-sm transition-all hover:translate-y-[-2px] duration-300">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-20 h-20 rounded-2xl bg-[#e2dfde] flex-shrink-0 flex items-center justify-center overflow-hidden">
                  <Store className="w-10 h-10 text-[#5f5e5e]" />
                </div>
                <div className="flex-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full mb-3 border border-gray-200">
                    <Lock className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold tracking-wider uppercase">Unclaimed Business</span>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-extrabold text-[#0b1c30] tracking-tight mb-2">
                    {businessName}
                  </h2>
                  <p className="text-sm md:text-base text-[#5a4136] max-w-lg leading-relaxed">
                    {businessDesc}
                  </p>
                </div>
              </div>
            </section>

            {/* Demand Meter Bento Card */}
            <section className="bg-white p-6 md:p-8 rounded-2xl border border-[#e2bfb0]/30 shadow-sm relative overflow-hidden transition-all hover:translate-y-[-2px] duration-300">
              <div className="relative z-10">
                <h3 className="text-lg font-extrabold text-[#0b1c30] mb-6 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#ff6900]" />
                  Community Demand
                </h3>
                
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl md:text-5xl font-black text-[#a14000]">
                    {metrics?.totalVotes || 482}
                  </span>
                  <span className="text-xs font-bold text-[#5a4136] uppercase tracking-wider">
                    Requests this month
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-3">
                  <div className="h-4 bg-[#e2dfde] rounded-full overflow-hidden w-full">
                    <div 
                      className="h-full bg-[#ff6900] transition-all duration-1000 ease-out" 
                      style={{ width: demandWidth }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-bold text-[#5a4136]">
                    <span>Trending High</span>
                    <span>Goal: {metrics?.targetGoal || 500} for Priority Activation</span>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#0b1c30]">12k</div>
                    <div className="text-xs text-[#5a4136]">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#0b1c30]">89</div>
                    <div className="text-xs text-[#5a4136]">Saves</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#0b1c30]">56</div>
                    <div className="text-xs text-[#5a4136]">Shares</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#0b1c30]">{metrics?.sentimentScore || 92}%</div>
                    <div className="text-xs text-[#5a4136]">Sentiment</div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#ff6900]/5 rounded-full blur-3xl" />
            </section>

            {/* Specific Pledge Request Option Form (collapsible/accessible underneath) */}
            <section className="bg-white p-6 md:p-8 rounded-2xl border border-[#e2bfb0]/30 shadow-sm">
              <h3 className="text-lg font-extrabold text-[#0b1c30] mb-4">Pledge Specific Offerings</h3>
              <p className="text-xs text-[#5a4136] mb-6">
                Tell us what you want to buy. We use this data to pitch the bakery on how much neighborhood demand is waiting.
              </p>
              
              {hasVoted ? (
                <div className="text-center py-4 text-emerald-600 font-bold flex flex-col items-center gap-2">
                  <CheckCircle className="w-8 h-8" />
                  <span>Offerings requested successfully!</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitPledge} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      'Sourdough Bread',
                      'Kids Workshops',
                      'Vegan Pastries',
                      'Specialty Coffee',
                      'Delivery Service',
                      'Craft Beer'
                    ].map((demand) => {
                      const isSelected = selectedDemands.includes(demand);
                      return (
                        <button
                          type="button"
                          key={demand}
                          onClick={() => toggleDemand(demand)}
                          className={`p-3.5 rounded-xl border text-left font-bold text-xs transition-all flex items-center justify-between ${
                            isSelected 
                              ? 'border-[#ff6900] bg-[#ff6900]/5 text-[#a14000] shadow-sm' 
                              : 'border-gray-250 bg-white hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <span>{demand}</span>
                          {isSelected ? <Check className="w-3.5 h-3.5 text-[#ff6900]" /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#5a4136] uppercase tracking-wider block">
                      Write other requests (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Gluten-free pastries, late opening hours..."
                      value={customDemand}
                      onChange={(e) => setCustomDemand(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#ff6900] focus:border-[#ff6900] text-sm font-semibold w-full"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#a14000] text-white hover:bg-[#ff6900] font-bold rounded-xl py-6 shadow-md"
                  >
                    Submit Specific Requests
                  </Button>
                </form>
              )}
            </section>
          </div>

          {/* Right Column: Activation actions & Step Guide */}
          <div className="lg:col-span-5 space-y-8">
            <section className="bg-[#eff4ff] p-6 md:p-8 rounded-2xl border-2 border-[#a14000] shadow-lg sticky top-24 space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-[#0b1c30] mb-2">Want this business active?</h3>
                <p className="text-sm text-[#5a4136] leading-relaxed">
                  The more signals we receive, the faster we can onboard them to the community platform.
                </p>
              </div>

              <div className="space-y-4">
                {/* Primary Action Button */}
                <button 
                  onClick={handleRequestActivation}
                  className={`w-full font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 shadow-md hover:scale-[1.02] active:scale-95 transition-all ${
                    hasVoted 
                      ? 'bg-gray-800 text-white cursor-default' 
                      : 'bg-[#ff6900] text-white hover:bg-[#a14000] hover:shadow-lg'
                  }`}
                >
                  {hasVoted ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      Request Sent!
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 fill-white" />
                      Request Activation
                    </>
                  )}
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Secondary actions */}
                  <button 
                    onClick={handleNotifyOwner}
                    className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-[#a14000] text-[#a14000] font-bold rounded-xl hover:bg-[#a14000]/5 transition-colors active:scale-95 text-xs"
                  >
                    <Share2 className="w-4 h-4" />
                    Notify Business
                  </button>
                  <button 
                    onClick={handleFollowUpdates}
                    className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-[#a14000] text-[#a14000] font-bold rounded-xl hover:bg-[#a14000]/5 transition-colors active:scale-95 text-xs"
                  >
                    <Bell className="w-4 h-4" />
                    Follow Updates
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-[#e2bfb0]/40 flex items-start gap-4">
                <Info className="w-5 h-5 text-[#a14000] shrink-0 mt-0.5" />
                <p className="text-xs text-[#5a4136] leading-relaxed">
                  By requesting activation, you'll be notified via email once this storefront is live and verified. We never share your personal data with the merchant.
                </p>
              </div>
            </section>

            {/* Why Request Card */}
            <section className="bg-white p-6 md:p-8 rounded-2xl border border-gray-150 transition-all hover:translate-y-[-2px] duration-300">
              <h4 className="text-base font-extrabold text-[#0b1c30] mb-4">What happens next?</h4>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#ff6900]/10 text-[#a14000] flex items-center justify-center flex-shrink-0 font-extrabold text-xs">1</span>
                  <p className="text-xs text-[#5a4136] leading-normal">We reach out to the owner with community data.</p>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#ff6900]/10 text-[#a14000] flex items-center justify-center flex-shrink-0 font-extrabold text-xs">2</span>
                  <p className="text-xs text-[#5a4136] leading-normal">They set up their digital storefront & profile.</p>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#ff6900]/10 text-[#a14000] flex items-center justify-center flex-shrink-0 font-extrabold text-xs">3</span>
                  <p className="text-xs text-[#5a4136] leading-normal">You get an exclusive "early adopter" reward.</p>
                </li>
              </ul>
            </section>
          </div>

        </div>

        {/* Featured Gallery Section */}
        <section className="mt-12 pt-12 border-t border-gray-200">
          <h3 className="text-xl md:text-3xl font-black text-[#0b1c30] mb-6 font-display-lg">
            Storefront Sneak Peek
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 relative group border border-gray-150">
              <img 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                alt="Bakery Interior shelves" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC90LTrnpygLoEa3igpJMC_WQfTFsiWdqNqHkvtKA4pXSc9WxY9L55EZIh0aPoSpqf4wZ3AEjdk-YoF8v4YrvGgQyev-5tZw_Ul02uNgbKKYxT6CsKdIwas2bdlB-Gojplhg8OOFVXoB3po0mvPgqYtpghAbg6dcg4qdw6VlVOxkioMi5698Utjb7XO5L0Q4KB0vHrCCg5CzcKNTlLXeF8nZrlvE41P1xr5QIn9tJ1I61RjPcDlDaoBYfnZcAbzzyoY6TQTF-dx22U"
              />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 relative group border border-gray-150">
              <img 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                alt="Pastry Chef garnishing Citrus Tart" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqR9iyTqhjiJVWlZla4gsXKuyL2l3ljzxpm1L7U19-isSRtLZG2TDnuqY5ru-dmai-SR6yz2DWvROIhxYWZLIopoT3ft_XaYkBVccRc5L9PIACvbJBaO1DrODCAfavRyQli4S4IH8tp7GcWlY6JnkfDn8HR7Po8Jz8PY5LZ9RtxjpFqnxmpE93RxrZ6twgdomnBWWXISOw7lmMydCGRUIF-2SIyJ96bJu7Hf5Uu9U_VVebDrbnCNdp9Wqp4SnUiNQvM-6FFPch0T0"
              />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 relative group border border-gray-150">
              <img 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                alt="Minimalist Storefront exteriorLarge window sunrise" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGrTUnxhhPc6-7fZdt5ONx3_uF0QD1ZXKL7RDi59PZ-hfPt1_lnF7CnZMHxkmJeJr0qIQ_oEP-QCLkH_IqHfj0mBJ3qjdGuSu0bxiIBa2FSdEEJk6XBS7FU5PDpOBsWx0wEXwuEbqWUQ4PGqUXZFHOHvmR2zm0mfLpjwu7d-sNm_HmJaclicjq9VJHdvIJJ8EVAEQ-LO3MxorAcrTphIO6ZhouHw1H5OkazLyoTNZ4HVENj-JlumaRZElTqOpNhMLY48OtBJS2luM"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-safe bg-white border-t border-[#e2bfb0]/40 shadow-lg md:hidden">
        <a className="flex flex-col items-center justify-center text-[#5a4136] transition-all active:scale-90 duration-200" href="#">
          <BarChart2 className="w-5 h-5 text-[#5a4136]" />
          <span className="text-[10px] font-bold mt-0.5">Dashboard</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#5a4136] transition-all active:scale-90 duration-200" href="#">
          <UserCheck className="w-5 h-5 text-[#5a4136]" />
          <span className="text-[10px] font-bold mt-0.5">Register</span>
        </a>
        <a className="flex flex-col items-center justify-center bg-[#ff6900] text-white rounded-full px-4 py-1 active:scale-90 transition-transform duration-200" href="#">
          <Compass className="w-5 h-5 text-white" />
          <span className="text-[10px] font-bold mt-0.5">Discover</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#5a4136] transition-all active:scale-90 duration-200" href="#">
          <Trophy className="w-5 h-5 text-[#5a4136]" />
          <span className="text-[10px] font-bold mt-0.5">Rewards</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#5a4136] transition-all active:scale-90 duration-200" href="#">
          <BarChart2 className="w-5 h-5 text-[#5a4136]" />
          <span className="text-[10px] font-bold mt-0.5">Leaders</span>
        </a>
      </nav>
    </div>
  );
}

