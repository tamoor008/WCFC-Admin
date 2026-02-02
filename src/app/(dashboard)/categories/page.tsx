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
import { validateCategoryImage } from "@/lib/imageValidation";
import { AlertModal } from "@/components/ui/alert-modal";

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
    const [uploading, setUploading] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

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

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
        setAlertOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        try {
            setLoading(true);
            await adminService.deleteCategory(deleteId);
            toast.success("Category deleted successfully");
            fetchCategories();
        } catch (error: any) {
            console.error("Failed to delete category", error);
            toast.error(error?.response?.data?.error || "Failed to delete category");
        } finally {
            setLoading(false);
            setAlertOpen(false);
            setDeleteId(null);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            toast.error("Please select a PNG, JPG, or JPEG image");
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image size must be less than 2MB");
            return;
        }

        // Validate dimensions (must be 300x300px)
        const validation = await validateCategoryImage(file);
        if (!validation.valid) {
            toast.error(validation.error || "Invalid image dimensions");
            return;
        }

        try {
            setUploading(true);

            // Upload to backend
            const uploadData = new FormData();
            uploadData.append('image', file);
            const { data } = await adminService.uploadImage(uploadData, 'category');

            if (data.url) {
                setFormData({ ...formData, iconSvg: data.url });
                setIconPreview(data.url);
                toast.success("Image uploaded successfully");
            }
        } catch (error: any) {
            console.error("Failed to upload image:", error);
            toast.error(error?.response?.data?.error || "Failed to upload image");
        } finally {
            setUploading(false);
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
                                            <img
                                                src={category.iconSvg}
                                                alt={category.name}
                                                className="w-8 h-8 object-contain"
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
                                                onClick={() => category._id && handleDeleteClick(category._id)}
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
                                <label className="block text-sm font-medium mb-2">Category Image</label>
                                <input
                                    type="file"
                                    accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                                    onChange={handleFileChange}
                                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90 cursor-pointer"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Upload a PNG, JPG, or JPEG image (max 2MB)
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
                                        <img
                                            src={iconPreview}
                                            alt="Category icon preview"
                                            className="w-12 h-12 object-contain border border-border rounded"
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
                                disabled={saving || uploading || !formData.name || !formData.iconSvg}
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
            {/* Alert Modal */}
            <AlertModal
                isOpen={alertOpen}
                onClose={() => setAlertOpen(false)}
                onConfirm={handleConfirmDelete}
                loading={loading}
                title="Delete Category"
                description="Are you sure you want to delete this category? This action cannot be undone."
            />
        </div>
    );
}
