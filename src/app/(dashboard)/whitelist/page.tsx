"use client";

import { useEffect, useState } from "react";
import { Mail, Plus, Trash2, Loader2 } from "lucide-react";
import { adminService } from "@/lib/api";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function WhitelistPage() {
    const [emails, setEmails] = useState<{ _id: string; email: string; createdAt: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [addEmail, setAddEmail] = useState("");
    const [role, setRole] = useState<'user' | 'driver'>('user');
    const [adding, setAdding] = useState(false);
    const [removing, setRemoving] = useState<string | null>(null);

    const fetchWhitelist = async () => {
        try {
            setLoading(true);
            const res = await adminService.getWhitelist(role);
            setEmails(res.data);
        } catch (e) {
            console.error("Failed to fetch whitelist:", e);
            toast.error("Failed to load whitelist");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWhitelist();
    }, [role]);

    const handleAdd = async () => {
        const email = addEmail.trim().toLowerCase();
        if (!email) {
            toast.error("Enter an email address");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Enter a valid email address");
            return;
        }
        try {
            setAdding(true);
            await adminService.addWhitelist(email, role);
            setAddEmail("");
            toast.success("Email added to whitelist");
            fetchWhitelist();
        } catch (e: any) {
            toast.error(e?.response?.data?.error || "Failed to add email");
        } finally {
            setAdding(false);
        }
    };

    const handleRemove = async (email: string) => {
        try {
            setRemoving(email);
            await adminService.removeWhitelist(email);
            toast.success("Removed from whitelist");
            fetchWhitelist();
        } catch (e: any) {
            toast.error(e?.response?.data?.error || "Failed to remove");
        } finally {
            setRemoving(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Whitelist</h2>
                <p className="text-muted-foreground mt-1">
                    Manage invite-only access for customers and drivers.
                </p>
                <div className="flex space-x-4 mt-4 border-b">
                    <button
                        onClick={() => setRole('user')}
                        className={cn(
                            "pb-2 text-sm font-medium transition-colors border-b-2",
                            role === 'user'
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Customers
                    </button>
                    <button
                        onClick={() => setRole('driver')}
                        className={cn(
                            "pb-2 text-sm font-medium transition-colors border-b-2",
                            role === 'driver'
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Drivers
                    </button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 bg-secondary/10">
                    <div className="flex-1 flex gap-2">
                        <input
                            type="email"
                            placeholder="Add email (e.g. user@example.com)"
                            value={addEmail}
                            onChange={(e) => setAddEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                        <button
                            onClick={handleAdd}
                            disabled={adding}
                            className={cn(
                                "inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                            )}
                        >
                            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            Add
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-border">
                    {loading ? (
                        <div className="p-8 flex justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : emails.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            No whitelisted emails yet. Add emails to allow signup without a referral code.
                        </div>
                    ) : (
                        emails.map((item) => (
                            <div
                                key={item._id}
                                className="flex items-center justify-between px-4 py-3 hover:bg-muted/30"
                            >
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-mono text-sm">{item.email}</span>
                                </div>
                                <button
                                    onClick={() => handleRemove(item.email)}
                                    disabled={removing === item.email}
                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50"
                                    title="Remove from whitelist"
                                >
                                    {removing === item.email ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
