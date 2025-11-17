"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart2, Edit, FileText, MessageSquare, ShoppingBag, Video, Settings } from "lucide-react";
import Link from "next/link";

const dashboardLinks = [
  {
    title: "Manage Booth",
    description: "Update your booth's branding and content.",
    icon: Edit,
    href: "/exhibitor/booth/setup",
    color: "text-lime-400",
    bgColor: "bg-lime-900/50",
  },
  {
    title: "Product Listings",
    description: "Add or edit your products and services.",
    icon: ShoppingBag,
    href: "/exhibitor/products",
    color: "text-pink-400",
    bgColor: "bg-pink-900/50",
  },
  {
    title: "Live Demos",
    description: "Schedule and manage your live sessions.",
    icon: Video,
    href: "/exhibitor/demos",
    color: "text-sky-400",
    bgColor: "bg-sky-900/50",
  },
  {
    title: "Analytics",
    description: "View your booth's performance and leads.",
    icon: BarChart2,
    href: "/exhibitor/analytics",
    color: "text-amber-400",
    bgColor: "bg-amber-900/50",
  },
  {
    title: "Orders",
    description: "Manage incoming orders and customer requests.",
    icon: FileText,
    href: "/exhibitor/orders",
    color: "text-purple-400",
    bgColor: "bg-purple-900/50",
  },
  {
    title: "Chat",
    description: "Engage with visitors in real-time.",
    icon: MessageSquare,
    href: "/exhibitor/chat",
    color: "text-teal-400",
    bgColor: "bg-teal-900/50",
  },
];

export default function ExhibitorDashboardPage() {
  return (
    <div className="min-h-screen bg-emerald-950 text-white">
      {/* Header */}
      <header className="bg-emerald-900/50 shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-lime-300">Exhibitor Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link href="/exhibitor/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-6 w-6" />
              </Button>
            </Link>
            <Button variant="outline" className="text-white border-pink-400 hover:bg-pink-500">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-bold">Welcome, Exhibitor!</h2>
          <p className="text-stone-400 mt-2">
            This is your control center for the MCOM Virtual Exhibition. Let's get started.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-emerald-900 border-lime-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-stone-300">
                <BarChart2 className="w-5 h-5" />
                Booth Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">1,234</p>
              <p className="text-sm text-stone-400">+5% from last event</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-900 border-lime-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-stone-300">
                <FileText className="w-5 h-5" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">56</p>
              <p className="text-sm text-stone-400">View Details</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-900 border-lime-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-stone-300">
                <MessageSquare className="w-5 h-5" />
                New Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">12</p>
              <p className="text-sm text-stone-400">Go to Inbox</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-900 border-lime-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-stone-300">
                <ShoppingBag className="w-5 h-5" />
                Active Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">8</p>
              <p className="text-sm text-stone-400">Manage Listings</p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardLinks.map((link) => (
            <Link href={link.href} key={link.title}>
              <Card className={`relative overflow-hidden group h-full ${link.bgColor} border-lime-700/30 hover:border-lime-500 transition-all duration-300`}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${link.bgColor}`}>
                      <link.icon className={`w-8 h-8 ${link.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-white">{link.title}</CardTitle>
                      <CardDescription className="text-stone-400">{link.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
