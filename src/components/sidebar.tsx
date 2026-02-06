"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Settings,
    Package,
    BarChart3,
    LogOut,
    Tags,
    Bell,
    ListChecks,
    Star,
    Truck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AlertModal } from "@/components/ui/alert-modal";
import { useState } from "react";

const navigation = [
    { name: "Dashboard", href: "/overview", icon: LayoutDashboard },
    { name: "Products", href: "/products", icon: Package },
    { name: "Categories", href: "/categories", icon: Tags },
    { name: "Orders", href: "/orders", icon: ShoppingBag },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Drivers", href: "/drivers", icon: Truck },
    { name: "Reviews", href: "/reviews", icon: Star },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Whitelist", href: "/whitelist", icon: ListChecks },
    { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
    onLogout?: () => void | Promise<void>;
}

export function Sidebar({ onLogout }: SidebarProps) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const onConfirm = async () => {
        try {
            setLoading(true);
            if (onLogout) {
                await onLogout();
            }
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setLoading(false);
            setOpen(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-64 bg-card border-r border-border fixed left-0 top-0 z-40">
            <div className="flex items-center justify-between h-16 px-6 border-b border-border">
                <span className="text-xl font-bold text-primary">
                    WCFC Admin
                </span>
                {(process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_SHOW_DANGER_ZONE === 'true') && (
                    <span className="bg-amber-100 text-amber-700 text-[10px] uppercase font-bold px-2 py-1 rounded-full border border-amber-200">
                        Dev Mode
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-white" : "text-muted-foreground")} />
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-border">
                <button
                    onClick={() => setOpen(true)}
                    className="flex w-full items-center px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                </button>
            </div>
            <AlertModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={onConfirm}
                loading={loading}
                title="Are you sure?"
                description="This action cannot be undone."
            />
        </div>
    );
}
