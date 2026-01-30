"use client";

import { useEffect, useState, useRef } from "react";
import {
    MoreVertical,
    UserPlus,
    Mail,
    Phone,
    Calendar,
    Loader2,
    MapPin,
    Ban,
    UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminService } from "@/lib/api";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Address {
    label?: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
}

interface Referrer {
    _id: string;
    name: string;
    displayId?: string | null;
    email: string;
}

interface Customer {
    _id: string;
    displayId?: string | null;
    referralCode?: string | null;
    name: string;
    email: string;
    emailVerified?: boolean;
    phone?: string;
    createdAt: string;
    orderCount?: number;
    totalSpent?: number;
    isActive: boolean;
    isBlocked?: boolean;
    addresses?: Address[];
    joinedVia?: 'whitelist' | 'referral' | null;
    referrer?: Referrer | null;
}

function ActionMenu({ customer, onToggleBlock, triggerRef, onClose }: { customer: Customer, onToggleBlock: () => void, triggerRef: HTMLElement | null, onClose: () => void }) {
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (triggerRef) {
            const rect = triggerRef.getBoundingClientRect();
            // Position: align right edge of menu with right edge of trigger, and below trigger
            setCoords({
                top: rect.bottom + window.scrollY + 5,
                left: rect.right + window.scrollX - 192 // 192px is w-48 (12rem)
            });
        }
    }, [triggerRef]);

    // Use a portal-like approach by using fixed position relative to viewport
    // Note: In a real portal we would append to body, but fixed with high Z-index usually works if parents don't transform.
    return (
        <div
            className="fixed w-48 rounded-lg shadow-lg z-[9999] overflow-hidden bg-card border border-border"
            style={{
                top: coords.top - window.scrollY, // adjustments for fixed pos
                left: coords.left - window.scrollX,
            }}
        >
            <div onClick={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleBlock();
                    }}
                    className={cn(
                        "w-full flex items-center px-4 py-3 text-sm font-semibold transition-colors text-left",
                        "w-full flex items-center px-4 py-2.5 text-sm font-medium transition-colors text-left rounded-md mx-1 my-1 w-[calc(100%-8px)]",
                        customer.isBlocked
                            ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            : "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    )}
                >
                    {customer.isBlocked ? (
                        <>
                            <UserCheck className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span>Unblock Customer</span>
                        </>
                    ) : (
                        <>
                            <Ban className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span>Block Customer</span>
                        </>
                    )}
                </button>
            </div>
            {/* Backdrop to handle click outside more robustly if needed, 
                though the existing document listener should handle it. 
                Optimally we act as a modal. */}
        </div>
    );
}

export default function CustomersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const page = Number(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const [status, setStatus] = useState(searchParams.get("status") || "all");

    useEffect(() => {
        const fetchCustomers = async () => {
            setLoading(true);
            try {
                // Assuming the API returns { customers: [], totalPages: number, total: number }
                // Adjust based on actual API response structure
                const response = await adminService.getCustomers({ page, limit: 10, search, status });

                // Handle different possible response structures safely
                const data = response.data;
                const customerList = data.customers || data.users || [];
                setCustomers(customerList);
                setTotalPages(data.totalPages || 1);
                setTotalCustomers(data.totalDocs || data.total || 0);

            } catch (error) {
                console.error("Failed to fetch customers:", error);
                toast.error("Failed to load customers");
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, [page, search, status]);

    const handleFilterChange = (newStatus: string) => {
        setStatus(newStatus);
        const params = new URLSearchParams(searchParams.toString());
        if (newStatus !== 'all') {
            params.set("status", newStatus);
        } else {
            params.delete("status");
        }
        params.set("page", "1"); // Reset to page 1
        router.push(`?${params.toString()}`);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | Event) => {
            if (openMenuId && menuRefs.current[openMenuId]) {
                const menuElement = menuRefs.current[openMenuId];
                if (menuElement && !menuElement.contains((event.target as Node))) {
                    setOpenMenuId(null);
                }
            }
        };

        if (openMenuId) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('scroll', handleClickOutside, true);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('scroll', handleClickOutside, true);
        };
    }, [openMenuId]);

    const handleBlockToggle = async (customerId: string, currentStatus: boolean) => {
        try {
            await adminService.blockCustomer(customerId, !currentStatus);
            toast.success(currentStatus ? 'Customer unblocked successfully' : 'Customer blocked successfully');
            // Refresh customers list
            const response = await adminService.getCustomers({ page, limit: 10, search });
            const data = response.data;
            setCustomers(data.customers || data.users || []);
            setOpenMenuId(null);
        } catch (error: any) {
            console.error("Failed to update customer status:", error);
            toast.error(error?.response?.data?.error || "Failed to update customer status");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Customers</h2>
                    <p className="text-muted-foreground mt-1">
                        Manage your customer base ({totalCustomers} total)
                    </p>
                </div>
                <button
                    onClick={() => router.push('/customers/new')}
                    className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95">
                    <UserPlus className="h-5 w-5" />
                    <span>Add Customer</span>
                </button>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-secondary/10">
                    <SearchInput placeholder="Search by name, email or phone..." />
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                        {['all', 'active', 'inactive', 'blocked'].map((f) => (
                            <button
                                key={f}
                                onClick={() => handleFilterChange(f)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                                    (status === f || (!status && f === 'all'))
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                )}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto overflow-y-visible">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Joined via</th>
                                <th className="px-6 py-4">Referrer</th>
                                <th className="px-6 py-4">Addresses</th>
                                <th className="px-6 py-4">Referral Code</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center">
                                        <div className="flex justify-center items-center space-x-2 text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                            <span>Loading customers...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-muted-foreground">
                                        No customers found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr
                                        key={customer._id}
                                        onClick={() => router.push(`/customers/${customer._id}`)}
                                        className="hover:bg-muted/30 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 flex-shrink-0">
                                                    {customer.name
                                                        ? customer.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                                                        : 'U'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold">{customer.name || 'Unknown'}</span>
                                                    <span className="text-xs text-muted-foreground">Display ID: {customer.displayId || customer._id.toString().slice(-6)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full",
                                                customer.isBlocked
                                                    ? "bg-red-500/10 text-red-600 border border-red-500/20"
                                                    : customer.isActive !== false
                                                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                                        : "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
                                            )}>
                                                {customer.isBlocked ? "Blocked" : customer.isActive !== false ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Mail className="h-3 w-3 mr-2" />
                                                    {customer.email}
                                                </div>
                                                {customer.emailVerified === false && (
                                                    <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded w-fit">
                                                        Email not verified
                                                    </span>
                                                )}
                                                {customer.phone && (
                                                    <div className="flex items-center text-sm text-muted-foreground">
                                                        <Phone className="h-3 w-3 mr-2" />
                                                        {customer.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {customer.joinedVia === 'whitelist' ? (
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full",
                                                    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                                )}>
                                                    Whitelist
                                                </span>
                                            ) : customer.joinedVia === 'referral' ? (
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full",
                                                    "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20"
                                                )}>
                                                    Referral
                                                </span>
                                            ) : (
                                                <span className="text-sm text-muted-foreground italic">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {customer.referrer ? (
                                                <div className="flex flex-col space-y-0.5 max-w-[180px]">
                                                    <span className="text-sm font-medium text-foreground truncate" title={customer.referrer.email}>
                                                        {customer.referrer.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground font-mono">
                                                        {customer.referrer.displayId || customer.referrer._id}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground italic">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {customer.addresses && customer.addresses.length > 0 ? (
                                                <div className="flex flex-col space-y-2 max-w-xs">
                                                    {customer.addresses.map((address, idx) => (
                                                        <div key={idx} className="flex items-start space-x-2 text-sm">
                                                            <MapPin className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                                                            <div className="flex flex-col">
                                                                {address.label && (
                                                                    <span className="font-semibold text-foreground">{address.label}</span>
                                                                )}
                                                                <span className="text-muted-foreground">
                                                                    {[
                                                                        address.street,
                                                                        address.city,
                                                                        address.state,
                                                                        address.zipCode
                                                                    ].filter(Boolean).join(', ')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground italic">No addresses</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-mono text-muted-foreground">
                                                {customer.referralCode || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            <div className="flex items-center">
                                                <Calendar className="h-3 w-3 mr-2" />
                                                {new Date(customer.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="relative inline-block" ref={(el) => { menuRefs.current[customer._id] = el; }}>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (openMenuId === customer._id) {
                                                            setOpenMenuId(null);
                                                        } else {
                                                            setOpenMenuId(customer._id);
                                                        }
                                                    }}
                                                    className="p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted rounded-md"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </button>
                                                {openMenuId === customer._id && (
                                                    <ActionMenu
                                                        customer={customer}
                                                        onToggleBlock={() => handleBlockToggle(customer._id, customer.isBlocked || false)}
                                                        triggerRef={menuRefs.current[customer._id]}
                                                        onClose={() => setOpenMenuId(null)}
                                                    />
                                                )}
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
