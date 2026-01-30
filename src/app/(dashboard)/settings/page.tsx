"use client";

import { useState, useEffect, useRef } from "react";
import { User, Smartphone, Upload, X, AlertTriangle, Mail, Send } from "lucide-react";
import { getAdminUser } from "@/lib/auth";
import { adminService } from "@/lib/api";
import toast from "react-hot-toast";
import { validateBannerImage } from "@/lib/imageValidation";

export default function SettingsPage() {
  const user = getAdminUser();
  const [name, setName] = useState(user?.name ?? "");
  const [contactEmail, setContactEmail] = useState("");
  const [appStoreLink, setAppStoreLink] = useState("");
  const [playStoreLink, setPlayStoreLink] = useState("");
  const [driverAppStoreLink, setDriverAppStoreLink] = useState("");
  const [driverPlayStoreLink, setDriverPlayStoreLink] = useState("");
  const [autoAcceptReviews, setAutoAcceptReviews] = useState(false);

  // Home Config State
  const [homeBannerText, setHomeBannerText] = useState("");
  const [homeBannerImage, setHomeBannerImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'home' | 'reviews' | 'email'>('general');
  const [isEditingHomeConfig, setIsEditingHomeConfig] = useState(false);

  // Email Broadcast State
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailTargetGroup, setEmailTargetGroup] = useState("all");
  const [emailTestAddress, setEmailTestAddress] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  // Danger Zone State
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [emptying, setEmptying] = useState(false);

  const handleEmptyDev = async () => {
    if (confirmationText !== "EMPTY DEV") {
      toast.error("Please type EMPTY DEV to confirm");
      return;
    }

    setEmptying(true);
    try {
      const { data } = await adminService.emptyDevEnvironment();
      if (data.success) {
        toast.success(`Dev environment cleared! Deleted ${data.details.storageDeleted} files and ${data.details.collectionsCleared} collections.`);
        setShowDangerModal(false);
        setConfirmationText("");
        // Reload settings to reflect changes if necessary
        window.location.reload();
      }
    } catch (error: any) {
      console.error("Failed to empty dev environment:", error);
      toast.error(error?.response?.data?.error || "Failed to empty dev environment");
    } finally {
      setEmptying(false);
    }
  };

  useEffect(() => {
    // Initial state from localStorage for name
    if (user?.name) setName(user.name);

    // Fetch fresh data from API
    const fetchProfile = async () => {
      try {
        const { data } = await adminService.getProfile();
        if (data) {
          setName(data.name || "");
          // Update localStorage to keep it fresh
          const stored = getAdminUser();
          if (stored) {
            localStorage.setItem(
              "admin_user",
              JSON.stringify({ ...stored, name: data.name })
            );
          }
        }

        // Fetch Settings
        const { data: settings } = await adminService.getPlatformSettings();
        if (settings) {
          setContactEmail(settings.supportEmail || "");
          setAppStoreLink(settings.appStoreLink || "");
          setPlayStoreLink(settings.playStoreLink || "");
          setDriverAppStoreLink(settings.driverAppStoreLink || "");
          setDriverPlayStoreLink(settings.driverPlayStoreLink || "");
          setAutoAcceptReviews(settings.autoAcceptReviews || false);
        }

        // Fetch App Config
        const { data: config } = await adminService.getAppConfig();
        if (config) {
          setHomeBannerText(config.home_banner_text || "");
          setHomeBannerImage(config.home_banner_image || "");
        }
      } catch (e) {
        console.error("Failed to fetch profile", e);
      }
    };
    fetchProfile();
  }, [user?.name]);

  const ensureProtocol = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return "";
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("SettingsPage: handleSubmit triggered");
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      console.log("SettingsPage: Calling updates");
      // Update Profile
      const { data: profile } = await adminService.updateProfile({
        name: trimmed,
      });
      // Update Settings
      await adminService.updatePlatformSettings({
        supportEmail: contactEmail.trim(),
        appStoreLink: ensureProtocol(appStoreLink),
        playStoreLink: ensureProtocol(playStoreLink),
        driverAppStoreLink: ensureProtocol(driverAppStoreLink),
        driverPlayStoreLink: ensureProtocol(driverPlayStoreLink),
        // @ts-ignore
        autoAcceptReviews
      });

      // Update App Config
      await adminService.updateAppConfig("home_banner_text", homeBannerText);
      await adminService.updateAppConfig("home_banner_image", homeBannerImage);

      if (typeof window !== "undefined" && profile) {
        const stored = getAdminUser();
        if (stored) {
          localStorage.setItem(
            "admin_user",
            JSON.stringify({ ...stored, name: profile.name ?? trimmed })
          );
        }
      }
      toast.success("Profile updated");
    } catch (error) {
      console.error("SettingsPage: Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate dimensions (must be 1000x500px)
    const validation = await validateBannerImage(file);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid image dimensions");
      e.target.value = "";
      return;
    }

    // reset input value so allowing same file upload again if needed
    e.target.value = "";

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("image", file);

      const res = await adminService.uploadImage(formData, 'banner');
      if (res.data && res.data.url) {
        setHomeBannerImage(res.data.url);
        toast.success("Banner image uploaded successfully");
      }
    } catch (error: any) {
      console.error("Failed to upload image", error);
      toast.error(error?.response?.data?.error || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings</p>
      </div>

      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-2 px-4 text-sm font-medium transition-colors relative ${activeTab === 'general'
            ? 'text-primary border-b-2 border-primary'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('home')}
          className={`pb-2 px-4 text-sm font-medium transition-colors relative ${activeTab === 'home'
            ? 'text-primary border-b-2 border-primary'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          Home Screen
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-2 px-4 text-sm font-medium transition-colors relative ${activeTab === 'reviews'
            ? 'text-primary border-b-2 border-primary'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          Reviews
        </button>
        <button
          onClick={() => setActiveTab('email')}
          className={`pb-2 px-4 text-sm font-medium transition-colors relative ${activeTab === 'email'
            ? 'text-primary border-b-2 border-primary'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          Email
        </button>
      </div>

      {activeTab === 'general' ? (
        <div className="flex-1 bg-card border border-border rounded-xl p-6 shadow-sm max-w-xl">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Profile & General</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Update your display name, contact info, and store links.
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
                <label className="text-sm font-medium">Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="public@example.com (visible to users)"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <p className="text-xs text-muted-foreground">This email will be shown to users who need support (e.g. blocked users).</p>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">App Store Link (iOS)</label>
                <input
                  type="text"
                  value={appStoreLink}
                  onChange={(e) => setAppStoreLink(e.target.value)}
                  placeholder="apps.apple.com/..."
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Play Store Link (Android)</label>
                <input
                  type="text"
                  value={playStoreLink}
                  onChange={(e) => setPlayStoreLink(e.target.value)}
                  placeholder="play.google.com/store/apps/..."
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Driver App Links</h4>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Driver App Store Link (iOS)</label>
                    <input
                      type="text"
                      value={driverAppStoreLink}
                      onChange={(e) => setDriverAppStoreLink(e.target.value)}
                      placeholder="apps.apple.com/..."
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Driver Play Store Link (Android)</label>
                    <input
                      type="text"
                      value={driverPlayStoreLink}
                      onChange={(e) => setDriverPlayStoreLink(e.target.value)}
                      placeholder="play.google.com/store/apps/..."
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Login Email</label>
                <div className="flex h-10 w-full items-center rounded-md bg-muted/50 px-3 text-sm text-muted-foreground border border-transparent">
                  {user?.email ?? ""}
                </div>
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

            {/* Danger Zone - Only show in development or if explicitly enabled */}
            {(process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_SHOW_DANGER_ZONE === 'true') && (
              <div className="border-t border-red-200 mt-12 pt-8">
                <div className="flex items-center gap-2 text-red-600 mb-4">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Danger Zone</h3>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                  <h4 className="font-medium text-red-900 mb-1">Empty Dev Environment</h4>
                  <p className="text-sm text-red-700 mb-4">
                    This will PERMANENTLY delete all data in the development database and all images in the DigitalOcean Spaces <span className="font-mono font-bold">dev/</span> folder. This cannot be undone.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowDangerModal(true)}
                    className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Empty Development Environment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'home' ? (
        <div className="flex-1 bg-card border border-border rounded-xl p-6 shadow-sm max-w-xl">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium">Home Screen Configuration</h3>
              </div>
              {!isEditingHomeConfig && (
                <button
                  onClick={() => setIsEditingHomeConfig(true)}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Edit
                </button>
              )}
            </div>

            {!isEditingHomeConfig ? (
              <div className="space-y-6">
                {/* PREVIEW SECTION */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Current Mobile Preview</label>
                  <div className="w-full max-w-sm mx-auto border border-border rounded-[24px] overflow-hidden bg-background shadow-md relative aspect-[9/16] pointer-events-none select-none">
                    {/* Fake Status Bar */}
                    <div className="h-6 w-full bg-black/5 flex items-center justify-between px-4">
                      <div className="w-8 h-2 bg-black/10 rounded-full"></div>
                      <div className="flex gap-1">
                        <div className="w-3 h-3 bg-black/10 rounded-full"></div>
                        <div className="w-3 h-3 bg-black/10 rounded-full"></div>
                      </div>
                    </div>

                    {/* Fake Header */}
                    <div className="h-12 w-full border-b border-border flex items-center px-4 gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted"></div>
                      <div className="flex-1 h-3 bg-muted rounded w-20"></div>
                    </div>

                    {/* Banner Content */}
                    <div className="p-4">
                      {homeBannerImage ? (
                        <div className="w-full aspect-[2/1] rounded-2xl overflow-hidden relative">
                          <img src={homeBannerImage} className="w-full h-full object-cover" alt="Banner" />
                        </div>
                      ) : (
                        <div className="w-full p-4 rounded-xl bg-orange-50 border border-orange-100 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                            <Smartphone className="h-4 w-4 text-orange-600" />
                          </div>
                          <p className="text-sm text-orange-900 font-medium leading-tight">
                            {homeBannerText || "No banner text set"}
                          </p>
                        </div>
                      )}

                      {/* Fake content placeholders */}
                      <div className="mt-6 flex gap-3 overflow-hidden">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-24 h-32 rounded-lg bg-muted shrink-0"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Customize the banner displayed on the mobile app home screen.
                  <br />
                  <span className="font-medium text-amber-600 block mt-1">
                    Note: Only one banner updates. If an image is set, it will be displayed. The text is only used as a fallback when no image is present.
                  </span>
                </p>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Banner Text (Fallback)</label>
                  <input
                    type="text"
                    value={homeBannerText}
                    onChange={(e) => setHomeBannerText(e.target.value)}
                    placeholder="Enter marketing text..."
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <p className="text-xs text-muted-foreground">This text is ONLY shown if NO image is uploaded below.</p>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Banner Image</label>

                  {homeBannerImage ? (
                    <div className="relative w-full aspect-[2/1] bg-muted rounded-lg overflow-hidden border border-border">
                      <img
                        src={homeBannerImage}
                        alt="Home Banner"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setHomeBannerImage("")}
                        className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full aspect-[3/1] bg-muted/30 border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      {uploadingImage ? (
                        <span className="text-sm text-muted-foreground">Uploading...</span>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Click to upload banner image</span>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <p className="text-xs text-muted-foreground">Recommended size: 1000x500px or similar (2:1 aspect ratio).</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setIsEditingHomeConfig(false);
                      // Optional: Reset state to original if needed, but for now we keep edits in memory until save or page refresh
                      // Reloading config to reset changes if Cancel is clicked would be better UX:
                      adminService.getAppConfig().then(({ data }) => {
                        if (data) {
                          setHomeBannerText(data.home_banner_text || "");
                          setHomeBannerImage(data.home_banner_image || "");
                        }
                      });
                    }}
                    disabled={saving}
                    className="flex-1 bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async (e) => {
                      await handleSubmit(e as any);
                      setIsEditingHomeConfig(false);
                    }}
                    disabled={saving}
                    className="flex-1 bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'email' ? (
        <div className="flex-1 bg-card border border-border rounded-xl p-6 shadow-sm max-w-xl">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Broadcast Email</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Send emails to all users or specific groups.
            </p>

            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Target Audience</label>
                <select
                  value={emailTargetGroup}
                  onChange={(e) => setEmailTargetGroup(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="all">All Users</option>
                  <option value="whitelisted">Whitelisted Users Only</option>
                  <option value="referred">Referred Users Only</option>
                  <option value="blocked">Blocked Users Only</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject line..."
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Message</label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Write your message here..."
                  rows={6}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Test Email (Optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={emailTestAddress}
                      onChange={(e) => setEmailTestAddress(e.target.value)}
                      placeholder="test@example.com"
                      className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <button
                      type="button"
                      disabled={sendingEmail || !emailSubject || !emailMessage || !emailTestAddress}
                      onClick={async () => {
                        setSendingEmail(true);
                        try {
                          const { data } = await adminService.sendEmail({
                            subject: emailSubject,
                            message: emailMessage,
                            testEmail: emailTestAddress
                          });
                          toast.success(data.message || 'Test email sent!');
                        } catch (error: any) {
                          toast.error(error?.response?.data?.error || 'Failed to send test email');
                        } finally {
                          setSendingEmail(false);
                        }
                      }}
                      className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send Test
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Send a test email to yourself before broadcasting.</p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  disabled={sendingEmail || !emailSubject || !emailMessage}
                  onClick={async () => {
                    if (!confirm(`Are you sure you want to send this email to ${emailTargetGroup === 'all' ? 'ALL users' : emailTargetGroup + ' users'}?`)) {
                      return;
                    }
                    setSendingEmail(true);
                    try {
                      const { data } = await adminService.sendEmail({
                        subject: emailSubject,
                        message: emailMessage,
                        targetGroup: emailTargetGroup
                      });
                      toast.success(data.message || 'Emails sent successfully!');
                      // Clear form after successful send
                      setEmailSubject("");
                      setEmailMessage("");
                    } catch (error: any) {
                      toast.error(error?.response?.data?.error || 'Failed to send emails');
                    } finally {
                      setSendingEmail(false);
                    }
                  }}
                  className="flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 px-6 py-2.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                  {sendingEmail ? 'Sending...' : 'Send to All'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-card border border-border rounded-xl p-6 shadow-sm max-w-xl">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">Review Settings</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure how customer reviews are handled.
            </p>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Auto-Accept Reviews</h4>
                <p className="text-sm text-muted-foreground">Automatically approve new reviews without moderation.</p>
              </div>
              <div className="flex items-center h-6">
                <input
                  type="checkbox"
                  checked={autoAcceptReviews}
                  onChange={(e) => setAutoAcceptReviews(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showDangerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Are you absolutely sure?</h3>
            </div>

            <p className="text-muted-foreground mb-6">
              This action will wipe the <span className="font-bold text-foreground underline italic">development environment</span> including all MongoDB data and DigitalOcean Spaces files in the dev folder.
            </p>

            <div className="space-y-4 mb-8">
              <label className="text-sm font-medium block">
                Type <span className="font-mono font-bold text-red-600 select-all">EMPTY DEV</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="EMPTY DEV"
                className="flex h-12 w-full rounded-lg border border-red-200 bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDangerModal(false);
                  setConfirmationText("");
                }}
                disabled={emptying}
                className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEmptyDev}
                disabled={emptying || confirmationText !== "EMPTY DEV"}
                className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {emptying ? "Emptying..." : "Empty Dev"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
