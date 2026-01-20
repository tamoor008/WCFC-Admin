"use client";

import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    ArrowUpDown
} from "lucide-react";
import { cn } from "@/lib/utils";

const products = [
    { id: "1", name: "Premium Leather Watch", category: "Accessories", price: "$299.00", stock: 45, status: "In Stock", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&auto=format&fit=crop" },
    { id: "2", name: "Wireless Noise Cancelling Headphones", category: "Electronics", price: "$349.00", stock: 12, status: "Low Stock", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&auto=format&fit=crop" },
    { id: "3", name: "Minimalist Ceramic Vase", category: "Home Decor", price: "$49.00", stock: 0, status: "Out of Stock", image: "https://images.unsplash.com/photo-1581009146145-b5ef03a7433b?w=100&h=100&auto=format&fit=crop" },
    { id: "4", name: "Ultra-thin Laptop 14-inch", category: "Electronics", price: "$1,299.00", stock: 8, status: "Low Stock", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100&h=100&auto=format&fit=crop" },
    { id: "5", name: "Organic Cotton T-Shirt", category: "Apparel", price: "$35.00", stock: 120, status: "In Stock", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&auto=format&fit=crop" },
];

export default function ProductsPage() {
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
                    <div className="flex items-center space-x-2">
                        <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors">
                            <Filter className="h-4 w-4" />
                            <span>Filters</span>
                        </button>
                        <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors">
                            <ArrowUpDown className="h-4 w-4" />
                            <span>Sort</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border bg-secondary/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-secondary/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-lg overflow-hidden border border-border bg-secondary flex-shrink-0">
                                                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                            </div>
                                            <span className="text-sm font-semibold">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-medium px-2 py-1 bg-secondary border border-border rounded-full italic">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">{product.price}</td>
                                    <td className="px-6 py-4 text-sm font-medium">{product.stock}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md",
                                            product.status === "In Stock" ? "bg-emerald-500/10 text-emerald-500" :
                                                product.status === "Low Stock" ? "bg-amber-500/10 text-amber-500" :
                                                    "bg-rose-500/10 text-rose-500"
                                        )}>
                                            {product.status}
                                        </span>
                                    </td>
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

                <div className="p-4 border-t border-border flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground italic">
                        Showing <span className="text-foreground">1-5</span> of <span className="text-foreground">24</span> products
                    </p>
                    <div className="flex items-center space-x-2">
                        <button className="px-3 py-1.5 text-xs font-semibold border border-border rounded-md hover:bg-secondary disabled:opacity-50 transition-colors" disabled>
                            Previous
                        </button>
                        <button className="px-3 py-1.5 text-xs font-semibold border border-border rounded-md hover:bg-secondary transition-colors">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
