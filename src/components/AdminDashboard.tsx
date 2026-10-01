import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  X,
  PlusCircle,
  LayoutDashboard,
  ShoppingBag,
  TrendingUp,
  MessageSquare,
  User,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  CheckCircle,
  Bell,
  Sliders,
  Car,
  Check,
  AlertCircle,
  Clock,
  Send,
  Save,
  ChevronRight,
  ShieldCheck,
  Settings,
  HelpCircle,
  Eye,
  Edit,
  Sparkles,
  Menu,
  ChevronLeft,
  RefreshCw,
  LogOut,
  Sliders as SlidersIcon,
  Star,
  Table,
  LayoutGrid,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  PackageCheck,
  Smartphone,
  HardDrive,
  Share2
} from "lucide-react";
import { Product, resolveImageUrl, CloudinaryImageMeta } from "../types";
import CustomizerDashboard, { SiteConfig } from "./CustomizerDashboard";
import { db, isFirebasePlaceholder, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc, setDoc, getDocs, getDocsFromCache, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";

import BrandProductForm from "./BrandProductForm";
import VehicleProductForm from "./VehicleProductForm";
import DeleteProductModal from "./DeleteProductModal";
import WebsiteBrandingManager from "./WebsiteBrandingManager";
import BrandLogosManager from "./BrandLogosManager";
import VehicleShowcaseManager from "./VehicleShowcaseManager";
import AdminSwapManager from "./AdminSwapManager";
import AdminTradeInValuationManager from "./AdminTradeInValuationManager";
import AdminTestimonialManager from "./testimonials/AdminTestimonialManager";
import AdminAlertsManager from "./AdminAlertsManager";
import { useBranding } from "../context/BrandingContext";
import {
  saveAdminActiveTab,
  getStoredAdminActiveTab,
  saveAdminProductDraft,
  getStoredAdminProductDraft,
  saveAdminFilterState,
  getStoredAdminFilterState,
  AdminProductDraft
} from "../utils/userProgressPersistence";
import { UploadService } from "../services/UploadService";
import { getStockStatus, getProductStockQuantity } from "../utils/stockUtils";
import { lockBodyScroll, unlockBodyScroll } from "../utils/scrollRetention";
import { processProductChange } from "../services/AlertService";

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
  onChangeConfig: (newConfig: SiteConfig) => void;
  onShareProduct?: (product: Product) => void;
}

interface AdminOrder {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerState: string;
  productName: string;
  productPrice: number;
  paymentStatus: "Paid" | "Unpaid" | "Confirmed";
  deliveryStatus: "Pending" | "Processing" | "Shipped" | "Delivered" | "Completed";
  date: string;
}

interface AdminTradeIn {
  id: string;
  customerName: string;
  customerPhone: string;
  customerState: string;
  submittedDevice: string;
  submittedGrade: string;
  submittedStorage: string;
  requestedUpgrade: string;
  calculatedValue: number;
  balanceDue: number;
  status: "Pending Appraisal" | "Approved" | "Rejected";
  date: string;
}

interface AdminSupportMessage {
  id: string;
  senderName: string;
  senderPhone: string;
  text: string;
  status: "Unread" | "Replied" | "Resolved" | "Archived";
  date: string;
  replyText?: string;
}

interface AdminProfile {
  businessName: string;
  adminName: string;
  phone: string;
  email: string;
}

export function getPublicIdFromCloudinaryUrl(url: string | undefined): string | null {
  if (!url || !url.includes("res.cloudinary.com")) return null;
  try {
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return null;
    let pathAfterUpload = url.substring(uploadIndex + 8);
    const parts = pathAfterUpload.split("/").filter(Boolean);
    const cleanParts = parts.filter(p => !p.includes(",") && !/^v\d+$/.test(p));
    const fullPath = cleanParts.join("/");
    const lastDot = fullPath.lastIndexOf(".");
    if (lastDot !== -1) {
      return fullPath.substring(0, lastDot);
    }
    return fullPath;
  } catch (e) {
    return null;
  }
}

export default function AdminDashboard({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  onShareProduct
}: AdminDashboardProps) {
  const { branding } = useBranding();

  useEffect(() => {
    if (isOpen) {
      lockBodyScroll();
      return () => {
        unlockBodyScroll();
      };
    }
  }, [isOpen]);

  // Primary Tabs Navigation
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "products" | "inventory" | "media" | "orders" | "tradeins" | "tradein-valuations" | "testimonials" | "messages" | "profile" | "branding" | "showcase"
  >(() => {
    const saved = getStoredAdminActiveTab();
    const validTabs = ["dashboard", "products", "inventory", "media", "orders", "tradeins", "tradein-valuations", "testimonials", "messages", "profile", "branding", "showcase"];
    if (saved && validTabs.includes(saved)) {
      return saved as any;
    }
    return "dashboard";
  });

  // Persist Active Tab
  useEffect(() => {
    saveAdminActiveTab(activeTab);
  }, [activeTab]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Toast Notifications State
  const [toastNotification, setToastNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Orders State
  const [orders, setOrders] = useState<AdminOrder[]>(() => {
    const saved = localStorage.getItem("milito_admin_orders");
    if (saved) return JSON.parse(saved);
    return [
      {
        orderId: "#MIL-4921",
        customerName: "Samuel Alao",
        customerPhone: "09088776655",
        customerState: "Lagos",
        productName: "iPhone 14 Pro Max",
        productPrice: 910000,
        paymentStatus: "Confirmed",
        deliveryStatus: "Processing",
        date: "2026-06-20 14:32"
      },
      {
        orderId: "#MIL-4922",
        customerName: "Chioma Nwachukwu",
        customerPhone: "08033221144",
        customerState: "Abuja",
        productName: "Samsung Galaxy S24 Ultra",
        productPrice: 1350000,
        paymentStatus: "Paid",
        deliveryStatus: "Shipped",
        date: "2026-06-20 12:15"
      }
    ];
  });

  // Trade-Ins State
  const [tradeIns, setTradeIns] = useState<AdminTradeIn[]>(() => {
    const saved = localStorage.getItem("milito_admin_tradeins");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "TRD-881",
        customerName: "Emeka Okafor",
        customerPhone: "08122334455",
        customerState: "Rivers",
        submittedDevice: "iPhone 11 Pro 256GB",
        submittedGrade: "Grade A",
        submittedStorage: "256GB",
        requestedUpgrade: "iPhone 15 Pro Max 512GB",
        calculatedValue: 320000,
        balanceDue: 880000,
        status: "Pending Appraisal",
        date: "2026-06-20 15:10"
      }
    ];
  });

  // Messages State
  const [messages, setMessages] = useState<AdminSupportMessage[]>(() => {
    const saved = localStorage.getItem("milito_admin_messages");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "MSG-101",
        senderName: "Amina Yusuf",
        senderPhone: "07055443322",
        text: "Hello, is the Samsung S24 Ultra in Titanium Gray currently available for instant pick up in Ikeja?",
        status: "Unread",
        date: "2026-06-20 16:05"
      }
    ];
  });

  // Admin Profile State
  const [profile, setProfile] = useState<AdminProfile>(() => {
    const saved = localStorage.getItem("milito_admin_profile");
    if (saved) return JSON.parse(saved);
    return {
      businessName: "MILITO TECH HOME Ltd",
      adminName: "Milito Admin Team",
      phone: "+234 908 676 0000",
      email: "partner@militotech.com"
    };
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("milito_admin_orders", JSON.stringify(orders));
    localStorage.setItem("milito_admin_tradeins", JSON.stringify(tradeIns));
    localStorage.setItem("milito_admin_messages", JSON.stringify(messages));
    localStorage.setItem("milito_admin_profile", JSON.stringify(profile));
  }, [orders, tradeIns, messages, profile]);

  // Product Filters & Search State with persistence
  const storedAdminFilters = useMemo(() => getStoredAdminFilterState(), []);
  const [productSearchQuery, setProductSearchQuery] = useState(() => storedAdminFilters?.searchQuery || "");
  const [adminProductTypeFilter, setAdminProductTypeFilter] = useState<"All" | "phone" | "vehicle">(() => (storedAdminFilters?.productType as any) || "All");
  const [adminBrandFilter, setAdminBrandFilter] = useState(() => storedAdminFilters?.brand || "All");
  const [adminConditionFilter, setAdminConditionFilter] = useState(() => storedAdminFilters?.condition || "All");
  const [productStatusFilter, setProductStatusFilter] = useState<"All" | "Available" | "Reserved" | "Sold">(() => (storedAdminFilters?.status as any) || "All");
  const [adminSortBy, setAdminSortBy] = useState<"newest" | "oldest" | "price-asc" | "price-desc" | "brand">(() => (storedAdminFilters?.sortBy as any) || "newest");
  const [adminViewMode, setAdminViewMode] = useState<"table" | "grid">(() => (storedAdminFilters?.viewMode as any) || "table");
  const [adminPage, setAdminPage] = useState(1);
  const [adminPageSize, setAdminPageSize] = useState(10);

  // Auto-save admin product filters
  useEffect(() => {
    saveAdminFilterState({
      searchQuery: productSearchQuery,
      productType: adminProductTypeFilter,
      brand: adminBrandFilter,
      condition: adminConditionFilter,
      status: productStatusFilter,
      sortBy: adminSortBy,
      viewMode: adminViewMode
    });
  }, [productSearchQuery, adminProductTypeFilter, adminBrandFilter, adminConditionFilter, productStatusFilter, adminSortBy, adminViewMode]);

  // Product Draft State Management
  const storedProductDraft = useMemo(() => getStoredAdminProductDraft(), []);
  const [hasProductDraft, setHasProductDraft] = useState(() => Boolean(storedProductDraft?.isDirty));

  // Add/Edit Product Form States
  const [isAddingProduct, setIsAddingProduct] = useState(() => Boolean(storedProductDraft?.isDirty && storedProductDraft.isAddingProduct));
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Delete Modal States
  const [deleteTargetProduct, setDeleteTargetProduct] = useState<Product | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Firebase Firestore Live Sync States
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(false);

  // Upload States
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [publishUploadStatus, setPublishUploadStatus] = useState<{
    isUploading: boolean;
    current: number;
    total: number;
    stageText?: string;
    isSuccess?: boolean;
    errorMessage?: string | null;
  }>({
    isUploading: false,
    current: 0,
    total: 0
  });
  const [uploadQueue, setUploadQueue] = useState<any[]>([]);
  const uploadFilesMap = useRef<Record<string, File>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionUploadedPublicIds = useRef<string[]>([]);

  // Product Form State with Draft restoration
  const [productForm, setProductForm] = useState<Partial<Product>>(() => {
    if (storedProductDraft?.isDirty && storedProductDraft.productForm) {
      return storedProductDraft.productForm;
    }
    return {
      name: "",
      brand: "", // REQUIREMENT: Blank by default so admin selects Brand first
      condition: "Premium UK Used",
      price: 350000,
      originalPrice: 420000,
      image: "",
      gallery: [],
      storageOptions: ["128GB"],
      colorOptions: [],
      description: "",
      specs: {
        screen: "6.7-inch OLED",
        camera: "48MP Dual Camera",
        chipset: "Flagship Bionic CPU",
        batterySize: "4400 mAh",
        os: "Latest OS",
        warranty: "1-Year MILITO Warranty",
        simType: "Physical SIM + eSIM"
      },
      rating: 4.9,
      reviewsCount: 12,
      availability: "In Stock",
      quantity: 1,
      tags: []
    };
  });

  // Auto-save Product draft on form changes
  useEffect(() => {
    if (isAddingProduct || editingProduct) {
      const isDirty = Boolean(productForm.name?.trim() || productForm.brand?.trim() || (productForm.price && productForm.price !== 350000) || (productForm.gallery && productForm.gallery.length > 0));
      setHasProductDraft(isDirty);
      saveAdminProductDraft({
        productForm,
        isAddingProduct,
        editingProductId: editingProduct?.id || null,
        isDirty,
        updatedAt: Date.now()
      });
    }
  }, [productForm, isAddingProduct, editingProduct]);

  // Load Products from Firestore only if catalog is empty when opened
  useEffect(() => {
    if (isOpen && (!config.products || config.products.length === 0)) {
      loadProductsFromFirestore();
    }
  }, [isOpen]);

  const loadProductsFromFirestore = async () => {
    if (isFirebasePlaceholder || !db) return;
    setIsFirebaseLoading(true);
    try {
      const qPrimary = query(collection(db, "product"));
      const qLegacy = query(collection(db, "products"));

      const [snapPrimary, snapLegacy] = await Promise.allSettled([
        getDocs(qPrimary),
        getDocs(qLegacy)
      ]);

      const fsProductsMap = new Map<string, Product>();

      const parseDocToProduct = (docSnap: any): Product => {
        const data = docSnap.data();

        // Safely extract main image string (thumbnail -> image -> galleryImages[0] -> gallery[0] -> imageUrl)
        let mainImg = "";
        if (data.thumbnail && typeof data.thumbnail === "object" && data.thumbnail.secure_url) {
          mainImg = data.thumbnail.secure_url;
        } else if (typeof data.thumbnail === "string" && data.thumbnail.trim().length > 0) {
          mainImg = data.thumbnail;
        } else if (data.image) {
          mainImg = typeof data.image === "object" ? (data.image as any).secure_url || "" : String(data.image);
        } else if (Array.isArray(data.galleryImages) && data.galleryImages.length > 0) {
          const g0 = data.galleryImages[0];
          mainImg = typeof g0 === "object" && g0 !== null ? g0.secure_url || "" : String(g0);
        } else if (Array.isArray(data.gallery) && data.gallery.length > 0) {
          const g0 = data.gallery[0];
          mainImg = typeof g0 === "object" && g0 !== null ? g0.secure_url || "" : String(g0);
        } else if (data.imageUrl) {
          mainImg = String(data.imageUrl);
        }
        if (!mainImg || mainImg === "[object Object]") {
          mainImg = "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&q=80";
        }

        // Parse thumbnail object
        const parsedThumbnail = (data.thumbnail && typeof data.thumbnail === "object" && data.thumbnail.secure_url)
          ? { secure_url: data.thumbnail.secure_url, public_id: data.thumbnail.public_id || "" }
          : { secure_url: mainImg, public_id: data.imagePublicId || getPublicIdFromCloudinaryUrl(mainImg) || "" };

        // Parse galleryImages array of CloudinaryImageMeta
        let parsedGalleryImages: CloudinaryImageMeta[] = [];
        if (Array.isArray(data.galleryImages) && data.galleryImages.length > 0) {
          parsedGalleryImages = data.galleryImages.map((g: any, idx: number) => {
            if (typeof g === "object" && g !== null) {
              return {
                secure_url: g.secure_url || "",
                public_id: g.public_id || "",
                original_filename: g.original_filename || `Image ${idx + 1}`,
                width: Number(g.width) || 0,
                height: Number(g.height) || 0,
                format: g.format || "jpg",
                bytes: Number(g.bytes) || 0,
                created_at: g.created_at || new Date().toISOString()
              };
            }
            return {
              secure_url: String(g),
              public_id: getPublicIdFromCloudinaryUrl(String(g)) || "",
              original_filename: `Image ${idx + 1}`,
              width: 0,
              height: 0,
              format: "jpg",
              bytes: 0,
              created_at: new Date().toISOString()
            };
          }).filter(g => Boolean(g.secure_url));
        }

        let galUrls: string[] = [];
        if (parsedGalleryImages.length > 0) {
          galUrls = parsedGalleryImages.map(g => g.secure_url);
        } else if (Array.isArray(data.gallery)) {
          galUrls = data.gallery.map((g: any) => typeof g === "object" ? g.secure_url : String(g)).filter(Boolean);
        } else if (mainImg) {
          galUrls = [mainImg];
        }

        const isVehicleProduct = data.productType === "vehicle" || ((data.year || data.transmission || data.mileage) ? true : false);

        return {
          id: docSnap.id,
          name: data.model || data.name || "Unknown Model",
          brand: data.brand || "Other",
          productType: isVehicleProduct ? "vehicle" : "phone",
          condition: data.condition || (isVehicleProduct ? "Foreign Used" : "Premium UK Used"),
          price: Number(data.price) || 0,
          originalPrice: Number(data.originalPrice) || Number(data.price) * 1.2,
          badge: data.badge || (isVehicleProduct ? "Verified Clean" : "Verified Grade A"),
          image: mainImg,
          imagePublicId: parsedThumbnail.public_id || data.imagePublicId || undefined,
          thumbnail: parsedThumbnail,
          galleryImages: parsedGalleryImages,
          gallery: galUrls,
          galleryPublicIds: data.galleryPublicIds || parsedGalleryImages.map(g => g.public_id).filter(Boolean),

          // Vehicle attributes
          year: data.year || undefined,
          mileage: data.mileage || undefined,
          mileageNumber: data.mileageNumber || undefined,
          transmission: data.transmission || undefined,
          fuelType: data.fuelType || undefined,
          engine: data.engine || undefined,
          driveType: data.driveType || undefined,
          bodyType: data.bodyType || undefined,
          exteriorColor: data.exteriorColor || undefined,
          interiorColor: data.interiorColor || undefined,
          vehicleStatus: data.vehicleStatus || undefined,
          documentation: data.documentation || undefined,
          location: data.location || undefined,
          customBrand: data.customBrand || undefined,
          customModel: data.customModel || undefined,
          series: data.series || undefined,

          storageOptions: data.storageOptions || data.storage || (isVehicleProduct ? [] : ["128GB"]),
          colorOptions: data.colorOptions || data.color || [],
          batteryHealth: data.batteryHealth || undefined,
          batteryHealthValue: data.batteryHealthValue || data.batteryHealth || undefined,
          batteryCondition: data.batteryCondition || undefined,
          deviceLockStatus: data.deviceLockStatus || undefined,
          description: data.description || "",
          specs: data.specs || {
            screen: isVehicleProduct ? "" : "6.7-inch OLED",
            camera: isVehicleProduct ? "" : "48MP Dual Camera",
            chipset: isVehicleProduct ? "" : "Bionic CPU",
            batterySize: isVehicleProduct ? "" : "4400 mAh",
            os: isVehicleProduct ? "" : "Latest OS",
            warranty: isVehicleProduct ? "Inspection Guaranteed" : "1-Year Warranty",
            simType: isVehicleProduct ? "" : "Physical SIM + eSIM"
          },
          rating: Number(data.rating) || 4.9,
          reviewsCount: Number(data.reviewsCount) || 10,
          availability: data.status || data.availability || "In Stock",
          featured: !!data.featured,
          quantity: data.quantity !== undefined ? Number(data.quantity) : 1,
          tags: data.tags || [],
          faceId: data.faceId || undefined,
          network: data.network || undefined,
          createdAt: data.createdAt || "",
          updatedAt: data.updatedAt || ""
        };
      };

      if (snapPrimary.status === "fulfilled" && !snapPrimary.value.empty) {
        snapPrimary.value.forEach(docSnap => {
          fsProductsMap.set(docSnap.id, parseDocToProduct(docSnap));
        });
      }
      if (snapLegacy.status === "fulfilled" && !snapLegacy.value.empty) {
        snapLegacy.value.forEach(docSnap => {
          if (!fsProductsMap.has(docSnap.id)) {
            fsProductsMap.set(docSnap.id, parseDocToProduct(docSnap));
          }
        });
      }

      if (fsProductsMap.size > 0) {
        const fsProducts = Array.from(fsProductsMap.values());
        onChangeConfig({
          ...config,
          products: fsProducts
        });
        console.log(`[Firestore Telemetry] Loaded ${fsProducts.length} product(s) from Firestore 'product' collection.`);
      }
    } catch (e) {
      console.error("Error loading products from Firestore:", e);
    } finally {
      setIsFirebaseLoading(false);
    }
  };

  // Upload Logic via centralized UploadService
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingImage(true);
    setUploadProgress(15);
    setUploadError(null);

    try {
      const uploadedMetas = await UploadService.uploadToCloudinary(files, (progress) => {
        setUploadProgress(progress);
      });

      if (uploadedMetas.length > 0) {
        const uploadedUrls = uploadedMetas.map(m => m.secure_url);
        const uploadedPublicIds = uploadedMetas.map(m => m.public_id);

        uploadedPublicIds.forEach(id => {
          if (id && !sessionUploadedPublicIds.current.includes(id)) {
            sessionUploadedPublicIds.current.push(id);
          }
        });

        setProductForm(prev => {
          const prevGalleryMetas = prev.galleryImages || (prev.gallery || []).map((url, idx) => ({
            secure_url: url,
            public_id: (prev.galleryPublicIds && prev.galleryPublicIds[idx]) || `legacy_${idx}`,
            original_filename: `Photo ${idx + 1}`
          }));

          const updatedFormGallery = [...prevGalleryMetas, ...uploadedMetas];
          const newMain = prev.image ? prev.image : uploadedUrls[0];
          const newMainPublicId = prev.imagePublicId ? prev.imagePublicId : uploadedPublicIds[0];

          return {
            ...prev,
            image: newMain,
            imagePublicId: newMainPublicId,
            gallery: updatedFormGallery.map(g => g.secure_url),
            galleryPublicIds: updatedFormGallery.map(g => g.public_id),
            galleryImages: updatedFormGallery,
            thumbnail: { secure_url: newMain, public_id: newMainPublicId }
          };
        });

        setToastNotification({
          type: "success",
          message: `Uploaded ${uploadedMetas.length} photo(s) to form preview.`
        });
        setTimeout(() => setToastNotification(null), 3000);
      } else {
        throw new Error("Unable to process the selected image files.");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to process image.");
    } finally {
      setIsUploadingImage(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Track Cloudinary uploads during form editing (NO immediate Firestore writes)
  const trackImageUploadSuccess = (
    uploadedFile: CloudinaryImageMeta | null,
    newGalleryImages: CloudinaryImageMeta[],
    newThumbnail: { secure_url: string; public_id: string }
  ) => {
    if (uploadedFile?.public_id && !sessionUploadedPublicIds.current.includes(uploadedFile.public_id)) {
      sessionUploadedPublicIds.current.push(uploadedFile.public_id);
    }
    console.log("[Publish Workflow] Image upload staged in form state:", uploadedFile);
  };

  // Save Product (Add / Edit) - Centralized Atomic Transaction via UploadService
  const handleSaveProductForm = async (e: React.FormEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    const isVehicle = productForm.productType === "vehicle";

    if (!productForm.brand) {
      const msg = isVehicle ? "Please select a vehicle make / brand first." : "Please select a smartphone brand first.";
      setUploadError(msg);
      setToastNotification({ type: "error", message: msg });
      return;
    }
    if (!productForm.name || !productForm.name.trim()) {
      const msg = isVehicle ? "Please select or enter the vehicle model name." : "Please select or enter the smartphone model name.";
      setUploadError(msg);
      setToastNotification({ type: "error", message: msg });
      return;
    }
    if (productForm.price === undefined || productForm.price === null || isNaN(Number(productForm.price)) || Number(productForm.price) <= 0) {
      const msg = "Please enter a valid selling price in Naira (₦).";
      setUploadError(msg);
      setToastNotification({ type: "error", message: msg });
      return;
    }

    setIsFirebaseLoading(true);
    setUploadError(null);
    setPublishUploadStatus({
      isUploading: true,
      current: 0,
      total: ((productForm as any)._mediaItems?.filter((m: any) => m.isLocal)?.length) || 0,
      stageText: "Publishing product to catalog..."
    });

    try {
      const updatedProduct = await UploadService.publishProduct({
        productForm,
        editingProduct,
        mediaItems: (productForm as any)._mediaItems,
        existingGalleryImages: productForm.galleryImages,
        existingThumbnail: productForm.thumbnail,
        onProgress: (stageText, progressPercent, currentUploaded, totalToUpload) => {
          setPublishUploadStatus({
            isUploading: progressPercent < 100,
            current: currentUploaded || 0,
            total: totalToUpload || 0,
            stageText,
            isSuccess: progressPercent >= 100
          });
        },
        onRefreshWebsite: (publishedProduct) => {
          const updatedList = editingProduct
            ? config.products.map(p => p.id === editingProduct.id ? publishedProduct : p)
            : [publishedProduct, ...config.products];
          onChangeConfig({ ...config, products: updatedList });
        }
      });

      sessionUploadedPublicIds.current = [];

      const notifyCount = (updatedProduct as any)?._notificationResult?.totalQueued || 0;
      setToastNotification({
        type: "success",
        message: notifyCount > 0
          ? `${updatedProduct.name || "Product"} published. ${notifyCount} customer notification ${notifyCount === 1 ? "job" : "jobs"} queued in background.`
          : `${updatedProduct.name || "Product"} published successfully to catalog.`
      });
      setTimeout(() => setToastNotification(null), 4000);

      // Clear saved product draft on publish
      saveAdminProductDraft(null);
      setHasProductDraft(false);

      setIsAddingProduct(false);
      setEditingProduct(null);
      setPublishUploadStatus({ isUploading: false, current: 0, total: 0 });
    } catch (err: any) {
      console.error("[Publish Workflow] Execution error:", err);
      const userMessage = err.message || "Image upload failed. Product was NOT published.";
      setUploadError(userMessage);
      setToastNotification({
        type: "error",
        message: userMessage
      });
    } finally {
      setIsFirebaseLoading(false);
    }
  };

  // DELETE PRODUCT WORKFLOW - Centralized via UploadService
  const handleConfirmDeleteProduct = async (p: Product) => {
    setIsDeletingProduct(true);
    setDeleteError(null);

    try {
      // 1. Collect Cloudinary public_ids from thumbnail, galleryImages, and legacy fields
      const thumbnailPublicId = p.thumbnail?.public_id || p.imagePublicId || getPublicIdFromCloudinaryUrl(p.image);
      const galleryMetaPublicIds = (p.galleryImages || []).map(g => g.public_id);
      const legacyGalleryPublicIds = p.galleryPublicIds || (p.gallery || []).map(getPublicIdFromCloudinaryUrl).filter(Boolean);
      const allPublicIds = Array.from(new Set([thumbnailPublicId, ...galleryMetaPublicIds, ...legacyGalleryPublicIds].filter(Boolean) as string[]));

      // 2. Call UploadService to delete images from Cloudinary
      if (allPublicIds.length > 0) {
        await UploadService.deleteCloudinaryImages(allPublicIds);
      }

      // 3. Delete from Firestore 'product' and 'products' collections
      if (!isFirebasePlaceholder && db) {
        try {
          await deleteDoc(doc(db, "product", p.id));
          await deleteDoc(doc(db, "products", p.id));
          console.log(`[Firestore Telemetry] Product ${p.id} deleted from Firestore collections.`);
        } catch (fErr) {
          console.warn("Firestore delete doc note:", fErr);
        }
      }

      // 4. Update Live Website & Dashboard inventory state immediately
      const updatedProducts = config.products.filter(item => item.id !== p.id);
      onChangeConfig({
        ...config,
        products: updatedProducts
      });

      setToastNotification({
        type: "success",
        message: `Product "${p.name}" deleted successfully!`
      });
      setTimeout(() => setToastNotification(null), 4000);

      setDeleteTargetProduct(null);
    } catch (err: any) {
      console.error("Delete failure error:", err);
      // Fallback state update guarantee
      const updatedProducts = config.products.filter(item => item.id !== p.id);
      onChangeConfig({
        ...config,
        products: updatedProducts
      });
      setToastNotification({
        type: "success",
        message: `Product "${p.name}" removed from inventory!`
      });
      setTimeout(() => setToastNotification(null), 4000);
      setDeleteTargetProduct(null);
    } finally {
      setIsDeletingProduct(false);
    }
  };

  // Filtered & Sorted Products Calculation
  const filteredProducts = useMemo(() => {
    return config.products.filter(p => {
      // Search Query
      const q = productSearchQuery.toLowerCase();
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);

      // Product Type / Category Filter
      const pType = p.productType || ((p.year || p.transmission || p.mileage) ? "vehicle" : "phone");
      const matchesType = adminProductTypeFilter === "All" || pType === adminProductTypeFilter;

      // Brand Filter
      const matchesBrand = adminBrandFilter === "All" || p.brand.toLowerCase() === adminBrandFilter.toLowerCase();

      // Condition Filter
      const matchesCondition = adminConditionFilter === "All" || p.condition === adminConditionFilter;

      // Status Filter
      let matchesStatus = true;
      if (productStatusFilter === "Available") matchesStatus = (p.quantity ?? 1) > 0 && p.availability !== "Sold Out";
      if (productStatusFilter === "Sold") matchesStatus = (p.quantity ?? 0) <= 0 || p.availability === "Sold Out";

      return matchesSearch && matchesType && matchesBrand && matchesCondition && matchesStatus;
    }).sort((a, b) => {
      if (adminSortBy === "newest") return (b.createdAt || "").localeCompare(a.createdAt || "");
      if (adminSortBy === "oldest") return (a.createdAt || "").localeCompare(b.createdAt || "");
      if (adminSortBy === "price-asc") return a.price - b.price;
      if (adminSortBy === "price-desc") return b.price - a.price;
      if (adminSortBy === "brand") return a.brand.localeCompare(b.brand);
      return 0;
    });
  }, [config.products, productSearchQuery, adminProductTypeFilter, adminBrandFilter, adminConditionFilter, productStatusFilter, adminSortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / adminPageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (adminPage - 1) * adminPageSize;
    return filteredProducts.slice(start, start + adminPageSize);
  }, [filteredProducts, adminPage, adminPageSize]);

  // Inventory Metrics
  const metrics = useMemo(() => {
    const total = config.products.length;
    const available = config.products.filter(p => (p.quantity ?? 1) > 0 && p.availability !== "Sold Out").length;
    const outOfStock = config.products.filter(p => (p.quantity ?? 0) <= 0 || p.availability === "Sold Out").length;
    const featured = config.products.filter(p => p.featured).length;
    const lowStock = config.products.filter(p => (p.quantity ?? 1) > 0 && (p.quantity ?? 1) <= 3).length;
    return { total, available, outOfStock, featured, lowStock };
  }, [config.products]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] w-screen h-screen flex bg-[#0B0F17] text-white font-sans overflow-hidden">
      
      {/* Toast Notification Banner */}
      {toastNotification && (
        <div className="fixed top-5 right-5 z-[10050] flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-900 border border-emerald-500/50 shadow-2xl animate-fade-in text-xs font-bold text-white">
          <CheckCircle2 className="w-4 h-4 text-[#00B14F]" />
          <span>{toastNotification.message}</span>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      <DeleteProductModal
        isOpen={!!deleteTargetProduct}
        product={deleteTargetProduct}
        onClose={() => setDeleteTargetProduct(null)}
        onConfirmDelete={handleConfirmDeleteProduct}
        isDeleting={isDeletingProduct}
        error={deleteError}
      />

      {/* View Product Details Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 z-[10010] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto bg-[#111827] border border-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6 text-white space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold px-2.5 py-1 rounded bg-[#00B14F]/20 text-[#00B14F]">
                  {viewingProduct.brand} • {viewingProduct.condition}
                </span>
                <h3 className="text-base font-bold text-white">{viewingProduct.name}</h3>
              </div>
              <button onClick={() => setViewingProduct(null)} className="p-1 rounded-lg text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="w-full h-48 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center p-2">
                <img src={resolveImageUrl(viewingProduct.image)} alt={viewingProduct.name} className="max-h-full max-w-full object-contain rounded-lg" />
              </div>
              <div className="space-y-2 text-xs">
                <p><strong className="text-gray-400">Price:</strong> <span className="text-[#00B14F] font-bold text-sm">₦{viewingProduct.price?.toLocaleString()}</span></p>
                <p><strong className="text-gray-400">Stock Quantity:</strong> {viewingProduct.quantity ?? 1}</p>
                {viewingProduct.batteryHealth && (
                  <p><strong className="text-gray-400">Battery Health:</strong> {viewingProduct.batteryHealth}</p>
                )}
                {viewingProduct.batteryCondition && (
                  <p><strong className="text-gray-400">Battery Condition:</strong> {viewingProduct.batteryCondition}</p>
                )}
                {viewingProduct.faceId && (
                  <p><strong className="text-gray-400">Biometrics / Face ID:</strong> {viewingProduct.faceId}</p>
                )}
                {viewingProduct.network && (
                  <p><strong className="text-gray-400">Network:</strong> {viewingProduct.network}</p>
                )}
                {viewingProduct.deviceLockStatus && (
                  <p><strong className="text-gray-400">Device Lock:</strong> {viewingProduct.deviceLockStatus}</p>
                )}
                {viewingProduct.storageOptions && viewingProduct.storageOptions.length > 0 && (
                  <p><strong className="text-gray-400">Storage Options:</strong> {viewingProduct.storageOptions.join(", ")}</p>
                )}
                {viewingProduct.imagePublicId && (
                  <p className="text-[10px] text-gray-500 font-mono truncate"><strong className="text-gray-400">Cloudinary ID:</strong> {viewingProduct.imagePublicId}</p>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed bg-gray-900/60 p-3 rounded-xl border border-gray-800">
              {viewingProduct.description || "No description provided."}
            </p>

            <div className="flex justify-end gap-3 pt-2">
              {onShareProduct && (
                <button
                  onClick={() => {
                    onShareProduct(viewingProduct);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gray-800 text-emerald-400 hover:bg-gray-700 border border-emerald-500/30"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share Product Link
                </button>
              )}
              <button
                onClick={() => {
                  setEditingProduct(viewingProduct);
                  setProductForm(viewingProduct);
                  setViewingProduct(null);
                  setIsAddingProduct(true);
                  setActiveTab("products");
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#00B14F] text-black hover:bg-[#009241]"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit This Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BACKDROP OVERLAY */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* COLLAPSIBLE SIDEBAR */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#0E131F] border-r border-gray-800/80 transition-all duration-300 flex flex-col ${
          isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-20"
        }`}
      >
        {/* Sidebar Header Logo */}
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3 overflow-hidden">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt="Logo"
                className="w-9 h-9 object-contain rounded-xl bg-white/5 p-0.5 border border-white/10 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00B14F] to-emerald-700 flex items-center justify-center text-black font-black text-lg shrink-0 shadow-lg shadow-[#00B14F]/20">
                M
              </div>
            )}
            {isSidebarOpen && (
              <div className="min-w-0">
                <h1 className="text-sm font-black tracking-tight text-white truncate">MILITO TECH</h1>
                <p className="text-[10px] font-bold text-[#00B14F] uppercase tracking-widest">Admin Portal</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {[
            { id: "dashboard", label: "Overview", icon: LayoutDashboard },
            { id: "products", label: "Products Catalog", icon: ShoppingBag, badge: metrics.total },
            { id: "alerts", label: "Notification Alerts", icon: Bell },
            { id: "showcase", label: "Homepage Showcase", icon: Car },
            { id: "branding", label: "Website Branding", icon: Sparkles },
            { id: "inventory", label: "Inventory & Stock", icon: TrendingUp, badge: metrics.lowStock > 0 ? metrics.lowStock : undefined },
            { id: "media", label: "Media Library", icon: ImageIcon },
            { id: "orders", label: "Orders & Sales", icon: Clock, badge: orders.length },
            { id: "tradein-valuations", label: "Trade-In Valuation", icon: HardDrive },
            { id: "tradeins", label: "Swap Requests", icon: RefreshCw },
            { id: "testimonials", label: "Testimonials & Proof", icon: ShieldCheck },
            { id: "messages", label: "Support Messages", icon: MessageSquare, badge: messages.filter(m => m.status === "Unread").length },
            { id: "profile", label: "Portal Settings", icon: Settings }
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  if (item.id !== "products") {
                    setIsAddingProduct(false);
                    setEditingProduct(null);
                  }
                  if (typeof window !== "undefined" && window.innerWidth < 1024) {
                    setIsSidebarOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all group ${
                  isActive
                    ? "bg-[#00B14F] text-black shadow-lg shadow-[#00B14F]/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-black" : "text-gray-400 group-hover:text-white"}`} />
                {isSidebarOpen && <span className="truncate flex-1 text-left">{item.label}</span>}
                {isSidebarOpen && item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? "bg-black text-[#00B14F]" : "bg-gray-800 text-gray-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-800 space-y-2">
          <button
            onClick={() => {
              setIsCustomizerOpen(true);
              if (typeof window !== "undefined" && window.innerWidth < 1024) {
                setIsSidebarOpen(false);
              }
            }}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-bold hover:bg-purple-600 hover:text-white transition-all"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            {isSidebarOpen && <span>Customize Site Theme</span>}
          </button>
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gray-800/80 text-gray-400 text-xs font-bold hover:bg-red-600 hover:text-white transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {isSidebarOpen && <span>Exit Portal</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#0B0F17] min-w-0">
        {/* Top Header Bar */}
        <header className="px-4 sm:px-6 py-3.5 bg-[#0E131F] border-b border-gray-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-xl bg-gray-800 text-gray-300 hover:text-white shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-white capitalize truncate">
                {activeTab === "dashboard" && "Dashboard Overview"}
                {activeTab === "products" && "Smartphone Catalog Storefront"}
                {activeTab === "alerts" && "Product Notification Demands"}
                {activeTab === "branding" && "Website Branding & Asset Management"}
                {activeTab === "inventory" && "Stock & Inventory Control"}
                {activeTab === "media" && "Cloudinary Media Library"}
                {activeTab === "orders" && "Naira Live Orders"}
                {activeTab === "tradein-valuations" && "Trade-In Valuation"}
                {activeTab === "tradeins" && "Device Swap Appraisals"}
                {activeTab === "testimonials" && "Customer Testimonials & Proofs"}
                {activeTab === "messages" && "Customer Support Inbox"}
                {activeTab === "profile" && "Portal Settings"}
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-400 truncate hidden xs:block">MILITO TECH Central Inventory Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Refresh Firestore */}
            <button
              onClick={loadProductsFromFirestore}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-all flex items-center gap-1.5 text-xs font-bold"
              title="Refresh catalog from Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFirebaseLoading ? "animate-spin text-[#00B14F]" : ""}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>

            {/* Cloudinary Status Indicator Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Cloudinary CDN Connected
            </div>

            {/* Add Product CTAs */}
            {activeTab === "products" && !isAddingProduct && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      productType: "phone",
                      name: "",
                      brand: "", // First select brand
                      condition: "Premium UK Used",
                      price: 380000,
                      quantity: 1,
                      availability: "In Stock"
                    });
                    setIsAddingProduct(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-[#00B14F] text-black font-extrabold text-xs shadow-lg shadow-[#00B14F]/20 hover:bg-[#009241] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <Smartphone className="w-3.5 h-3.5 hidden sm:inline" />
                  <span className="hidden sm:inline">Add Smartphone</span>
                  <span className="sm:hidden">Phone</span>
                </button>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      productType: "vehicle",
                      name: "",
                      brand: "",
                      condition: "Foreign Used",
                      year: "2020",
                      transmission: "Automatic",
                      fuelType: "Petrol",
                      driveType: "AWD",
                      location: "Lagos",
                      vehicleStatus: "Available",
                      documentation: "Complete Original Customs Paper",
                      price: 8500000,
                      quantity: 1,
                      availability: "In Stock"
                    });
                    setIsAddingProduct(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <Car className="w-3.5 h-3.5 hidden sm:inline" />
                  <span className="hidden sm:inline">Add Vehicle</span>
                  <span className="sm:hidden">Vehicle</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Tab Content Panels */}
        <div className="flex-1 p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">

          {/* TAB 1: OVERVIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-4 sm:space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
                {[
                  { label: "Total Products", value: metrics.total, color: "from-blue-500/20 to-blue-600/10", border: "border-blue-500/30", text: "text-blue-400", icon: ShoppingBag },
                  { label: "Available Stock", value: metrics.available, color: "from-emerald-500/20 to-emerald-600/10", border: "border-emerald-500/30", text: "text-emerald-400", icon: PackageCheck },
                  { label: "Out of Stock", value: metrics.outOfStock, color: "from-red-500/20 to-red-600/10", border: "border-red-500/30", text: "text-red-400", icon: AlertTriangle },
                  { label: "Featured Items", value: metrics.featured, color: "from-amber-500/20 to-amber-600/10", border: "border-amber-500/30", text: "text-amber-400", icon: Star },
                  { label: "Low Stock Alert", value: metrics.lowStock, color: "from-purple-500/20 to-purple-600/10", border: "border-purple-500/30", text: "text-purple-400", icon: TrendingUp }
                ].map((stat, i) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={i} className={`p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br ${stat.color} border ${stat.border} shadow-xl flex items-center justify-between`}>
                      <div>
                        <p className="text-[10px] sm:text-xs font-bold text-gray-400">{stat.label}</p>
                        <h3 className={`text-lg sm:text-2xl font-black ${stat.text} mt-0.5 sm:mt-1`}>{stat.value}</h3>
                      </div>
                      <div className={`p-2.5 sm:p-3 rounded-xl bg-black/40 ${stat.text}`}>
                        <StatIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions & Cloudinary Status */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2 p-4 sm:p-6 rounded-2xl bg-[#111827] border border-gray-800 space-y-4">
                  <h3 className="text-xs sm:text-sm font-extrabold text-white">Recently Added Inventory</h3>
                  <div className="divide-y divide-gray-800">
                    {config.products.slice(0, 5).map(p => (
                      <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <img src={resolveImageUrl(p.image)} alt={p.name} className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-contain bg-gray-800 border border-gray-700 p-0.5 shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-gray-800 text-gray-300">
                                {p.productType === "vehicle" ? "🚗 Vehicle" : "📱 Phone"}
                              </span>
                              <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                            </div>
                            <span className="text-[10px] text-gray-400 block truncate">{p.brand} • {p.condition}</span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-[#00B14F] shrink-0">₦{p.price?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 sm:p-6 rounded-2xl bg-[#111827] border border-gray-800 space-y-4">
                  <h3 className="text-xs sm:text-sm font-extrabold text-white">System Status</h3>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
                      <span className="text-gray-300">Firestore Database</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">Connected</span>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
                      <span className="text-gray-300">Cloudinary Image Storage</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">Active CDN</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS (CATALOG & ADD/EDIT) */}
          {activeTab === "products" && (
            <div className="space-y-4 sm:space-y-6">
              {isAddingProduct ? (
                /* DYNAMIC FORM COMPONENT (SMARTPHONE OR VEHICLE) */
                <div className="bg-[#0E131F] p-2 sm:p-4 rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-800">
                    <div>
                      <h3 className="text-xs sm:text-base font-extrabold text-white truncate">
                        {editingProduct 
                          ? `Edit ${productForm.productType === "vehicle" ? "Vehicle" : "Smartphone"}: ${editingProduct.name}` 
                          : `Add New ${productForm.productType === "vehicle" ? "Vehicle" : "Smartphone"} to Storefront`}
                      </h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {productForm.productType === "vehicle" 
                          ? "Enter automotive specifications, condition, papers, and high-resolution vehicle photos." 
                          : "Enter brand specifications, grade condition, and high-resolution smartphone photos."}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Product Type Switcher (Only enabled when creating fresh product) */}
                      {!editingProduct && (
                        <div className="flex items-center bg-gray-900 p-1 rounded-xl border border-gray-800">
                          <button
                            type="button"
                            onClick={() => {
                              if (productForm.productType !== "phone") {
                                setProductForm(prev => ({
                                  ...prev,
                                  productType: "phone",
                                  brand: "",
                                  name: "",
                                  condition: "Premium UK Used",
                                  price: 380000
                                }));
                              }
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              (productForm.productType || "phone") === "phone"
                                ? "bg-[#00B14F] text-black shadow-sm"
                                : "text-gray-400 hover:text-white"
                            }`}
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>Phones</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (productForm.productType !== "vehicle") {
                                setProductForm(prev => ({
                                  ...prev,
                                  productType: "vehicle",
                                  brand: "",
                                  name: "",
                                  condition: "Foreign Used",
                                  year: "2020",
                                  transmission: "Automatic",
                                  fuelType: "Petrol",
                                  driveType: "AWD",
                                  location: "Lagos",
                                  vehicleStatus: "Available",
                                  documentation: "Complete Original Customs Paper",
                                  price: 8500000
                                }));
                              }
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              productForm.productType === "vehicle"
                                ? "bg-[#00B14F] text-black shadow-sm"
                                : "text-gray-400 hover:text-white"
                            }`}
                          >
                            <Car className="w-3.5 h-3.5" />
                            <span>Vehicles</span>
                          </button>
                        </div>
                      )}

                      {hasProductDraft && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold uppercase tracking-wider">
                          Unsaved Draft
                        </span>
                      )}

                      {hasProductDraft && (
                        <button
                          type="button"
                          onClick={() => {
                            saveAdminProductDraft(null);
                            setHasProductDraft(false);
                            setProductForm({
                              name: "",
                              brand: "",
                              condition: "Premium UK Used",
                              price: 350000,
                              originalPrice: 420000,
                              image: "",
                              gallery: [],
                              storageOptions: ["128GB"],
                              colorOptions: [],
                              description: "",
                              specs: {
                                screen: "6.7-inch OLED",
                                camera: "48MP Dual Camera",
                                chipset: "Flagship Bionic CPU",
                                batterySize: "4400 mAh",
                                os: "Latest OS",
                                warranty: "1-Year MILITO Warranty",
                                simType: "Physical SIM + eSIM"
                              },
                              rating: 4.9,
                              reviewsCount: 12,
                              availability: "In Stock",
                              quantity: 1,
                              tags: []
                            });
                            setIsAddingProduct(false);
                            setEditingProduct(null);
                            setToastNotification({
                              type: "info",
                              message: "Discarded unsaved product draft."
                            });
                            setTimeout(() => setToastNotification(null), 3000);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/20 shrink-0 cursor-pointer"
                        >
                          Discard Draft
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingProduct(false);
                          setEditingProduct(null);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gray-800 text-gray-300 text-xs font-bold hover:text-white shrink-0 cursor-pointer"
                      >
                        ← Back to Catalog
                      </button>
                    </div>
                  </div>

                  {productForm.productType === "vehicle" ? (
                    <VehicleProductForm
                      productForm={productForm}
                      setProductForm={setProductForm}
                      editingProduct={editingProduct}
                      onSave={handleSaveProductForm}
                      onCancel={() => {
                        setIsAddingProduct(false);
                        setEditingProduct(null);
                      }}
                      isSaving={isFirebaseLoading}
                      uploadQueue={uploadQueue}
                      isUploadingImage={isUploadingImage}
                      uploadProgress={uploadProgress}
                      uploadError={uploadError}
                      uploadStatus={publishUploadStatus}
                      fileInputRef={fileInputRef}
                      handleFileSelect={handleFileSelect}
                      onImageUploadSuccess={trackImageUploadSuccess}
                    />
                  ) : (
                    <BrandProductForm
                      productForm={productForm}
                      setProductForm={setProductForm}
                      editingProduct={editingProduct}
                      onSave={handleSaveProductForm}
                      onCancel={() => {
                        setIsAddingProduct(false);
                        setEditingProduct(null);
                      }}
                      isSaving={isFirebaseLoading}
                      uploadQueue={uploadQueue}
                      isUploadingImage={isUploadingImage}
                      uploadProgress={uploadProgress}
                      uploadError={uploadError}
                      uploadStatus={publishUploadStatus}
                      fileInputRef={fileInputRef}
                      handleFileSelect={handleFileSelect}
                      onImageUploadSuccess={trackImageUploadSuccess}
                    />
                  )}
                </div>
              ) : (
                /* PRODUCT LISTING TABLE / GRID VIEW */
                <div className="space-y-4">
                  {/* SEARCH & FILTERS BAR */}
                  <div className="p-3 sm:p-4 bg-[#111827] border border-gray-800 rounded-2xl flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[180px]">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search Brand or Model..."
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
                      {/* Filter by Category */}
                      <select
                        value={adminProductTypeFilter}
                        onChange={(e) => {
                          setAdminProductTypeFilter(e.target.value as any);
                          setAdminBrandFilter("All");
                        }}
                        className="bg-gray-900 border border-gray-700 rounded-xl px-2.5 py-2 text-xs text-white focus:border-[#00B14F] focus:outline-none font-bold"
                      >
                        <option value="All">All Categories</option>
                        <option value="phone">📱 Smartphones</option>
                        <option value="vehicle">🚗 Vehicles</option>
                      </select>

                      {/* Filter by Brand */}
                      <select
                        value={adminBrandFilter}
                        onChange={(e) => setAdminBrandFilter(e.target.value)}
                        className="bg-gray-900 border border-gray-700 rounded-xl px-2.5 py-2 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                      >
                        <option value="All">All Brands</option>
                        {adminProductTypeFilter === "vehicle" ? (
                          <>
                            <option value="Toyota">Toyota</option>
                            <option value="Lexus">Lexus</option>
                            <option value="Mercedes-Benz">Mercedes-Benz</option>
                            <option value="Honda">Honda</option>
                            <option value="Hyundai">Hyundai</option>
                            <option value="Kia">Kia</option>
                            <option value="Ford">Ford</option>
                            <option value="Land Rover">Land Rover</option>
                            <option value="BMW">BMW</option>
                            <option value="Audi">Audi</option>
                            <option value="Nissan">Nissan</option>
                            <option value="Mazda">Mazda</option>
                            <option value="Other">Other Brand</option>
                          </>
                        ) : adminProductTypeFilter === "phone" ? (
                          <>
                            <option value="Apple">Apple</option>
                            <option value="Samsung">Samsung</option>
                            <option value="Google Pixel">Google Pixel</option>
                            <option value="Xiaomi">Xiaomi</option>
                            <option value="OnePlus">OnePlus</option>
                            <option value="Infinix">Infinix</option>
                            <option value="Tecno">Tecno</option>
                            <option value="Other">Other Brand</option>
                          </>
                        ) : (
                          <>
                            <option value="Apple">Apple</option>
                            <option value="Samsung">Samsung</option>
                            <option value="Google Pixel">Google Pixel</option>
                            <option value="Toyota">Toyota</option>
                            <option value="Lexus">Lexus</option>
                            <option value="Mercedes-Benz">Mercedes-Benz</option>
                            <option value="Honda">Honda</option>
                            <option value="Xiaomi">Xiaomi</option>
                            <option value="Infinix">Infinix</option>
                            <option value="Tecno">Tecno</option>
                            <option value="Other">Other</option>
                          </>
                        )}
                      </select>

                      {/* Filter by Condition */}
                      <select
                        value={adminConditionFilter}
                        onChange={(e) => setAdminConditionFilter(e.target.value)}
                        className="bg-gray-900 border border-gray-700 rounded-xl px-2.5 py-2 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                      >
                        <option value="All">All Conditions</option>
                        <option value="Brand New">Brand New</option>
                        <option value="Premium UK Used">Premium UK Used</option>
                      </select>

                      {/* Filter by Availability */}
                      <select
                        value={productStatusFilter}
                        onChange={(e) => setProductStatusFilter(e.target.value as any)}
                        className="bg-gray-900 border border-gray-700 rounded-xl px-2.5 py-2 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                      >
                        <option value="All">All Status</option>
                        <option value="Available">In Stock</option>
                        <option value="Sold">Out of Stock</option>
                      </select>

                      {/* Sort Options */}
                      <select
                        value={adminSortBy}
                        onChange={(e) => setAdminSortBy(e.target.value as any)}
                        className="bg-gray-900 border border-gray-700 rounded-xl px-2.5 py-2 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                      >
                        <option value="newest">Sort: Newest</option>
                        <option value="oldest">Sort: Oldest</option>
                        <option value="price-asc">Price Low-High</option>
                        <option value="price-desc">Price High-Low</option>
                        <option value="brand">Brand A-Z</option>
                      </select>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center justify-end gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800 self-end sm:self-auto">
                      <button
                        onClick={() => setAdminViewMode("table")}
                        className={`p-1.5 rounded-lg transition-colors ${adminViewMode === "table" ? "bg-[#00B14F] text-black" : "text-gray-400 hover:text-white"}`}
                        title="Table View"
                      >
                        <Table className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setAdminViewMode("grid")}
                        className={`p-1.5 rounded-lg transition-colors ${adminViewMode === "grid" ? "bg-[#00B14F] text-black" : "text-gray-400 hover:text-white"}`}
                        title="Grid View"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* PRODUCTS TABLE / GRID */}
                  {adminViewMode === "table" ? (
                    <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                      <div className="overflow-x-auto w-full scrollbar-thin">
                        <table className="w-full min-w-[640px] text-left text-xs text-gray-300">
                          <thead className="bg-gray-900/80 uppercase text-[10px] font-black tracking-wider text-gray-400 border-b border-gray-800">
                            <tr>
                              <th className="p-3.5">Product Image</th>
                              <th className="p-3.5">Brand & Model</th>
                              <th className="p-3.5">Condition</th>
                              <th className="p-3.5">Price (NGN)</th>
                              <th className="p-3.5">Stock & Status</th>
                              <th className="p-3.5">Featured</th>
                              <th className="p-3.5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800/60">
                            {paginatedProducts.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="text-center p-8 text-gray-500">
                                  No products match your search/filters.
                                </td>
                              </tr>
                            ) : (
                              paginatedProducts.map(p => (
                                <tr key={p.id} className="hover:bg-gray-900/50 transition-colors">
                                  <td className="p-3.5">
                                    <img
                                      src={resolveImageUrl(p.thumbnail?.secure_url || p.thumbnail || p.image || p.galleryImages?.[0]?.secure_url || p.gallery?.[0], { width: 120, brand: p.brand })}
                                      alt={p.name}
                                      loading="lazy"
                                      decoding="async"
                                      referrerPolicy="no-referrer"
                                      className="w-12 h-12 rounded-xl object-contain bg-gray-800 border border-gray-700 p-0.5"
                                    />
                                  </td>
                                  <td className="p-3.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[9px] px-1.5 py-0.5 rounded font-black bg-gray-800 text-gray-300">
                                        {p.productType === "vehicle" ? "🚗" : "📱"}
                                      </span>
                                      <div className="font-extrabold text-white text-xs">{p.name}</div>
                                    </div>
                                    <span className="text-[10px] text-gray-400">
                                      {p.productType === "vehicle" && p.year ? `${p.year} • ` : ""}{p.brand}
                                      {p.transmission ? ` • ${p.transmission}` : ""}
                                      {p.mileage ? ` • ${p.mileage}` : ""}
                                    </span>
                                  </td>
                                  <td className="p-3.5">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.condition === "Brand New" ? "bg-purple-500/20 text-purple-300" : "bg-blue-500/20 text-blue-300"}`}>
                                      {p.condition}
                                    </span>
                                  </td>
                                  <td className="p-3.5 font-black text-[#00B14F]">
                                    ₦{p.price?.toLocaleString()}
                                  </td>
                                  <td className="p-3.5">
                                    {(() => {
                                      const qty = getProductStockQuantity(p);
                                      const status = getStockStatus(qty);
                                      return (
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          status.isSoldOut 
                                            ? "bg-red-500/20 text-red-400" 
                                            : status.isUrgent 
                                            ? "bg-amber-500/20 text-amber-300" 
                                            : "bg-emerald-500/20 text-emerald-400"
                                        }`}>
                                          {status.label} ({qty})
                                        </span>
                                      );
                                    })()}
                                  </td>
                                  <td className="p-3.5">
                                    {p.featured ? <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> : <Star className="w-4 h-4 text-gray-600" />}
                                  </td>
                                  <td className="p-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {onShareProduct && (
                                        <button
                                          onClick={() => onShareProduct(p)}
                                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                                          title="Share Product Link"
                                        >
                                          <Share2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => setViewingProduct(p)}
                                        className="p-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700"
                                        title="View Details"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingProduct(p);
                                          setProductForm(p);
                                          setIsAddingProduct(true);
                                        }}
                                        className="p-1.5 rounded-lg bg-gray-800 text-blue-400 hover:bg-blue-600/20"
                                        title="Edit Product"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setDeleteTargetProduct(p)}
                                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white"
                                        title="Delete Product"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    /* GRID VIEW */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {paginatedProducts.map(p => (
                        <div key={p.id} className="p-3.5 sm:p-4 bg-[#111827] border border-gray-800 rounded-2xl space-y-3">
                          <div className="w-full h-36 sm:h-40 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center p-2">
                            <img
                              src={resolveImageUrl(p.thumbnail?.secure_url || p.thumbnail || p.image || p.galleryImages?.[0]?.secure_url || p.gallery?.[0], { width: 320, brand: p.brand })}
                              alt={p.name}
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                              className="max-h-full max-w-full object-contain rounded-lg"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1 mb-0.5">
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-gray-800 text-gray-300">
                                {p.productType === "vehicle" ? "🚗 Vehicle" : "📱 Phone"}
                              </span>
                              <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400">{p.brand}</span>
                            </div>
                            <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                            {p.productType === "vehicle" && (p.year || p.transmission) && (
                              <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                                {[p.year, p.transmission, p.mileage].filter(Boolean).join(" • ")}
                              </p>
                            )}
                            <p className="text-sm font-black text-[#00B14F] mt-1">₦{p.price?.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                            <button onClick={() => setViewingProduct(p)} className="text-xs font-bold text-gray-400 hover:text-white">View</button>
                            <div className="flex items-center gap-1">
                              {onShareProduct && (
                                <button
                                  onClick={() => onShareProduct(p)}
                                  className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                                  title="Share Product Link"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button onClick={() => { setEditingProduct(p); setProductForm(p); setIsAddingProduct(true); }} className="p-1.5 rounded-lg bg-gray-800 text-blue-400"><Edit className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setDeleteTargetProduct(p)} className="p-1.5 rounded-lg bg-red-500/20 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pagination Controls */}
                  <div className="p-3 sm:p-4 bg-[#111827] border border-gray-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-gray-400">
                    <span>Showing {filteredProducts.length} items (Page {adminPage} of {totalPages})</span>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={adminPage <= 1}
                        onClick={() => setAdminPage(prev => Math.max(1, prev - 1))}
                        className="px-3 py-1.5 rounded-lg bg-gray-800 text-white disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <button
                        disabled={adminPage >= totalPages}
                        onClick={() => setAdminPage(prev => Math.min(totalPages, prev + 1))}
                        className="px-3 py-1.5 rounded-lg bg-gray-800 text-white disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: WEBSITE BRANDING */}
          {activeTab === "branding" && (
            <WebsiteBrandingManager />
          )}

          {/* TAB 3: INVENTORY */}
          {activeTab === "inventory" && (
            <div className="space-y-6">
              <div className="p-6 bg-[#111827] border border-gray-800 rounded-2xl space-y-4">
                <h3 className="text-sm font-extrabold text-white">Stock Level Management</h3>
                <div className="divide-y divide-gray-800">
                  {config.products.map(p => (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={resolveImageUrl(p.thumbnail?.secure_url || p.thumbnail || p.image || p.galleryImages?.[0]?.secure_url || p.gallery?.[0], { width: 100, brand: p.brand })}
                          alt={p.name}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-contain bg-gray-800 p-0.5"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-white">{p.name}</h4>
                          <span className="text-[10px] text-gray-400">Current Stock: {p.quantity ?? 1}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            const oldQty = p.quantity ?? 1;
                            const updatedQty = Math.max(0, oldQty - 1);
                            const newAvailability = updatedQty === 0 ? "Sold Out" : p.availability;
                            const updatedList = config.products.map(item => item.id === p.id ? { ...item, quantity: updatedQty, availability: newAvailability as any } : item);
                            onChangeConfig({ ...config, products: updatedList });

                            // Persist to Firestore
                            if (db && !isFirebasePlaceholder && p.id) {
                              try {
                                await updateDoc(doc(db, "products", p.id), {
                                  quantity: updatedQty,
                                  stockQuantity: updatedQty,
                                  availability: newAvailability,
                                  status: newAvailability,
                                  updatedAt: new Date().toISOString()
                                });
                              } catch (e) {
                                console.warn("Could not sync stock decrease to Firestore:", e);
                              }
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-white font-bold cursor-pointer transition"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-black">{p.quantity ?? 1}</span>
                        <button
                          onClick={async () => {
                            const oldQty = p.quantity ?? 0;
                            const updatedQty = oldQty + 1;
                            const updatedList = config.products.map(item => item.id === p.id ? { ...item, quantity: updatedQty, availability: "In Stock" as const } : item);
                            onChangeConfig({ ...config, products: updatedList });

                            // Persist to Firestore
                            if (db && !isFirebasePlaceholder && p.id) {
                              try {
                                await updateDoc(doc(db, "products", p.id), {
                                  quantity: updatedQty,
                                  stockQuantity: updatedQty,
                                  availability: "In Stock",
                                  status: "In Stock",
                                  updatedAt: new Date().toISOString()
                                });
                              } catch (e) {
                                console.warn("Could not sync stock increase to Firestore:", e);
                              }
                            }

                            // Trigger Automatic Restock Notification Engine if 0 -> N
                            if (oldQty === 0 && updatedQty > 0 && p.id) {
                              try {
                                const notifyRes = await processProductChange({
                                  productId: p.id,
                                  productName: p.name,
                                  oldQuantity: oldQty,
                                  newQuantity: updatedQty,
                                  oldAvailability: "Sold Out",
                                  newAvailability: "In Stock",
                                  source: "admin_inventory_tab"
                                });

                                if (notifyRes.totalQueued > 0) {
                                  setToastNotification({
                                    type: "success",
                                    message: `Restocked! ${notifyRes.totalQueued} customer notification ${notifyRes.totalQueued === 1 ? "job" : "jobs"} queued in background.`
                                  });
                                  setTimeout(() => setToastNotification(null), 4000);
                                }
                              } catch (notifyErr) {
                                console.error("Restock notification trigger error:", notifyErr);
                              }
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-white font-bold cursor-pointer transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MEDIA LIBRARY */}
          {activeTab === "media" && (
            <div className="p-6 bg-[#111827] border border-gray-800 rounded-2xl space-y-4">
              <h3 className="text-sm font-extrabold text-white">Cloudinary Uploaded Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {config.products.flatMap(p => [p.image, ...(p.gallery || [])]).filter(Boolean).map((url, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-800 bg-gray-900 aspect-square flex items-center justify-center p-1">
                    <img
                      src={resolveImageUrl(url, { width: 200 })}
                      alt={`Media ${idx}`}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS */}
          {activeTab === "orders" && (
            <div className="p-6 bg-[#111827] border border-gray-800 rounded-2xl space-y-4">
              <h3 className="text-sm font-extrabold text-white">Live Orders Management</h3>
              <div className="divide-y divide-gray-800 text-xs">
                {orders.map(o => (
                  <div key={o.orderId} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">{o.orderId}</span> - {o.customerName} ({o.customerState})
                      <p className="text-gray-400">{o.productName} • ₦{o.productPrice.toLocaleString()}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">{o.paymentStatus}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: NOTIFICATION ALERTS & CUSTOMER REACTIVATION */}
          {activeTab === "alerts" && (
            <AdminAlertsManager />
          )}

          {/* TAB: TRADE-IN VALUATIONS DATABASE */}
          {activeTab === "tradein-valuations" && (
            <AdminTradeInValuationManager />
          )}

          {/* TAB 6: TRADE-INS & SWAP DEALS */}
          {activeTab === "tradeins" && (
            <AdminSwapManager />
          )}

          {/* TAB 7: MESSAGES */}
          {activeTab === "messages" && (
            <div className="p-6 bg-[#111827] border border-gray-800 rounded-2xl space-y-4">
              <h3 className="text-sm font-extrabold text-white">Support Chat Inbox</h3>
              <div className="divide-y divide-gray-800 text-xs">
                {messages.map(m => (
                  <div key={m.id} className="py-3 space-y-1">
                    <div className="flex justify-between font-bold text-white">
                      <span>{m.senderName} ({m.senderPhone})</span>
                      <span className="text-gray-500 text-[10px]">{m.date}</span>
                    </div>
                    <p className="text-gray-300">{m.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="p-6 bg-[#111827] border border-gray-800 rounded-2xl space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#00B14F]" />
                    MILITO TECH Portal & Storefront Settings
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Configure business profile details, cloud service connections, and payment integrations.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  {/* Business Profile */}
                  <div className="p-4 bg-gray-900/80 border border-gray-800 rounded-xl space-y-3">
                    <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-[#00B14F]">1. Business Profile Information</h4>
                    <div>
                      <label className="block text-gray-400 mb-1 font-semibold">Storefront Business Name</label>
                      <input
                        type="text"
                        value={profile.businessName}
                        onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                        className="w-full bg-[#0B0F17] border border-gray-700 rounded-xl p-2.5 text-white focus:border-[#00B14F] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1 font-semibold">WhatsApp & Calls Support Line</label>
                      <input
                        type="text"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full bg-[#0B0F17] border border-gray-700 rounded-xl p-2.5 text-white focus:border-[#00B14F] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1 font-semibold">Admin Contact Email</label>
                      <input
                        type="email"
                        value={profile.email || "admin@militotech.com"}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full bg-[#0B0F17] border border-gray-700 rounded-xl p-2.5 text-white focus:border-[#00B14F] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Integration Statuses */}
                  <div className="p-4 bg-gray-900/80 border border-gray-800 rounded-xl space-y-4">
                    <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-[#00B14F]">2. Infrastructure & CDN Status</h4>
                    
                    <div className="p-3 bg-[#0B0F17] rounded-xl border border-emerald-500/30 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">Cloudinary Image CDN</span>
                        <span className="text-[10px] text-gray-400">Cloud Name: militotech • Preset: ml_default</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ● Connected
                      </span>
                    </div>

                    <div className="p-3 bg-[#0B0F17] rounded-xl border border-blue-500/30 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">Firebase Firestore Database</span>
                        <span className="text-[10px] text-gray-400">Collection: /products • Real-time Sync Active</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        ● Active
                      </span>
                    </div>

                    <div className="p-3 bg-[#0B0F17] rounded-xl border border-emerald-500/30 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">WhatsApp Direct Order System</span>
                        <span className="text-[10px] text-gray-400">Order Now & Direct Dispatch Ready</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ● Online
                      </span>
                    </div>
                  </div>

                  {/* Homepage Showcase Shortcut */}
                  <div className="md:col-span-2 p-4 bg-gradient-to-r from-[#121824] to-gray-900 border border-emerald-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#00B14F]/15 border border-[#00B14F]/30 flex items-center justify-center text-[#00B14F] shrink-0">
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-xs">Homepage Vehicle Showcase Promotion</h4>
                        <p className="text-[11px] text-gray-400">Manage auto-rotating video/image slides, copy texts, and timing speeds.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("showcase")}
                      className="px-4 py-2 rounded-xl bg-[#00B14F] hover:bg-[#00c95a] text-black font-extrabold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-[#00B14F]/20"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Configure Showcase
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800 flex flex-wrap items-center justify-between gap-4">
                  <button
                    onClick={() => setIsCustomizerOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-extrabold transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Open Storefront Theme & Hero Customizer
                  </button>

                  <button
                    onClick={() => {
                      localStorage.setItem("milito_admin_profile", JSON.stringify(profile));
                      setToastNotification({
                        type: "success",
                        message: "Portal settings saved successfully!"
                      });
                      setTimeout(() => setToastNotification(null), 3000);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#00B14F] text-black font-extrabold text-xs hover:bg-[#009241] shadow-lg shadow-[#00B14F]/20 transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Save Portal Settings
                  </button>
                </div>
              </div>

              {/* BRAND LOGOS MANAGEMENT SECTION */}
              <BrandLogosManager />
            </div>
          )}

          {/* TAB 9: HOMEPAGE VEHICLE SHOWCASE MANAGER */}
          {activeTab === "showcase" && (
            <div className="space-y-6">
              <VehicleShowcaseManager />
            </div>
          )}

          {/* TAB 10: TESTIMONIALS & CUSTOMER PROOF MANAGER */}
          {activeTab === "testimonials" && (
            <div className="space-y-6">
              <AdminTestimonialManager />
            </div>
          )}

        </div>
      </main>

      {/* Theme Customizer Modal */}
      {isCustomizerOpen && (
        <CustomizerDashboard
          isOpen={isCustomizerOpen}
          onClose={() => setIsCustomizerOpen(false)}
          config={config}
          onChangeConfig={onChangeConfig}
          onResetToDefault={() => {}}
        />
      )}
    </div>
  );
}
