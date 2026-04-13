"use client";

import { Sidebar } from "@/components/sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getAdminUser, logout } from "@/lib/auth";
import { adminService } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AlertCircle, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const user = getAdminUser();
    const [shopifyConnected, setShopifyConnected] = useState<boolean | null>(null);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const { data } = await adminService.getShopifyStatus();
                setShopifyConnected(data.connected);
            } catch (error) {
                console.error("Failed to check Shopify status", error);
            }
        };
        if (user) checkStatus();
    }, [pathname, user]);

    const handleLogout = async () => {
        try {
            await adminService.logout();
        } catch {
            // Still clear local state if API fails (e.g. network, 401)
        } finally {
            logout();
            router.push('/login');
        }
    };

    const getPageTitle = (path: string) => {
        const route = path.split('/')[1];
        if (!route || route === 'overview') return 'Overview';
        return route.charAt(0).toUpperCase() + route.slice(1);
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background text-foreground">
                <Sidebar onLogout={handleLogout} />
                <main className="pl-64 min-h-screen flex flex-col">
                    <header className="h-16 border-b border-border flex items-center px-8 bg-background/50 backdrop-blur-md sticky top-0 z-30">
                        <div className="flex-1">
                            <h1 className="text-lg font-semibold">{getPageTitle(pathname)}</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <ThemeToggle />
                            <div className="text-sm text-muted-foreground">
                                {user?.name || user?.email}
                            </div>
                            <div className="h-9 w-9 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden">
                                <span className="text-xs font-medium">
                                    {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A'}
                                </span>
                            </div>
                        </div>
                    </header>

                    {shopifyConnected === false && pathname !== '/settings' && (
                        <div className="bg-amber-500/10 border-b border-amber-500/20 px-8 py-3 flex items-center justify-between animate-in slide-in-from-top duration-500">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-amber-500/20 rounded-lg">
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                </div>
                                <p className="text-sm font-medium text-amber-800">
                                    Shopify store not connected. Products and orders will not synchronize.
                                </p>
                            </div>
                            <Link 
                                href="/settings" 
                                className="flex items-center gap-2 text-sm font-bold text-amber-900 hover:text-amber-700 transition-colors group"
                            >
                                Connect Store
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    )}

                    <div className="flex-1 p-8">
                        {children}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
