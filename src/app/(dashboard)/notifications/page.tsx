"use client";

import { useState } from "react";
import { adminService } from "@/lib/api";
import { Bell, Send, CheckCircle, Smartphone } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
    const [activeTab, setActiveTab] = useState<"push" | "email">("push");

    // Push State
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [pushTarget, setPushTarget] = useState("all");

    // Email State
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [emailTarget, setEmailTarget] = useState("all"); // whitelisted, referred, all, blocked
    const [testEmail, setTestEmail] = useState("");

    const [loading, setLoading] = useState(false);

    const handleSendPush = async (e: React.FormEvent) => {
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
                target: pushTarget
            });
            toast.success(response.data.message || "Notification sent successfully!");
            setTitle("");
            setBody("");
        } catch (error: any) {
            console.error("Failed to send push:", error);
            const errorMsg = error?.response?.data?.message || error?.response?.data?.error || "Failed to send notification";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !message.trim()) {
            toast.error("Please provide subject and message");
            return;
        }

        setLoading(true);
        try {
            const response = await adminService.sendEmail({
                subject,
                message,
                targetGroup: testEmail ? undefined : emailTarget,
                testEmail: testEmail || undefined
            });
            toast.success(response.data.message || "Email sent successfully!");
            if (!testEmail) {
                // Only clear if sent to group, keep for testing if using test email
                setSubject("");
                setMessage("");
            }
        } catch (error: any) {
            console.error("Failed to send email:", error);
            const errorMsg = error?.response?.data?.message || error?.response?.data?.error || "Failed to send email";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
                    <Bell className="mr-3 h-8 w-8 text-primary" />
                    Notifications Center
                </h2>
                <p className="text-muted-foreground">
                    Send updates via Push Notifications or Email to your users.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 rounded-xl bg-muted p-1">
                <button
                    onClick={() => setActiveTab("push")}
                    className={cn(
                        "w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                        activeTab === "push"
                            ? "bg-background text-foreground shadow"
                            : "text-muted-foreground hover:bg-white/[0.12] hover:text-white"
                    )}
                >
                    Push Notifications
                </button>
                <button
                    onClick={() => setActiveTab("email")}
                    className={cn(
                        "w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                        activeTab === "email"
                            ? "bg-background text-foreground shadow"
                            : "text-muted-foreground hover:bg-white/[0.12] hover:text-white"
                    )}
                >
                    Email Notifications
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border bg-secondary/10">
                            <h3 className="font-semibold flex items-center">
                                <Send className="mr-2 h-4 w-4" />
                                {activeTab === "push" ? "Compose Push Notification" : "Compose Email"}
                            </h3>
                        </div>
                        <div className="p-6">
                            {activeTab === "push" ? (
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
                                            <option value="referral">Referral Based Users</option>
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
                            ) : (
                                <form onSubmit={handleSendEmail} className="space-y-6">
                                    <div className="p-4 bg-muted/50 rounded-lg space-y-4 border border-border">
                                        <h4 className="text-sm font-semibold">Test Email (Optional)</h4>
                                        <div className="space-y-2">
                                            <input
                                                placeholder="Enter recipient email to test..."
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                value={testEmail}
                                                onChange={(e) => setTestEmail(e.target.value)}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                If filled, email will ONLY be sent to this address for testing.
                                            </p>
                                        </div>
                                    </div>

                                    <div className={cn("space-y-2 transition-opacity duration-200", testEmail ? "opacity-50 pointer-events-none" : "")}>
                                        <label htmlFor="emailTarget" className="text-sm font-medium">Target Group</label>
                                        <select
                                            id="emailTarget"
                                            value={emailTarget}
                                            onChange={(e) => setEmailTarget(e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            disabled={!!testEmail}
                                        >
                                            <option value="all">All Users</option>
                                            <option value="whitelisted">Whitelisted Users</option>
                                            <option value="referred">Referred Users</option>
                                            <option value="blocked">Blocked Users</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                                        <input
                                            id="subject"
                                            placeholder="e.g. Important Update from WCFC"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-sm font-medium">Email Message (HTML supported)</label>
                                        <textarea
                                            id="message"
                                            rows={8}
                                            placeholder="Enter your email content..."
                                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
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
                                                    {testEmail ? "Send Test Email" : "Send Bulk Email"}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
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
                            {activeTab === "push" ? (
                                <div className="w-[280px] bg-background border-[8px] border-slate-800 rounded-[2rem] shadow-xl overflow-hidden relative flex flex-col">
                                    {/* iPhone Notch */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-10"></div>
                                    <div className="h-10 w-full bg-background flex items-center justify-between px-4 text-[10px] font-bold">
                                        <span>9:41</span>
                                    </div>
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
                                                    {body || "Your notification message will appear here."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-auto pb-2 flex justify-center">
                                        <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full bg-white dark:bg-slate-950 border border-border rounded-lg shadow-sm flex flex-col text-sm">
                                    <div className="p-3 border-b border-border flex items-center justify-between bg-muted/20">
                                        <span className="font-semibold text-xs">New Message</span>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="pb-2 border-b border-border/50">
                                            <span className="text-muted-foreground text-xs">Subject:</span>
                                            <div className="font-medium text-sm">{subject || "No Subject"}</div>
                                        </div>
                                        <div className="text-xs text-muted-foreground whitespace-pre-wrap">
                                            {message || "Email body content preview..."}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4">
                        <div className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 shrink-0" />
                            <div>
                                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Best Practices</h4>
                                <ul className="mt-2 text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                                    {activeTab === "push" ? (
                                        <>
                                            <li>Keep titles under 40 characters</li>
                                            <li>Be clear and concise with your message</li>
                                            <li>Use emojis to increase engagement 🚀</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>Use a clear, action-oriented subject line</li>
                                            <li>Personalize the message when possible</li>
                                            <li>Test email layout on mobile devices</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
