"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    className?: string;
}

export function Pagination({ currentPage, totalPages, className }: PaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { replace } = useRouter();

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        replace(createPageURL(page));
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            range.unshift("...");
        }
        if (currentPage + delta < totalPages - 1) {
            range.push("...");
        }

        range.unshift(1);
        if (totalPages > 1) {
            range.push(totalPages);
        }

        return range;
    };

    const pages = getPageNumbers();

    return (
        <div className={cn("flex items-center justify-center space-x-2 py-4", className)}>
            <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="First Page"
            >
                <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center space-x-1">
                {pages.map((page, i) => (
                    <button
                        key={i}
                        onClick={() => typeof page === 'number' ? handlePageChange(page) : undefined}
                        disabled={page === '...'}
                        className={cn(
                            "h-8 w-8 text-sm font-medium rounded-md transition-colors",
                            page === currentPage
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                : "hover:bg-secondary text-muted-foreground hover:text-foreground",
                            page === '...' && "cursor-default hover:bg-transparent"
                        )}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
            <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Last Page"
            >
                <ChevronsRight className="h-4 w-4" />
            </button>
        </div>
    );
}
