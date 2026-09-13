import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { motion, Variants } from 'framer-motion';
import { Mail, Phone, MapPin, Calendar, Share2, Download } from 'lucide-react';

const people = [
  {
    name: 'Ezra Miller',
    role: 'Salon Owner',
    email: 'ezra@gmail.com',
    phone: '+1-407-844-8764',
    location: 'New York, USA',
    dob: '12th June 1990',
    tagline: 'Precision cuts • Color specialist • Styling wizard',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    accent: 'emerald',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
  },
  {
    name: 'Jane Smith',
    role: 'Lawyer',
    email: 'jane@lawfirm.com',
    phone: '+1-407-844-8765',
    location: 'New York, USA',
    dob: '4th March 1985',
    tagline: 'Corporate law • M&A • Compliance & risk',
    gradient: 'from-fuchsia-600 via-indigo-600 to-blue-500',
    accent: 'indigo',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
  },
  {
    name: 'Mary Arden',
    role: 'Programmer',
    email: 'mary@dev.com',
    phone: '+1-402-888-1234',
    location: 'New York, USA',
    dob: '9th November 2002',
    tagline: 'Full‑stack • TypeScript • Cloud • DX obsessed',
    gradient: 'from-rose-500 via-orange-500 to-amber-400',
    accent: 'rose',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
  },
];

const accentRing = (accent: string) => {
  const map: Record<string, string> = {
    emerald: 'from-emerald-300 to-cyan-200',
    indigo: 'from-indigo-300 to-fuchsia-300',
    rose: 'from-rose-300 to-amber-300',
  };
  return map[accent] || 'from-slate-200 to-white';
};

const accentChip = (accent: string) => {
  const map: Record<string, string> = {
    emerald: 'bg-emerald-300/20 text-white border border-emerald-200/30',
    indigo: 'bg-indigo-300/20 text-white border border-indigo-200/30',
    rose: 'bg-rose-300/20 text-white border border-rose-200/30',
  };
  return map[accent] || 'bg-white/15 text-white border border-white/20';
};

const shineAnim = {
  initial: { x: -200 },
  animate: { x: 600 },
  transition: { repeat: Infinity, duration: 3.6, ease: 'easeInOut' },
} as const;

const cardTilt: Variants = {
  rest: { rotateX: 0, rotateY: 0, scale: 1 },
  hover: {
    rotateX: -3,
    rotateY: 3,
    scale: 1.02,
    transition: { type: 'spring', stiffness: 200, damping: 15 },
  },
};

const GAP = 20;

export default function McomEgiftCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState(0);

  useEffect(() => {
    const calculateConstraints = () => {
      const containerWidth = containerRef.current?.offsetWidth || 0;
      const cardsWidth = cardsRef.current?.scrollWidth || 0;
      const newDragConstraints = Math.min(0, containerWidth - cardsWidth - GAP);
      setDragConstraints(newDragConstraints);
    };

    calculateConstraints();
    window.addEventListener('resize', calculateConstraints);
    return () => window.removeEventListener('resize', calculateConstraints);
  }, []);

  return (
    <section>
      <header className="text-3xl font-bold text-center mb-5 sm:text-5xl">
        Mcom VCards
      </header>
      <div
        ref={containerRef}
        className="container mx-auto p-6 sm:grid sm:grid-cols-2 xl:grid-cols-3 sm:gap-10 overflow-hidden"
      >
        <motion.div
          ref={cardsRef}
          drag="x"
          dragConstraints={{ left: dragConstraints, right: 0 }}
          dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
          className="flex gap-5 sm:contents"
        >
          {people.map((p, i) => (
            <motion.div
              key={p.email}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="w-[90vw] flex-shrink-0 sm:w-auto sm:flex-shrink sm:justify-center sm:perspective-[1200px]"
            >
              <motion.div
                variants={cardTilt}
                initial="rest"
                whileHover="hover"
                className="relative"
              >
                <Card className="relative h-[560px] w-full overflow-hidden rounded-[28px] border-0 shadow-2xl xl:h-[580px]">
                  {/* BG LAYER 1: vibrant gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${p.gradient} opacity-95`}
                  />

                  {/* BG LAYER 2: subtle grid pattern using SVG */}
                  <svg
                    className="absolute inset-0 opacity-25"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <pattern
                        id={`grid-${i}`}
                        width="28"
                        height="28"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M28 0H0v28"
                          fill="none"
                          stroke="white"
                          strokeOpacity="0.15"
                        />
                      </pattern>
                      <radialGradient
                        id={`vignette-${i}`}
                        cx="50%"
                        cy="50%"
                        r="70%"
                      >
                        <stop offset="60%" stopColor="black" stopOpacity="0" />
                        <stop
                          offset="100%"
                          stopColor="black"
                          stopOpacity="0.35"
                        />
                      </radialGradient>
                    </defs>
                    <rect
                      width="100%"
                      height="100%"
                      fill={`url(#grid-${i})`}
                    />
                    <rect
                      width="100%"
                      height="100%"
                      fill={`url(#vignette-${i})`}
                    />
                  </svg>

                  {/* BG LAYER 3: animated blob */}
                  <motion.div
                    className="absolute -top-20 -right-24 w-72 h-72 rounded-full blur-3xl"
                    animate={{
                      scale: [1, 1.15, 1],
                      rotate: [0, 15, 0],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{
                      background:
                        'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), rgba(255,255,255,0) 60%)',
                    }}
                  />

                  {/* SHINE SWEEP */}
                  <motion.div
                    className="pointer-events-none absolute -top-10 -left-40 h-[140%] w-24 rotate-12 bg-white/25 blur-xl"
                    initial={shineAnim.initial}
                    animate={shineAnim.animate}
                    transition={shineAnim.transition}
                  />

                  {/* HEADER */}
                  <CardContent className="relative z-10 pt-8">
                    <div className="flex items-start justify-between px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs tracking-wide ${accentChip(
                          p.accent
                        )}`}
                      >
                        {p.role}
                      </span>
                      <span className="text-white/80 text-xs">vCard</span>
                    </div>

                    {/* Avatar with glow ring */}
                    <div className="mt-6 flex justify-center">
                      <div className="relative">
                        <div
                          className={`p-[3px] rounded-full bg-gradient-to-r ${accentRing(
                            p.accent
                          )}`}
                        >
                          <div className="rounded-full bg-white/20 p-[2px]">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-28 h-28 rounded-full object-cover shadow-xl"
                              width={112}
                              height={112}
                            />
                          </div>
                        </div>
                        {/* corner sparkle */}
                        <svg
                          className="absolute -top-2 -right-2 w-6 h-6"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M12 2l2.2 4.6L19 8l-4.3 2.2L12 15l-2.7-4.8L5 8l4.8-1.4L12 2z"
                            fill="white"
                            opacity="0.7"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Name / Tagline */}
                    <div className="mt-5 text-center px-6">
                      <h3 className="text-white text-2xl font-extrabold drop-shadow-sm leading-tight">
                        {p.name}
                      </h3>
                      <p className="mt-1 text-white/90 text-sm">{p.tagline}</p>
                    </div>

                    {/* Divider with fancy SVG wave */}
                    <div className="relative mt-6 h-10">
                      <svg
                        className="absolute inset-0 w-full h-10"
                        viewBox="0 0 400 40"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M0,20 C100,40 300,0 400,20 L400,40 L0,40 Z"
                          fill="rgba(255,255,255,0.15)"
                        />
                      </svg>
                    </div>

                    {/* INFO GRID */}
                    <div className="px-6 mt-2 grid grid-cols-1 gap-2 text-[13px] text-white/95">
                      <InfoRow
                        icon={<Mail className="w-4 h-4" />}
                        label="Email"
                        value={p.email}
                      />
                      <InfoRow
                        icon={<Phone className="w-4 h-4" />}
                        label="Phone"
                        value={p.phone}
                      />
                      <InfoRow
                        icon={<MapPin className="w-4 h-4" />}
                        label="Location"
                        value={p.location}
                      />
                      <InfoRow
                        icon={<Calendar className="w-4 h-4" />}
                        label="DOB"
                        value={p.dob}
                      />
                    </div>

                    {/* BADGES */}
                    <div className="px-6 mt-4 flex flex-wrap gap-2">
                      {p.role === 'Programmer' && <Badge text="TypeScript" />}
                      {p.role === 'Lawyer' && <Badge text="Corporate" />}
                      {p.role === 'Salon Owner' && <Badge text="Styling" />}
                      <Badge text="Available" />
                      <Badge text="Verified" />
                    </div>
                  </CardContent>

                  {/* FOOTER ACTIONS + QR */}
                  <CardFooter className="relative z-10 mt-auto px-6 pb-6">
                    <div className="w-full flex items-center gap-3">
                      <Button className="flex-1 rounded-xl bg-white/95 text-gray-900 font-semibold shadow hover:bg-white">
                        <Download className="mr-2 h-4 w-4" /> Save Contact
                      </Button>
                      <Button
                        variant="secondary"
                        className="rounded-xl bg-black/20 text-white border border-white/20 hover:bg-black/30"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      {/* Minimal QR placeholder */}
                      <div className="ml-auto shrink-0 rounded-md p-[2px] bg-white/30">
                        <div className="w-14 h-14 bg-white/90 grid grid-cols-3 gap-[2px] p-[3px]">
                          <div className="bg-black" />
                          <div className="bg-black/0" />
                          <div className="bg-black" />
                          <div className="bg-black/0" />
                          <div className="bg-black" />
                          <div className="bg-black/0" />
                          <div className="bg-black" />
                          <div className="bg-black/0" />
                          <div className="bg-black" />
                        </div>
                      </div>
                    </div>
                  </CardFooter>

                  {/* Decorative corner arcs */}
                  <svg
                    className="absolute -bottom-12 -left-12 w-40 h-40 opacity-30"
                    viewBox="0 0 200 200"
                  >
                    <circle
                      cx="100"
                      cy="100"
                      r="70"
                      fill="none"
                      stroke="white"
                      strokeWidth="10"
                      opacity="0.2"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="white"
                      strokeWidth="6"
                      opacity="0.15"
                    />
                  </svg>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ————————————————————————————————————————————
// Small helpers
// ————————————————————————————————————————————
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-white/10 rounded-xl px-3 py-2 border border-white/15">
      <span className="shrink-0 rounded-lg p-1.5 bg-white/20">{icon}</span>
      <span className="opacity-90 min-w-[72px]">{label}:</span>
      <span className="font-medium truncate">{value}</span>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="text-[11px] tracking-wide px-2.5 py-1 rounded-full bg-white/15 border border-white/25 text-white shadow-sm">
      {text}
    </span>
  );
}
