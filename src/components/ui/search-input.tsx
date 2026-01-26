"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
// Let's stick to standard debounce logic without extra deps for now to be safe, or check package.json.
// package.json didn't show use-debounce. I'll implement a simple one.

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    placeholder?: string;
    className?: string;
}

export function SearchInput({ placeholder = "Search...", className, ...props }: SearchInputProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set("search", term);
            params.set("page", "1"); // Reset to page 1 on search
        } else {
            params.delete("search");
        }
        replace(`${pathname}?${params.toString()}`);
    };

    // Simple debounce implementation
    const debounce = (func: Function, wait: number) => {
        let timeout: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    const debouncedSearch = React.useCallback(debounce(handleSearch, 300), [searchParams, pathname, replace]);

    return (
        <div className={`relative flex-1 max-w-md ${className}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
                type="text"
                placeholder={placeholder}
                defaultValue={searchParams.get("search")?.toString()}
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm outline-none ring-primary/20 focus:ring-2 focus:bg-background transition-all hover:bg-secondary/80"
                {...props}
            />
        </div>
    );
}
