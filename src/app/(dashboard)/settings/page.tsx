"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { getAdminUser } from "@/lib/auth";
import { adminService } from "@/lib/api";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const user = getAdminUser();
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const { data } = await adminService.updateProfile({ name: trimmed });
      if (typeof window !== "undefined" && data) {
        const stored = getAdminUser();
        if (stored) {
          localStorage.setItem(
            "admin_user",
            JSON.stringify({ ...stored, name: data.name ?? trimmed })
          );
        }
      }
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings</p>
      </div>

      <div className="flex-1 bg-card border border-border rounded-xl p-6 shadow-sm max-w-xl">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-medium">Profile</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Update your display name. Email cannot be changed.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={user?.email ?? ""}
                readOnly
                disabled
                className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
