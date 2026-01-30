"use client";

import { useEffect, useState } from "react";
import {
    MoreVertical,
    Plus,
    Search,
    Package,
    Loader2,
    Edit,
    Trash
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminService } from "@/lib/api";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

interface Product {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    stock: number;
    category?: { name: string };
    image?: string;
    createdAt: string;
}

export default function ProductsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const page = Number(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await adminService.getProducts({ page, limit: 10, search });
                const data = response.data;
                // Adaptation for different response structures
                const productList = data.products || data.docs || [];
                setProducts(productList);
                setTotalPages(data.pages || data.totalPages || 1);
                setTotalProducts(data.total || data.totalDocs || 0);
            } catch (error) {
                console.error("Failed to fetch products:", error);
                toast.error("Failed to load products");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [page, search]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Products</h2>
                    <p className="text-muted-foreground mt-1">
                        Manage your product catalog ({totalProducts} items)
                    </p>
                </div>
                <button
                    onClick={() => router.push('/products/new')}
                    className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95">
                    <Plus className="h-5 w-5" />
                    <span>Add Product</span>
                </button>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-secondary/10">
                    <SearchInput placeholder="Search products..." />
                    <div className="flex items-center space-x-2">
                        {/* Filter Buttons could go here */}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center">
                                        <div className="flex justify-center items-center space-x-2 text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                            <span>Loading products...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                        No products found.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product._id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-12 w-12 rounded-lg bg-secondary border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {product.image ? (
                                                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Package className="h-6 w-6 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold line-clamp-1">{product.name}</span>
                                                    <span className="text-xs text-muted-foreground">ID: {product._id.substring(product._id.length - 6)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                                                {product.category?.name || "Uncategorized"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-sm">
                                            <div className="flex flex-col">
                                                {product.originalPrice && product.originalPrice > product.price && (
                                                    <span className="text-xs text-muted-foreground line-through">
                                                        ${product.originalPrice.toFixed(2)}
                                                    </span>
                                                )}
                                                <span className={product.originalPrice && product.originalPrice > product.price ? "text-red-500" : ""}>
                                                    ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "text-xs font-bold px-2 py-1 rounded-md",
                                                product.stock > 10 ? "text-emerald-500 bg-emerald-500/10" :
                                                    product.stock > 0 ? "text-amber-500 bg-amber-500/10" :
                                                        "text-red-500 bg-red-500/10"
                                            )}>
                                                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10 rounded-md">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button className="p-2 text-muted-foreground hover:text-destructive transition-colors hover:bg-destructive/10 rounded-md">
                                                    <Trash className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && totalPages > 1 && (
                    <div className="border-t border-border bg-muted/20">
                        <Pagination currentPage={page} totalPages={totalPages} />
                    </div>
                )}
            </div>
        </div>
    );
}
