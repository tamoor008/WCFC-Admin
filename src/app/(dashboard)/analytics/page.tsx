"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/lib/api";
import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30"); // Default to last 30 days

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await adminService.getStats({ range: dateRange });
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [dateRange]);

  const StatCard = ({ title, value, icon: Icon, color, className }: any) => (
    <div className={cn("p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
        </div>
        <div className={cn("p-3 rounded-xl bg-opacity-20", color)}>
          <Icon className={cn("h-6 w-6", color.replace('bg-', 'text-'))} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Overview</h1>
          <p className="text-muted-foreground mt-2">Monitor your store's performance and growth.</p>
        </div>

        <div className="flex items-center space-x-2 bg-card border border-border rounded-lg p-1">
          <button
            onClick={() => setDateRange("7")}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              dateRange === "7" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            7 Days
          </button>
          <button
            onClick={() => setDateRange("30")}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              dateRange === "30" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            30 Days
          </button>
          <button
            onClick={() => setDateRange("90")}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              dateRange === "90" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            3 Months
          </button>
          <button
            onClick={() => setDateRange("365")}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              dateRange === "365" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            Year
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={stats?.totalRevenue ? `$${stats.totalRevenue.toLocaleString()}` : "$0"}
              icon={DollarSign}
              color="bg-emerald-500/10 text-emerald-500"
            />
            <StatCard
              title="Active Orders"
              value={stats?.activeOrders || stats?.ordersCount || 0}
              icon={ShoppingBag}
              color="bg-blue-500/10 text-blue-500"
            />
            <StatCard
              title="Total Customers"
              value={stats?.customersCount || stats?.usersCount || 0}
              icon={Users}
              color="bg-purple-500/10 text-purple-500"
            />
            <StatCard
              title="Products"
              value={stats?.productsCount || 0}
              icon={Package}
              color="bg-amber-500/10 text-amber-500"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {/* Fallback for activity list */}
                <p className="text-sm text-muted-foreground">No recent activity to display.</p>
              </div>
            </div>
            <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
              <div className="space-y-4">
                {/* Fallback for top products */}
                <p className="text-sm text-muted-foreground">No data available.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Helper icon
function Package(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22v-10" />
    </svg>
  )
}
