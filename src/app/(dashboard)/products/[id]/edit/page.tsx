"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Edit3, ExternalLink } from "lucide-react";

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

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
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Edit Product</h2>
                </div>
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-sm p-12 text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
                    <Edit3 className="h-10 w-10 text-amber-500" />
                </div>
                
                <h3 className="text-2xl font-bold text-foreground">Editing Disabled</h3>
                
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Manual editing of products is disabled in the admin panel. All product details, including pricing, titles, and images, must be updated through Shopify to remain in sync.
                </p>

                <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => router.push(`/products/${id}`)}
                        className="w-full sm:w-auto px-8 py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-all"
                    >
                        Back to Details
                    </button>
                    <a
                        href={`https://www.shopify.com/admin/products/${id.split('/').pop()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                        Edit in Shopify
                        <ExternalLink className="h-4 w-4" />
                    </a>
                </div>
            </div>

            <div className="bg-muted/30 border border-border border-dashed rounded-xl p-6 text-sm text-muted-foreground italic">
                Note: Local changes to products can cause synchronization conflicts. Please always use the Shopify admin for product management.
            </div>
        </div>
    );
}
