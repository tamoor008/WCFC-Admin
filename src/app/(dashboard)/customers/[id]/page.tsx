"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Loader2,
    User,
    Ban,
    UserCheck,
    Hash,
    CreditCard,
    ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminService } from "@/lib/api";
import toast from "react-hot-toast";

interface Address {
    label?: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    lat?: number;
    lng?: number;
}

interface Referrer {
    _id: string;
    name: string;
    displayId?: string | null;
    email: string;
}

interface Order {
    _id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    customerName?: string;
    email?: string;
    address?: { street?: string; city?: string; state?: string; zipCode?: string };
    products?: { productId: string; quantity: number; variantName?: string | null; variantPrice?: number | null }[];
}

interface CustomerDetail {
    _id: string;
    name: string;
    email: string;
    picture?: string | null;
    phone?: string | null;
    displayId?: string | null;
    referralCode?: string | null;
    joinedVia?: "whitelist" | "referral" | null;
    referrer?: Referrer | null;
    authProvider?: string;
    birthDate?: string | null;
    zipCode?: string | null;
    isAgeVerified?: boolean;
    isLocationVerified?: boolean;
    emailVerified?: boolean;
    isBlocked?: boolean;
    kyc?: { status?: string };
    createdAt: string;
    lastLogin?: string | null;
    addresses: Address[];
    orders: Order[];
    orderCount: number;
    totalSpent: number;
}

export default function CustomerDetailPage() {
    const params = useParams();
    const id = typeof params?.id === "string" ? params.id : "";
    const [customer, setCustomer] = useState<CustomerDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [blocking, setBlocking] = useState(false);

    useEffect(() => {
        const fetchCustomer = async () => {
            setLoading(true);
            try {
                const res = await adminService.getCustomer(id);
                setCustomer(res.data);
            } catch (e) {
                console.error("Failed to fetch customer:", e);
                toast.error("Customer not found");
                setCustomer(null);
            } finally {
                setLoading(false);
            }
        };
        if (!id) return;
        fetchCustomer();
    }, [id]);

    const handleBlockToggle = async () => {
        if (!customer) return;
        const newBlocked = !customer.isBlocked;
        setBlocking(true);
        try {
            await adminService.blockCustomer(customer._id, newBlocked);
            setCustomer((c) => (c ? { ...c, isBlocked: newBlocked } : null));
            toast.success(newBlocked ? "Customer blocked" : "Customer unblocked");
        } catch (e) {
            toast.error("Failed to update block status");
        } finally {
            setBlocking(false);
        }
    };

    const getStatusColor = (status: string) => {
        const s = (status || "").toLowerCase();
        if (s === "delivered" || s === "completed") return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
        if (s === "processing" || s === "pending") return "bg-amber-500/10 text-amber-600 border-amber-500/20";
        if (s === "cancelled") return "bg-red-500/10 text-red-600 border-red-500/20";
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    };

    if (!id) {
        return (
            <div className="space-y-6">
                <Link href="/customers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" /> Back to customers
                </Link>
                <p className="text-muted-foreground">Invalid customer ID.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="space-y-6">
                <Link
                    href="/customers"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to customers
                </Link>
                <p className="text-muted-foreground">Customer not found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/customers"
                        className="p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                    </Link>
                    <div className="flex items-center gap-3">
                        {customer.picture ? (
                            <img
                                src={customer.picture}
                                alt={customer.name}
                                className="h-14 w-14 rounded-full object-cover border border-border"
                            />
                        ) : (
                            <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20">
                                {customer.name ? customer.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "U"}
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">{customer.name || "Unknown"}</h1>
                            <p className="text-sm text-muted-foreground font-mono">
                                Display ID: {customer.displayId || customer._id.toString().slice(-6)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border",
                            customer.isBlocked
                                ? "bg-red-500/10 text-red-600 border-red-500/20"
                                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        )}
                    >
                        {customer.isBlocked ? "Blocked" : "Active"}
                    </span>
                    {customer.joinedVia && (
                        <span
                            className={cn(
                                "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border",
                                customer.joinedVia === "whitelist"
                                    ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                    : "bg-violet-500/10 text-violet-600 border-violet-500/20"
                            )}
                        >
                            {customer.joinedVia === "whitelist" ? "Whitelist" : "Referral"}
                        </span>
                    )}
                    <button
                        onClick={handleBlockToggle}
                        disabled={blocking}
                        className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                            customer.isBlocked
                                ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20"
                        )}
                    >
                        {blocking ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : customer.isBlocked ? (
                            <UserCheck className="h-4 w-4" />
                        ) : (
                            <Ban className="h-4 w-4" />
                        )}
                        {customer.isBlocked ? "Unblock" : "Block"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile & contact */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <User className="h-5 w-5 text-muted-foreground" />
                        Profile & contact
                    </h2>
                    <dl className="space-y-4">
                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Email</dt>
                            <dd className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <a href={`mailto:${customer.email}`} className="text-primary hover:underline">
                                    {customer.email}
                                </a>
                            </dd>
                        </div>
                        {customer.phone && (
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Phone</dt>
                                <dd className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    {customer.phone}
                                </dd>
                            </div>
                        )}
                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Auth</dt>
                            <dd className="text-sm capitalize">{customer.authProvider || "—"}</dd>
                        </div>
                        {customer.birthDate && (
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Birth date</dt>
                                <dd className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {new Date(customer.birthDate).toLocaleDateString()}
                                </dd>
                            </div>
                        )}
                        {customer.zipCode && (
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">ZIP</dt>
                                <dd className="text-sm">{customer.zipCode}</dd>
                            </div>
                        )}
                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Joined</dt>
                            <dd className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {new Date(customer.createdAt).toLocaleString()}
                            </dd>
                        </div>
                        {customer.lastLogin && (
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Last login</dt>
                                <dd className="text-sm">{new Date(customer.lastLogin).toLocaleString()}</dd>
                            </div>
                        )}
                        {customer.kyc?.status && (
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">KYC</dt>
                                <dd className="text-sm capitalize">{customer.kyc.status}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {/* Identifiers & referrer */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Hash className="h-5 w-5 text-muted-foreground" />
                        Identifiers & referral
                    </h2>
                    <dl className="space-y-4">
                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Display ID</dt>
                            <dd className="text-sm font-mono">{customer.displayId || "—"}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Referral code</dt>
                            <dd className="text-sm font-mono">{customer.referralCode || "—"}</dd>
                        </div>
                        {customer.referrer && (
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Referred by</dt>
                                <dd className="text-sm">
                                    <span className="font-medium">{customer.referrer.name}</span>
                                    <span className="text-muted-foreground mx-1">·</span>
                                    <span className="font-mono">{customer.referrer.displayId || customer.referrer._id}</span>
                                    <br />
                                    <a href={`mailto:${customer.referrer.email}`} className="text-primary hover:underline text-xs">
                                        {customer.referrer.email}
                                    </a>
                                </dd>
                            </div>
                        )}
                    </dl>
                </div>
            </div>

            {/* Addresses */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    Addresses
                </h2>
                {customer.addresses && customer.addresses.length > 0 ? (
                    <div className="space-y-4">
                        {customer.addresses.map((addr, idx) => (
                            <div
                                key={idx}
                                className="p-4 rounded-lg bg-muted/30 border border-border flex justify-between items-start"
                            >
                                <div>
                                    {addr.label && (
                                        <p className="text-sm font-semibold text-foreground mb-1">{addr.label}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        {[addr.street, addr.city, addr.state, addr.zipCode].filter(Boolean).join(", ")}
                                    </p>
                                </div>
                                {addr.lat && addr.lng && (
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${addr.lat},${addr.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors bg-primary/10 px-2 py-1 rounded hover:bg-primary/20"
                                    >
                                        <MapPin className="h-3 w-3" />
                                        View on Map
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground italic">No addresses on file.</p>
                )}
            </div>

            {/* Orders */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                        Orders
                    </h2>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                            {customer.orderCount} order{customer.orderCount !== 1 ? "s" : ""}
                        </span>
                        <span className="font-semibold flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            Total spent: ${customer.totalSpent.toFixed(2)}
                        </span>
                    </div>
                </div>
                {customer.orders && customer.orders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <th className="px-6 py-3">Order ID</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {customer.orders.map((o) => (
                                    <tr key={o._id} className="hover:bg-muted/30">
                                        <td className="px-6 py-4 font-mono text-sm">{o._id.toString().slice(-8)}</td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {new Date(o.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={cn(
                                                    "text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border",
                                                    getStatusColor(o.status)
                                                )}
                                            >
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-right">
                                            ${(o.totalAmount || 0).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-muted-foreground text-sm">No orders yet.</div>
                )}
            </div>
        </div>
    );
}
