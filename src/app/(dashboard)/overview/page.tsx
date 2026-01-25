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
import { cn } from "@/lib/utils";
import { adminService } from "@/lib/api";

export default function OverviewPage() {
  const [statsData, setStatsData] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          adminService.getStats(),
          adminService.getOrders()
        ]);
        setStatsData(statsRes.data.stats);
        setRecentOrders(ordersRes.data.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      name: "Total Revenue",
      value: `$${statsData?.totalRevenue?.toLocaleString() || '0'}`,
      change: "+0%",
      trend: "up",
      icon: DollarSign,
    },
    {
      name: "Total Orders",
      value: statsData?.totalOrders?.toString() || '0',
      change: "+0%",
      trend: "up",
      icon: ShoppingCart,
    },
    {
      name: "Active Products",
      value: statsData?.totalProducts?.toString() || '0',
      change: "+0",
      trend: "up",
      icon: Package,
    },
    {
      name: "Pending Orders",
      value: statsData?.statusCounts?.pending?.toString() || '0',
      change: "0",
      trend: "neutral",
      icon: Package,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground mt-1">
            Welcome back, here's what's happening with your store today.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-secondary rounded-lg">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
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
          <div className="h-[300px] flex items-end justify-between space-x-2 pt-4">
            {[40, 70, 45, 90, 65, 80, 50, 85, 45, 75, 60, 95].map((height, i) => (
              <div key={i} className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-sm relative group" style={{ height: `${height}%` }}>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 p-6 bg-card border border-border rounded-xl flex flex-col">
          <h3 className="font-semibold text-lg mb-6">Recent Orders</h3>
          <div className="space-y-6 flex-1">
            {recentOrders.map((order, i) => (
              <div key={order._id} className="flex items-center justify-between group cursor-pointer hover:bg-secondary/50 p-2 -m-2 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center font-bold text-xs">
                    {order.shippingAddress?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{order.shippingAddress?.name || 'Anonymous'}</p>
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
