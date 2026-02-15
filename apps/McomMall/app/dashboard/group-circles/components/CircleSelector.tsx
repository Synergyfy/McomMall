"use client";

import React, { useMemo } from "react";
import {
    Search,
    ChevronDown,
    Globe,
    Check,
    Users,
    Calendar,
    ArrowUpDown,
    Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface CircleSelectorProps {
    selectedCircle: any;
    circleSearch: string;
    setCircleSearch: (val: string) => void;
    isLoadingCircles: boolean;
    circles: any[];
    selectedCircleId: string | null;
    setSelectedCircleId: (id: string) => void;
    groupCircleTypes: any[];
    onCreateNew?: () => void;
    disabled?: boolean;
}

export const CircleSelector = React.memo(({
    selectedCircle,
    circleSearch,
    setCircleSearch,
    isLoadingCircles,
    circles,
    selectedCircleId,
    setSelectedCircleId,
    groupCircleTypes,
    onCreateNew,
    disabled
}: CircleSelectorProps) => {
    // Filter and sort circles
    const filteredCircles = useMemo(() => {
        let result = [...circles];

        // Apply search filter
        if (circleSearch) {
            result = result.filter(c =>
                c.name.toLowerCase().includes(circleSearch.toLowerCase()) ||
                c.type.toLowerCase().includes(circleSearch.toLowerCase())
            );
        }

        // Default sort: newest first
        result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        return result;
    }, [circles, circleSearch]);

    const activeType = groupCircleTypes.find(t => t.id === selectedCircle?.type);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="h-auto py-2.5 px-4 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all group flex items-center gap-3 min-w-[280px] justify-start"
                >
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0",
                        activeType?.gradient || "bg-zinc-500"
                    )}>
                        {activeType?.icon ? <activeType.icon className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 text-left overflow-hidden">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 group-hover:text-orange-500 transition-colors">Switch Circle</span>
                            <Badge variant="outline" className="text-[9px] py-0 h-4 border-orange-100 text-orange-600 bg-orange-50/50">
                                {selectedCircle?.type?.replace('_', ' ') || "None"}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate">
                                {selectedCircle?.name || "Select a circle..."}
                            </h3>
                            <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-orange-500 group-data-[state=open]:rotate-180 transition-all" />
                        </div>
                    </div>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-[350px] p-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-[10000] overflow-hidden">
                {/* Search Header */}
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                        <Input
                            placeholder="Find a circle..."
                            value={circleSearch}
                            onChange={(e) => setCircleSearch(e.target.value)}
                            className="pl-9 h-9 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-orange-500/20"
                        />
                    </div>
                </div>

                {/* List Content */}
                <ScrollArea className="h-[320px]">
                    <div className="p-2 space-y-1">
                        {isLoadingCircles ? (
                            <div className="py-8 text-center text-zinc-400">
                                <span className="text-xs">Loading circles...</span>
                            </div>
                        ) : filteredCircles.length === 0 ? (
                            <div className="py-8 text-center text-zinc-400">
                                <span className="text-xs">No circles found</span>
                            </div>
                        ) : (
                            filteredCircles.map((circle) => {
                                const type = groupCircleTypes.find(t => t.id === circle.type);
                                const isActive = selectedCircleId === circle.id;
                                return (
                                    <DropdownMenuItem
                                        key={circle.id}
                                        onClick={() => setSelectedCircleId(circle.id)}
                                        className={cn(
                                            "flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all",
                                            isActive
                                                ? "bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/50"
                                                : "hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-transparent"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm",
                                            type?.gradient || "bg-zinc-400"
                                        )}>
                                            {type?.icon ? <type.icon className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex items-center justify-between">
                                                <h4 className={cn(
                                                    "text-xs font-bold truncate",
                                                    isActive ? "text-orange-900 dark:text-orange-100" : "text-zinc-700 dark:text-zinc-300"
                                                )}>
                                                    {circle.name}
                                                </h4>
                                                {isActive && <Check className="w-3.5 h-3.5 text-orange-600" />}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-zinc-400 capitalize">{circle.type.toLowerCase().replace('_', ' ')}</span>
                                                <span className="text-[10px] text-zinc-300">•</span>
                                                <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                                                    <Users className="w-2.5 h-2.5" />
                                                    {circle.members?.length || 0}
                                                </div>
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                );
                            })
                        )}
                    </div>
                </ScrollArea>

                {/* Footer Action */}
                <div className="p-2 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 h-9 rounded-xl"
                        onClick={onCreateNew}
                        disabled={disabled}
                    >
                        <Plus className="w-3.5 h-3.5 mr-2" /> Create New Circle
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
});

CircleSelector.displayName = "CircleSelector";
