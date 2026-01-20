"use client";

import {
    Search,
    Filter,
    MoreVertical,
    Eye,
    Download,
    Clock,
    CheckCircle2,
    XCircle,
    Truck
} from "lucide-react";
import { cn } from "@/lib/utils";

const orders = [
    { id: "#ORD-7429", customer: "Sarah Connor", item: "Premium Leather Watch", date: "Jan 20, 2026", amount: "$299.00", status: "Delivered", method: "Credit Card" },
    { id: "#ORD-7430", customer: "John Doe", item: "Wireless Headphones", date: "Jan 19, 2026", amount: "$349.00", status: "Processing", method: "PayPal" },
    { id: "#ORD-7431", customer: "Michael Smith", item: "Ceramic Vase", date: "Jan 19, 2026", amount: "$49.00", status: "Shipped", method: "Apple Pay" },
    { id: "#ORD-7432", customer: "Emily Davis", item: "Organic T-Shirt", date: "Jan 18, 2026", amount: "$35.00", status: "Cancelled", method: "Credit Card" },
    { id: "#ORD-7433", customer: "Robert Wilson", item: "Ultra-thin Laptop", date: "Jan 18, 2026", amount: "$1,299.00", status: "Delivered", method: "Bank Transfer" },
];

const statusConfig = {
    Delivered: { icon: CheckCircle2, class: "bg-emerald-500/10 text-emerald-500" },
    Processing: { icon: Clock, class: "bg-amber-500/10 text-amber-500" },
    Shipped: { icon: Truck, class: "bg-blue-500/10 text-blue-500" },
    Cancelled: { icon: XCircle, class: "bg-rose-500/10 text-rose-500" },
};

export default function OrdersPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Orders</h2>
                    <p className="text-muted-foreground mt-1">
                        Track and manage customer orders and fulfillment status.
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="flex items-center justify-center space-x-2 border border-border px-4 py-2.5 rounded-lg font-semibold hover:bg-secondary transition-all">
                        <Download className="h-5 w-5" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm">
                <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by Order ID or Customer..."
                            className="w-full pl-10 pr-4 py-2 bg-secondary border-none rounded-lg text-sm outline-none ring-primary/20 focus:ring-2 transition-all"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="px-3 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors">
                            Filter Status
                        </button>
                        <select className="px-3 py-2 text-sm font-medium border border-border rounded-lg bg-transparent outline-none cursor-pointer">
                            <option>Last 30 Days</option>
                            <option>Last 3 Months</option>
                            <option>All Time</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border bg-secondary/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {orders.map((order) => {
                                const config = statusConfig[order.status as keyof typeof statusConfig];
                                return (
                                    <tr key={order.id} className="hover:bg-secondary/20 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-sm font-semibold">{order.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold">{order.customer}</span>
                                                <span className="text-xs text-muted-foreground italic">{order.item}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={cn(
                                                "inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                                                config.class
                                            )}>
                                                <config.icon className="mr-1.5 h-3 w-3" />
                                                {order.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground font-medium">{order.date}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-foreground">{order.amount}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary rounded-md">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-border flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground italic">
                        Displaying <span className="text-foreground">5</span> orders for <span className="text-foreground">Today</span>
                    </p>
                    <div className="flex items-center space-x-2">
                        <button className="px-3 py-1.5 text-xs font-semibold border border-border rounded-md hover:bg-secondary transition-colors">
                            Next Page
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
