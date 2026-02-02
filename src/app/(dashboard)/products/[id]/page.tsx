"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { adminService } from "@/lib/api";
import { ArrowLeft, Loader2, Edit, Package, DollarSign, Tag, Archive, Info } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Variant {
    name: string;
    price?: number;
    stock: number;
    image?: string;
}

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    stock: number;
    category?: { name: string } | string;
    image: string;
    images: string[];
    variants: Variant[];
    status: string;
    thcaContent?: string;
    cbdContent?: string;
    createdAt: string;
    updatedAt: string;
}

export default function ProductDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string>("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await adminService.getProduct(id);
                const data = response.data;
                setProduct(data);
                if (data.image) setSelectedImage(data.image);
                else if (data.images && data.images.length > 0) setSelectedImage(data.images[0]);
            } catch (error) {
                console.error("Failed to fetch product:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span>Loading details...</span>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <p className="text-xl font-semibold text-muted-foreground">Product not found</p>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                        title="Go Back"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">{product.name}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                            <span className="uppercase tracking-wide font-medium">
                                {typeof product.category === 'object' ? product.category?.name : product.category || 'Uncategorized'}
                            </span>
                            <span>•</span>
                            <span className="font-mono text-xs">ID: {product._id}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold uppercase",
                        product.status === 'active' ? "bg-emerald-100 text-emerald-700" :
                            product.status === 'draft' ? "bg-amber-100 text-amber-700" :
                                product.status === 'deleted' ? "bg-red-100 text-red-700" :
                                    "bg-gray-100 text-gray-700"
                    )}>
                        {product.status}
                    </span>
                    <button
                        onClick={() => router.push(`/products/${id}/edit`)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all"
                    >
                        <Edit className="h-4 w-4" />
                        Edit Product
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Images */}
                <div className="md:col-span-1 space-y-4">
                    <div className="aspect-square bg-white border border-border rounded-xl overflow-hidden flex items-center justify-center relative shadow-sm">
                        {selectedImage ? (
                            <img
                                src={selectedImage}
                                alt={product.name}
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="flex flex-col items-center text-muted-foreground">
                                <Package className="h-12 w-12 opacity-20" />
                                <span className="text-sm mt-2">No Image</span>
                            </div>
                        )}
                    </div>
                    {product.images && product.images.length > 0 && (
                        <div className="grid grid-cols-5 gap-2">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(img)}
                                    className={cn(
                                        "aspect-square rounded-md overflow-hidden border cursor-pointer transition-all",
                                        selectedImage === img ? "ring-2 ring-primary border-primary" : "border-border hover:border-foreground/50"
                                    )}
                                >
                                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Details */}
                <div className="md:col-span-2 space-y-8">
                    {/* Key Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-muted-foreground uppercase">Price</span>
                                <DollarSign className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <span className="text-sm text-muted-foreground line-through">
                                        ${product.originalPrice.toFixed(2)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-muted-foreground uppercase">Stock</span>
                                <Archive className="h-4 w-4 text-blue-500" />
                            </div>
                            <span className={cn(
                                "text-2xl font-bold",
                                product.stock > 0 ? "text-foreground" : "text-red-500"
                            )}>
                                {product.stock}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">units</span>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-muted-foreground uppercase">THCA / CBD</span>
                                <Info className="h-4 w-4 text-purple-500" />
                            </div>
                            <div className="flex flex-col">
                                {product.thcaContent && <span className="text-sm font-medium">THCA: <span className="font-normal">{product.thcaContent}</span></span>}
                                {product.cbdContent && <span className="text-sm font-medium">CBD: <span className="font-normal">{product.cbdContent}</span></span>}
                                {!product.thcaContent && !product.cbdContent && <span className="text-sm text-muted-foreground italic">Not specified</span>}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            Description
                        </h3>
                        <div className="bg-card border border-border rounded-lg p-4 text-sm leading-relaxed whitespace-pre-line shadow-sm min-h-[100px]">
                            {product.description || <span className="text-muted-foreground italic">No description provided.</span>}
                        </div>
                    </div>

                    {/* Variants */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            Variants
                            <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                {product.variants?.length || 0}
                            </span>
                        </h3>

                        {product.variants && product.variants.length > 0 ? (
                            <div className="border border-border rounded-lg overflow-hidden shadow-sm">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                                        <tr>
                                            <th className="px-4 py-2">Image</th>
                                            <th className="px-4 py-2">Name</th>
                                            <th className="px-4 py-2">Price Override</th>
                                            <th className="px-4 py-2 text-right">Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border bg-card">
                                        {product.variants.map((variant, idx) => (
                                            <tr key={idx} className="hover:bg-muted/30">
                                                <td className="px-4 py-2">
                                                    <div className="h-8 w-8 rounded bg-muted border border-border overflow-hidden">
                                                        {variant.image ? (
                                                            <img src={variant.image} alt={variant.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full w-full">
                                                                <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 font-medium">{variant.name}</td>
                                                <td className="px-4 py-2 text-muted-foreground">
                                                    {variant.price ? `$${variant.price.toFixed(2)}` : '-'}
                                                </td>
                                                <td className="px-4 py-2 text-right font-mono">
                                                    {variant.stock}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="bg-muted/30 border border-border border-dashed rounded-lg p-6 text-center text-muted-foreground">
                                This product has no variants.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
