"use client";

import { useEffect, useState } from "react";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    X,
    Loader2,
    Save
} from "lucide-react";
import toast from "react-hot-toast";
import { adminService } from "@/lib/api";

interface Category {
    _id?: string;
    name: string;
    icon?: string;
    iconSvg?: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<Category>({
        name: "",
        icon: "",
        iconSvg: "",
    });
    const [saving, setSaving] = useState(false);
    const [iconPreview, setIconPreview] = useState<string>("");

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await adminService.getCategories();
            setCategories(res.data);
        } catch (error: any) {
            console.error("Failed to fetch categories", error);
            toast.error(error?.response?.data?.error || "Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingCategory(null);
        setFormData({
            name: "",
            icon: "",
            iconSvg: "",
        });
        setIconPreview("");
        setShowModal(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name || "",
            icon: category.icon || "",
            iconSvg: category.iconSvg || "",
        });
        setIconPreview(category.iconSvg || "");
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        try {
            await adminService.deleteCategory(id);
            toast.success("Category deleted successfully");
            fetchCategories();
        } catch (error: any) {
            console.error("Failed to delete category", error);
            toast.error(error?.response?.data?.error || "Failed to delete category");
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.includes('svg') && !file.name.endsWith('.svg')) {
            toast.error("Please select an SVG file");
            return;
        }

        // Validate file size (max 500KB)
        if (file.size > 500 * 1024) {
            toast.error("SVG file size must be less than 500KB");
            return;
        }

        try {
            const reader = new FileReader();
            reader.onload = (event) => {
                const svgContent = event.target?.result as string;
                // Convert to base64 data URI for storage
                const dataUri = `data:image/svg+xml;base64,${btoa(svgContent)}`;
                setFormData({ ...formData, iconSvg: dataUri });
                setIconPreview(dataUri);
            };
            reader.onerror = () => {
                toast.error("Failed to read SVG file");
            };
            reader.readAsText(file);
        } catch (error) {
            console.error("Failed to read SVG file:", error);
            toast.error("Failed to read SVG file");
        }
    };

    const handleRemoveIcon = () => {
        setFormData({ ...formData, iconSvg: "" });
        setIconPreview("");
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const dataToSave = {
                name: formData.name,
                icon: formData.icon,
                iconSvg: formData.iconSvg || undefined,
            };
            if (editingCategory?._id) {
                await adminService.updateCategory(editingCategory._id, dataToSave);
            } else {
                await adminService.createCategory(dataToSave);
            }
            setShowModal(false);
            toast.success(editingCategory?._id ? "Category updated successfully" : "Category created successfully");
            fetchCategories();
        } catch (error: any) {
            console.error("Failed to save category", error);
            toast.error(error?.response?.data?.error || "Failed to save category");
        } finally {
            setSaving(false);
        }
    };

    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Categories</h2>
                    <p className="text-muted-foreground mt-1">
                        Manage product categories.
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                >
                    <Plus className="h-5 w-5" />
                    <span>Add Category</span>
                </button>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm">
                <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-secondary border-none rounded-lg text-sm outline-none ring-primary/20 focus:ring-2 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border bg-secondary/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <th className="px-6 py-4">Category Name</th>
                                <th className="px-6 py-4">Icon</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredCategories.map((category) => (
                                <tr key={category._id} className="hover:bg-secondary/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold">{category.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {category.iconSvg ? (
                                            <div 
                                                className="w-8 h-8 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:text-primary"
                                                dangerouslySetInnerHTML={{ 
                                                    __html: category.iconSvg.includes('data:image/svg+xml;base64,') 
                                                        ? atob(category.iconSvg.split(',')[1]) 
                                                        : category.iconSvg.includes('data:image/svg+xml,')
                                                        ? decodeURIComponent(category.iconSvg.split(',')[1])
                                                        : category.iconSvg 
                                                }}
                                            />
                                        ) : category.icon ? (
                                            <span className="text-sm">{category.icon}</span>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="p-1.5 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10 rounded-md"
                                                title="Edit"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => category._id && handleDelete(category._id)}
                                                className="p-1.5 text-muted-foreground hover:text-rose-500 transition-colors hover:bg-rose-500/10 rounded-md"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredCategories.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            {searchQuery ? "No categories found matching your search." : "No categories yet."}
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h3 className="text-xl font-bold">
                                {editingCategory ? "Edit Category" : "Add Category"}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 hover:bg-secondary rounded-md transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="e.g., Flowers"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">SVG Icon</label>
                                <input
                                    type="file"
                                    accept=".svg,image/svg+xml"
                                    onChange={handleFileChange}
                                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90 cursor-pointer"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Upload an SVG icon file (max 500KB)
                                </p>
                                {iconPreview && (
                                    <div className="mt-3 p-3 bg-secondary rounded-lg border border-border">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium">Preview:</span>
                                            <button
                                                onClick={handleRemoveIcon}
                                                className="text-xs text-destructive hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div 
                                            className="w-12 h-12 flex items-center justify-center border border-border rounded [&>svg]:w-full [&>svg]:h-full [&>svg]:text-primary"
                                            dangerouslySetInnerHTML={{ 
                                                __html: iconPreview.includes('data:image/svg+xml;base64,') 
                                                    ? atob(iconPreview.split(',')[1]) 
                                                    : iconPreview.includes('data:image/svg+xml,')
                                                    ? decodeURIComponent(iconPreview.split(',')[1])
                                                    : iconPreview 
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Icon Name (Alternative)</label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="e.g., leaf-outline"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Icon name from lucide-react or Ionicons (if not using SVG)
                                </p>
                            </div>
                        </div>
                        <div className="p-6 border-t border-border flex justify-end space-x-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !formData.name}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        <span>Save</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
