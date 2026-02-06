"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { adminService } from "@/lib/api";

export default function OverviewPage() {
  const [statsData, setStatsData] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("30");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        setLoading(true);
        const [statsRes, ordersRes] = await Promise.all([
          adminService.getStats({ range: dateRange }),
          adminService.getOrders()
        ]);
        setStatsData(statsRes.data.stats);
        setRecentOrders((ordersRes.data.orders || []).slice(0, 5));
      } catch (err: any) {
        console.error("Failed to fetch dashboard data", err);
        if (err?.isAuthError || err?.response?.status === 401) {
          const errorMsg = 'Authentication required. Please log in.';
          setError(errorMsg);
          toast.error(errorMsg);
        } else {
          const errorMsg = 'Failed to load dashboard data. Please check your connection.';
          setError(errorMsg);
          toast.error(err?.response?.data?.error || errorMsg);
        }
        setStatsData({
          totalRevenue: 0,
          totalOrders: 0,
          totalProducts: 0,
          totalCustomers: 0,
          statusCounts: { pending: 0 }
        });
        setRecentOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Overview of your e-commerce platform</p>
        </div>
        <div className="border border-border rounded-lg p-6 bg-card">
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      name: "Total Revenue",
      value: `$${statsData?.totalRevenue?.toLocaleString() || '0'}`,
      change: `Last ${dateRange} days`,
      trend: "neutral",
      icon: DollarSign,
    },
    {
      name: "Orders",
      value: statsData?.totalOrders?.toString() || '0',
      change: `Last ${dateRange} days`,
      trend: "neutral",
      icon: ShoppingCart,
    },
    {
      name: "Total Customers",
      value: statsData?.totalCustomers?.toString() || '0',
      change: "All time",
      trend: "up",
      icon: Users,
    },
    {
      name: "Pending Orders",
      value: statsData?.statusCounts?.pending?.toString() || '0',
      change: "Action needed",
      trend: "neutral",
      icon: Package,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground mt-1">
            Welcome back, here's what's happening with your store.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-card border border-border rounded-lg p-1">
          {['7', '30', '90', '365'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                dateRange === range ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {range === '365' ? 'Year' : `${range} Days`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-secondary rounded-lg">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground font-medium bg-secondary/50 px-2 py-1 rounded">
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="md:col-span-4 p-6 bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" />
              Revenue Growth
            </h3>
          </div>
          <div className="h-[300px] flex items-end justify-between space-x-1 pt-4 overflow-x-auto pb-2">
            {statsData?.revenueGraph?.length > 0 ? (
              <>
                {(() => {
                  const data = statsData.revenueGraph;
                  const maxVal = Math.max(...data.map((d: any) => d.value), 1); // Avoid division by zero

                  return data.map((day: any, i: number) => {
                    const height = (day.value / maxVal) * 100;
                    const dateObj = new Date(day.date);
                    // Format date for display (e.g., "Mon 12") or just "12" if space is tight
                    const label = dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

                    return (
                      <div key={i} className="flex-1 min-w-[30px] flex flex-col items-center group relative">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-popover text-popover-foreground text-xs rounded px-2 py-1 shadow-md whitespace-nowrap z-10 border border-border">
                          <p className="font-semibold">{label}</p>
                          <p>${day.value.toLocaleString()}</p>
                        </div>

                        <div
                          className="w-full bg-primary/20 group-hover:bg-primary/40 transition-colors rounded-t-sm relative"
                          style={{ height: `${Math.max(height, 5)}%` }} // Min height 5% for visibility
                        >
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 truncate w-full text-center">{dateObj.getDate()}</span>
                      </div>
                    );
                  });
                })()}
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                No data available for this range
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-3 p-6 bg-card border border-border rounded-xl flex flex-col">
          <h3 className="font-semibold text-lg mb-6">Recent Orders</h3>
          <div className="space-y-6 flex-1">
            {recentOrders.map((order, i) => (
              <div key={order._id} className="flex items-center justify-between group cursor-pointer hover:bg-secondary/50 p-2 -m-2 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center font-bold text-xs overflow-hidden border border-border">
                    {order.customer?.picture ? (
                      <img src={order.customer.picture} alt="" className="h-full w-full object-cover" />
                    ) : (
                      (order.customer?.name || order.customerName || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none max-w-[150px] truncate">{order.customer?.name || order.customerName || 'Guest'}</p>
                    <p className="text-xs text-muted-foreground mt-1">{order.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">${order.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
