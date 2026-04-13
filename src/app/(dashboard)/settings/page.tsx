"use client";

import { useState, useEffect, useRef } from "react";
import { User, Smartphone, Upload, X, AlertTriangle, Mail, Send } from "lucide-react";
import { getAdminUser } from "@/lib/auth";
import { adminService } from "@/lib/api";
import toast from "react-hot-toast";
import { validateBannerImage } from "@/lib/imageValidation";

interface HomeBanner {
  url: string;
  order: number;
  isActive: boolean;
}

interface FeaturedSection {
  title: string;
  subline?: string;
  collectionId: string;
  isActive: boolean;
}

interface ProductDetailAccordionSection {
  title: string;
  content: string;
  isActive: boolean;
}

export default function SettingsPage() {
  const user = getAdminUser();
  const [name, setName] = useState(user?.name ?? "");
  const [contactEmail, setContactEmail] = useState("");
  const [appStoreLink, setAppStoreLink] = useState("");
  const [playStoreLink, setPlayStoreLink] = useState("");
  const [autoAcceptReviews, setAutoAcceptReviews] = useState(false);
  const [minOrderAmount, setMinOrderAmount] = useState("0");
  const [deliveryFee, setDeliveryFee] = useState("0");
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState("3000");
  const [saleName, setSaleName] = useState("");
  const [saleEndTime, setSaleEndTime] = useState("");
  const [isSaleActive, setIsSaleActive] = useState(false);
  // const [deliveryFeeUnder50, setDeliveryFeeUnder50] = useState("4"); // Deprecated

  const [homeBanners, setHomeBanners] = useState<HomeBanner[]>([]);
  const [featuredSections, setFeaturedSections] = useState<FeaturedSection[]>([
    { title: "Best Sellers", subline: "Discover our most popular products", collectionId: "", isActive: true },
    { title: "Bundles/Deals", subline: "Great value packs just for you", collectionId: "", isActive: true },
    { title: "Recently Launched", subline: "Brand new additions to our catalog", collectionId: "", isActive: true }
  ]);
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([]);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [bannerUrl, setBannerUrl] = useState("");
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialTiktok, setSocialTiktok] = useState("");
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'both'>('both');
  const [productDetailSections, setProductDetailSections] = useState<ProductDetailAccordionSection[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'home' | 'reviews' | 'product_detail' | 'shopify'>('general');
  const [isEditingHomeConfig, setIsEditingHomeConfig] = useState(false);

  // Shopify Connection State
  const [shopDomain, setShopDomain] = useState("");
  const [shopifyStatus, setShopifyStatus] = useState<{ connected: boolean; shop?: string; updatedAt?: string } | null>(null);
  const [loadingShopifyStatus, setLoadingShopifyStatus] = useState(true);
  const [showConnectingModal, setShowConnectingModal] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);


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
          setAutoAcceptReviews(settings.autoAcceptReviews || false);
          setMinOrderAmount(String(settings.minOrderAmount || 0));
          setDeliveryFee(String(settings.deliveryFee || 0));
          setFreeDeliveryThreshold(String(settings.freeDeliveryThreshold || 3000));
          setSaleName(settings.saleName || "");
          setSaleEndTime(settings.saleEndTime ? new Date(settings.saleEndTime).toISOString().slice(0, 16) : "");
          setIsSaleActive(settings.isSaleActive || false);
        }

        // Fetch App Config
        const { data: config } = await adminService.getAppConfig();
        if (config) {
          // setHomeBannerText(config.home_banner_text || "");
          setHomeBanners(config.home_banners || []);
          if (config.featured_sections && config.featured_sections.length > 0) {
            setFeaturedSections(config.featured_sections);
          }
          setThemeMode(config.theme_mode || "both");
          setSocialFacebook(config.social_facebook || "");
          setSocialInstagram(config.social_instagram || "");
          setSocialTiktok(config.social_tiktok || "");
          setProductDetailSections(config.product_detail_accordion || []);
        }

        // Fetch Shopify Collections
        const { data: collectionsData } = await adminService.getShopifyCollections();
        if (collectionsData?.collections) {
          setCollections(collectionsData.collections);
        }
        // Fetch Shopify Status
        setLoadingShopifyStatus(true);
        const { data: statusData } = await adminService.getShopifyStatus();
        setShopifyStatus(statusData);
        if (statusData?.shop) setShopDomain(statusData.shop);
        setLoadingShopifyStatus(false);
      } catch (e) {
        console.error("Failed to fetch profile/status", e);
        setLoadingShopifyStatus(false);
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

    const parsedMinOrder = Number(minOrderAmount);
    const parsedDeliveryFee = Number(deliveryFee);
    const parsedFreeThreshold = Number(freeDeliveryThreshold);

    if (!Number.isFinite(parsedMinOrder) || parsedMinOrder < 0) {
      toast.error("Minimum order amount must be a valid non-negative number");
      return;
    }
    if (!Number.isFinite(parsedDeliveryFee) || parsedDeliveryFee < 0) {
      toast.error("Delivery fee must be a valid non-negative number");
      return;
    }
    if (!Number.isFinite(parsedFreeThreshold) || parsedFreeThreshold < 0) {
      toast.error("Free delivery threshold must be a valid non-negative number");
      return;
    }

    setSaving(true);
    try {
      console.log("SettingsPage: Calling updates");

      const updatePromises = [
        // Update Profile
        adminService.updateProfile({ name: trimmed }),

        // Update Settings
        adminService.updatePlatformSettings({
          supportEmail: contactEmail.trim(),
          appStoreLink: ensureProtocol(appStoreLink),
          playStoreLink: ensureProtocol(playStoreLink),
          minOrderAmount: parsedMinOrder,
          deliveryFee: parsedDeliveryFee,
          freeDeliveryThreshold: parsedFreeThreshold,
          autoAcceptReviews,
          saleName: saleName.trim(),
          saleEndTime: saleEndTime ? new Date(saleEndTime).toISOString() : null,
          isSaleActive
        }),

        // Update App Config
        // adminService.updateAppConfig("home_banner_text", homeBannerText),
        adminService.updateAppConfig("home_banners", homeBanners),
        adminService.updateAppConfig("featured_sections", featuredSections),
        adminService.updateAppConfig("theme_mode", themeMode),
        adminService.updateAppConfig("social_facebook", ensureProtocol(socialFacebook)),
        adminService.updateAppConfig("social_instagram", ensureProtocol(socialInstagram)),
        adminService.updateAppConfig("social_tiktok", ensureProtocol(socialTiktok)),
        adminService.updateAppConfig("product_detail_accordion", productDetailSections)
      ];

      const results = await Promise.all(updatePromises);
      const profile = results[0].data;

      if (typeof window !== "undefined" && profile) {
        const stored = getAdminUser();
        if (stored) {
          localStorage.setItem(
            "admin_user",
            JSON.stringify({ ...stored, name: profile.name ?? trimmed })
          );
        }
      }
      toast.success("Settings updated successfully");
    } catch (error: any) {
      console.error("SettingsPage: Error updating profile:", error);
      toast.error(error?.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (homeBanners.length + files.length > 10) {
      toast.error("Maximum 10 banners allowed");
      e.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);
      const newBanners: HomeBanner[] = [];

      for (const file of files) {
        // Validate dimensions (min 1000px wide, landscape)
        const validation = await validateBannerImage(file);
        if (!validation.valid) {
          toast.error(`${file.name}: ${validation.error || "Invalid dimensions"}`);
          continue;
        }

        const formData = new FormData();
        formData.append("image", file);

        const res = await adminService.uploadImage(formData, 'banner');
        if (res.data && res.data.url) {
          newBanners.push({
            url: res.data.url,
            order: homeBanners.length + newBanners.length,
            isActive: true
          });
        }
      }

      if (newBanners.length > 0) {
        setHomeBanners(prev => [...prev, ...newBanners]);
        toast.success(`${newBanners.length} banner(s) uploaded successfully`);
      }
    } catch (error: any) {
      console.error("Failed to upload image(s)", error);
      const errorMessage = error.response?.data?.error || error.userMessage || "Failed to upload image";
      toast.error(errorMessage);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddBannerUrl = () => {
    const trimmed = bannerUrl.trim();
    if (!trimmed) {
      toast.error("Please enter a valid URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(trimmed);
    } catch (e) {
      toast.error("Invalid URL format. Make sure to include http:// or https://");
      return;
    }

    if (homeBanners.length >= 10) {
      toast.error("Maximum 10 banners allowed");
      return;
    }

    const newBanner: HomeBanner = {
      url: trimmed,
      order: homeBanners.length,
      isActive: true
    };

    setHomeBanners(prev => [...prev, newBanner]);
    setBannerUrl("");
    toast.success("Banner URL added successfully");
  };

  const moveBanner = (index: number, direction: 'up' | 'down') => {
    const newBanners = [...homeBanners];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBanners.length) return;

    // Swap
    [newBanners[index], newBanners[targetIndex]] = [newBanners[targetIndex], newBanners[index]];

    // Re-assign orders based on new indices
    newBanners.forEach((b, i) => b.order = i);
    setHomeBanners(newBanners);
  };

  const toggleBannerStatus = (index: number) => {
    setHomeBanners(prev => prev.map((b, i) =>
      i === index ? { ...b, isActive: !b.isActive } : b
    ));
  };

  const handleShopifyConnect = () => {
    const shop = shopDomain.trim().replace('https://', '').replace('http://', '').split('/')[0];
    if (!shop) {
      toast.error("Please enter a valid Shopify store domain");
      return;
    }

    // Redirect to backend auth endpoint in a new tab
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const authUrl = `${apiUrl}/shopify/auth?shop=${shop}`;
    
    // Open in new tab
    window.open(authUrl, '_blank');
    
    // Show progress modal
    setShowConnectingModal(true);
  };

  const handleCheckConnectionStatus = async () => {
    setCheckingStatus(true);
    try {
      const { data } = await adminService.getShopifyStatus();
      setShopifyStatus(data);
      if (data?.connected) {
        toast.success("Shopify connected successfully!");
        setShowConnectingModal(false);
      } else {
        toast.error("Still waiting for connection... Please complete the process in the other tab.");
      }
    } catch (error) {
      console.error("Failed to check shopify status", error);
      toast.error("Failed to verify connection. Please try again.");
    } finally {
      setCheckingStatus(false);
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
          onClick={() => setActiveTab('product_detail')}
          className={`pb-2 px-4 text-sm font-medium transition-colors relative ${activeTab === 'product_detail'
            ? 'text-primary border-b-2 border-primary'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          Product Detail
        </button>
        <button
          onClick={() => setActiveTab('shopify')}
          className={`pb-2 px-4 text-sm font-medium transition-colors relative ${activeTab === 'shopify'
            ? 'text-primary border-b-2 border-primary'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          Shopify
        </button>
      </div>

      {activeTab === 'general' && (
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

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Minimum Order Amount (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Delivery Fee (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    placeholder="0.00"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Set delivery fee to 0 for free delivery.</p>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Free Delivery Threshold (PKR)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={freeDeliveryThreshold}
                  onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                  placeholder="3000.00"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <p className="text-xs text-muted-foreground">Orders equal to or above this amount will have free delivery.</p>
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

              <div className="grid gap-2">
                <label className="text-sm font-medium">Facebook URL</label>
                <input
                  type="text"
                  value={socialFacebook}
                  onChange={(e) => setSocialFacebook(e.target.value)}
                  placeholder="facebook.com/yourpage"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Instagram URL</label>
                <input
                  type="text"
                  value={socialInstagram}
                  onChange={(e) => setSocialInstagram(e.target.value)}
                  placeholder="instagram.com/yourprofile"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">TikTok URL</label>
                <input
                  type="text"
                  value={socialTiktok}
                  onChange={(e) => setSocialTiktok(e.target.value)}
                  placeholder="tiktok.com/@yourhandle"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>


              <div className="grid gap-2">
                <label className="text-sm font-medium">Login Email</label>
                <div className="flex h-10 w-full items-center rounded-md bg-muted/50 px-3 text-sm text-muted-foreground border border-transparent">
                  {user?.email ?? ""}
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
              </div>

              <div className="grid gap-2 border-t border-border pt-4">
                <label className="text-sm font-medium">Mobile App Theme Mode</label>
                <select
                  value={themeMode}
                  onChange={(e) => setThemeMode(e.target.value as any)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="both">Support Both (User Choice)</option>
                  <option value="light">Light Mode Only</option>
                  <option value="dark">Dark Mode Only</option>
                </select>
                <p className="text-xs text-muted-foreground">Control whether users can toggle dark mode in the mobile app.</p>
              </div>

              <div className="grid gap-4 border-t border-border pt-6 mt-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-medium">Sale Management</h3>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="isSaleActive"
                    checked={isSaleActive}
                    onChange={(e) => setIsSaleActive(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="isSaleActive" className="text-sm font-medium cursor-pointer">Enable Flash Sale</label>
                </div>
                
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Sale Name</label>
                  <input
                    type="text"
                    value={saleName}
                    onChange={(e) => setSaleName(e.target.value)}
                    placeholder="e.g. Ramadan Special Sale"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    disabled={!isSaleActive}
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Sale End Time</label>
                  <input
                    type="datetime-local"
                    value={saleEndTime}
                    onChange={(e) => setSaleEndTime(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    disabled={!isSaleActive}
                  />
                  <p className="text-xs text-muted-foreground">The countdown timer in the app will count down to this time.</p>
                </div>
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
      )}
      
      {activeTab === 'home' && (
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
                  <label className="text-sm font-medium text-muted-foreground mb-4 block">Current Mobile Preview</label>
                  <div className="w-full max-w-[300px] mx-auto border-[6px] border-slate-900 rounded-[3rem] overflow-hidden bg-background shadow-2xl relative aspect-[9/18.5] pointer-events-none select-none ring-1 ring-slate-800">
                    {/* Speaker/Sensors Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-b-2xl z-20 flex items-center justify-center gap-1">
                      <div className="w-8 h-1 bg-slate-800 rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
                    </div>

                    {/* Fake Status Bar */}
                    <div className="h-10 w-full bg-background flex items-center justify-between px-6 pt-4 text-[11px] font-bold">
                      <span>9:41</span>
                      <div className="flex gap-1.5 items-center">
                        <div className="w-4 h-2.5 border border-black/20 rounded-sm relative">
                          <div className="absolute left-0 top-0 bottom-0 bg-black w-[80%]"></div>
                        </div>
                        <div className="w-3 h-3 bg-black/80 rounded-full flex items-center justify-center">
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>

                    {/* Fake Search Header */}
                    <div className="px-4 py-3">
                      <div className="h-10 w-full bg-muted/30 rounded-full border border-border flex items-center px-4 gap-3">
                        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30"></div>
                        <div className="h-2 w-24 bg-muted-foreground/20 rounded"></div>
                      </div>
                    </div>

                    {/* Banner Content */}
                    <div className="px-4">
                      {homeBanners && homeBanners.length > 0 && homeBanners.some(b => b.isActive) ? (
                        <div className="w-full aspect-[2/1] rounded-2xl overflow-hidden relative shadow-sm">
                          <img
                            src={homeBanners.find(b => b.isActive)?.url}
                            className="w-full h-full object-cover"
                            alt="Banner"
                          />
                          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                            {homeBanners.filter(b => b.isActive).map((_, i) => (
                              <div key={i} className={`w-1 h-1 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/50'}`}></div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="w-full p-4 rounded-xl bg-orange-50 border border-orange-100 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                            <Smartphone className="h-4 w-4 text-orange-600" />
                          </div>
                          <p className="text-[11px] text-orange-900 font-medium leading-tight pt-1">
                            No active banners
                          </p>
                        </div>
                      )}

                      {/* Fake Category Bar */}
                      <div className="mt-6 flex gap-3 overflow-hidden">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
                             <div className="w-12 h-12 rounded-2xl bg-muted/40 flex items-center justify-center">
                               <div className="w-6 h-6 rounded-md bg-muted-foreground/10"></div>
                             </div>
                             <div className="h-1.5 w-8 bg-muted rounded"></div>
                          </div>
                        ))}
                      </div>

                      {/* Featured Section Label */}
                      <div className="mt-8 flex justify-between items-center mb-3">
                         <div className="h-3 w-20 bg-muted rounded"></div>
                         <div className="h-2.5 w-10 bg-muted rounded"></div>
                      </div>

                      {/* Fake Product Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {[1, 2].map(i => (
                          <div key={i} className="bg-white border border-border/50 rounded-2xl p-2 shadow-sm space-y-2">
                             <div className="aspect-square bg-muted/20 rounded-xl overflow-hidden flex items-center justify-center">
                               <div className="w-8 h-8 rounded-full bg-muted-foreground/5 font-black text-[10px] flex items-center justify-center text-muted-foreground/20">TSS</div>
                             </div>
                             <div className="space-y-1">
                               <div className="h-2 w-full bg-muted rounded"></div>
                               <div className="h-2 w-1/2 bg-muted rounded"></div>
                             </div>
                             <div className="h-3 w-12 bg-primary/20 rounded"></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Home Indicator */}
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-900/10 rounded-full"></div>
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
                  <label className="text-sm font-medium">Banner Carousel Images (Max 10)</label>

                  <div className="space-y-3">
                    {homeBanners.sort((a, b) => a.order - b.order).map((banner, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-muted/20 border border-border rounded-lg group">
                        <div className="relative w-24 aspect-[2/1] bg-muted rounded overflow-hidden border border-border shrink-0">
                          <img
                            src={banner.url}
                            alt={`Banner ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">Banner {index + 1}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {banner.isActive ? 'Active' : 'Paused'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveBanner(index, 'up')}
                            disabled={index === 0}
                            className="p-1.5 hover:bg-muted rounded text-muted-foreground disabled:opacity-30"
                            title="Move Up"
                          >
                            <Upload className="h-4 w-4 rotate-0" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveBanner(index, 'down')}
                            disabled={index === homeBanners.length - 1}
                            className="p-1.5 hover:bg-muted rounded text-muted-foreground disabled:opacity-30"
                            title="Move Down"
                          >
                            <Upload className="h-4 w-4 rotate-180" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleBannerStatus(index)}
                            className={`p-1.5 rounded transition-colors ${banner.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                            title={banner.isActive ? 'Pause' : 'Resume'}
                          >
                            {banner.isActive ? <X className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => setHomeBanners(prev => prev.filter((_, i) => i !== index).map((b, i) => ({ ...b, order: i })))}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded"
                            title="Delete"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {homeBanners.length < 10 && (
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={bannerUrl}
                            onChange={(e) => setBannerUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddBannerUrl()}
                            placeholder="Paste banner image URL here..."
                            className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          />
                          <button
                            type="button"
                            onClick={handleAddBannerUrl}
                            className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium transition-colors"
                          >
                            Add URL
                          </button>
                        </div>
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-6 bg-muted/30 border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          {uploadingImage ? (
                            <span className="text-xs text-muted-foreground animate-pulse">Uploading...</span>
                          ) : (
                            <>
                              <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                              <span className="text-sm text-muted-foreground font-medium">Bulk Upload Banners</span>
                              <span className="text-[10px] text-muted-foreground mt-1 text-center px-4">
                                Min 1000px width • Landscape aspect (1.5:1 to 3:1) • Multi-select supported
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Minimum width 1000px, landscape ratio (e.g. 1920x800px). You can add multiple images for the carousel.</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Featured Sections (Max 3)</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Configure the product sections shown on the mobile app home screen.
                  </p>

                  <div className="space-y-4">
                    {featuredSections.map((section, index) => (
                      <div key={index} className="p-4 bg-muted/20 border border-border rounded-lg space-y-3">
                        <div className="grid gap-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Section {index + 1} Title</label>
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => {
                              const next = [...featuredSections];
                              next[index].title = e.target.value;
                              setFeaturedSections(next);
                            }}
                            placeholder="e.g. Best Sellers"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Linked Shopify Collection</label>
                          <select
                            value={section.collectionId}
                            onChange={(e) => {
                              const next = [...featuredSections];
                              next[index].collectionId = e.target.value;
                              setFeaturedSections(next);
                            }}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            <option value="">Select a collection...</option>
                            {collections.map((col) => (
                              <option key={col.id} value={col.id}>{col.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subline / Description</label>
                          <input
                            type="text"
                            value={section.subline || ""}
                            onChange={(e) => {
                              const next = [...featuredSections];
                              next[index].subline = e.target.value;
                              setFeaturedSections(next);
                            }}
                            placeholder="e.g. Discover our most popular products"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="checkbox"
                            id={`active-${index}`}
                            checked={section.isActive}
                            onChange={(e) => {
                              const next = [...featuredSections];
                              next[index].isActive = e.target.checked;
                              setFeaturedSections(next);
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label htmlFor={`active-${index}`} className="text-xs font-medium text-foreground cursor-pointer">
                            Active (Show on Home Screen)
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setIsEditingHomeConfig(false);
                      // Optional: Reset state to original if needed, but for now we keep edits in memory until save or page refresh
                      // Reloading config to reset changes if Cancel is clicked would be better UX:
                      adminService.getAppConfig().then(({ data }) => {
                        if (data) {
                          // setHomeBannerText(data.home_banner_text || "");
                          setHomeBanners(data.home_banners || []);
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
      )}

      {activeTab === 'product_detail' && (
        <div className="flex-1 bg-card border border-border rounded-xl p-6 shadow-sm max-w-2xl">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium">Product Detail Accordions</h3>
              </div>
              <button
                type="button"
                onClick={() => setProductDetailSections([...productDetailSections, { title: "", content: "", isActive: true }])}
                className="text-sm bg-primary text-primary-foreground hover:opacity-90 px-3 py-1.5 rounded-md font-medium transition-colors"
              >
                Add Section
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage the collapsible sections (like Shipping, Returns) that appear on the product details page.
            </p>

            <div className="space-y-4">
              {productDetailSections.map((section, index) => (
                <div key={index} className="p-4 bg-muted/20 border border-border rounded-lg space-y-4 relative">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 grid gap-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => {
                          const next = [...productDetailSections];
                          next[index].title = e.target.value;
                          setProductDetailSections(next);
                        }}
                        placeholder="e.g. Shipping Information"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...productDetailSections];
                          next[index].isActive = !next[index].isActive;
                          setProductDetailSections(next);
                        }}
                        className={`text-xs px-2 py-1 rounded border ${section.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}
                      >
                        {section.isActive ? 'Active' : 'Hidden'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductDetailSections(productDetailSections.filter((_, i) => i !== index))}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded"
                        title="Delete"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Content (Markdown/HTML supported)</label>
                    <textarea
                      value={section.content}
                      onChange={(e) => {
                        const next = [...productDetailSections];
                        next[index].content = e.target.value;
                        setProductDetailSections(next);
                      }}
                      rows={4}
                      placeholder="Enter the section content..."
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[100px]"
                    />
                  </div>
                  
                  {/* Reordering */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => {
                        const next = [...productDetailSections];
                        [next[index], next[index - 1]] = [next[index - 1], next[index]];
                        setProductDetailSections(next);
                      }}
                      className="text-[10px] text-primary hover:underline disabled:opacity-30"
                    >
                      Move Up
                    </button>
                    <button
                      type="button"
                      disabled={index === productDetailSections.length - 1}
                      onClick={() => {
                        const next = [...productDetailSections];
                        [next[index], next[index + 1]] = [next[index + 1], next[index]];
                        setProductDetailSections(next);
                      }}
                      className="text-[10px] text-primary hover:underline disabled:opacity-30"
                    >
                      Move Down
                    </button>
                  </div>
                </div>
              ))}

              {productDetailSections.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-muted rounded-xl">
                  <p className="text-sm text-muted-foreground">No sections added yet.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
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

      {activeTab === 'reviews' && (
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

      {activeTab === 'shopify' && (
        <div className="flex-1 bg-card border border-border rounded-xl p-6 shadow-sm max-w-xl">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <img src="/shopify-logo.svg" alt="Shopify" className="h-6 w-6" onError={(e) => { (e.target as any).src = 'https://cdn.worldvectorlogo.com/logos/shopify.svg' }} />
              <h3 className="text-lg font-medium">Shopify Integration</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Connect your store to synchronize products, collections, and inventory.
            </p>

            {loadingShopifyStatus ? (
              <div className="animate-pulse flex space-x-4 p-4 border rounded-lg">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </div>
              </div>
            ) : shopifyStatus?.connected ? (
              <div className="p-4 border border-green-100 bg-green-50/30 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-green-900">Connected</h4>
                    <p className="text-sm text-green-700">{shopifyStatus.shop}</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                </div>
                <div className="pt-2 border-t border-green-100">
                  <p className="text-xs text-green-600">
                    Last sync/update: {shopifyStatus.updatedAt ? new Date(shopifyStatus.updatedAt).toLocaleString() : 'Never'}
                  </p>
                </div>
                <button
                  onClick={() => setShopifyStatus(null)}
                  className="text-xs text-red-600 hover:underline font-medium"
                >
                  Disconnect store
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 border border-amber-100 bg-amber-50/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-900">Store Not Linked</h4>
                      <p className="text-xs text-amber-700 mt-1">
                        Linking your store will allow the mobile app to fetch your products and inventory in real-time.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Shopify Store URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shopDomain}
                      onChange={(e) => setShopDomain(e.target.value)}
                      placeholder="your-store.myshopify.com"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <button
                      onClick={handleShopifyConnect}
                      className="bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                    >
                      Connect
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">
                    Example: the-supplement-solution.myshopify.com
                  </p>
                </div>
              </div>
            )}

            <div className="pt-6 border-t">
              <h4 className="text-sm font-semibold mb-2">Instructions</h4>
              <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
                <li>Ensure you are an admin of the Shopify store.</li>
                <li>You will be redirected to Shopify to approve the connection.</li>
                <li>The app requires permissions to read products, collections, and inventory.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Shopify Connection Progress Modal */}
      {showConnectingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-card border border-border rounded-3xl shadow-2xl max-w-lg w-full p-10 animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 text-center">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <img src="https://cdn.worldvectorlogo.com/logos/shopify.svg" alt="Shopify" className="h-8 w-8" />
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-3 tracking-tight">Shopify Connection in Progress</h3>
            
            <div className="space-y-4 text-muted-foreground mb-8 text-sm leading-relaxed px-4">
              <p>
                Your store is being linked. We've opened a new window for you to authorize the application.
              </p>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-amber-800 text-left">
                <p className="font-semibold flex items-center gap-2 mb-1">
                  <span className="text-lg">⏳</span> Synchronization Note:
                </p>
                <p>Initial product and inventory sync can take <span className="font-bold underline">1-2 minutes</span> depending on your catalog size.</p>
              </div>
              <p>Once you see the "Success" page in the other tab, return here to verify the connection.</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleCheckConnectionStatus}
                disabled={checkingStatus}
                className="w-full px-6 py-3 bg-primary text-primary-foreground hover:opacity-95 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
              >
                {checkingStatus ? "Verifying..." : "Check Connection Status"}
              </button>
              <button
                type="button"
                onClick={() => setShowConnectingModal(false)}
                className="w-full px-6 py-3 bg-muted hover:bg-muted/80 rounded-xl font-medium transition-colors"
              >
                Close & Finish Later
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
