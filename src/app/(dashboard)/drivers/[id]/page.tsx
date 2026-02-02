"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Loader2,
    ArrowLeft,
    Truck,
    MapPin,
    Mail,
    Phone,
    Package,
    CheckCircle,
    XCircle,
    Clock
} from "lucide-react";
import { adminService } from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";

interface DriverDetails {
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
    stats: {
        totalOrders: number;
        delivered: number;
        failed: number;
    };
    joinedVia: string;
    createdAt: string;
}

export default function DriverProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [driver, setDriver] = useState<DriverDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDriver = async () => {
            try {
                const response = await adminService.getDriver(params.id as string);
                setDriver(response.data);
            } catch (error) {
                console.error("Failed to fetch driver:", error);
                toast.error("Failed to load driver details");
                router.push('/drivers');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchDriver();
        }
    }, [params.id, router]);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!driver) return null;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Link
                href="/drivers"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Drivers
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
                    <div className="flex flex-col items-center">
                        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden mb-4">
                            {driver.picture ? (
                                <img src={driver.picture} alt={driver.name} className="h-full w-full object-cover" />
                            ) : (
                                <Truck className="h-10 w-10 text-muted-foreground" />
                            )}
                        </div>
                        <h2 className="text-xl font-bold">{driver.name}</h2>
                        <p className="text-muted-foreground text-sm">Driver Since {new Date(driver.createdAt).getFullYear()}</p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{driver.email}</span>
                        </div>
                        {driver.phone && (
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{driver.phone}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{driver.location?.address || "Location unavailable"}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <Package className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Orders</p>
                                <p className="text-2xl font-bold">{driver.stats.totalOrders}</p>
                            </div>
                        </div>
                        <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Delivered</p>
                                <p className="text-2xl font-bold">{driver.stats.delivered}</p>
                            </div>
                        </div>
                        <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                <XCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Failed</p>
                                <p className="text-2xl font-bold">{driver.stats.failed}</p>
                            </div>
                        </div>
                    </div>

                    {/* Map Placeholder */}
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden min-h-[400px]">
                        <div className="p-4 border-b border-border bg-muted/30">
                            <h3 className="font-semibold flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Live Location
                            </h3>
                        </div>
                        <div className="w-full h-[400px] bg-muted/20 flex flex-col items-center justify-center relative">
                            {driver.location ? (
                                <>
                                    <div className="text-center p-6">
                                        <Truck className="h-12 w-12 text-primary mx-auto mb-2" />
                                        <p className="font-medium">Driver is currently here</p>
                                        <p className="text-sm text-muted-foreground mt-1">{driver.location.lat}, {driver.location.lng}</p>
                                        <p className="text-xs text-muted-foreground mt-2">Last updated: {new Date(driver.location.lastUpdated).toLocaleString()}</p>
                                    </div>
                                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                                        style={{
                                            backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                                            backgroundSize: '20px 20px'
                                        }}>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-muted-foreground">
                                    <p>No location data available for this driver.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
