"use client";

import { useEffect, useState } from "react";
import {
    Search,
    Filter,
    MoreVertical,
    Eye,
    Download,
    Clock,
    CheckCircle2,
    XCircle,
    Truck,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminService } from "@/lib/api";

const statusConfig: Record<string, { icon: any, class: string }> = {
    delivered: { icon: CheckCircle2, class: "bg-emerald-500/10 text-emerald-500" },
    pending: { icon: Clock, class: "bg-amber-500/10 text-amber-500" },
    processing: { icon: Truck, class: "bg-blue-500/10 text-blue-500" },
    cancelled: { icon: XCircle, class: "bg-rose-500/10 text-rose-500" },
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await adminService.getOrders();
            setOrders(res.data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await adminService.updateOrderStatus(id, newStatus);
            fetchOrders();
        } catch (error) {
            alert("Failed to update status");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Orders</h2>
                    <p className="text-muted-foreground mt-1">
                        Track and manage customer orders and fulfillment status.
                    </p>
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
                                const config = statusConfig[order.status] || statusConfig.pending;
                                return (
                                    <tr key={order._id} className="hover:bg-secondary/20 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-sm font-semibold">#{order._id.slice(-6)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold">{order.shippingAddress?.name || 'Anonymous'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                className={cn(
                                                    "inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border-none outline-none cursor-pointer",
                                                    config.class
                                                )}
                                            >
                                                {Object.keys(statusConfig).map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-foreground">${order.totalAmount.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary rounded-md">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
