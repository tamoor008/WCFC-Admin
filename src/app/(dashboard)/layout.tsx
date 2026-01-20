import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Sidebar />
            <main className="pl-64 min-h-screen flex flex-col">
                <header className="h-16 border-b border-border flex items-center px-8 bg-background/50 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold">Overview</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="h-9 w-9 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden">
                            <span className="text-xs font-medium">TM</span>
                        </div>
                    </div>
                </header>
                <div className="flex-1 p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
