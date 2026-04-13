"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, ExternalLink } from "lucide-react";

export default function NewProductPage() {
    const router = useRouter();

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto pt-10">
            <div className="flex items-center space-x-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Add Product</h2>
                </div>
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-sm p-12 text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="h-10 w-10 text-primary" />
                </div>
                
                <h3 className="text-2xl font-bold text-foreground">Managed via Shopify</h3>
                
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Direct product creation is disabled in the admin panel. All products, pricing, and inventory are synchronized from your Shopify store.
                </p>

                <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => router.push("/products")}
                        className="w-full sm:w-auto px-8 py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-all"
                    >
                        Back to Products
                    </button>
                    <a
                        href="https://www.shopify.com/admin/products"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                        Go to Shopify
                        <ExternalLink className="h-4 w-4" />
                    </a>
                </div>
            </div>

            <div className="bg-muted/30 border border-border border-dashed rounded-xl p-6 text-sm text-muted-foreground italic">
                Tip: After adding a product in Shopify, use the "Force Sync" button on the products list page to update the local database immediately.
            </div>
        </div>
    );
}
