"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type OrbitLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface Member {
    id: string;
    memberId: string;
    name: string; email?: string;
    role: "Owner" | "Admin" | "Member" | "Banker" | "Guest";
    orbit: OrbitLevel;
    status: "active" | "online" | "offline" | "inactive";
    category: string;
    avatar?: string;
    contributions?: number;
    drawDate?: string;
    earnedPoints?: number;
    distributions?: number;
    relationshipScore?: number;
    locationTag?: string;
    relationshipTag?: string;
}

export const ORBIT_CONFIG: Record<number, { label: string; radius: number; color: string; description: string }> = {
    1: { label: "Core", radius: 12, color: "border-orange-600", description: "Critical partners & team" },
    2: { label: "Inner", radius: 24, color: "border-orange-500", description: "Frequent collaborators" },
    3: { label: "Local", radius: 36, color: "border-orange-400", description: "Nearby businesses" },
    4: { label: "Regional", radius: 48, color: "border-orange-300", description: "State/Regional reach" },
    5: { label: "National", radius: 60, color: "border-orange-200", description: "Country-wide partners" },
    6: { label: "Global", radius: 75, color: "border-zinc-200", description: "International / Peripheral" },
};

interface MultiLayerRadialGraphProps {
    members: Member[];
    onMemberClick: (m: Member) => void;
    currentMemberId?: string | null;
    focusedOrbits?: number[] | null;
    profileImage?: string;
    relationshipFilter?: string | null;
}

export const MultiLayerRadialGraph = React.memo(({
    members,
    onMemberClick,
    currentMemberId,
    focusedOrbits = null,
    profileImage,
    relationshipFilter = null
}: MultiLayerRadialGraphProps) => {
    const owner = members.find(m => m.role.toLowerCase() === 'owner');
    const me = members.find(m => m.id === currentMemberId);
    const isOwner = me?.id === owner?.id;

    return (
        <div className="w-full h-full flex items-center justify-center p-4 overflow-visible">
            <div className="relative w-full aspect-square max-w-[800px] max-h-[800px] mx-auto isolate">

                {/* Radar Scanner Effect */}
                <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-0 opacity-20">
                    <div className="w-1/2 h-1/2 absolute top-0 left-0 origin-bottom-right bg-gradient-to-tr from-transparent to-orange-400/30 animate-[spin_4s_linear_infinite]" />
                </div>

                {/* --- The Orbits (Background Rings) --- */}
                {Object.entries(ORBIT_CONFIG).reverse().map(([key, config]) => (
                    <div
                        key={key}
                        className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed transition-all duration-1000 select-none pointer-events-none",
                            Number(key) % 2 === 0 ? "border-opacity-40" : "border-opacity-20",
                            config.color,
                            "dark:border-opacity-30"
                        )}
                        style={{
                            width: `${config.radius * 2}%`,
                            height: `${config.radius * 2}%`,
                            zIndex: 0
                        }}
                    >
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] uppercase font-bold tracking-widest text-zinc-400 bg-white/80 dark:bg-zinc-950/80 backdrop-blur px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap z-10">
                            {config.label}
                        </div>
                    </div>
                ))}

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                                onClick={() => {
                                    if (owner) {
                                        onMemberClick(owner);
                                    } else {
                                        toast.error("No owner found for this circle.");
                                    }
                                }}
                                className={cn(
                                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-zinc-800 to-black flex flex-col items-center justify-center text-white shadow-xl shadow-black/30 border-4 border-white dark:border-zinc-900 transition-all hover:scale-105 select-none cursor-pointer hover:shadow-black/50 pointer-events-auto overflow-hidden",
                                    isOwner ? "from-orange-500 to-red-600 shadow-orange-500/30 hover:shadow-orange-500/50" : ""
                                )}
                            >
                                {isOwner && profileImage ? (
                                    <img
                                        src={profileImage}
                                        alt="You"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <>
                                        {isOwner ? <Zap className="w-4 h-4 md:w-6 md:h-6 mb-0.5 animate-pulse" /> : <Users className="w-4 h-4 md:w-6 md:h-6 mb-0.5" />}
                                        <span className="text-[6px] md:text-[8px] font-bold pointer-events-none uppercase">
                                            {isOwner ? "YOU" : "OWNER"}
                                        </span>
                                    </>
                                )}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <div className="text-center">
                                <p className="font-bold">{owner?.name || "Circle Owner"}</p>
                                <p className="text-xs text-muted-foreground">{isOwner ? "You are the owner" : "Circle Founder"}</p>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* --- The Particles (Members) --- */}
                <AnimatePresence>
                    {members
                        .filter(m => m.id !== owner?.id)
                        .filter(m => {
                            const orbitMatch = !focusedOrbits || focusedOrbits.includes(m.orbit);
                            const relationMatch = !relationshipFilter || m.relationshipTag?.toLowerCase() === relationshipFilter.toLowerCase();
                            return orbitMatch && relationMatch;
                        })
                        .map((member, i) => {
                            const siblings = members.filter(m => m.orbit === member.orbit);
                            const indexInOrbit = siblings.indexOf(member);
                            const totalInOrbit = siblings.length;
                            const angleStep = 360 / (totalInOrbit || 1);
                            const ringOffset = member.orbit * 45;
                            const angle = (indexInOrbit * angleStep) + ringOffset;
                            const radiusPercent = ORBIT_CONFIG[member.orbit].radius;
                            const rad = (angle * Math.PI) / 180;
                            const r = radiusPercent;
                            const x = 50 + (r * Math.cos(rad));
                            const y = 50 + (r * Math.sin(rad));

                            return (
                                <motion.div
                                    key={member.id}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{
                                        delay: i * 0.01,
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 20
                                    }}
                                    className="absolute w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 z-20"
                                    style={{
                                        left: `${x}%`,
                                        top: `${y}%`,
                                        marginTop: '-1.5rem',
                                        marginLeft: '-1.5rem',
                                    }}
                                >
                                    {member.orbit <= 2 && (
                                        <div
                                            className="absolute top-1/2 left-1/2 h-px bg-gradient-to-r from-orange-400/50 to-transparent w-[50vh] origin-left -z-10 pointer-events-none"
                                            style={{
                                                transform: `rotate(${angle + 180}deg)`,
                                                width: `${(r / 100) * 100 * 4}px`
                                            }}
                                        />
                                    )}

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={() => onMemberClick(member)}
                                                    className={cn(
                                                        "relative group w-full h-full rounded-full transition-all duration-300 hover:scale-125 hover:z-50 focus:outline-none focus:ring-2 focus:ring-orange-500",
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-full h-full rounded-full overflow-hidden border-2 shadow-sm bg-white dark:bg-zinc-900 transition-colors relative z-10",
                                                        member.id === currentMemberId ? "border-blue-500 ring-2 ring-blue-200" :
                                                            member.orbit === 1 ? "border-orange-500 ring-2 ring-orange-200/50" : "border-white dark:border-zinc-700",
                                                        member.status === 'offline' && "grayscale opacity-70"
                                                    )}>
                                                        <Avatar className="w-full h-full">
                                                            <AvatarFallback className={cn(
                                                                "text-[10px] md:text-xs font-bold flex items-center justify-center w-full h-full",
                                                                member.id === currentMemberId ? "bg-blue-100 text-blue-700" :
                                                                    member.orbit === 1 ? "bg-orange-100 text-orange-700" : "bg-zinc-100 text-zinc-500"
                                                            )}>
                                                                {member.id === currentMemberId ? "ME" : member.name.substring(0, 2)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                    <span className={cn(
                                                        "absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-zinc-900 z-20",
                                                        member.status === 'active' ? "bg-green-500 w-3 h-3 animate-pulse" : "bg-zinc-400 w-2.5 h-2.5"
                                                    )} />
                                                    {member.status === 'active' && <div className="absolute inset-0 rounded-full border border-green-500 animate-ping opacity-20" />}
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                <div className="text-center">
                                                    <p className="font-bold">{member.name}</p>
                                                    <p className="text-xs text-muted-foreground">{member.category} • {ORBIT_CONFIG[member.orbit].label}</p>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </motion.div>
                            );
                        })}
                </AnimatePresence>
            </div>
        </div>
    );
});

MultiLayerRadialGraph.displayName = "MultiLayerRadialGraph";

