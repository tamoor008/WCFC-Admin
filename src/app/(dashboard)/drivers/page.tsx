"use client";

import { useEffect, useState } from "react";
import {
    Loader2,
    Truck,
    MapPin,
    Phone,
    Mail,
    Search
} from "lucide-react";
import { adminService } from "@/lib/api";
import { SearchInput } from "@/components/ui/search-input";
import Link from "next/link";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Driver {
    _id: string;
    name: string;
    email: string;
    phone: string;
    picture: string;
    location?: {
        lat: number;
        lng: number;
        address: string;
        lastUpdated: string;
    };
    isBlocked: boolean;
}

export default function DriversPage() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchDrivers = async () => {
            setLoading(true);
            try {
                const response = await adminService.getDrivers();
                setDrivers(response.data);
            } catch (error) {
                console.error("Failed to fetch drivers:", error);
                toast.error("Failed to load drivers");
            } finally {
                setLoading(false);
            }
        };

        fetchDrivers();
    }, []);

    const filteredDrivers = drivers.filter(driver =>
        driver.name?.toLowerCase().includes(search.toLowerCase()) ||
        driver.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Drivers</h2>
                    <p className="text-muted-foreground mt-1">
                        Manage delivery drivers and track their location
                    </p>
                </div>
                {/* Could add 'Add Driver' button here if we had a create flow */}
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-secondary/10">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search drivers..."
                            className="w-full bg-background pl-9 pr-4 py-2 text-sm rounded-md border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <th className="px-6 py-4">Driver</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center">
                                        <div className="flex justify-center items-center space-x-2 text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                            <span>Loading drivers...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredDrivers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                        No drivers found.
                                    </td>
                                </tr>
                            ) : (
                                filteredDrivers.map((driver) => (
                                    <tr key={driver._id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                                    {driver.picture ? (
                                                        <img src={driver.picture} alt={driver.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Truck className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{driver.name}</p>
                                                    <p className="text-xs text-muted-foreground">ID: {driver._id.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-3 w-3" />
                                                    {driver.email}
                                                </div>
                                                {driver.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-3 w-3" />
                                                        {driver.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border",
                                                driver.isBlocked
                                                    ? "bg-red-500/10 text-red-600 border-red-500/20"
                                                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                            )}>
                                                {driver.isBlocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {driver.location ? (
                                                <div className="flex items-center gap-1.5 text-blue-600">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    <span className="truncate max-w-[150px]">{driver.location.address || "Online"}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">Offline</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/drivers/${driver._id}`}
                                                className="text-sm font-medium text-primary hover:underline"
                                            >
                                                View Profile
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
