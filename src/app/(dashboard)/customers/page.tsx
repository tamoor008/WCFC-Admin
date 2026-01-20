"use client";

import {
    Search,
    MoreVertical,
    Mail,
    Phone,
    MapPin,
    Calendar,
    UserPlus,
    ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const customers = [
    { id: "1", name: "Sarah Connor", email: "sarah@example.com", phone: "+1 (555) 123-4567", orders: 12, spent: "$2,450.00", status: "Active", joined: "Oct 2025" },
    { id: "2", name: "John Doe", email: "john@example.com", phone: "+1 (555) 987-6543", orders: 5, spent: "$890.50", status: "Active", joined: "Dec 2025" },
    { id: "3", name: "Michael Smith", email: "mike@example.com", phone: "+1 (555) 456-7890", orders: 1, spent: "$49.00", status: "Inactive", joined: "Jan 2026" },
    { id: "4", name: "Emily Davis", email: "emily@example.com", phone: "+1 (555) 246-1357", orders: 28, spent: "$5,120.20", status: "VIP", joined: "May 2024" },
    { id: "5", name: "Robert Wilson", email: "rob@example.com", phone: "+1 (555) 369-1470", orders: 8, spent: "$1,199.00", status: "Active", joined: "Nov 2025" },
];

export default function CustomersPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Customers</h2>
                    <p className="text-muted-foreground mt-1">
                        Browse and manage your customer directory and their purchase history.
                    </p>
                </div>
                <button className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
                    <UserPlus className="h-5 w-5" />
                    <span>Add Customer</span>
                </button>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm">
                <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search customers..."
                            className="w-full pl-10 pr-4 py-2 bg-secondary border-none rounded-lg text-sm outline-none ring-primary/20 focus:ring-2 transition-all"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="px-3 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors">
                            Advanced Search
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border bg-secondary/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Orders</th>
                                <th className="px-6 py-4">Total Spent</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {customers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-secondary/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center font-bold text-xs border border-border">
                                                {customer.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold">{customer.name}</span>
                                                <span className="text-xs text-muted-foreground italic">{customer.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md",
                                            customer.status === "VIP" ? "bg-primary/10 text-primary border border-primary/20" :
                                                customer.status === "Active" ? "bg-emerald-500/10 text-emerald-500" :
                                                    "bg-muted text-muted-foreground"
                                        )}>
                                            {customer.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">{customer.orders}</td>
                                    <td className="px-6 py-4 text-sm font-bold">{customer.spent}</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{customer.joined}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary rounded-md">
                                            <MoreVertical className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
