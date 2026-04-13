"use client";

import { useEffect, useState } from "react";
import {
    MoreVertical,
    Search,
    ShoppingBag,
    Loader2,
    Calendar,
    User,
    DollarSign,
    Eye,
    X,
    MapPin,
    Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminService } from "@/lib/api";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

interface Order {
    _id: string;
    orderNumber?: string;
    displayId?: string;
    customer?: { name: string; email: string };
    totalAmount: number;
    subtotal?: number;
    deliveryFee?: number;
    tax?: number;
    tips?: number;
    status: string;
    courier?: string;
    trackingId?: string;
    createdAt: string;
    products?: Array<{
        productId?: {
            name?: string;
            image?: string;
            images?: string[];
            price?: number;
            variants?: Array<{
                name: string;
                image?: string;
            }>;
        } | string | null;
        quantity?: number;
        price?: number;
        variantName?: string | null;
        variantPrice?: number;
    }>;
    deliveryStatus?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
}

type OrderItem = NonNullable<Order["products"]>[number];

export default function OrdersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const page = Number(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);

    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const [savingStatus, setSavingStatus] = useState(false);

    const handleUpdateStatus = async (newStatus: string) => {
        if (!selectedOrder) return;
        setSavingStatus(true);
        try {
            await adminService.updateOrderStatus(selectedOrder._id, newStatus);
            toast.success("Status updated successfully");
            // Update local state
            setOrders(prev => prev.map(o => o._id === selectedOrder._id ? { ...o, status: newStatus } : o));
            setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        } catch (error: any) {
            toast.error(error.userMessage || "Failed to update status");
        } finally {
            setSavingStatus(false);
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await adminService.getOrders({ page, limit: 10, search, status });
                const data = response.data;
                const ordersList = data.orders || [];
                setOrders(ordersList);
                setTotalPages(data.pages || data.totalPages || 1);
                setTotalOrders(data.total || data.totalDocs || 0);
            } catch (error: any) {
                console.error("Failed to fetch orders:", error);
                toast.error(error.userMessage || "Failed to load orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [page, search, status]);

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

    const getItemDetails = (item: OrderItem) => {
        if (!item.productId || typeof item.productId === 'string') {
            return { name: "Unknown Product", image: null, variant: item.variantName };
        }
        const product = item.productId;
        let image = product.image || (product.images && product.images[0]) || null;

        if (item.variantName && product.variants) {
            const variant = product.variants.find(v => v.name === item.variantName);
            if (variant && variant.image) {
                image = variant.image;
            }
        }

        return {
            name: product.name || "Product",
            image,
            variant: item.variantName
        };
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-2xl rounded-xl shadow-xl border border-border overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40 sticky top-0">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                Order Details <span className="text-muted-foreground text-sm font-normal">#{selectedOrder.displayId || selectedOrder.orderNumber || selectedOrder._id.substring(selectedOrder._id.length - 8).toUpperCase()}</span>
                            </h3>
                            <button onClick={() => setSelectedOrder(null)} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/80 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Customer Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <User className="h-4 w-4" /> Customer
                                    </h4>
                                    <div className="bg-secondary/20 p-3 rounded-lg border border-border/50">
                                        <p className="font-medium text-foreground">{selectedOrder.customer?.name || "Guest"}</p>
                                        <p className="text-sm text-muted-foreground">{selectedOrder.customer?.email}</p>
                                        <p className="text-sm text-muted-foreground mt-2 font-mono bg-background/50 inline-block px-2 py-1 rounded">
                                            Order #: {selectedOrder.displayId || selectedOrder.orderNumber || selectedOrder._id}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <MapPin className="h-4 w-4" /> Delivery Details
                                    </h4>
                                    <div className="bg-secondary/20 p-3 rounded-lg border border-border/50">
                                        <p className="text-sm text-foreground">
                                            {selectedOrder.address?.street}<br />
                                            {selectedOrder.address?.city}, {selectedOrder.address?.state} {selectedOrder.address?.zipCode}
                                        </p>
                                        <div className="mt-2 flex gap-2">
                                            <span className={cn("text-xs font-medium px-2 py-1 rounded-full border", getStatusColor(selectedOrder.status))}>
                                                {selectedOrder.status}
                                            </span>
                                            {selectedOrder.deliveryStatus && (
                                                <span className="text-xs font-medium px-2 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                                                    {selectedOrder.deliveryStatus}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status Management section */}
                            <div className="space-y-3 bg-primary/5 p-4 rounded-xl border border-primary/20">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                                        <Loader2 className={cn("h-4 w-4", savingStatus && "animate-spin")} /> Order Status
                                    </h4>
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                        getStatusColor(selectedOrder.status)
                                    )}>
                                        Current: {selectedOrder.status}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <select 
                                        value={selectedOrder.status.toLowerCase()}
                                        onChange={(e) => handleUpdateStatus(e.target.value)}
                                        disabled={savingStatus}
                                        className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in-transit">In-Transit</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <ShoppingBag className="h-4 w-4" /> Order Items
                                </h4>
                                <div className="border border-border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
                                            <tr>
                                                <th className="px-4 py-3">Product</th>
                                                <th className="px-4 py-3 text-center">Qty</th>
                                                <th className="px-4 py-3 text-right">Price</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {selectedOrder.products?.map((item, idx) => {
                                                const details = getItemDetails(item);
                                                return (
                                                    <tr key={idx} className="bg-card">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden border border-border">
                                                                    {details.image ? (
                                                                        <img src={details.image} alt={details.name} className="h-full w-full object-cover" />
                                                                    ) : (
                                                                        <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-foreground">{details.name}</p>
                                                                    {details.variant && <p className="text-xs text-muted-foreground">{details.variant}</p>}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            Rs.{(
                                                                item.price ||
                                                                item.variantPrice ||
                                                                (typeof item.productId === 'object' && item.productId?.price) ||
                                                                0
                                                            ).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot className="bg-muted/20 font-medium text-sm">
                                            <tr>
                                                <td colSpan={2} className="px-4 py-2 text-right text-muted-foreground">Subtotal:</td>
                                                <td className="px-4 py-2 text-right text-foreground">Rs.{(selectedOrder.subtotal || selectedOrder.totalAmount).toFixed(2)}</td>
                                            </tr>
                                            <tr>
                                                <td colSpan={2} className="px-4 py-2 text-right text-muted-foreground">Delivery Fee:</td>
                                                <td className="px-4 py-2 text-right text-foreground">Rs.{(selectedOrder.deliveryFee || 0).toFixed(2)}</td>
                                            </tr>
                                            <tr>
                                                <td colSpan={2} className="px-4 py-2 text-right text-muted-foreground">Tax:</td>
                                                <td className="px-4 py-2 text-right text-foreground">Rs.{(selectedOrder.tax || 0).toFixed(2)}</td>
                                            </tr>
                                            {selectedOrder.tips && selectedOrder.tips > 0 && (
                                                <tr>
                                                    <td colSpan={2} className="px-4 py-2 text-right text-muted-foreground">Tips:</td>
                                                    <td className="px-4 py-2 text-right text-foreground">Rs.{selectedOrder.tips.toFixed(2)}</td>
                                                </tr>
                                            )}
                                            <tr className="border-t border-border font-bold text-base">
                                                <td colSpan={2} className="px-4 py-3 text-right">Total:</td>
                                                <td className="px-4 py-3 text-right">Rs.{selectedOrder.totalAmount.toFixed(2)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-border bg-muted/20 flex justify-end gap-2">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Orders</h2>
                    <p className="text-muted-foreground mt-1">
                        Track and manage customer orders ({totalOrders} total)
                    </p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex flex-col gap-4 bg-secondary/10">
                    <SearchInput placeholder="Search orders..." />
                    <div className="flex flex-col gap-2 w-full overflow-x-auto">
                        {/* Filter Buttons */}
                        <div className="flex gap-2 min-w-max pb-2">
                            {['all', 'pending', 'in-transit', 'delivered', 'cancelled'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => {
                                        const params = new URLSearchParams(searchParams.toString());
                                        if (f !== 'all') {
                                            params.set("status", f);
                                        } else {
                                            params.delete("status");
                                        }
                                        params.set("page", "1"); // Reset to page 1
                                        router.push(`?${params.toString()}`);
                                    }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${(status === f || (!status && f === 'all'))
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                        }`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
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
                                <th className="px-6 py-4">Items</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center">
                                        <div className="flex justify-center items-center space-x-2 text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                            <span>Loading orders...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
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
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            <div className="space-y-2">
                                                {(order.products || []).slice(0, 2).map((item, i) => {
                                                    const details = getItemDetails(item);
                                                    return (
                                                        <div key={i} className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded bg-muted flex-shrink-0 overflow-hidden border border-border/50">
                                                                {details.image ? (
                                                                    <img src={details.image} alt="" className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center">
                                                                        <ShoppingBag className="h-4 w-4 text-muted-foreground/50" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium truncate max-w-[150px]">{details.name}</p>
                                                                {details.variant && <p className="text-xs text-muted-foreground truncate">{details.variant}</p>}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                                {(order.products || []).length > 2 && (
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="text-xs text-primary font-medium hover:underline pl-1"
                                                    >
                                                        +{(order.products || []).length - 2} more items...
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium">
                                            Rs.{typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : order.totalAmount}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-md hover:bg-primary/20 transition-colors"
                                                >
                                                    View Details
                                                </button>
                                            </div>
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
