"use client";

import { useState } from "react";
import { adminService } from "@/lib/api";
import { Bell, Send, CheckCircle, Smartphone } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(false);
    const [target, setTarget] = useState("all");

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !body.trim()) {
            toast.error("Please provide both title and body");
            return;
        }

        setLoading(true);
        try {
            const response = await adminService.sendNotification({
                title,
                body,
                target
            });

            toast.success(response.data.message || "Notification sent successfully!");
            setTitle("");
            setBody("");
        } catch (error: any) {
            console.error("Failed to send notification:", error);
            const errorMsg = error?.response?.data?.message || error?.response?.data?.error || "Failed to send notification";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
                    <Bell className="mr-3 h-8 w-8 text-primary" />
                    Push Notifications
                </h2>
                <p className="text-muted-foreground">
                    Send updates, alerts, and promotional messages directly to your users' devices.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border bg-secondary/10">
                            <h3 className="font-semibold flex items-center">
                                <Send className="mr-2 h-4 w-4" />
                                Compose Message
                            </h3>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSend} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="target" className="text-sm font-medium">Target Audience</label>
                                    <select
                                        id="target"
                                        value={target}
                                        onChange={(e) => setTarget(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="all">All Registered Users</option>
                                        <option value="whitelist">Whitelist Users</option>
                                        <option value="referral">Referral Based Users</option>
                                    </select>
                                    <p className="text-xs text-muted-foreground">
                                        {target === "all" && "Sends to all users with active push tokens."}
                                        {target === "whitelist" && "Sends only to users who joined via whitelist."}
                                        {target === "referral" && "Sends only to users who joined via a referral code."}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="title" className="text-sm font-medium">Title</label>
                                    <input
                                        id="title"
                                        placeholder="e.g. Flash Sale Alert! ⚡️"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="body" className="text-sm font-medium">Message Body</label>
                                    <textarea
                                        id="body"
                                        rows={5}
                                        placeholder="Enter your message here..."
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={cn(
                                            "w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold shadow-md transition-all",
                                            "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]",
                                            loading && "opacity-70 cursor-not-allowed"
                                        )}
                                    >
                                        {loading ? (
                                            <>Processing...</>
                                        ) : (
                                            <>
                                                <Send className="h-5 w-5 mr-2" />
                                                Send Notification
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-1">
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden h-fit sticky top-24">
                        <div className="p-4 border-b border-border bg-secondary/10">
                            <h3 className="font-semibold flex items-center text-sm">
                                <Smartphone className="mr-2 h-4 w-4" />
                                Preview
                            </h3>
                        </div>
                        <div className="p-6 bg-slate-100 dark:bg-slate-900 flex justify-center min-h-[400px]">
                            {/* iPhone Mockup */}
                            <div className="w-[280px] bg-background border-[8px] border-slate-800 rounded-[2rem] shadow-xl overflow-hidden relative flex flex-col">
                                {/* Notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-10"></div>

                                {/* Status Bar area */}
                                <div className="h-10 w-full bg-background flex items-center justify-between px-6 text-[10px] font-bold">
                                    <span>9:41</span>
                                    <div className="flex space-x-1">
                                        <div className="w-3 h-3 bg-foreground rounded-full opacity-20"></div>
                                        <div className="w-3 h-3 bg-foreground rounded-full opacity-20"></div>
                                    </div>
                                </div>

                                {/* Notification Card */}
                                <div className="pt-8 px-3">
                                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-border/50 transform transition-all duration-300">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <div className="h-6 w-6 rounded-md overflow-hidden flex-shrink-0 bg-primary/10 flex items-center justify-center">
                                                    <img src="/wcfclogo.png" alt="WCFC" className="h-full w-full object-contain" />
                                                </div>
                                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">WCFC</span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground">now</span>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-semibold leading-tight">{title || "Notification Title"}</h4>
                                            <p className="text-xs text-muted-foreground leading-snug">
                                                {body || "Your notification message will appear here exactly as the user sees it."}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Home Indicator */}
                                <div className="mt-auto pb-2 flex justify-center">
                                    <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4">
                        <div className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 shrink-0" />
                            <div>
                                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Best Practices</h4>
                                <ul className="mt-2 text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                                    <li>Keep titles under 40 characters</li>
                                    <li>Be clear and concise with your message</li>
                                    <li>Use emojis to increase engagement 🚀</li>
                                    <li>Test with a small group first if possible</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
