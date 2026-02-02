"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { adminService } from "@/lib/api";
import { ArrowLeft, Loader2, Save, Upload, X } from "lucide-react";
import toast from "react-hot-toast";

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        stock: "",
        category: "",
        images: [] as string[],
        variants: [] as { name: string; price: string; stock: string; image: string }[],
        thcaContent: "",
        cbdContent: "",
        status: "active" as "active" | "draft" | "archived" | "inactive" | "deleted"
    });

    // Fetch product and categories
    useEffect(() => {
        const init = async () => {
            try {
                const [productRes, categoryRes] = await Promise.all([
                    adminService.getProduct(id),
                    adminService.getCategories()
                ]);

                // Set Categories
                const catData = categoryRes.data;
                const categoryList = Array.isArray(catData) ? catData : (catData.categories || []);
                setCategories(categoryList);

                // Set Product Data
                const product = productRes.data;
                setFormData({
                    name: product.name || "",
                    description: product.description || "",
                    price: product.price?.toString() || "",
                    originalPrice: product.originalPrice?.toString() || "",
                    stock: product.stock?.toString() || "",
                    category: typeof product.category === 'object' && product.category ? (product.category as any)._id : product.category || "",
                    images: product.images || (product.image ? [product.image] : []),
                    variants: product.variants ? product.variants.map((v: any) => ({
                        name: v.name,
                        price: v.price?.toString() || "",
                        stock: v.stock?.toString() || "",
                        image: v.image || ""
                    })) : [],
                    thcaContent: product.thcaContent || "",
                    cbdContent: product.cbdContent || "",
                    status: product.status || "active"
                });

            } catch (error) {
                console.error("Failed to load data", error);
                toast.error("Failed to load product data");
            } finally {
                setFetching(false);
            }
        };

        if (id) {
            init();
        }
    }, [id]);

    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { name: "", price: "", stock: "", image: "" }]
        }));
    };

    const removeVariant = (index: number) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const updateVariant = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map((v, i) => i === index ? { ...v, [field]: value } : v)
        }));
    };

    const handleVariantImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            const isSquare = await validateImageAspectRatio(file);
            if (!isSquare) {
                toast.error(`Variant image must be square (1:1 aspect ratio).`);
                e.target.value = "";
                return;
            }

            const uploadData = new FormData();
            uploadData.append('image', file);

            try {
                // @ts-ignore
                const { data } = await adminService.uploadImage(uploadData, 'product');
                if (data.url) {
                    updateVariant(index, 'image', data.url);
                    toast.success("Variant image uploaded");
                }
            } catch (error) {
                console.error("Variant upload failed", error);
                toast.error("Failed to upload variant image");
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateImageAspectRatio = (file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const ratio = img.width / img.height;
                // Allow 5% tolerance (0.95 to 1.05)
                const isValid = ratio >= 0.95 && ratio <= 1.05;
                resolve(isValid);
            };
            img.onerror = () => resolve(true); // Fail open if can't load
            img.src = URL.createObjectURL(file);
        });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);

            if (formData.images.length + files.length > 10) {
                toast.error("You can only upload up to 10 images per product");
                return;
            }

            // Validate aspect ratios
            for (const file of files) {
                const isSquare = await validateImageAspectRatio(file);
                if (!isSquare) {
                    toast.error(`Image ${file.name} is not square (1:1). Please upload 1:1 images.`);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    return;
                }
            }

            setIsUploading(true);
            const newImageUrls: string[] = [];

            try {
                for (const file of files) {
                    const uploadData = new FormData();
                    uploadData.append('image', file);
                    // @ts-ignore
                    const { data } = await adminService.uploadImage(uploadData, 'product');
                    if (data.url) {
                        newImageUrls.push(data.url);
                    }
                }

                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, ...newImageUrls]
                }));
                toast.success(`Uploaded ${newImageUrls.length} image(s)`);
            } catch (error) {
                console.error("Upload failed", error);
                toast.error("Failed to upload one or more images");
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        }
    };

    const removeImage = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSubmit = async (e: React.FormEvent, status: "active" | "draft" = "active") => {
        e.preventDefault();

        // Use the current status from formData if not explicitly passed (or override if 'save as draft' button used)
        const finalStatus = status;

        // Validation: Verify all variants have an image (Only for Active products)
        if (finalStatus === 'active') {
            const variantsWithoutImages = formData.variants.filter(v => !v.image && v.name);
            if (variantsWithoutImages.length > 0) {
                toast.error("All product variants must have an image.");
                return;
            }
        }

        setLoading(true);

        try {
            const price = parseFloat(formData.price);
            const stock = parseInt(formData.stock);

            if (isNaN(price)) {
                throw new Error("Invalid price value");
            }
            if (isNaN(stock)) {
                throw new Error("Invalid stock value");
            }

            const productData = {
                ...formData,
                status: finalStatus,
                price: price,
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
                stock: stock,
                image: formData.images.length > 0 ? formData.images[0] : "",
                images: formData.images,
                variants: formData.variants.map(v => ({
                    name: v.name,
                    price: v.price ? parseFloat(v.price) : undefined,
                    stock: v.stock ? parseInt(v.stock) : 0,
                    image: v.image
                })).filter(v => v.name) // Filter out empty variants
            };

            await adminService.updateProduct(id, productData);
            toast.success(`Product updated successfully`);
            router.push("/products");
        } catch (error: any) {
            console.error("Failed to update product:", error);
            toast.error(error?.response?.data?.error || "Failed to update product");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto pb-10">
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Edit Product</h2>
                    <p className="text-muted-foreground mt-1">
                        Update product details and inventory
                    </p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                <form onSubmit={(e) => handleSubmit(e, formData.status as any)} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Product Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Premium CBD Oil"
                                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    name="category"
                                    required
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="" disabled>Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Price ($) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="price"
                                required
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0.00"
                                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Original Price ($) <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
                            </label>
                            <input
                                type="number"
                                name="originalPrice"
                                min="0"
                                step="0.01"
                                value={formData.originalPrice}
                                onChange={handleChange}
                                placeholder="0.00"
                                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Stock Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="stock"
                                required
                                min="0"
                                value={formData.stock}
                                onChange={handleChange}
                                placeholder="0"
                                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                THCA Content
                            </label>
                            <input
                                type="text"
                                name="thcaContent"
                                value={formData.thcaContent}
                                onChange={handleChange}
                                placeholder="e.g. 15%"
                                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                CBD Content
                            </label>
                            <input
                                type="text"
                                name="cbdContent"
                                value={formData.cbdContent}
                                onChange={handleChange}
                                placeholder="e.g. 5%"
                                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Status
                            </label>
                            <div className="relative">
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="active">Active</option>
                                    <option value="draft">Draft</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">
                            Product Images (Max 10) <span className="text-red-500">*</span>
                        </label>

                        <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-4">
                            {formData.images.map((url, index) => (
                                <div key={index} className="relative group aspect-square border rounded-md overflow-hidden bg-muted">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={url}
                                        alt={`Product ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}

                            {formData.images.length < 10 && (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square border-2 border-dashed border-muted-foreground/25 hover:border-primary rounded-md flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/5 hover:bg-muted/10"
                                >
                                    {isUploading ? (
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                            <span className="text-xs text-muted-foreground text-center px-2">Click to upload</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleFileSelect}
                        />
                        <p className="text-xs text-muted-foreground">
                            Upload 1:1 square aspect ratio images for best results. First image will be the main one.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Description
                        </label>
                        <textarea
                            name="description"
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Product description..."
                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium leading-none">
                                Product Variants (Optional)
                            </label>
                            <button
                                type="button"
                                onClick={addVariant}
                                className="text-sm text-primary hover:underline"
                            >
                                + Add Variant
                            </button>
                        </div>

                        {formData.variants.map((variant, index) => (
                            <div key={index} className="grid gap-4 p-4 border rounded-md relative bg-muted/20">
                                <button
                                    type="button"
                                    onClick={() => removeVariant(index)}
                                    className="absolute top-2 right-2 text-muted-foreground hover:text-red-500"
                                >
                                    <X className="h-4 w-4" />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium">Variant Name *</label>
                                        <input
                                            type="text"
                                            value={variant.name}
                                            onChange={(e) => updateVariant(index, 'name', e.target.value)}
                                            placeholder="e.g. Small, Blue"
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium">Price (Override)</label>
                                        <input
                                            type="number"
                                            value={variant.price}
                                            onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                            placeholder={formData.price || "0.00"}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium">Stock *</label>
                                        <input
                                            type="number"
                                            value={variant.stock}
                                            onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                                            placeholder="0"
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="text-xs font-medium">Variant Image</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleVariantImageUpload(index, e)}
                                            className="flex w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                        />
                                    </div>
                                    {variant.image && (
                                        <div className="h-12 w-12 rounded overflow-hidden border">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={variant.image} alt="Variant" className="h-full w-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4 space-x-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex items-center justify-center space-x-2 bg-secondary text-secondary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-secondary/80 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || isUploading}
                            className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-8 py-2.5 rounded-lg font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    <span>Update Product</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
