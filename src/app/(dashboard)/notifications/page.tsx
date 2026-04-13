"use client";

import { useState, useEffect } from "react";
import { Send, Bell, Smartphone, CheckCircle, Clock, History } from "lucide-react";
import { adminService } from "@/lib/api";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function NotificationsPage() {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [pushTarget, setPushTarget] = useState("all");
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [fetchingHistory, setFetchingHistory] = useState(true);

    const fetchHistory = async () => {
        setFetchingHistory(true);
        try {
            const response = await adminService.getNotifications();
            setHistory(response.data);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setFetchingHistory(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleSendPush = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !body.trim()) {
            toast.error("Please provide both title and body");
            return;
        }

        setLoading(true);
        try {
            await adminService.sendNotification({
                title,
                body,
                target: pushTarget
            });
            toast.success("Notification sent successfully!");
            setTitle("");
            setBody("");
            fetchHistory(); // Refresh history
        } catch (error: any) {
            console.error("Failed to send push:", error);
            const errorMsg = error?.response?.data?.message || error?.response?.data?.error || "Failed to send notification";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
                    <Bell className="mr-3 h-8 w-8 text-primary" />
                    Push Notifications
                </h2>
                <p className="text-muted-foreground">
                    Send updates via Push Notifications to your users.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border bg-secondary/10">
                            <h3 className="font-semibold flex items-center">
                                <Send className="mr-2 h-4 w-4" />
                                Compose Push Notification
                            </h3>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSendPush} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="pushTarget" className="text-sm font-medium">Target Audience</label>
                                    <select
                                        id="pushTarget"
                                        value={pushTarget}
                                        onChange={(e) => setPushTarget(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <option value="all">All Registered Users</option>
                                        <option value="whitelist">Whitelist Users</option>
                                    </select>
                                    <p className="text-xs text-muted-foreground">
                                        Sends to users with active push tokens.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="title" className="text-sm font-medium">Title</label>
                                    <input
                                        id="title"
                                        placeholder="e.g. Flash Sale Alert! ⚡️"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                                        placeholder="Enter your push message..."
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                                        {loading ? "Processing..." : (
                                            <>
                                                <Send className="h-5 w-5 mr-2" />
                                                Send Push Notification
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
                            <div className="w-[280px] bg-background border-[8px] border-slate-800 rounded-[2rem] shadow-xl overflow-hidden relative flex flex-col">
                                {/* iPhone Notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-10"></div>
                                <div className="h-10 w-full bg-background flex items-center justify-between px-4 text-[10px] font-bold">
                                    <span>9:41</span>
                                </div>
                                <div className="pt-8 px-3">
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-lg border border-slate-200 dark:border-slate-700 transform transition-all duration-300">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <div className="h-6 w-6 rounded-md overflow-hidden flex-shrink-0 bg-primary/10 flex items-center justify-center">
                                                    <img src="/logo.png" alt="TS Solution" className="h-full w-full object-contain" />
                                                </div>
                                                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">TS Solution</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500">now</span>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{title || "Notification Title"}</h4>
                                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                                                {body || "Your notification message will appear here."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-auto pb-2 flex justify-center">
                                    <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Section */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mt-8">
                <div className="p-6 border-b border-border bg-secondary/10 flex justify-between items-center">
                    <h3 className="font-semibold flex items-center">
                        <History className="mr-2 h-4 w-4" />
                        Notification History
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-secondary/5 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-medium">Title & Message</th>
                                <th className="px-6 py-4 font-medium">Target</th>
                                <th className="px-6 py-4 font-medium">Sent At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {fetchingHistory ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center">
                                        <div className="flex justify-center items-center space-x-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                            <span>Loading history...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                                        No notifications sent yet.
                                    </td>
                                </tr>
                            ) : (
                                history.map((notification) => (
                                    <tr key={notification._id} className="hover:bg-secondary/5 transition-colors">
                                        <td className="px-6 py-4 max-w-md">
                                            <div className="font-semibold text-foreground">{notification.title}</div>
                                            <div className="text-muted-foreground line-clamp-2 text-xs mt-1">{notification.body}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                notification.target === 'all' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                            )}>
                                                {notification.target}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                            <div className="flex items-center">
                                                <Clock className="mr-2 h-3 w-3" />
                                                {format(new Date(notification.createdAt), "MMM d, yyyy h:mm a")}
                                            </div>
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

