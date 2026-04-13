"use client";

import { useEffect, useState } from "react";
import {
    Search,
    Loader2,
    Package,
    ChevronDown,
    ChevronRight,
    Layers,
    Hash,
    RefreshCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { adminService } from "@/lib/api";
import { useRouter } from "next/navigation";

interface ProductSummary {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image?: string;
    stock: number;
    status?: string;
}

interface CategoryWithProducts {
    _id: string;
    name: string;
    icon?: string;
    iconSvg?: string;
    shopifyId?: string;
    productCount: number;
    products: ProductSummary[];
}

export default function CategoriesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<CategoryWithProducts[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [shopifyConnected, setShopifyConnected] = useState<boolean | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchCategories();
        checkShopifyStatus();
    }, []);

    const checkShopifyStatus = async () => {
        try {
            const { data } = await adminService.getShopifyStatus();
            setShopifyConnected(data.connected);
        } catch (error) {
            console.error("Failed to check Shopify status", error);
        }
    };

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await adminService.getCategoriesWithProducts();
            setCategories(res.data);
        } catch (error: any) {
            console.error("Failed to fetch categories", error);
            toast.error(error?.response?.data?.error || "Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        const toastId = toast.loading("Syncing with Shopify...");
        try {
            await adminService.syncShopify();
            toast.success("Shopify sync completed!", { id: toastId });
            await fetchCategories();
        } catch (error: any) {
            console.error("Sync failed:", error);
            toast.error(error.userMessage || "Failed to sync with Shopify", { id: toastId });
        } finally {
            setSyncing(false);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const expandAll = () => {
        if (expandedIds.size === filteredCategories.length) {
            setExpandedIds(new Set());
        } else {
            setExpandedIds(new Set(filteredCategories.map((c) => c._id)));
        }
    };

    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.products.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Categories</h2>
                    <p className="text-muted-foreground mt-1">
                        View synced product categories and their products. Managed via Shopify.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSync}
                        disabled={syncing || shopifyConnected === false}
                        className={cn(
                            "flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg font-semibold border transition-all active:scale-95 disabled:opacity-50",
                            shopifyConnected === false 
                                ? "bg-muted text-muted-foreground border-border cursor-not-allowed" 
                                : "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80"
                        )}
                        title={shopifyConnected === false ? "Connect Shopify in Settings to sync" : "Sync with Shopify"}
                    >
                        <RefreshCcw className={cn("h-4 w-4", syncing && "animate-spin")} />
                        <span>{shopifyConnected === false ? "Connection Required" : "Force Sync"}</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Layers className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Categories</p>
                        <p className="text-2xl font-bold text-foreground">{categories.length}</p>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Package className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Products</p>
                        <p className="text-2xl font-bold text-foreground">{totalProducts}</p>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Hash className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Avg per Category</p>
                        <p className="text-2xl font-bold text-foreground">
                            {categories.length > 0 ? Math.round(totalProducts / categories.length) : 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-secondary/10">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search categories or products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-secondary border-none rounded-lg text-sm outline-none ring-primary/20 focus:ring-2 transition-all"
                        />
                    </div>
                    <button
                        onClick={expandAll}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md border border-border hover:bg-secondary"
                    >
                        {expandedIds.size === filteredCategories.length && filteredCategories.length > 0
                            ? "Collapse All"
                            : "Expand All"}
                    </button>
                </div>

                {/* Category Rows */}
                <div className="divide-y divide-border">
                    {filteredCategories.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            {searchQuery ? "No categories or products found matching your search." : "No categories yet. Sync with Shopify to load categories."}
                        </div>
                    ) : (
                        filteredCategories.map((category) => {
                            const isExpanded = expandedIds.has(category._id);
                            return (
                                <div key={category._id}>
                                    {/* Category Header Row */}
                                    <button
                                        onClick={() => toggleExpand(category._id)}
                                        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors text-left group"
                                    >
                                        <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                                            {isExpanded ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </div>
                                        <div className="h-10 w-10 rounded-lg bg-secondary border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {category.iconSvg ? (
                                                <img
                                                    src={category.iconSvg}
                                                    alt={category.name}
                                                    className="w-6 h-6 object-contain"
                                                />
                                            ) : category.icon ? (
                                                <span className="text-lg">{category.icon}</span>
                                            ) : (
                                                <Layers className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate">
                                                {category.name}
                                            </p>
                                        </div>
                                        <span
                                            className={cn(
                                                "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold",
                                                category.productCount > 0
                                                    ? "bg-primary/10 text-primary"
                                                    : "bg-muted text-muted-foreground"
                                            )}
                                        >
                                            {category.productCount} {category.productCount === 1 ? "product" : "products"}
                                        </span>
                                    </button>

                                    {/* Expanded Products List */}
                                    {isExpanded && (
                                        <div className="bg-muted/20 border-t border-border">
                                            {category.products.length === 0 ? (
                                                <div className="px-14 py-6 text-sm text-muted-foreground italic">
                                                    No products in this category.
                                                </div>
                                            ) : (
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                                                            <th className="pl-14 pr-4 py-3">Product</th>
                                                            <th className="px-4 py-3">Price</th>
                                                            <th className="px-4 py-3">Discount</th>
                                                            <th className="px-4 py-3">Stock</th>
                                                            <th className="px-4 py-3">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border/30">
                                                        {category.products
                                                            .filter(
                                                                (p) =>
                                                                    !searchQuery ||
                                                                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                                    category.name.toLowerCase().includes(searchQuery.toLowerCase())
                                                            )
                                                            .map((product) => (
                                                                <tr
                                                                    key={product._id}
                                                                    onClick={() => router.push(`/products/${product._id}`)}
                                                                    className="hover:bg-muted/40 transition-colors cursor-pointer"
                                                                >
                                                                    <td className="pl-14 pr-4 py-3">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="h-9 w-9 rounded-md bg-secondary border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                                {product.image ? (
                                                                                    <img
                                                                                        src={product.image}
                                                                                        alt={product.name}
                                                                                        className="h-full w-full object-cover"
                                                                                    />
                                                                                ) : (
                                                                                    <Package className="h-4 w-4 text-muted-foreground" />
                                                                                )}
                                                                            </div>
                                                                            <span className="text-sm font-medium truncate max-w-[300px]">
                                                                                {product.name}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm font-medium">
                                                                        <div className="flex flex-col">
                                                                            <span>Rs.{typeof product.price === "number" ? product.price.toFixed(2) : product.price}</span>
                                                                            {product.originalPrice && product.originalPrice > product.price && (
                                                                                <span className="text-xs text-muted-foreground line-through">
                                                                                    Rs.{product.originalPrice.toFixed(2)}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        {product.originalPrice && product.originalPrice > product.price ? (
                                                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-rose-500/10 text-rose-500">
                                                                                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-xs text-muted-foreground">—</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <span
                                                                            className={cn(
                                                                                "text-xs font-bold px-2 py-1 rounded-md",
                                                                                product.stock > 10
                                                                                    ? "text-emerald-500 bg-emerald-500/10"
                                                                                    : product.stock > 0
                                                                                    ? "text-amber-500 bg-amber-500/10"
                                                                                    : "text-red-500 bg-red-500/10"
                                                                            )}
                                                                        >
                                                                            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <span
                                                                            className={cn(
                                                                                "text-xs font-medium px-2 py-1 rounded-full capitalize",
                                                                                product.status === "active"
                                                                                    ? "bg-emerald-500/10 text-emerald-500"
                                                                                    : product.status === "draft"
                                                                                    ? "bg-amber-500/10 text-amber-500"
                                                                                    : "bg-muted text-muted-foreground"
                                                                            )}
                                                                        >
                                                                            {product.status || "active"}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
