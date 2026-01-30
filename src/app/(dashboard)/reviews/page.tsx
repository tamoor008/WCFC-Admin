"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/lib/api";
import { format } from "date-fns";
import { Check, X, Star, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const { data } = await adminService.getReviews();
            setReviews(data);
        } catch (error) {
            console.error("Failed to fetch reviews", error);
            toast.error("Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await adminService.updateReviewStatus(id, status);
            toast.success(`Review ${status}`);
            fetchReviews(); // Refresh list
        } catch (error) {
            console.error("Failed to update status", error);
            toast.error("Failed to update status");
        }
    };

    const filteredReviews = reviews.filter(r => {
        if (filter === 'all') return true;
        return r.status === filter;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>;
            case 'rejected':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Product Reviews</h1>
                <p className="text-muted-foreground mt-2">Moderate customer reviews</p>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {['all', 'pending', 'approved', 'rejected'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                            <tr>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Rating</th>
                                <th className="px-6 py-4">Comment</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Loading reviews...</td></tr>
                            ) : filteredReviews.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">No reviews found.</td></tr>
                            ) : (
                                filteredReviews.map((review) => (
                                    <tr key={review._id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-medium">{review.product?.name || 'Unknown Product'}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{review.user?.name || 'Anonymous'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-amber-500">
                                                <Star size={14} fill="currentColor" />
                                                <span className="font-medium text-foreground">{review.rating}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate" title={review.comment}>{review.comment}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{format(new Date(review.createdAt), 'MMM d, yyyy')}</td>
                                        <td className="px-6 py-4">{getStatusBadge(review.status)}</td>
                                        <td className="px-6 py-4 text-right">
                                            {review.status === 'pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleStatusUpdate(review._id, 'approved')}
                                                        className="p-1 rounded-md bg-green-100 text-green-700 hover:bg-green-200"
                                                        title="Approve"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(review._id, 'rejected')}
                                                        className="p-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                                                        title="Reject"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
