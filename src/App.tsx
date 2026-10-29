import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense, lazy } from "react";
import { ChevronDown, ArrowRight, ArrowLeft, ShieldCheck, Truck, RefreshCw, X } from "lucide-react";
import { motion } from "motion/react";

// Critical above-the-fold components
import Header from "./components/Header";
import HomepageProductTeaser from "./components/HomepageProductTeaser";
import VehicleShowcaseBanner from "./components/VehicleShowcaseBanner";
import Footer from "./components/Footer";
import MobileBottomNav from "./components/MobileBottomNav";
import type { SiteConfig } from "./components/CustomizerDashboard";
import type { CategoryKey } from "./components/CategoryShoppingPage";
import { generateProductShareUrl } from "./utils/productUrl";

import StorePage from "./components/StorePage";
import VehiclesPage from "./components/VehiclesPage";
import SwapDealsPage from "./components/SwapDealsPage";
import CategoryShoppingPage from "./components/CategoryShoppingPage";
import PublicProductPage from "./components/PublicProductPage";
import SwapDealsSection from "./components/SwapDealsSection";
import MilitoQCSection from "./components/MilitoQCSection";
import PublicTestimonialsSection from "./components/testimonials/PublicTestimonialsSection";
import FinalCtaSection from "./components/FinalCtaSection";
import ProductDetailsModal from "./components/ProductDetailsModal";

// Lazy-loaded secondary modals & admin dashboard
const OrderTrackerModal = lazy(() => import("./components/OrderTrackerModal"));
const CheckoutModal = lazy(() => import("./components/CheckoutModal"));
const SupportChat = lazy(() => import("./components/SupportChat"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const ShareProductModal = lazy(() => import("./components/ShareProductModal"));
const NotifyMeModal = lazy(() => import("./components/NotifyMeModal").then((m) => ({ default: m.NotifyMeModal })));

// Types & Data
import { Product, ProductAlertType, CartItem, resolveImageUrl, getImageCanonicalKey } from "./types";
import { SAMPLE_PRODUCTS, FAQS } from "./data";
import liveCatalogSnapshot from "./data/liveCatalogSnapshot.json";
import { searchStoreProducts } from "./utils/searchUtils";
import { DiscoveryCardId } from "./context/DiscoveryCardsContext";
import {
  saveScrollPosition,
  getSavedScrollPosition,
  restoreScrollPosition,
  saveModalScroll,
  restoreModalScroll,
  lockBodyScroll,
  unlockBodyScroll
} from "./utils/scrollRetention";

const DEFAULT_CONFIG: SiteConfig = {
  hero: {
    titleLine1: "Find.",
    titleLine2Color: "Swap.",
    titleLine3: "Upgrade.",
    subtitle: "Shop genuine Brand New & Grade A UK Used smartphones with transparent pricing, accurate battery specs, and reliable nationwide delivery.",
    badgeTag: "MILITO Marketplace",
    badgeText: "Simple & Direct Ordering in Nigeria",
    ctaTextPrimary: "Explore Store",
    ctaTextSecondary: "Start a Swap",
    metric1Value: "100%",
    metric1Label: "Genuine Core Stocks",
    metric2Value: "35-Point",
    metric2Label: "Inspection Cleared",
    metric3Value: "Direct",
    metric3Label: "WhatsApp & Fast Delivery",
    glowIntensity: 4,
    particleCount: 15
  },
  products: (Array.isArray(liveCatalogSnapshot) && liveCatalogSnapshot.length > 0
    ? (liveCatalogSnapshot as unknown as Product[])
    : SAMPLE_PRODUCTS),
  animationMedia: {
    useCustomShowcase: false,
    type: "image",
    url: "",
    motionPattern: "floating",
    motionSpeed: 6,
    ambientColor: "green"
  }
};

export default function App() {
  // Page Routing State: "gateway" (initial two-option landing) vs "gadgets" vs "store" vs "vehicles" vs "swap-deals"
  const [activePage, setActivePage] = useState<"gateway" | "gadgets" | "store" | "vehicles" | "swap-deals">(() => {
    if (typeof window === "undefined") return "gateway";
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get("view");
    if (viewParam === "gadgets" || viewParam === "store" || viewParam === "vehicles" || viewParam === "swap-deals") {
      return viewParam;
    }
    return "gateway";
  });
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null);

  // Public Product Route state for Shareable Sales Funnel: /product/:slug--:id or ?product=:id
  const [publicProductRoute, setPublicProductRoute] = useState<{
    productId: string;
    source: string;
    slug?: string;
  } | null>(() => {
    if (typeof window === "undefined") return null;
    const path = window.location.pathname;
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const source = params.get("source") || params.get("utm_source") || "direct";

    // 1. Path format: /product/:slug--:id or /product/:id
    const match = path.match(/^\/product\/([^/?#]+)/);
    if (match) {
      const raw = match[1];
      if (raw.includes("--")) {
        const parts = raw.split("--");
        const id = parts[parts.length - 1];
        return { productId: id, source, slug: parts.slice(0, -1).join("--") };
      }
      return { productId: raw, source };
    }

    // 2. Query param format: ?product=id or ?p=id
    const qProduct = params.get("product") || params.get("p");
    if (qProduct) {
      return { productId: qProduct, source };
    }

    return null;
  });

  // State for sharing modal
  const [sharingProduct, setSharingProduct] = useState<Product | null>(null);
  const [notifyProduct, setNotifyProduct] = useState<Product | null>(null);
  const [notifyAlertType, setNotifyAlertType] = useState<ProductAlertType>("RESTOCK");
  const [checkoutOrderSource, setCheckoutOrderSource] = useState<string>("direct");

  // Handle browser back/forward buttons with product deep links and gateway/experience views
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const path = window.location.pathname;
      const search = window.location.search;
      const params = new URLSearchParams(search);
      const source = params.get("source") || params.get("utm_source") || "direct";

      const match = path.match(/^\/product\/([^/?#]+)/);
      if (match) {
        const raw = match[1];
        if (raw.includes("--")) {
          const parts = raw.split("--");
          const id = parts[parts.length - 1];
          setPublicProductRoute({ productId: id, source, slug: parts.slice(0, -1).join("--") });
        } else {
          setPublicProductRoute({ productId: raw, source });
        }
        return;
      }

      const qProduct = params.get("product") || params.get("p");
      if (qProduct) {
        setPublicProductRoute({ productId: qProduct, source });
        return;
      }

      setPublicProductRoute(null);
      setActiveCategory(null);

      const statePage = event.state?.page;
      const viewParam = params.get("view");
      const targetView = statePage || viewParam;
      if (
        targetView === "gateway" ||
        targetView === "gadgets" ||
        targetView === "store" ||
        targetView === "vehicles" ||
        targetView === "swap-deals"
      ) {
        setActivePage(targetView);
      } else {
        setActivePage("gateway");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleOpenPublicProductPage = useCallback((product: Product, source = "direct") => {
    const shareUrl = generateProductShareUrl(product, source);
    try {
      window.history.pushState({ productId: product.id }, "", shareUrl);
    } catch (e) {
      // safe fallback
    }
    setPublicProductRoute({ productId: product.id, source });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleClosePublicProductPage = useCallback((targetPage: "gateway" | "store" | "gadgets" | "vehicles" = "store") => {
    try {
      const nextUrl = targetPage === "gateway" ? "/" : `/?view=${targetPage}`;
      window.history.pushState({ page: targetPage }, "", nextUrl);
    } catch (e) {
      // safe fallback
    }
    setPublicProductRoute(null);
    setActivePage(targetPage);
  }, []);

  const handleShareProduct = useCallback((product: Product) => {
    setSharingProduct(product);
  }, []);

  const handleOpenNotifyMe = useCallback((product: Product, alertType: ProductAlertType = "RESTOCK") => {
    setNotifyProduct(product);
    setNotifyAlertType(alertType);
  }, []);

  // Continuously record scroll coordinate for the active page
  useEffect(() => {
    let scrollTimer: any = null;
    const handleScroll = () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        saveScrollPosition(activePage);
      }, 80);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
      saveScrollPosition(activePage);
    };
  }, [activePage]);

  const handleNavigatePage = (page: "gateway" | "gadgets" | "store" | "vehicles" | "swap-deals", sectionId?: string) => {
    setActiveCategory(null);
    if (publicProductRoute) {
      setPublicProductRoute(null);
    }

    // Save current page position before switching
    saveScrollPosition(activePage);

    if (activePage !== page || publicProductRoute) {
      try {
        const nextUrl = page === "gateway" ? "/" : `/?view=${page}`;
        window.history.pushState({ page, sectionId }, "", nextUrl);
      } catch (e) {
        // safe fallback
      }
    }

    if (activePage === page && !sectionId) {
      // User tapped the same page tab without a section anchor: retain position
      return;
    }

    setActivePage(page);

    if (
      page === "gateway" ||
      page === "swap-deals" ||
      page === "store" ||
      (activePage === "gateway" && !sectionId)
    ) {
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }

    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          // If section not found, fallback to restored position without resetting
          restoreScrollPosition(page, "smooth");
        }
      }, 120);
    } else {
      // Returning to previous view: seamlessly restore exact saved coordinate
      setTimeout(() => {
        restoreScrollPosition(page, "instant");
      }, 50);
    }
  };

  // Dedicated back action from Swap Deals page that returns user specifically to the swap-deals section where they clicked the button
  const handleBackFromSwapDeals = useCallback(() => {
    try {
      window.history.pushState({ page: "gadgets" }, "", "/?view=gadgets");
    } catch (e) {}
    setActivePage("gadgets");
    setTimeout(() => {
      const el = document.getElementById("swap-deals");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        restoreScrollPosition("gadgets", "smooth");
      }
    }, 60);
  }, []);

  // Target product for Swap Deals (when user clicks 'Swap for This' from product page)
  const [swapTargetProduct, setSwapTargetProduct] = useState<Product | null>(null);

  const handleSwapForThis = useCallback((product: Product) => {
    setSwapTargetProduct(product);
    setSelectedProductDetails(null);
    unlockBodyScroll();
    handleNavigatePage("swap-deals");
  }, []);

  // Navigation scrolling logic
  const handleScrollToSection = (id: string) => {
    // Explicit Home / Hero logo tap: smoothly scroll to top of gadgets storefront
    if (id === "hero" && activePage === "gadgets") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      saveScrollPosition("gadgets", 0);
      return;
    }

    if (id === "store" || id === "shop" || id === "store-inventory") {
      handleNavigatePage("store");
      return;
    }

    if (id === "trade-in" || id === "swap-deals") {
      handleNavigatePage("swap-deals");
      return;
    }

    if (id === "vehicles" || id === "vehicle-import" || id === "vehicles-catalog") {
      if (activePage !== "vehicles") {
        saveScrollPosition(activePage);
        setActivePage("vehicles");
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            restoreScrollPosition("vehicles", "smooth");
          }
        }, 120);
        return;
      }
    } else if (id === "hero" || id === "how-it-works" || id === "reviews" || id === "faq") {
      if (activePage !== "gadgets") {
        saveScrollPosition(activePage);
        setActivePage("gadgets");
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            restoreScrollPosition("gadgets", "smooth");
          }
        }, 120);
        return;
      }
    }

    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // State Management
  const [config, setConfig] = useState<SiteConfig>(() => {
    try {
      const saved = localStorage.getItem("milito_tech_site_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.hero) {
          if (typeof parsed.hero.badgeTag === "string" && (parsed.hero.badgeTag.includes("Escrow") || parsed.hero.badgeTag.includes("Lock") || parsed.hero.badgeTag.includes("Secure"))) {
            parsed.hero.badgeTag = DEFAULT_CONFIG.hero.badgeTag;
          }
          if (typeof parsed.hero.badgeText === "string" && (parsed.hero.badgeText.includes("Escrow") || parsed.hero.badgeText.includes("Lock") || parsed.hero.badgeText.includes("Active in Nigeria"))) {
            parsed.hero.badgeText = DEFAULT_CONFIG.hero.badgeText;
          }
        }
        // Seamlessly merge any new sample products (such as iPad and Watch devices)
        if (Array.isArray(parsed?.products)) {
          const existingIds = new Set(parsed.products.map((p: any) => p.id));
          const missing = DEFAULT_CONFIG.products.filter(p => !existingIds.has(p.id));
          if (missing.length > 0) {
            parsed.products = [...parsed.products, ...missing];
          }
        } else {
          parsed.products = DEFAULT_CONFIG.products;
        }
        return parsed;
      }
    } catch (e) {
      console.error("Config parser error:", e);
    }
    return DEFAULT_CONFIG;
  });

  useEffect(() => {
    const saveTimer = setTimeout(() => {
      try {
        localStorage.setItem("milito_tech_site_config", JSON.stringify(config));
      } catch (e) {
        // Ignore storage quota warnings on constrained mobile devices
      }
    }, 600);
    return () => clearTimeout(saveTimer);
  }, [config]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let isCancelled = false;

    const timer = setTimeout(async () => {
      if (isCancelled) return;
      try {
        const { db, isFirebasePlaceholder } = await import("./lib/firebase");
        if (isCancelled || isFirebasePlaceholder || !db) return;

        const { collection, onSnapshot, query } = await import("firebase/firestore");
        if (isCancelled) return;
        const qProduct = query(collection(db, "product"));
        const qProducts = query(collection(db, "products"));

        // Master combined map across both 'product' and 'products' collections
        const masterProductsMap = new Map<string, Product>();

        const parseDocToProduct = (docSnap: any): Product => {
          const data = docSnap.data();

          // Safely extract main thumbnail URL as a string (thumbnail -> image -> galleryImages[0] -> gallery[0] -> imagePublicId -> imageUrl)
          let mainImg = "";
          if (data.thumbnail && typeof data.thumbnail === "object" && (data.thumbnail.secure_url || data.thumbnail.url)) {
            mainImg = data.thumbnail.secure_url || data.thumbnail.url;
          } else if (typeof data.thumbnail === "string" && data.thumbnail.trim().length > 0) {
            mainImg = data.thumbnail.trim();
          } else if (data.image) {
            mainImg = typeof data.image === "object" ? ((data.image as any).secure_url || (data.image as any).url || "") : String(data.image).trim();
          } else if (Array.isArray(data.galleryImages) && data.galleryImages.length > 0) {
            const g0 = data.galleryImages[0];
            mainImg = typeof g0 === "object" && g0 !== null ? (g0.secure_url || g0.url || "") : String(g0).trim();
          } else if (Array.isArray(data.gallery) && data.gallery.length > 0) {
            const g0 = data.gallery[0];
            mainImg = typeof g0 === "object" && g0 !== null ? (g0.secure_url || g0.url || "") : String(g0).trim();
          } else if (data.imagePublicId && typeof data.imagePublicId === "string") {
            mainImg = `https://res.cloudinary.com/militotech/image/upload/${data.imagePublicId.trim()}`;
          } else if (data.public_id && typeof data.public_id === "string") {
            mainImg = `https://res.cloudinary.com/militotech/image/upload/${data.public_id.trim()}`;
          } else if (Array.isArray(data.galleryPublicIds) && data.galleryPublicIds[0]) {
            mainImg = `https://res.cloudinary.com/militotech/image/upload/${data.galleryPublicIds[0].trim()}`;
          } else if (data.imageUrl) {
            mainImg = String(data.imageUrl).trim();
          } else if (data.secure_url) {
            mainImg = String(data.secure_url).trim();
          }

          if (!mainImg || mainImg === "[object Object]") {
            mainImg = "";
          }

          // Parse thumbnail object
          const parsedThumbnail = (data.thumbnail && typeof data.thumbnail === "object" && (data.thumbnail.secure_url || data.thumbnail.url))
            ? { secure_url: data.thumbnail.secure_url || data.thumbnail.url, public_id: data.thumbnail.public_id || data.imagePublicId || "" }
            : { secure_url: mainImg, public_id: data.imagePublicId || data.public_id || "" };

          // Parse galleryImages array of CloudinaryImageMeta
          let rawGalleryImages: any[] = [];
          if (Array.isArray(data.galleryImages) && data.galleryImages.length > 0) {
            rawGalleryImages = data.galleryImages.map((g: any, idx: number) => {
              if (typeof g === "object" && g !== null) {
                return {
                  secure_url: g.secure_url || g.url || g.previewUrl || "",
                  public_id: g.public_id || (data.galleryPublicIds && data.galleryPublicIds[idx]) || "",
                  original_filename: g.original_filename || `Image ${idx + 1}`,
                  width: Number(g.width) || 0,
                  height: Number(g.height) || 0,
                  format: g.format || "jpg",
                  bytes: Number(g.bytes) || 0,
                  created_at: g.created_at || data.createdAt || new Date().toISOString()
                };
              }
              return {
                secure_url: String(g),
                public_id: (data.galleryPublicIds && data.galleryPublicIds[idx]) || "",
                original_filename: `Image ${idx + 1}`,
                width: 0,
                height: 0,
                format: "jpg",
                bytes: 0,
                created_at: data.createdAt || new Date().toISOString()
              };
            }).filter((g: any) => Boolean(g.secure_url));
          } else if (Array.isArray(data.gallery) && data.gallery.length > 0) {
            rawGalleryImages = data.gallery.map((g: any, idx: number) => {
              const url = typeof g === "object" && g !== null ? (g.secure_url || g.url) : String(g);
              return {
                secure_url: url,
                public_id: data.galleryPublicIds?.[idx] || "",
                original_filename: `Image ${idx + 1}`,
                width: 0,
                height: 0,
                format: "jpg",
                bytes: 0,
                created_at: data.createdAt || new Date().toISOString()
              };
            }).filter((g: any) => Boolean(g.secure_url));
          } else if (Array.isArray(data.galleryPublicIds) && data.galleryPublicIds.length > 0) {
            rawGalleryImages = data.galleryPublicIds.map((pid: string, idx: number) => ({
              secure_url: `https://res.cloudinary.com/militotech/image/upload/${pid.trim()}`,
              public_id: data.galleryPublicIds[idx] || "",
              original_filename: `Image ${idx + 1}`,
              width: 0,
              height: 0,
              format: "jpg",
              bytes: 0,
              created_at: data.createdAt || new Date().toISOString()
            })).filter((g: any) => Boolean(g.secure_url));
          } else if (mainImg) {
            rawGalleryImages = [{
              secure_url: mainImg,
              public_id: parsedThumbnail.public_id || data.imagePublicId || "",
              original_filename: "Main Photo",
              width: 0,
              height: 0,
              format: "jpg",
              bytes: 0,
              created_at: data.createdAt || new Date().toISOString()
            }];
          }

          // Deduplicate parsed gallery items strictly by canonical key
          const seenKeySet = new Set<string>();
          const parsedGalleryImages: any[] = [];
          for (const item of rawGalleryImages) {
            const k = getImageCanonicalKey(item.secure_url) || getImageCanonicalKey(item);
            if (k && !seenKeySet.has(k)) {
              seenKeySet.add(k);
              parsedGalleryImages.push(item);
            }
          }

          const galUrls: string[] = parsedGalleryImages.map(g => g.secure_url).filter(Boolean);
          const galPids: string[] = parsedGalleryImages.map(g => g.public_id).filter(Boolean);

          const isVehicle = data.productType === "vehicle" || Boolean(data.year || data.transmission || data.mileage || data.fuelType || ["Toyota", "Lexus", "Mercedes-Benz", "Honda", "Hyundai", "Kia", "Ford", "Land Rover", "BMW", "Audi", "Nissan", "Mazda"].includes(data.brand));

          return {
            id: docSnap.id,
            productType: isVehicle ? "vehicle" : (data.productType || "phone"),
            name: data.model || data.name || "Unknown Model",
            brand: data.brand || "Other",
            condition: data.condition || (isVehicle ? "Foreign Used" : "Premium UK Used"),
            price: Number(data.price) || 0,
            originalPrice: Number(data.originalPrice) || Number(data.price) * 1.2,
            badge: data.badge || (isVehicle ? "Verified Direct Tokunbo / Nigerian Used" : "Verified Grade A++"),
            image: (parsedGalleryImages[0]?.secure_url) || mainImg,
            imagePublicId: (parsedGalleryImages[0]?.public_id) || parsedThumbnail.public_id || data.imagePublicId || "",
            thumbnail: parsedGalleryImages[0] ? { secure_url: parsedGalleryImages[0].secure_url, public_id: parsedGalleryImages[0].public_id } : parsedThumbnail,
            galleryImages: parsedGalleryImages,
            gallery: galUrls,
            galleryPublicIds: galPids,
            year: data.year || undefined,
            mileage: data.mileage || undefined,
            transmission: data.transmission || undefined,
            fuelType: data.fuelType || undefined,
            engineSize: data.engineSize || undefined,
            driveType: data.driveType || undefined,
            location: data.location || undefined,
            vehicleStatus: data.vehicleStatus || undefined,
            documentation: data.documentation || undefined,
            color: data.color || (typeof data.color === "string" ? data.color : undefined),
            interiorColor: data.interiorColor || undefined,
            vin: data.vin || undefined,
            vehicleFeatures: Array.isArray(data.vehicleFeatures) ? data.vehicleFeatures : (Array.isArray(data.features) ? data.features : undefined),
            storageOptions: data.storageOptions || (Array.isArray(data.storage) ? data.storage : data.storage ? [data.storage] : (isVehicle ? [] : ["128GB"])),
            colorOptions: data.colorOptions || (Array.isArray(data.color) ? data.color : []),
            batteryHealth: data.batteryHealth || undefined,
            batteryHealthValue: data.batteryHealthValue || data.batteryHealth || undefined,
            batteryCondition: data.batteryCondition || undefined,
            deviceLockStatus: data.deviceLockStatus || undefined,
            faceId: data.faceId || undefined,
            fingerprint: data.fingerprint || undefined,
            networkCapability: data.networkCapability || undefined,
            network: data.network || undefined,
            description: data.description || "",
            specs: data.specs || (isVehicle ? undefined : {
              screen: "6.7-inch OLED",
              camera: "48MP Quad Pixel",
              chipset: "Bionic CPU Logic",
              batterySize: "3900 mAh",
              os: "Latest Version Unlocked",
              warranty: "1-Year Warranty",
              simType: "1 Physical SIM + active eSIM"
            }),
            rating: Number(data.rating) || 4.9,
            reviewsCount: Number(data.reviewsCount) || 1,
            stockQuantity: typeof data.stockQuantity === "number"
              ? Number(data.stockQuantity)
              : typeof data.quantity === "number"
              ? Number(data.quantity)
              : (data.status === "Sold Out" || data.availability === "Sold Out" ? 0 : 5),
            quantity: typeof data.stockQuantity === "number"
              ? Number(data.stockQuantity)
              : typeof data.quantity === "number"
              ? Number(data.quantity)
              : (data.status === "Sold Out" || data.availability === "Sold Out" ? 0 : 5),
            availability: (typeof data.stockQuantity === "number" && Number(data.stockQuantity) <= 0) || (typeof data.quantity === "number" && Number(data.quantity) <= 0) || data.status === "Sold Out" || data.availability === "Sold Out" ? "Sold Out" : (data.status || data.availability || "In Stock"),
            featured: !!data.featured,
            categorySlug: data.categorySlug || (isVehicle ? "vehicles" : "phones"),
            assignedAccessories: Array.isArray(data.assignedAccessories) ? data.assignedAccessories : undefined,
            assignedAccessoryIds: Array.isArray(data.assignedAccessoryIds) ? data.assignedAccessoryIds : undefined,
            createdAt: data.createdAt || "",
            updatedAt: data.updatedAt || ""
          };
        };

        const handleSnapshot = (querySnapshot: any, isPrimary: boolean) => {
          if (!querySnapshot) return;

          querySnapshot.forEach((docSnap: any) => {
            const product = parseDocToProduct(docSnap);
            // Insert or update in master map (primary collection 'product' takes precedence)
            if (isPrimary || !masterProductsMap.has(docSnap.id)) {
              masterProductsMap.set(docSnap.id, product);
            }
          });

          if (masterProductsMap.size > 0) {
            const fsProducts = Array.from(masterProductsMap.values());
            setConfig(prev => ({
              ...prev,
              products: fsProducts
            }));
          }
        };

        const unsub1 = onSnapshot(qProduct, (snap) => handleSnapshot(snap, true), (err) => {
          console.warn("Realtime Firestore 'product' listener notice:", err);
        });
        const unsub2 = onSnapshot(qProducts, (snap) => handleSnapshot(snap, false), (err) => {
          console.warn("Realtime Firestore 'products' listener notice:", err);
        });

        unsubscribe = () => {
          unsub1();
          unsub2();
        };
      } catch (err) {
        console.error("Failed to sync live catalog on boot:", err);
      }
    }, 180);

    // Prefetch primary experience chunks in idle time after initial paint so navigation is instant
    const prefetchTimer = setTimeout(() => {
      if (isCancelled) return;
      import("./components/StorePage").catch(() => {});
      import("./components/VehiclesPage").catch(() => {});
      import("./components/SwapDealsSection").catch(() => {});
    }, 450);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      clearTimeout(prefetchTimer);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const getAmbientGlowClass = () => {
    switch (config.animationMedia.ambientColor) {
      case "emerald":
        return "bg-emerald-500/20 shadow-[0_0_80px_rgba(16,185,129,0.35)]";
      case "blue":
        return "bg-sky-500/20 shadow-[0_0_80px_rgba(14,165,233,0.35)]";
      case "purple":
        return "bg-purple-500/20 shadow-[0_0_80px_rgba(168,85,247,0.35)]";
      case "gold":
        return "bg-amber-500/20 shadow-[0_0_80px_rgba(245,158,11,0.35)]";
      case "green":
      default:
        return "bg-[#00b14f]/20 shadow-[0_0_80px_rgba(0,177,79,0.35)]";
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split(/[?#]/)[0];
    } else if (url.includes("youtube.com/embed/")) {
      videoId = url.split("youtube.com/embed/")[1]?.split(/[?#]/)[0];
    } else if (url.includes("v=")) {
      videoId = url.split("v=")[1]?.split(/[?#&]/)[0];
    } else {
      videoId = url; // assume raw videoId
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playlist=${videoId}&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1`;
  };

  const [cart, setCart] = useState<CartItem[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoadHeroVideo, setShouldLoadHeroVideo] = useState(false);

  useEffect(() => {
    // Skip heavy background MP4 download on 2G / 3G / Data Saver so bandwidth goes 100% to fast browsing
    try {
      const conn = typeof navigator !== "undefined" ? (navigator as any).connection : null;
      if (conn && (conn.saveData || conn.effectiveType === "slow-2g" || conn.effectiveType === "2g" || conn.effectiveType === "3g")) {
        return;
      }
    } catch {}

    const vidTimer = setTimeout(() => {
      setShouldLoadHeroVideo(true);
    }, 300);
    return () => clearTimeout(vidTimer);
  }, []);

  useEffect(() => {
    if (!shouldLoadHeroVideo) return;
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;

      video.play().catch(() => {});

      const playVideo = () => {
        if (video) {
          video.play().catch(() => {});
        }
      };

      window.addEventListener("click", playVideo, { once: true });
      window.addEventListener("touchstart", playVideo, { once: true });
      window.addEventListener("scroll", playVideo, { once: true });
      window.addEventListener("mousemove", playVideo, { once: true });

      return () => {
        window.removeEventListener("click", playVideo);
        window.removeEventListener("touchstart", playVideo);
        window.removeEventListener("scroll", playVideo);
        window.removeEventListener("mousemove", playVideo);
      };
    }
  }, [shouldLoadHeroVideo]);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  
  // Modals state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutDirectItem, setCheckoutDirectItem] = useState<{
    product: Product;
    selectedStorage: string;
    selectedColor: { name: string; hex: string };
    quantity: number;
    price: number;
  } | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [trackerInitialOrderId, setTrackerInitialOrderId] = useState<string>("");
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Active tab for mobile bottom navigation
  const mobileActiveTab = useMemo<"home" | "shop" | "swap" | "cart" | "profile">(() => {
    if (isCartOpen) return "cart";
    if (isLoginModalOpen) return "profile";
    if (activeCategory || activePage === "store") return "shop";
    if (activePage === "swap-deals") return "swap";
    return "home";
  }, [isCartOpen, isLoginModalOpen, activeCategory, activePage]);

  // Modal open/close handlers preserving exact background scroll coordinates
  const handleOpenProductDetails = useCallback((p: Product) => {
    saveModalScroll();
    handleOpenPublicProductPage(p, "spec");
  }, [handleOpenPublicProductPage]);

  const handleCloseProductDetails = useCallback(() => {
    setSelectedProductDetails(null);
    restoreModalScroll();
  }, []);

  const handleOpenCheckout = useCallback(() => {
    saveModalScroll();
    setIsCheckoutOpen(true);
  }, []);

  const handleBuyNowProtectedOrder = useCallback((product: Product, storage: string, color: { name: string; hex: string }, price: number, source?: string) => {
    saveModalScroll();
    setCheckoutOrderSource(source || "direct");
    setCheckoutDirectItem({
      product,
      selectedStorage: storage,
      selectedColor: color,
      quantity: 1,
      price,
      orderSource: source || "direct"
    });
    setIsCheckoutOpen(true);
  }, []);

  // Resolve active public product for shareable funnel
  const activePublicProduct = useMemo(() => {
    if (!publicProductRoute) return null;
    return config.products.find((p) => p.id === publicProductRoute.productId) || null;
  }, [publicProductRoute, config.products]);

  const handleCloseCheckout = useCallback(() => {
    setIsCheckoutOpen(false);
    setCheckoutDirectItem(null);
    restoreModalScroll();
  }, []);

  const handleOpenTracker = useCallback(() => {
    saveModalScroll();
    setIsTrackerOpen(true);
  }, []);

  const handleCloseTracker = useCallback(() => {
    setIsTrackerOpen(false);
    restoreModalScroll();
  }, []);

  const handleOpenDashboard = useCallback(() => {
    saveModalScroll();
    setIsDashboardOpen(true);
  }, []);

  const handleCloseDashboard = useCallback(() => {
    setIsDashboardOpen(false);
    restoreModalScroll();
  }, []);

  const handleOpenCompare = useCallback(() => {
    saveModalScroll();
    setIsCompareOpen(true);
  }, []);

  const handleCloseCompare = useCallback(() => {
    setIsCompareOpen(false);
    restoreModalScroll();
  }, []);

  // Lock body scroll when compare modal is active
  useEffect(() => {
    if (isCompareOpen) {
      lockBodyScroll();
      return () => {
        unlockBodyScroll();
      };
    }
  }, [isCompareOpen]);

  // Filter & Search states for Phones Catalogue
  const [brandFilter, setBrandFilter] = useState<"All" | "Apple" | "Samsung" | "Google Pixel" | "Tecno" | "Infinix" | "Redmi">("All");
  const [conditionFilter, setConditionFilter] = useState<"All" | "Brand New" | "Premium UK Used">("All");
  const [priceRangeFilter, setPriceRangeFilter] = useState<"All" | "under-200k" | "200k-500k" | "500k-1m" | "above-1m">("All");
  const [storageFilter, setStorageFilter] = useState<"All" | "64GB" | "128GB" | "256GB" | "512GB" | "1TB">("All");
  const [batteryHealthFilter, setBatteryHealthFilter] = useState<"All" | "90%+" | "95%+" | "100%">("All");
  const [availabilityFilter, setAvailabilityFilter] = useState<"All" | "In Stock" | "Reserved" | "Sold Out">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceSort, setPriceSort] = useState<"Default" | "LowToHigh" | "HighToLow">("Default");
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // FAQ Accordion index
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Cart operations
  const handleAddToCart = useCallback((product: Product, storage: string, color: { name: string; hex: string }) => {
    const itemKey = `${product.id}-${storage}-${color.name}`;
    
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === itemKey);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      } else {
        return [
          ...prev,
          {
            id: itemKey,
            product,
            quantity: 1,
            selectedStorage: storage,
            selectedColor: color,
          },
        ];
      }
    });
  }, []);

  const handleQuickAdd = useCallback((product: Product) => {
    // Falls back automatically to lowest tier parameters
    handleAddToCart(product, product.storageOptions[0], product.colorOptions[0]);
  }, [handleAddToCart]);

  const handleUpdateCartQty = useCallback((key: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== key));
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === key ? { ...item, quantity: qty } : item))
    );
  }, []);

  const handleRemoveFromCart = useCallback((key: string) => {
    setCart((prev) => prev.filter((item) => item.id !== key));
  }, []);

  const handleClearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Separate phone and vehicle products cleanly
  const phoneProducts = useMemo(() => {
    return config.products.filter((p) => (p.productType || "phone") !== "vehicle");
  }, [config.products]);

  const vehicleProducts = useMemo(() => {
    return config.products.filter((p) => p.productType === "vehicle");
  }, [config.products]);

  // Store initial search & brand state for Discovery Cards & Header Search
  const [storeInitialSearch, setStoreInitialSearch] = useState<string>("");
  const [storeInitialBrand, setStoreInitialBrand] = useState<string>("All");

  const handleSelectDiscoveryCategory = (categoryId: DiscoveryCardId) => {
    setActiveCategory(categoryId as CategoryKey);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleExecuteSearch = (customQuery?: string) => {
    if (typeof customQuery === "string") {
      setSearchQuery(customQuery);
      setStoreInitialSearch(customQuery);
      try {
        sessionStorage.setItem("milito_store_search", customQuery);
      } catch (e) {}
    }
    handleNavigatePage("store");
  };

  // Filter computation for Phones - Memoized for high performance
  const filteredProducts = useMemo(() => {
    let list = phoneProducts;

    // 1. Multi-parameter Flexible Search Query (Name, brand, specs, RAM, 5G, storage, condition, price)
    if (searchQuery.trim().length > 0) {
      list = searchStoreProducts(list, searchQuery);
    }

    // 2. Brand
    if (brandFilter !== "All") {
      list = list.filter(prod => prod.brand === brandFilter);
    }

    // 3. Condition
    if (conditionFilter !== "All") {
      list = list.filter(prod => prod.condition === conditionFilter);
    }

    // 4. Price range
    if (priceRangeFilter !== "All") {
      list = list.filter(prod => {
        if (priceRangeFilter === "under-200k") return prod.price < 200000;
        if (priceRangeFilter === "200k-500k") return prod.price >= 200000 && prod.price <= 500000;
        if (priceRangeFilter === "500k-1m") return prod.price >= 500000 && prod.price <= 1000000;
        if (priceRangeFilter === "above-1m") return prod.price > 1000000;
        return true;
      });
    }

    // 5. Storage
    if (storageFilter !== "All") {
      list = list.filter(prod => prod.storageOptions && prod.storageOptions.includes(storageFilter));
    }

    // 6. Battery Health
    if (batteryHealthFilter !== "All") {
      list = list.filter(prod => {
        if (prod.condition === "Brand New") return true;
        const val = prod.batteryHealthValue || "";
        if (batteryHealthFilter === "100%") return val === "100%";
        if (batteryHealthFilter === "95%+") return val === "95%+" || val === "100%";
        if (batteryHealthFilter === "90%+") return val === "90%+" || val === "95%+" || val === "100%";
        return true;
      });
    }

    // 7. Availability
    if (availabilityFilter !== "All") {
      list = list.filter(prod => prod.availability === availabilityFilter);
    }

    // Sort by price if requested (otherwise keep relevance order from searchStoreProducts)
    if (priceSort === "LowToHigh") {
      return [...list].sort((a, b) => a.price - b.price);
    } else if (priceSort === "HighToLow") {
      return [...list].sort((a, b) => b.price - a.price);
    }

    return list;
  }, [phoneProducts, searchQuery, brandFilter, conditionFilter, priceRangeFilter, storageFilter, batteryHealthFilter, availabilityFilter, priceSort]);

  useEffect(() => {
    setCurrentPage(1);
  }, [brandFilter, conditionFilter, priceRangeFilter, storageFilter, batteryHealthFilter, availabilityFilter, searchQuery]);

  const toggleCompare = useCallback((prod: Product) => {
    setCompareList(prev => {
      const exists = prev.some(p => p.id === prod.id);
      if (exists) {
        return prev.filter(p => p.id !== prod.id);
      } else {
        if (prev.length >= 3) {
          return [...prev.slice(1), prod];
        }
        return [...prev, prod];
      }
    });
  }, []);

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const gadgetFaqs = useMemo(() => {
    return FAQS.filter((faq) => faq.category !== "Imports");
  }, []);

  const isInitialGatewayView = !publicProductRoute && !activeCategory && activePage === "gateway";

  // Horizontal Gateway Carousel state (0 = Shop Gadgets, 1 = Explore Cars) — user swipe left or right
  const [gatewaySlideIndex, setGatewaySlideIndex] = useState<0 | 1>(0);
  const [gatewayDragOffset, setGatewayDragOffset] = useState<number>(0);
  const [isGatewayDragging, setIsGatewayDragging] = useState<boolean>(false);
  const gatewayDragStartXRef = useRef<number | null>(null);
  const gatewayDragStartYRef = useRef<number | null>(null);
  const gatewayDragDeltaXRef = useRef<number>(0);
  const gatewayIsDraggingRef = useRef<boolean>(false);
  const gatewayAxisLockedRef = useRef<"x" | "y" | null>(null);
  const gatewayWheelCooldownRef = useRef<number>(0);

  const handleGatewayDragStart = (clientX: number, clientY: number) => {
    gatewayDragStartXRef.current = clientX;
    gatewayDragStartYRef.current = clientY;
    gatewayDragDeltaXRef.current = 0;
    gatewayAxisLockedRef.current = null;
    gatewayIsDraggingRef.current = true;
    setGatewayDragOffset(0);
  };

  const handleGatewayDragMove = (clientX: number, clientY: number) => {
    if (!gatewayIsDraggingRef.current || gatewayDragStartXRef.current === null || gatewayDragStartYRef.current === null) {
      return;
    }
    const deltaX = clientX - gatewayDragStartXRef.current;
    const deltaY = clientY - gatewayDragStartYRef.current;

    if (gatewayAxisLockedRef.current === null) {
      if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) return;
      if (Math.abs(deltaX) >= Math.abs(deltaY) * 0.75) {
        gatewayAxisLockedRef.current = "x";
        setIsGatewayDragging(true);
      } else {
        gatewayAxisLockedRef.current = "y";
        return;
      }
    }

    if (gatewayAxisLockedRef.current === "x") {
      gatewayDragDeltaXRef.current = deltaX;
      setGatewayDragOffset(deltaX);
    }
  };

  const handleGatewayDragEnd = () => {
    if (!gatewayIsDraggingRef.current) return;
    const deltaX = gatewayDragDeltaXRef.current;
    const threshold = 35; // responsive px swipe left or right to switch hero slide

    if (gatewayAxisLockedRef.current === "x" && Math.abs(deltaX) >= threshold) {
      // Swipe left or right switches to the other hero slide
      setGatewaySlideIndex((prev) => (prev === 0 ? 1 : 0));
    }

    gatewayIsDraggingRef.current = false;
    gatewayDragStartXRef.current = null;
    gatewayDragStartYRef.current = null;
    gatewayDragDeltaXRef.current = 0;
    gatewayAxisLockedRef.current = null;
    setGatewayDragOffset(0);
    setIsGatewayDragging(false);
  };

  const renderGadgetHeroCarousel = (isGatewayMode: boolean) => (
    <section
      style={{ backgroundColor: "#1A2025" }}
      className={`relative flex items-center justify-center text-white overflow-hidden select-none ${
        isGatewayMode
          ? "min-h-screen h-full w-full py-12 sm:py-16 lg:py-20"
          : "min-h-[calc(100vh-80px)] xl:min-h-screen py-20 border-b border-white/[0.04]"
      }`}
      id="hero"
    >
      {/* Background video loaded after first paint */}
      <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
        {shouldLoadHeroVideo && (
          <video
            ref={videoRef}
            src="https://res.cloudinary.com/militotech/video/upload/v1782058769/9f6ae906f73ccfec6f37203801e8eb81_720w_l1qwvu.mp4"
            autoPlay={true}
            loop={true}
            muted={true}
            playsInline={true}
            preload="metadata"
            className="w-full h-full object-cover opacity-45 transition-opacity duration-1000"
          />
        )}
        {/* Protecting layer - balanced for high contrast with hero text */}
        <div className="absolute inset-0 bg-[#1A2025]/30"></div>
      </div>

      {/* Subtle grid with rich dark background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.03] z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#1A2025] via-transparent to-[#1A2025] opacity-75 z-0"></div>

      {/* Soft floating moving gradients / ambient green glow accents */}
      <motion.div
        animate={{
          x: [-30, 30, -30],
          y: [-40, 40, -40],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/3 w-[360px] h-[360px] rounded-full bg-milito-green/[0.07] blur-[140px] pointer-events-none z-0"
      />
      <motion.div
        animate={{
          x: [40, -40, 40],
          y: [30, -30, 30],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-emerald-500/[0.04] blur-[120px] pointer-events-none z-0"
      />

      {/* Subtle Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 z-0">
        {Array.from({ length: config.hero.particleCount || 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-milito-green/30 rounded-full"
            style={{
              left: `${(i * 7) % 100}%`,
              top: `${((i * 13) % 40) + 40}%`,
            }}
            animate={{
              y: [0, -70, 0],
              opacity: [0.1, 0.6, 0.1],
            }}
            transition={{
              duration: 7 + (i % 5) * 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="max-w-4xl mx-auto space-y-7 text-center z-10">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] font-sans"
          >
            {config.hero.titleLine1}
            <br className="hidden sm:block" />
            <span className="text-milito-green drop-shadow-[0_0_15px_rgba(0,177,79,0.3)]">
              {config.hero.titleLine2Color}
            </span>
            <br className="hidden sm:block" />
            {config.hero.titleLine3}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-gray-300 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed font-semibold transition-colors duration-200"
          >
            {config.hero.subtitle}
          </motion.p>

          {/* Single Centered Call to Action: Shop Gadgets */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex items-center justify-center"
          >
            <button
              onClick={() => handleNavigatePage(isGatewayMode ? "gadgets" : "store")}
              className="w-full sm:w-auto px-9 py-4 rounded-xl bg-milito-green text-black font-extrabold text-sm uppercase tracking-wider hover:brightness-110 shadow-[0_4px_25px_rgba(0,177,79,0.35)] active:scale-98 transition duration-200 cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>Shop Gadgets</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Dynamic trust badges/cards with animated bouncing, linear courier delivery, and rotating swap */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 max-w-2xl mx-auto border-none animate-fadeIn"
          >
            {/* Card 1: Verified Devices */}
            <div className="flex flex-col items-center text-center bg-white/[0.02] hover:bg-white/[0.04] p-3.5 rounded-xl border border-milito-green/20 backdrop-blur-sm transition-all duration-300 group">
              <motion.div
                animate={{ y: [0, -12, 0, -4, 0] }}
                transition={{
                  duration: 1.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center mb-2.5 text-milito-green bg-milito-green/10 border border-milito-green/30 shadow-[0_0_15px_rgba(0,177,79,0.25)]"
              >
                <ShieldCheck className="w-5 h-5 text-milito-green" />
              </motion.div>
              <span className="block text-xs font-extrabold text-white group-hover:text-milito-green transition-colors">
                Verified Devices
              </span>
              <span className="text-[9px] font-bold text-gray-400 tracking-wider mt-1 block uppercase">
                35-point QC inspection
              </span>
            </div>

            {/* Card 2: Nationwide Delivery */}
            <div className="flex flex-col items-center text-center bg-white/[0.02] hover:bg-white/[0.04] p-3.5 rounded-xl border border-blue-400/20 backdrop-blur-sm transition-all duration-300 group overflow-hidden">
              <div className="w-full h-10 relative overflow-hidden flex items-center mb-2.5 bg-blue-500/10 rounded-xl border border-blue-400/20 px-1">
                <div className="absolute inset-x-2 bottom-2 h-[1px] border-b border-dashed border-blue-400/35 pointer-events-none" />
                <motion.div
                  animate={{ left: ["-28px", "calc(100% + 5px)"] }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute bottom-2 text-blue-400 flex items-center justify-center pointer-events-none"
                >
                  <Truck className="w-5 h-5 text-blue-400 fill-blue-400/20 drop-shadow-[0_0_8px_rgba(96,165,250,0.7)]" />
                </motion.div>
              </div>
              <span className="block text-xs font-extrabold text-white group-hover:text-blue-400 transition-colors">
                Nationwide Delivery
              </span>
              <span className="text-[9px] font-bold text-gray-400 tracking-wider mt-1 block uppercase">
                Insured & tracked courier
              </span>
            </div>

            {/* Card 3: Swapping-In Available */}
            <div className="flex flex-col items-center text-center bg-white/[0.02] hover:bg-white/[0.04] p-3.5 rounded-xl border border-amber-400/20 backdrop-blur-sm transition-all duration-300 group">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center mb-2.5 text-amber-400 bg-amber-400/10 border border-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                style={{ transformOrigin: "center center" }}
              >
                <RefreshCw className="w-5 h-5 text-amber-400" />
              </motion.div>
              <span className="block text-xs font-extrabold text-white group-hover:text-amber-400 transition-colors">
                Swapping-In Available
              </span>
              <span className="text-[9px] font-bold text-gray-400 tracking-wider mt-1 block uppercase">
                Instant upgrade credit
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );

  return (
    <div
      className={`min-h-screen bg-white text-gray-950 selection:bg-milito-green selection:text-[#1A2025] w-full max-w-full overflow-x-clip ${
        isInitialGatewayView || activePage === "vehicles" ? "pb-0" : "pb-20 md:pb-0"
      }`}
    >
      {/* 1. Header Navigation Component (Hidden on the initial two-option Gateway) */}
      {!isInitialGatewayView && (
        <Header
          cart={cart}
          onUpdateCartQty={handleUpdateCartQty}
          onRemoveFromCart={handleRemoveFromCart}
          onOpenCheckout={handleOpenCheckout}
          onOpenTracker={handleOpenTracker}
          onScrollToSection={handleScrollToSection}
          onOpenDashboard={handleOpenDashboard}
          activePage={activePage}
          onNavigatePage={handleNavigatePage}
          products={config.products}
          onSelectProduct={handleOpenProductDetails}
          onExecuteSearch={handleExecuteSearch}
          isCartOpen={isCartOpen}
          onOpenCart={() => setIsCartOpen(true)}
          onCloseCart={() => setIsCartOpen(false)}
          isLoginModalOpen={isLoginModalOpen}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onCloseLoginModal={() => setIsLoginModalOpen(false)}
          isCategoryMode={Boolean(activeCategory)}
          onNavigateHome={() => {
            setActiveCategory(null);
            handleNavigatePage("gadgets");
          }}
          onAddToCart={handleAddToCart}
        />
      )}

      <Suspense fallback={<div className="min-h-[60vh] bg-white" />}>
        {publicProductRoute ? (
          <PublicProductPage
            product={activePublicProduct}
            allProducts={config.products}
            trafficSource={publicProductRoute.source}
            onNavigateHome={() =>
              handleClosePublicProductPage(activePublicProduct?.productType === "vehicle" ? "vehicles" : "gadgets")
            }
            onNavigateStore={() =>
              handleClosePublicProductPage(activePublicProduct?.productType === "vehicle" ? "vehicles" : "store")
            }
            onSelectProduct={(p) => {
              handleOpenPublicProductPage(p, publicProductRoute.source);
            }}
            onAddToCart={handleAddToCart}
            onOpenCart={() => setIsCartOpen(true)}
            onOrderNow={(prod, storage, color, price, src) => {
              handleBuyNowProtectedOrder(prod, storage, color, price, src || publicProductRoute.source);
            }}
            onSwapForThis={handleSwapForThis}
            onShare={handleShareProduct}
            onNotifyMe={handleOpenNotifyMe}
          />
        ) : activeCategory ? (
          <CategoryShoppingPage
            category={activeCategory}
            products={config.products}
            compareList={compareList}
            onToggleCompare={toggleCompare}
            onOpenDetails={handleOpenProductDetails}
            onQuickAdd={handleQuickAdd}
            onShareProduct={handleShareProduct}
            onBackToHome={() => {
              setActiveCategory(null);
              handleNavigatePage("gadgets");
            }}
            onSelectCategory={(cat) => {
              setActiveCategory(cat);
            }}
            onOpenCart={() => setIsCartOpen(true)}
          />
        ) : activePage === "gateway" ? (
          /* INITIAL TWO-OPTION HORIZONTAL GATEWAY CAROUSEL: Side-by-side slides swiped left or right by the user */
          <main
            className="relative w-full min-h-screen overflow-hidden bg-[#070A10] select-none touch-pan-y cursor-grab active:cursor-grabbing"
            onTouchStart={(e) => {
              if (e.touches && e.touches[0]) {
                handleGatewayDragStart(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchMove={(e) => {
              if (e.touches && e.touches[0]) {
                handleGatewayDragMove(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchEnd={handleGatewayDragEnd}
            onTouchCancel={handleGatewayDragEnd}
            onMouseDown={(e) => {
              if ((e.target as HTMLElement).closest("button, a")) return;
              handleGatewayDragStart(e.clientX, e.clientY);
            }}
            onMouseMove={(e) => {
              handleGatewayDragMove(e.clientX, e.clientY);
            }}
            onMouseUp={handleGatewayDragEnd}
            onMouseLeave={handleGatewayDragEnd}
            onWheel={(e) => {
              if (Math.abs(e.deltaX) > 30 && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                const now = Date.now();
                if (now - gatewayWheelCooldownRef.current > 500) {
                  gatewayWheelCooldownRef.current = now;
                  setGatewaySlideIndex((prev) => (prev === 0 ? 1 : 0));
                }
              }
            }}
          >
            {/* Horizontal Flex Track containing the two Hero Carousels side-by-side */}
            <div
              className={`flex flex-row w-full min-h-screen items-stretch will-change-transform ${
                isGatewayDragging ? "transition-none" : "transition-transform duration-250 ease-out"
              }`}
              style={{
                transform: `translate3d(calc(-${gatewaySlideIndex * 100}% + ${gatewayDragOffset}px), 0, 0)`,
              }}
            >
              {/* Slide 1: Shop Gadgets Hero Carousel */}
              <div className="w-full min-w-full min-h-screen flex-shrink-0 flex flex-col">
                {renderGadgetHeroCarousel(true)}
              </div>

              {/* Slide 2: Explore Cars Hero Carousel */}
              <div className="w-full min-w-full min-h-screen flex-shrink-0 flex flex-col">
                <VehicleShowcaseBanner
                  isGatewayMode={true}
                  onExploreVehicles={() => handleNavigatePage("vehicles")}
                  onOpenEstimator={() => handleNavigatePage("vehicles", "vehicle-import")}
                  vehicleCount={vehicleProducts.length}
                />
              </div>
            </div>
          </main>
        ) : activePage === "vehicles" ? (
          /* CAR-ONLY HOMEPAGE */
          <VehiclesPage
            vehicles={vehicleProducts}
            compareList={compareList}
            onToggleCompare={toggleCompare}
            onOpenDetails={handleOpenProductDetails}
            onQuickAdd={handleQuickAdd}
            onBackToGadgets={() => handleNavigatePage("gateway")}
            onScrollToSection={handleScrollToSection}
            onShareProduct={handleShareProduct}
          />
        ) : activePage === "swap-deals" ? (
          <SwapDealsPage
            onBack={handleBackFromSwapDeals}
            products={phoneProducts}
            initialTargetProduct={swapTargetProduct}
            onClearTargetProduct={() => setSwapTargetProduct(null)}
          />
        ) : activePage === "store" ? (
          <StorePage
            products={phoneProducts}
            compareList={compareList}
            onToggleCompare={toggleCompare}
            onOpenDetails={handleOpenProductDetails}
            onQuickAdd={handleQuickAdd}
            initialSearch={storeInitialSearch}
            initialBrand={storeInitialBrand}
            onShareProduct={handleShareProduct}
          />
        ) : (
          /* GADGET-ONLY HOMEPAGE (Starts directly with Main Homepage sections — Hero Carousel is NOT repeated) */
          <>
            {/* Plain text link with clear arrow allowing the user to revisit the Main Carousel */}
            <div id="hero" className="bg-white pt-5 pb-1 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <button
                  type="button"
                  onClick={() => handleNavigatePage("gateway")}
                  className="inline-flex items-center gap-2 text-sm sm:text-base font-extrabold text-[#1A2025] hover:text-milito-green transition-colors cursor-pointer group bg-transparent border-0 p-0 shadow-none"
                >
                  <ArrowLeft className="w-5 h-5 text-milito-green stroke-[2.5] transition-transform group-hover:-translate-x-1" />
                  <span>Back to Main Carousel</span>
                </button>
              </div>
            </div>

            {/* 2. HOMEPAGE PRODUCT TEASER: Visual Discovery Cards */}
            <HomepageProductTeaser
              onExploreStore={() => {
                setStoreInitialSearch("");
                setStoreInitialBrand("All");
                try {
                  sessionStorage.setItem("milito_store_category", "All");
                  sessionStorage.setItem("milito_store_search", "");
                } catch (e) {}
                handleNavigatePage("store");
              }}
              onSelectCategory={handleSelectDiscoveryCategory}
            />

            {/* 4. Premium Full-Bleed Swap Deals Section */}
            <SwapDealsSection
              onSwapClick={() => {
                handleNavigatePage("swap-deals");
              }}
            />

            {/* 5. Detailed 35-Point MILITO QC Section & Simulator */}
            <MilitoQCSection />

            {/* 6. Verified Nigeria Clients Testimonials & Customer Proof */}
            <PublicTestimonialsSection
              onExploreDevices={() => {
                handleNavigatePage("store");
              }}
              onStartSwap={() => {
                handleNavigatePage("swap-deals");
              }}
            />

            {/* 7. Detailed Gadget FAQ Section accordion */}
            <section className="py-24 bg-white border-b border-gray-100" id="faq">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-milito-green bg-milito-green/10 px-3.5 py-1.5 rounded-full inline-block mb-3 border border-milito-green/20">
                    Clear Answers
                  </span>
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                    Find fast clarification on device ordering, 35-point quality grading, and nationwide delivery.
                  </p>
                </div>

                {/* Accordions */}
                <div className="space-y-4">
                  {gadgetFaqs.map((faq, index) => {
                    const isFaqOpen = openFaqIndex === index;
                    return (
                      <div
                        key={faq.id}
                        className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300"
                      >
                        <button
                          onClick={() => setOpenFaqIndex(isFaqOpen ? null : index)}
                          className="w-full text-left p-6 flex justify-between items-center text-sm font-extrabold text-[#1A2025] cursor-pointer focus:outline-none"
                        >
                          <span>{faq.question}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-milito-green transition-transform duration-300 ${
                              isFaqOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isFaqOpen && (
                          <div className="px-6 pb-6 text-xs text-gray-600 leading-relaxed border-t border-gray-200 pt-3 animate-fadeIn">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 8. Final CTA: Ready for Your Next Device? */}
            <FinalCtaSection
              onExploreStore={() => handleScrollToSection("store-inventory")}
              onStartSwap={() => handleNavigatePage("swap-deals")}
            />
          </>
        )}
      </Suspense>

      {/* 9. Footer brand section details (Hidden on the initial two-option Gateway) */}
      {!isInitialGatewayView && (
        <Footer
          onScrollToSection={handleScrollToSection}
          onOpenTracker={handleOpenTracker}
          onOpenDashboard={handleOpenDashboard}
          experienceMode={activePage === "vehicles" ? "vehicles" : "gadgets"}
          onNavigateGateway={() => handleNavigatePage("gateway")}
        />
      )}

      {/* Mobile Bottom Navigation Bar (Gadget experience only) */}
      {!isInitialGatewayView && activePage !== "vehicles" && (
        <MobileBottomNav
          activeTab={mobileActiveTab}
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          onNavigateHome={() => {
            setIsCartOpen(false);
            setIsLoginModalOpen(false);
            handleNavigatePage("gadgets", "hero");
          }}
          onNavigateShop={() => {
            setIsCartOpen(false);
            setIsLoginModalOpen(false);
            handleNavigatePage("store");
          }}
          onNavigateSwap={() => {
            setIsCartOpen(false);
            setIsLoginModalOpen(false);
            handleNavigatePage("swap-deals");
          }}
          onOpenCart={() => {
            setIsLoginModalOpen(false);
            setIsCartOpen(true);
          }}
          onOpenProfile={() => {
            setIsCartOpen(false);
            setIsLoginModalOpen(true);
          }}
        />
      )}

      {/* Float support chat utility (Hidden on initial two-option Gateway) */}
      {!isInitialGatewayView && (
        <Suspense fallback={null}>
          <SupportChat />
        </Suspense>
      )}

      {/* Floating Compare Bar overlay */}
      {compareList.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-[#1A2025]/95 backdrop-blur-md rounded-2xl border border-gray-800 text-white p-4 shadow-2xl flex items-center justify-between gap-4 animate-slideIn">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none w-[70%] sm:w-auto">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-milito-green hidden sm:inline">Compare list:</span>
            <div className="flex items-center gap-2">
              {compareList.map((prod) => (
                <div key={prod.id} className="relative flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 min-w-[120px] max-w-[160px] group flex-shrink-0">
                  <img
                    src={resolveImageUrl(prod.thumbnail?.secure_url || prod.thumbnail || prod.image || prod.galleryImages?.[0]?.secure_url || prod.gallery?.[0], { width: 80, brand: prod.brand })}
                    alt={prod.name}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 object-contain"
                  />
                  <span className="text-[10px] font-bold truncate pr-3">{prod.name}</span>
                  <button
                    onClick={() => setCompareList((prev) => prev.filter((p) => p.id !== prod.id))}
                    className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 transition"
                    title="Remove item"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setCompareList([])}
              className="text-[10px] tracking-wider uppercase font-extrabold text-gray-400 hover:text-white px-2.5 py-2 hover:bg-white/5 rounded-xl transition"
            >
              Clear
            </button>
            <button
              onClick={handleOpenCompare}
              className="px-4 py-2.5 bg-milito-green hover:brightness-110 text-black text-xs font-black uppercase tracking-wider rounded-xl transition shadow-lg shadow-milito-green/20 cursor-pointer"
            >
              Compare ({compareList.length})
            </button>
          </div>
        </div>
      )}

      {/* Side-by-Side Specifications Comparison Overlay Modal */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A2025]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 shadow-2xl animate-scaleUp">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsCompareOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:text-black hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 cursor-pointer shadow-xs text-xs font-bold font-sans"
                  title="Go back to listings"
                >
                  <ArrowLeft className="w-4 h-4 text-milito-green" />
                  <span>Back</span>
                </button>
                <div className="h-6 w-px bg-gray-200"></div>
                <div>
                  <h3 className="text-lg font-black text-[#1A2025]">Compare Verified Inventory Side-By-Side</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Review live specs and conditions of items before placing your order.</p>
                </div>
              </div>
              <button
                onClick={() => setIsCompareOpen(false)}
                className="p-2 bg-gray-250 hover:bg-gray-350 text-gray-800 hover:text-black rounded-full transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Inner Body - Comparative Grid/Table */}
            <div className="p-6 overflow-y-auto flex-1">
              {compareList.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-sm font-semibold">No devices selected. Close this modal and check some devices to review live comparison stats.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:divide-x md:divide-gray-150">
                  {/* Category labels column on desktop */}
                  <div className="hidden md:flex flex-col justify-between py-4 pr-4 text-xs text-gray-550 font-bold space-y-6">
                    <div className="h-44 flex flex-col justify-end">
                      <span className="uppercase text-[10px] tracking-widest text-[#00B14F] font-extrabold pb-3 block">Smartphone models</span>
                    </div>
                    <div className="py-2.5 border-b border-gray-105">🏷️ Manufacturer Brand</div>
                    <div className="py-2.5 border-b border-gray-105">🛡️ Condition & state</div>
                    <div className="py-2.5 border-b border-gray-105">💰 Verified Price</div>
                    <div className="py-2.5 border-b border-gray-105">🔋 Battery Health</div>
                    <div className="py-2.5 border-b border-gray-105">💾 Storage Options</div>
                    <div className="py-2.5 border-b border-gray-105">📺 Screen Specs</div>
                    <div className="py-2.5 border-b border-gray-105">📸 Camera hardware</div>
                    <div className="py-2.5 border-b border-gray-105">⚡ Core System Chipset</div>
                    <div className="py-2.5 border-b border-gray-105">🛡️ Sourcing warranty</div>
                    <div className="py-2.5">📋 SIM Card Slot Type</div>
                  </div>

                  {/* Device Columns */}
                  {compareList.slice(0, 3).map((prod) => (
                    <div key={prod.id} className="p-4 flex flex-col space-y-6 text-xs transition duration-200 hover:bg-gray-50 md:col-span-1">
                      {/* Product Header Card */}
                      <div className="flex flex-col items-center text-center h-44 justify-between pb-3">
                        <img
                          src={resolveImageUrl(prod.thumbnail?.secure_url || prod.thumbnail || prod.image || prod.galleryImages?.[0]?.secure_url || prod.gallery?.[0], { width: 200, brand: prod.brand })}
                          alt={prod.name}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="h-20 object-contain mb-2"
                        />
                        <div>
                          <h4 className="font-extrabold text-[#1A2025] line-clamp-1">{prod.name}</h4>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 mt-1 rounded-full border inline-block ${
                            prod.condition === "Brand New"
                              ? "bg-blue-50 text-blue-650 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-250"
                          }`}>{prod.condition}</span>
                        </div>
                      </div>

                      {/* Manufacturer Brand */}
                      <div className="py-2.5 border-b border-gray-100 flex justify-between items-center md:block">
                        <span className="md:hidden font-bold text-gray-500">Brand: </span>
                        <span className="font-extrabold text-gray-900">{prod.brand}</span>
                      </div>

                      {/* Condition badge */}
                      <div className="py-2.5 border-b border-gray-100 flex justify-between items-center md:block">
                        <span className="md:hidden font-bold text-gray-500">State: </span>
                        <span className="font-semibold text-gray-700">{prod.availability || "In Stock"}</span>
                      </div>

                      {/* price */}
                      <div className="py-2.5 border-b border-gray-100 flex justify-between items-center md:block">
                        <span className="md:hidden font-bold text-gray-500">Price: </span>
                        <span className="font-sans font-black text-sm text-[#00B14F]">
                          {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(prod.price)}
                        </span>
                      </div>

                      {/* battery life */}
                      <div className="py-2.5 border-b border-gray-100 flex justify-between items-center md:block">
                        <span className="md:hidden font-bold text-gray-500">Battery: </span>
                        <span className="font-bold text-gray-800">{prod.condition === "Brand New" ? "100% Sealed" : (prod.batteryHealth || "90%+")}</span>
                      </div>

                      {/* storage */}
                      <div className="py-2.5 border-b border-gray-100 flex justify-between items-center md:block">
                        <span className="md:hidden font-bold text-gray-500">Storage: </span>
                        <span className="font-semibold text-gray-700">{prod.storageOptions.join(" / ")}</span>
                      </div>

                      {/* Screen specs */}
                      <div className="py-2.5 border-b border-gray-100 flex justify-between items-center md:block">
                        <span className="md:hidden font-bold text-gray-500">Screen: </span>
                        <span className="text-gray-650 leading-relaxed font-medium block">{prod.specs?.screen}</span>
                      </div>

                      {/* camera */}
                      <div className="py-2.5 border-b border-gray-100 flex justify-between items-center md:block">
                        <span className="md:hidden font-bold text-gray-500">Camera: </span>
                        <span className="text-gray-650 leading-relaxed font-medium block">{prod.specs?.camera}</span>
                      </div>

                      {/* CPU chip */}
                      <div className="py-2.5 border-b border-gray-100 flex justify-between items-center md:block">
                        <span className="md:hidden font-bold text-gray-500">Chipset: </span>
                        <span className="text-gray-650 leading-relaxed font-medium block">{prod.specs?.chipset}</span>
                      </div>

                      {/* warranty */}
                      <div className="py-2.5 border-b border-gray-100 flex justify-between items-center md:block">
                        <span className="md:hidden font-bold text-gray-500">Warranty: </span>
                        <span className="text-gray-650 leading-relaxed font-medium block">{prod.specs?.warranty}</span>
                      </div>

                      {/* SIM type */}
                      <div className="py-2.5 flex justify-between items-center md:block">
                        <span className="md:hidden font-bold text-gray-500">SIM Type: </span>
                        <span className="text-gray-650 leading-relaxed font-semibold block">{prod.specs?.simType}</span>
                      </div>

                      {/* Actions */}
                      <div className="pt-3 flex flex-col gap-2">
                        {prod.availability === "Sold Out" ? (
                          <button
                            disabled
                            className="w-full py-2.5 bg-gray-100 text-gray-400 border border-gray-200 rounded-xl cursor-not-allowed font-bold text-center"
                          >
                            Sold Out
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              handleQuickAdd(prod);
                              setIsCompareOpen(false);
                            }}
                            className="w-full py-2.5 bg-milito-green hover:brightness-105 transition text-black font-black uppercase tracking-wider rounded-xl text-center cursor-pointer shadow-md"
                          >
                            Add to Cart
                          </button>
                        )}
                        <button
                          onClick={() => setCompareList((prev) => prev.filter((p) => p.id !== prod.id))}
                          className="w-full py-2 text-center text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                        >
                          Remove from list
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Bottom Controls */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500">You can compare up to 3 models side-by-side.</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setCompareList([]);
                    handleCloseCompare();
                  }}
                  className="px-4 py-2 border border-gray-250 hover:bg-gray-100 text-gray-750 hover:text-black rounded-xl font-bold transition cursor-pointer text-xs"
                >
                  Clear Selection
                </button>
                <button
                  onClick={handleCloseCompare}
                  className="px-5 py-2 bg-[#1A2025] hover:bg-black text-white rounded-xl font-bold transition cursor-pointer text-xs"
                >
                  Close Modal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------- MODALS MATRIX --------------------- */}
      <Suspense fallback={null}>
        {/* Product Spec detailed details popup drawer */}
        {selectedProductDetails && (
          <ProductDetailsModal
            product={selectedProductDetails}
            onClose={handleCloseProductDetails}
            onAddToCart={handleAddToCart}
            onOpenCart={() => setIsCartOpen(true)}
            onBuyNow={handleBuyNowProtectedOrder}
            onSwapForThis={handleSwapForThis}
            onShare={handleShareProduct}
            onNotifyMe={handleOpenNotifyMe}
          />
        )}

        {/* Direct Order checkout dialog popup */}
        {isCheckoutOpen && (
          <CheckoutModal
            cart={cart}
            directItem={checkoutDirectItem}
            onClose={handleCloseCheckout}
            onClearCart={handleClearCart}
            onViewOrderDetails={(orderId) => {
              setTrackerInitialOrderId(orderId);
              handleOpenTracker();
            }}
          />
        )}

        {/* Parcel Delivery tracking modal */}
        {isTrackerOpen && (
          <OrderTrackerModal
            initialOrderId={trackerInitialOrderId}
            onClose={() => {
              setTrackerInitialOrderId("");
              handleCloseTracker();
            }}
          />
        )}

        {/* 11. Admin Business Dashboard Modal (Only mounted when opened) */}
        {isDashboardOpen && (
          <AdminDashboard
            isOpen={isDashboardOpen}
            onClose={handleCloseDashboard}
            config={config}
            onChangeConfig={(newConfig) => setConfig(newConfig)}
            onShareProduct={handleShareProduct}
          />
        )}

        {/* Product Shareable Funnel Generator Modal */}
        {sharingProduct && (
          <ShareProductModal
            isOpen={Boolean(sharingProduct)}
            onClose={() => setSharingProduct(null)}
            product={sharingProduct}
          />
        )}

        {/* Customer Restock / Price Change Notification Modal (Phase 1) */}
        {notifyProduct && (
          <NotifyMeModal
            isOpen={Boolean(notifyProduct)}
            product={notifyProduct}
            initialAlertType={notifyAlertType}
            onClose={() => setNotifyProduct(null)}
          />
        )}
      </Suspense>

    </div>
  );
}
