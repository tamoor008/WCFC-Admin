"use client";

import { useEffect, useState } from "react";
import {
    MoreVertical,
    Search,
    ShoppingBag,
    Loader2,
    Calendar,
    User,
    DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminService } from "@/lib/api";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

interface Order {
    _id: string;
    orderNumber?: string;
    customer?: { name: string; email: string };
    totalAmount: number;
    status: string;
    createdAt: string;
    items?: any[];
}

export default function OrdersPage() {
    const searchParams = useSearchParams();
    const page = Number(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await adminService.getOrders({ page, limit: 10, search });
                const data = response.data;
                const ordersList = data.orders || [];
                setOrders(ordersList);
                setTotalPages(data.pages || data.totalPages || 1);
                setTotalOrders(data.total || data.totalDocs || 0);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
                toast.error("Failed to load orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [page, search]);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
            case 'completed':
                return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
            case 'processing':
            case 'pending':
                return "bg-amber-500/10 text-amber-600 border-amber-500/20";
            case 'cancelled':
                return "bg-red-500/10 text-red-600 border-red-500/20";
            default:
                return "bg-blue-500/10 text-blue-600 border-blue-500/20";
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Orders</h2>
                    <p className="text-muted-foreground mt-1">
                        Track and manage customer orders ({totalOrders} total)
                    </p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-secondary/10">
                    <SearchInput placeholder="Search orders..." />
                    <div className="flex items-center space-x-2">
                        {/* Filter Buttons */}
                        <button className="px-3 py-2 bg-background border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors">
                            Filter Status
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center">
                                        <div className="flex justify-center items-center space-x-2 text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                            <span>Loading orders...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-sm">
                                            #{order.orderNumber || order._id.substring(order._id.length - 8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{order.customer?.name || "Guest"}</span>
                                                <span className="text-xs text-muted-foreground">{order.customer?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            <div className="flex items-center">
                                                <Calendar className="h-3 w-3 mr-2" />
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border",
                                                getStatusColor(order.status)
                                            )}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium">
                                            ${typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : order.totalAmount}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted rounded-md">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && totalPages > 1 && (
                    <div className="border-t border-border bg-muted/20">
                        <Pagination currentPage={page} totalPages={totalPages} />
                    </div>
                )}
            </div>
        </div>
    );
}
