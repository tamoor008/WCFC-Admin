"use client";

import { useEffect, useState } from "react";
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    ArrowUpDown,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminService } from "@/lib/api";

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await adminService.getProducts();
                setProducts(res.data);
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Products</h2>
                    <p className="text-muted-foreground mt-1">
                        Manage your inventory, prices, and product visibility.
                    </p>
                </div>
                <button className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
                    <Plus className="h-5 w-5" />
                    <span>Add Product</span>
                </button>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm">
                <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2 bg-secondary border-none rounded-lg text-sm outline-none ring-primary/20 focus:ring-2 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border bg-secondary/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {products.map((product) => (
                                <tr key={product._id} className="hover:bg-secondary/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-lg overflow-hidden border border-border bg-secondary flex-shrink-0">
                                                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                            </div>
                                            <span className="text-sm font-semibold">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">${product.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary rounded-md" title="View">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button className="p-1.5 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10 rounded-md" title="Edit">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button className="p-1.5 text-muted-foreground hover:text-rose-500 transition-colors hover:bg-rose-500/10 rounded-md" title="Delete">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
