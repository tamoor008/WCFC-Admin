"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className="w-9 h-9 rounded-md border border-border bg-background flex items-center justify-center opacity-50 cursor-not-allowed">
                <Sun className="h-[1.2rem] w-[1.2rem]" />
            </button>
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-10 h-10 rounded-lg border border-border bg-background hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-all active:scale-90"
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
            ) : (
                <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
            )}
        </button>
    );
}
