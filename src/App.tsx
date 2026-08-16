import React, { useState, useEffect, useRef } from "react";
import { ShieldAlert, CreditCard, ChevronDown, Award, Star, ArrowRight, ArrowLeft, ShieldCheck, Play, Sparkles, Truck, RefreshCw, Search, SlidersHorizontal, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

// Components
import Header from "./components/Header";
import TrustFeatures from "./components/TrustFeatures";
import ProductCard from "./components/ProductCard";
import ProductDetailsModal from "./components/ProductDetailsModal";
import HowItWorks from "./components/HowItWorks";
import TradeInCalculator from "./components/TradeInCalculator";
import VehicleImport from "./components/VehicleImport";
import Footer from "./components/Footer";
import OrderTrackerModal from "./components/OrderTrackerModal";
import CheckoutModal from "./components/CheckoutModal";
import SupportChat from "./components/SupportChat";
import { SiteConfig } from "./components/CustomizerDashboard";
import AdminDashboard from "./components/AdminDashboard";

// Types & Data
import { Product, CartItem, resolveImageUrl } from "./types";
import { SAMPLE_PRODUCTS, TESTIMONIALS, FAQS } from "./data";

const DEFAULT_CONFIG: SiteConfig = {
  hero: {
    titleLine1: "Confirm Your Device",
    titleLine2Color: "Before We",
    titleLine3: "Get Paid.",
    subtitle: "Shop premium smartphones with confidence. Your payment stays protected until you receive and verify your",
    badgeTag: "Secure Delivery",
    badgeText: "Escrow Lock Framework Now Active in Nigeria",
    ctaTextPrimary: "Explore Smartphone Catalog",
    ctaTextSecondary: "How Buyer Protection Works",
    metric1Value: "100%",
    metric1Label: "Genuine Core Stocks",
    metric2Value: "35-Point",
    metric2Label: "Inspect Suit Cleared",
    metric3Value: "₦0 Risk",
    metric3Label: "Locked Escrow Vaults",
    glowIntensity: 4,
    particleCount: 15
  },
  products: SAMPLE_PRODUCTS,
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
  // Navigation scrolling logic
  const handleScrollToSection = (id: string) => {
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
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Config parser error:", e);
    }
    return DEFAULT_CONFIG;
  });

  useEffect(() => {
    try {
      localStorage.setItem("milito_tech_site_config", JSON.stringify(config));
    } catch (e) {
      console.error("Storage save failed:", e);
    }
  }, [config]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupLiveCatalogSync = async () => {
      try {
        const { db, isFirebasePlaceholder } = await import("./lib/firebase");
        if (isFirebasePlaceholder || !db) return;

        const { collection, onSnapshot, query } = await import("firebase/firestore");
        const qProduct = query(collection(db, "product"));
        const qProducts = query(collection(db, "products"));

        // Master combined map across both 'product' and 'products' collections
        const masterProductsMap = new Map<string, Product>();

        const parseDocToProduct = (docSnap: any): Product => {
          const data = docSnap.data();

          // Safely extract main thumbnail URL as a string (thumbnail -> image -> galleryImages[0] -> gallery[0] -> imageUrl)
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
            : { secure_url: mainImg, public_id: data.imagePublicId || "" };

          // Parse galleryImages array of CloudinaryImageMeta
          let parsedGalleryImages: any[] = [];
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
                public_id: "",
                original_filename: `Image ${idx + 1}`,
                width: 0,
                height: 0,
                format: "jpg",
                bytes: 0,
                created_at: new Date().toISOString()
              };
            }).filter((g: any) => Boolean(g.secure_url));
          }

          let galUrls: string[] = [];
          if (parsedGalleryImages.length > 0) {
            galUrls = parsedGalleryImages.map(g => g.secure_url).filter(Boolean);
          } else if (Array.isArray(data.gallery)) {
            galUrls = data.gallery.map((g: any) => (typeof g === "object" && g !== null ? g.secure_url : String(g))).filter(Boolean);
            parsedGalleryImages = galUrls.map((url, idx) => ({
              secure_url: url,
              public_id: data.galleryPublicIds?.[idx] || "",
              original_filename: `Image ${idx + 1}`,
              width: 0,
              height: 0,
              format: "jpg",
              bytes: 0,
              created_at: data.createdAt || new Date().toISOString()
            }));
          } else if (mainImg) {
            galUrls = [mainImg];
            parsedGalleryImages = [{
              secure_url: mainImg,
              public_id: parsedThumbnail.public_id || "",
              original_filename: "Main Photo",
              width: 0,
              height: 0,
              format: "jpg",
              bytes: 0,
              created_at: data.createdAt || new Date().toISOString()
            }];
          }

          return {
            id: docSnap.id,
            name: data.model || data.name || "Unknown Model",
            brand: data.brand || "Other",
            condition: data.condition || "Premium UK Used",
            price: Number(data.price) || 0,
            originalPrice: Number(data.originalPrice) || Number(data.price) * 1.2,
            badge: data.badge || "Verified Grade A++",
            image: mainImg,
            imagePublicId: parsedThumbnail.public_id || data.imagePublicId || "",
            thumbnail: parsedThumbnail,
            galleryImages: parsedGalleryImages,
            gallery: galUrls,
            galleryPublicIds: data.galleryPublicIds || parsedGalleryImages.map(g => g.public_id).filter(Boolean),
            storageOptions: data.storage || (Array.isArray(data.storage) ? data.storage : [data.storage]) || ["128GB", "256GB"],
            colorOptions: data.color || (Array.isArray(data.color) ? data.color : [{ name: data.color || "Space Premium", hex: "#1A2025" }]),
            batteryHealth: data.batteryHealth || "100%",
            batteryHealthValue: data.batteryHealthValue || "100%",
            description: data.description || "",
            specs: data.specs || {
              screen: "6.7-inch OLED",
              camera: "48MP Quad Pixel",
              chipset: "Bionic CPU Logic",
              batterySize: "3900 mAh",
              os: "Latest Version Unlocked",
              warranty: "1-Year Swap Escrow Check",
              simType: "1 Physical SIM + active eSIM"
            },
            rating: Number(data.rating) || 4.9,
            reviewsCount: Number(data.reviewsCount) || 1,
            availability: data.status || data.availability || "In Stock",
            featured: !!data.featured,
            categorySlug: data.categorySlug || "",
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
    };

    setupLiveCatalogSync();

    return () => {
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

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;

      // Try playing immediately
      video.play().catch((err) => {
        console.log("Background video auto-play prevented initially:", err);
      });

      const playVideo = () => {
        if (video) {
          video.play().catch((err) => {
            console.log("Video play attempt failed on user interaction:", err);
          });
        }
      };

      // Add fallback listeners to trigger playback upon the first mouse move, click, or scroll
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
  }, []);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  
  // Modals state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isProtectionLightboxOpen, setIsProtectionLightboxOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

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

  // Hero Parallax Tracking Coordinate values
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { currentTarget, clientX, clientY } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5; // -0.5 to 0.5
    const y = (clientY - top) / height - 0.5; // -0.5 to 0.5
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  const getMotionAnimation = () => {
    const duration = config.animationMedia.motionSpeed || 6;
    switch (config.animationMedia.motionPattern) {
      case "spin":
        return {
          animate: { rotate: 360 },
          transition: { duration, repeat: Infinity, ease: "linear" }
        };
      case "pulse":
        return {
          animate: { scale: [1, 1.05, 1] },
          transition: { duration, repeat: Infinity, ease: "easeInOut" }
        };
      case "bounce":
        return {
          animate: { y: [0, -20, 0] },
          transition: { duration, repeat: Infinity, ease: "easeInOut" }
        };
      case "parallax":
        return {
          animate: {
            x: mousePosition.x * 30,
            y: mousePosition.y * 30,
          },
          transition: { type: "spring", stiffness: 100, damping: 20 }
        };
      case "floating":
      default:
        return {
          animate: { y: [-12, 12, -12] },
          transition: { duration, repeat: Infinity, ease: "easeInOut" }
        };
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product, storage: string, color: { name: string; hex: string }) => {
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
  };

  const handleQuickAdd = (product: Product) => {
    // Falls back automatically to lowest tier parameters
    handleAddToCart(product, product.storageOptions[0], product.colorOptions[0]);
  };

  const handleUpdateCartQty = (key: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveFromCart(key);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === key ? { ...item, quantity: qty } : item))
    );
  };

  const handleRemoveFromCart = (key: string) => {
    setCart((prev) => prev.filter((item) => item.id !== key));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Filter computation for Phones
  const filteredProducts = config.products.filter((prod) => {
    // 1. Search Query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchName = prod.name.toLowerCase().includes(q);
      const matchBrand = prod.brand.toLowerCase().includes(q);
      const matchDesc = prod.description.toLowerCase().includes(q);
      const matchSpecs = JSON.stringify(prod.specs).toLowerCase().includes(q);
      const matchStorage = prod.storageOptions.some(st => st.toLowerCase().includes(q));
      const matchCondText = prod.condition.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchDesc && !matchSpecs && !matchStorage && !matchCondText) {
        return false;
      }
    }

    // 2. Brand
    const matchBrand = brandFilter === "All" || prod.brand === brandFilter;
    if (!matchBrand) return false;

    // 3. Condition
    const matchCond = conditionFilter === "All" || prod.condition === conditionFilter;
    if (!matchCond) return false;

    // 4. Price range
    if (priceRangeFilter !== "All") {
      if (priceRangeFilter === "under-200k" && prod.price >= 200000) return false;
      if (priceRangeFilter === "200k-500k" && (prod.price < 200000 || prod.price > 500000)) return false;
      if (priceRangeFilter === "500k-1m" && (prod.price < 500000 || prod.price > 1000000)) return false;
      if (priceRangeFilter === "above-1m" && prod.price <= 1000000) return false;
    }

    // 5. Storage
    if (storageFilter !== "All") {
      if (!prod.storageOptions.includes(storageFilter)) return false;
    }

    // 6. Battery Health
    if (batteryHealthFilter !== "All") {
      if (prod.condition === "Brand New") {
        // Brand new matches any battery health requirement
      } else {
        const val = prod.batteryHealthValue || "";
        if (batteryHealthFilter === "100%" && val !== "100%") return false;
        if (batteryHealthFilter === "95%+" && val !== "95%+" && val !== "100%") return false;
        if (batteryHealthFilter === "90%+" && val !== "90%+" && val !== "95%+" && val !== "100%") return false;
      }
    }

    // 7. Availability
    const matchAvail = availabilityFilter === "All" || prod.availability === availabilityFilter;
    if (!matchAvail) return false;

    return true;
  }).sort((a, b) => {
    if (priceSort === "LowToHigh") return a.price - b.price;
    if (priceSort === "HighToLow") return b.price - a.price;
    return 0; // default
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [brandFilter, conditionFilter, priceRangeFilter, storageFilter, batteryHealthFilter, availabilityFilter, searchQuery]);

  const toggleCompare = (prod: Product) => {
    setCompareList(prev => {
      const exists = prev.some(p => p.id === prod.id);
      if (exists) {
        return prev.filter(p => p.id !== prod.id);
      } else {
        if (prev.length >= 3) {
          // If already 3, swap the last one or do nothing
          return [...prev.slice(1), prod];
        }
        return [...prev, prod];
      }
    });
  };

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-white text-gray-950 selection:bg-milito-green selection:text-[#1A2025] overflow-hidden">
      
      {/* 1. Header Navigation Component */}
      <Header
        cart={cart}
        onUpdateCartQty={handleUpdateCartQty}
        onRemoveFromCart={handleRemoveFromCart}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onScrollToSection={handleScrollToSection}
        onOpenDashboard={() => setIsDashboardOpen(true)}
      />

      {/* Spacer for fixed header layout */}
      <div className="h-20 w-full" />

      {/* 2. Hero Section */}
      <section 
        style={{ backgroundColor: '#1A2025' }}
        className="relative min-h-[calc(100vh-80px)] xl:min-h-screen flex items-center justify-center py-20 text-white border-b border-white/[0.04] overflow-hidden select-none" 
        id="hero"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background video */}
        <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
          <video
            ref={videoRef}
            src="https://res.cloudinary.com/militotech/video/upload/v1782058769/9f6ae906f73ccfec6f37203801e8eb81_720w_l1qwvu.mp4"
            autoPlay={true}
            loop={true}
            muted={true}
            playsInline={true}
            className="w-full h-full object-cover opacity-45 transition-opacity duration-1000"
          />
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
          <div className="max-w-4xl mx-auto space-y-8 text-center z-10">
            
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/[0.03] p-1.5 pr-4 rounded-full border border-white/[0.08] backdrop-blur-md"
            >
              <span className="text-[10px] bg-milito-green text-black font-extrabold px-3 py-1 rounded-full uppercase tracking-wider block">
                {config.hero.badgeTag}
              </span>
              <span className="text-xs font-semibold text-gray-300">
                {config.hero.badgeText}
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] font-sans"
            >
              {config.hero.titleLine1}<br className="hidden sm:block" />
              <span className="text-milito-green drop-shadow-[0_0_15px_rgba(0,177,79,0.3)]">{config.hero.titleLine2Color}</span><br className="hidden sm:block" />
              {config.hero.titleLine3}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed font-semibold transition-colors duration-200"
            >
              {config.hero.subtitle}
            </motion.p>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={() => handleScrollToSection("shop")}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-milito-green text-black font-extrabold text-sm uppercase tracking-wider hover:brightness-110 shadow-[0_4px_25px_rgba(0,177,79,0.35)] active:scale-98 transition duration-200 cursor-pointer"
              >
                {config.hero.ctaTextPrimary}
              </button>
              <button
                onClick={() => setIsProtectionLightboxOpen(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/20 bg-white/[0.02] text-gray-300 font-extrabold text-sm hover:text-white hover:bg-white/[0.08] hover:border-white/40 transition cursor-pointer flex items-center justify-center gap-2 backdrop-blur-md"
              >
                <span>{config.hero.ctaTextSecondary}</span>
                <div className="w-5 h-5 rounded-full bg-milito-green/15 text-milito-green flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 fill-milito-green" />
                </div>
              </button>
            </motion.div>

            {/* Dynamic trust badges/cards */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 max-w-2xl mx-auto border-none animate-fadeIn"
            >
              {[
                { label: "Buyer Protection", icon: ShieldCheck, color: "text-milito-green bg-milito-green/5 hover:bg-milito-green/10", border: "border-milito-green/20", desc: "100% scam-proof escrow" },
                { label: "Nationwide Delivery", icon: Truck, color: "text-blue-400 bg-blue-400/5 hover:bg-blue-400/10", border: "border-blue-400/20", desc: "Insured & tracked courier" },
                { label: "Swapping-In Available", icon: RefreshCw, color: "text-amber-400 bg-amber-400/5 hover:bg-amber-400/10", border: "border-amber-400/20", desc: "Instant upgrade credit" }
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={i} 
                    className={`flex flex-col items-center text-center bg-white/[0.02] hover:bg-white/[0.04] p-3.5 rounded-xl border ${item.border} backdrop-blur-sm transition-all duration-300 group`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2.5 ${item.color} border border-current/10 transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <span className="block text-xs font-extrabold text-white group-hover:text-milito-green transition-colors">{item.label}</span>
                    <span className="text-[9px] font-bold text-gray-500 tracking-wider mt-1 block uppercase">{item.desc}</span>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Trust Cards Features Section */}
      <TrustFeatures />      {/* 4. Featured Phones Catalogue Grid */}
      <section className="py-24 bg-white border-b border-gray-100" id="shop">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#00B14F] bg-[#00B14F]/10 px-3.5 py-1.5 rounded-full inline-block mb-3 border border-[#00B14F]/20">
                Direct Inventory
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A2025] tracking-tight">
                Shop Verified Smartphones
              </h2>
              <p className="text-gray-655 mt-2 text-xs md:text-sm">
                Each listing corresponds to a verified physical device, thoroughly checked across battery stats, network bands, and screen original health.
              </p>
            </div>

            {/* Quick stats on inventory */}
            <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-2.5 max-w-sm">
              <ShieldCheck className="w-5 h-5 text-[#00B14F] flex-shrink-0" />
              <span>We hold real stock in Lagos and Abuja. No pre-orders or drop ship delays.</span>
            </div>
          </div>

          {/* Premium Search Section */}
          <div className="mb-10 bg-gray-50 border border-gray-200 p-6 md:p-8 rounded-3xl">
            <h3 className="text-xs uppercase font-extrabold text-[#1A2025] mb-3 tracking-wider">
              Find Your Perfect Device
            </h3>
            
            {/* Search Bar */}
            <div className="relative flex items-center max-w-3xl">
              <span className="absolute left-4 text-gray-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by model, budget, storage or brand"
                className="w-full bg-white border border-gray-250 hover:border-gray-300 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] leading-normal pl-12 pr-10 py-3.5 rounded-2xl text-sm text-[#1A2025] placeholder-gray-400 font-medium tracking-wide focus:outline-none transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 text-gray-400 hover:text-black p-1 rounded-full hover:bg-gray-150 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Popular Searches */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-500 font-bold">Popular Searches:</span>
              {[
                { label: "iPhone 15 Pro", query: "iPhone 15" },
                { label: "S24 Ultra", query: "S24" },
                { label: "Premium UK Used", query: "UK Used" },
                { label: "Brand New Devices", query: "Brand New" },
                { label: "Google Pixel", query: "Pixel" },
                { label: "Under ₦200,000", action: () => { setPriceRangeFilter("under-200k"); } },
                { label: "@256GB Storage", action: () => { setStorageFilter("256GB"); } }
              ].map((searchItem, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (searchItem.action) {
                      searchItem.action();
                    } else if (searchItem.query) {
                      setSearchQuery(searchItem.query);
                    }
                  }}
                  className="px-3 py-1 bg-white hover:bg-gray-100 border border-gray-200 text-[#1A2025] hover:text-black font-semibold rounded-lg transition-colors cursor-pointer text-[11px]"
                >
                  {searchItem.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Categories Bar */}
          <div className="mb-10">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-gray-500 mb-4">
              Quick Categories
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Apple", id: "Apple" },
                { label: "Samsung", id: "Samsung" },
                { label: "Google Pixel", id: "Google Pixel" },
                { label: "Tecno", id: "Tecno" },
                { label: "Infinix", id: "Infinix" },
                { label: "Redmi", id: "Redmi" }
              ].map((brandItem) => (
                <button
                  key={brandItem.id}
                  onClick={() => setBrandFilter(brandFilter === brandItem.id ? "All" : brandItem.id as any)}
                  className={`py-3 px-4 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    brandFilter === brandItem.id
                      ? "bg-[#1A2025] text-white border-[#1A2025] shadow-md scale-[1.02]"
                      : "bg-white text-[#1A2025] border-gray-250 hover:border-[#1A2025] hover:bg-gray-50"
                  }`}
                >
                  {brandItem.label}
                </button>
              ))}
            </div>
            {brandFilter !== "All" && (
              <div className="mt-3 flex justify-start">
                <button
                  onClick={() => setBrandFilter("All")}
                  className="text-xs text-[#00B14F] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>✕ Reset to All Brands (Current: {brandFilter})</span>
                </button>
              </div>
            )}
          </div>

          {/* Collapsible sidebar and Product Catalogue Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* Filter Panel Column */}
            <div className="lg:col-span-1 bg-gray-50 border border-gray-200 rounded-3xl p-6 lg:sticky lg:top-24">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#1A2025]" />
                  <span className="text-xs uppercase font-extrabold tracking-wider text-[#1A2025]">Filters Panel</span>
                </div>
                {(brandFilter !== "All" || conditionFilter !== "All" || priceRangeFilter !== "All" || storageFilter !== "All" || batteryHealthFilter !== "All" || availabilityFilter !== "All" || searchQuery !== "") && (
                  <button
                    onClick={() => {
                      setBrandFilter("All");
                      setConditionFilter("All");
                      setPriceRangeFilter("All");
                      setStorageFilter("All");
                      setBatteryHealthFilter("All");
                      setAvailabilityFilter("All");
                      setSearchQuery("");
                      setPriceSort("Default");
                    }}
                    className="text-[10px] uppercase font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition cursor-pointer"
                    title="Clear All Filters"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* FILTER GROUPS */}
              <div className="space-y-6">
                
                {/* Condition Filter */}
                <div>
                  <h4 className="text-[11px] font-extrabold text-[#1A2025] uppercase tracking-wider mb-2.5">
                    Condition
                  </h4>
                  <div className="space-y-2">
                    {["All", "Brand New", "Premium UK Used"].map((cond) => (
                      <label key={cond} className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-black cursor-pointer select-none">
                        <input
                          type="radio"
                          name="condition-filter"
                          checked={conditionFilter === cond}
                          onChange={() => setConditionFilter(cond as any)}
                          className="w-3.5 h-3.5 text-[#00B14F] border-gray-300 focus:ring-[#00B14F] accent-[#00B14F] cursor-pointer"
                        />
                        <span>{cond}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h4 className="text-[11px] font-extrabold text-[#1A2025] uppercase tracking-wider mb-2.5">
                    Price Range
                  </h4>
                  <div className="space-y-2">
                    {[
                      { label: "Show All Prices", id: "All" },
                      { label: "Under ₦200,000", id: "under-200k" },
                      { label: "₦200,000–₦500,000", id: "200k-500k" },
                      { label: "₦500,000–₦1,000,000", id: "500k-1m" },
                      { label: "Above ₦1,000,000", id: "above-1m" }
                    ].map((pr) => (
                      <label key={pr.id} className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-black cursor-pointer select-none">
                        <input
                          type="radio"
                          name="price-filter"
                          checked={priceRangeFilter === pr.id}
                          onChange={() => setPriceRangeFilter(pr.id as any)}
                          className="w-3.5 h-3.5 text-[#00B14F] border-gray-300 focus:ring-[#00B14F] accent-[#00B14F] cursor-pointer"
                        />
                        <span>{pr.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Storage Filter */}
                <div>
                  <h4 className="text-[11px] font-extrabold text-[#1A2025] uppercase tracking-wider mb-2.5">
                    Storage
                  </h4>
                  <div className="space-y-2">
                    {["All", "64GB", "128GB", "256GB", "512GB", "1TB"].map((st) => (
                      <label key={st} className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-black cursor-pointer select-none">
                        <input
                          type="radio"
                          name="storage-filter"
                          checked={storageFilter === st}
                          onChange={() => setStorageFilter(st as any)}
                          className="w-3.5 h-3.5 text-[#00B14F] border-gray-300 focus:ring-[#00B14F] accent-[#00B14F] cursor-pointer"
                        />
                        <span>{st}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Battery Health Filter */}
                <div>
                  <h4 className="text-[11px] font-extrabold text-[#1A2025] uppercase tracking-wider mb-2.5">
                    Battery Health
                  </h4>
                  <div className="space-y-2">
                    {[
                      { label: "Show All", id: "All" },
                      { label: "90%+ (Good Health)", id: "90%+" },
                      { label: "95%+ (Excellent)", id: "95%+" },
                      { label: "100% (Maximum Cap)", id: "100%" }
                    ].map((bh) => (
                      <label key={bh.id} className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-black cursor-pointer select-none">
                        <input
                          type="radio"
                          name="battery-filter"
                          checked={batteryHealthFilter === bh.id}
                          onChange={() => setBatteryHealthFilter(bh.id as any)}
                          className="w-3.5 h-3.5 text-[#00B14F] border-gray-300 focus:ring-[#00B14F] accent-[#00B14F] cursor-pointer"
                        />
                        <span>{bh.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability Filter */}
                <div>
                  <h4 className="text-[11px] font-extrabold text-[#1A2025] uppercase tracking-wider mb-2.5">
                    Availability
                  </h4>
                  <div className="space-y-2">
                    {["All", "In Stock", "Reserved", "Sold Out"].map((av) => (
                      <label key={av} className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-black cursor-pointer select-none">
                        <input
                          type="radio"
                          name="avail-filter"
                          checked={availabilityFilter === av}
                          onChange={() => setAvailabilityFilter(av as any)}
                          className="w-3.5 h-3.5 text-[#00B14F] border-gray-300 focus:ring-[#00B14F] accent-[#00B14F] cursor-pointer"
                        />
                        <span>{av}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Inventory Grid Column */}
            <div className="lg:col-span-3">
              
              {/* Toolbar Controls */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
                <span className="text-xs font-bold text-gray-600">
                  {filteredProducts.length === 0 
                    ? "No devices found" 
                    : `Showing ${Math.min(filteredProducts.length, (currentPage-1)*itemsPerPage + 1)}–${Math.min(filteredProducts.length, currentPage*itemsPerPage)} of ${filteredProducts.length} verified devices`
                  }
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-bold text-gray-500 whitespace-nowrap hidden sm:inline">Sort:</span>
                  <select
                    value={priceSort}
                    onChange={(e) => setPriceSort(e.target.value as any)}
                    className="bg-white border border-gray-250 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-[#00B14F] cursor-pointer font-bold w-full sm:w-44 focus:outline-none"
                  >
                    <option value="Default">Default Order</option>
                    <option value="LowToHigh">Price: Low to High</option>
                    <option value="HighToLow">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Core Grid / Categorized Shelves layout */}
              {(() => {
                const isFiltered =
                  brandFilter !== "All" ||
                  conditionFilter !== "All" ||
                  priceRangeFilter !== "All" ||
                  storageFilter !== "All" ||
                  batteryHealthFilter !== "All" ||
                  availabilityFilter !== "All" ||
                  searchQuery.trim().length > 0;

                // Robust Brand / Condition Matchers
                const isAppleDevice = (p: Product) => {
                  const b = (p.brand || "").toLowerCase().trim();
                  return b.includes("apple") || b.includes("iphone");
                };

                const isSamsungDevice = (p: Product) => {
                  const b = (p.brand || "").toLowerCase().trim();
                  return b.includes("samsung") || b.includes("galaxy");
                };

                const isGoogleDevice = (p: Product) => {
                  const b = (p.brand || "").toLowerCase().trim();
                  return b.includes("google") || b.includes("pixel");
                };

                const isBrandNewDevice = (p: Product) => {
                  const c = (p.condition || "").toLowerCase().trim();
                  return c.includes("brand new") || c === "new" || c === "sealed";
                };

                // Segment products for the dynamic homepage organization
                const featuredProducts = config.products.filter(p => p.featured).slice(0, 6);
                
                const brandNewIphones = config.products.filter(p => isAppleDevice(p) && isBrandNewDevice(p));
                const usedIphones = config.products.filter(p => isAppleDevice(p) && !isBrandNewDevice(p));
                
                const brandNewSamsungs = config.products.filter(p => isSamsungDevice(p) && isBrandNewDevice(p));
                const usedSamsungs = config.products.filter(p => isSamsungDevice(p) && !isBrandNewDevice(p));
                
                const googlePixels = config.products.filter(p => isGoogleDevice(p));

                // Track all products categorized into specific brand shelves above
                const categorizedIds = new Set([
                  ...brandNewIphones.map(p => p.id),
                  ...usedIphones.map(p => p.id),
                  ...brandNewSamsungs.map(p => p.id),
                  ...usedSamsungs.map(p => p.id),
                  ...googlePixels.map(p => p.id)
                ]);

                // Catch-all shelf for any other devices (Xiaomi, Tecno, Infinix, Oppo, or unassigned items)
                const otherDevices = config.products.filter(p => !categorizedIds.has(p.id));

                // Helper to render shelf
                const renderProductShelf = (title: string, subtitle: string, list: Product[]) => {
                  if (list.length === 0) return null;
                  return (
                    <div key={title} className="space-y-4 mb-12 border-b border-gray-100 pb-10 last:border-0 last:pb-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-[#1A2025] tracking-tight">{title}</h4>
                          <span className="bg-[#00B14F]/10 text-[#00B14F] text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#00B14F]/15">
                            {list.length} {list.length === 1 ? "device" : "devices"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5 items-start">
                        {list.map((prod) => (
                          <ProductCard
                            key={prod.id}
                            product={prod}
                            isComparing={compareList.some(p => p.id === prod.id)}
                            onToggleCompare={toggleCompare}
                            onOpenDetails={(p) => setSelectedProductDetails(p)}
                            onQuickAdd={handleQuickAdd}
                          />
                        ))}
                      </div>
                    </div>
                  );
                };

                // Fallback for search/filters
                if (paginatedProducts.length === 0) {
                  return (
                    <div className="bg-gray-50 rounded-3xl py-24 px-8 border border-gray-200 text-center text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
                        <SlidersHorizontal className="w-6 h-6 text-gray-405" />
                      </div>
                      <p className="text-sm font-bold text-[#1A2025]">No devices matched your selected filters.</p>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">Try adjusting your price range, storage constraints, or custom search query.</p>
                      <button
                        onClick={() => {
                          setBrandFilter("All");
                          setConditionFilter("All");
                          setPriceRangeFilter("All");
                          setStorageFilter("All");
                          setBatteryHealthFilter("All");
                          setAvailabilityFilter("All");
                          setSearchQuery("");
                          setPriceSort("Default");
                        }}
                        className="mt-6 px-5 py-2.5 rounded-xl bg-[#00B14F] text-black text-xs font-black uppercase tracking-wider hover:brightness-105 transition cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  );
                }

                if (isFiltered) {
                  // Render single flat grid when user is proactively searching or filtering
                  return (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5 items-start">
                        {paginatedProducts.map((prod) => (
                          <ProductCard
                            key={prod.id}
                            product={prod}
                            isComparing={compareList.some(p => p.id === prod.id)}
                            onToggleCompare={toggleCompare}
                            onOpenDetails={(p) => setSelectedProductDetails(p)}
                            onQuickAdd={handleQuickAdd}
                          />
                        ))}
                      </div>
                    </>
                  );
                }

                // Default Homepage View: Gorgeous Auto-Categorized Visual Shelves
                return (
                  <div className="space-y-2">
                    {/* 1. Spotlight Deals */}
                    {renderProductShelf(
                      "⭐ Spotlight Deals: Featured Products",
                      "Specially highlighted premium devices recommended by Milito Tech engineers",
                      featuredProducts
                    )}

                    {/* 2. Brand New iPhones */}
                    {renderProductShelf(
                      "Brand New iPhones",
                      "Factory-sealed authentic Apple devices with 1-Year manufacturer escrow protection",
                      brandNewIphones
                    )}

                    {/* 3. Premium UK Used iPhones */}
                    {renderProductShelf(
                      "Premium UK Used iPhones",
                      "Pristine condition devices, rigorously diagnostic-tested with 90%+ battery health",
                      usedIphones
                    )}

                    {/* 4. Brand New Samsung Galaxy */}
                    {renderProductShelf(
                      "Brand New Samsung Galaxy",
                      "Sealed global & regional versions with complete warranty status guarantees",
                      brandNewSamsungs
                    )}

                    {/* 5. Premium UK Used Samsung */}
                    {renderProductShelf(
                      "Premium UK Used Samsung",
                      "Tested direct swaps, unlocked dual physical SIM/eSIM setups ready for deployment",
                      usedSamsungs
                    )}

                    {/* 6. Google Pixel Collection */}
                    {renderProductShelf(
                      "Google Pixel Collection",
                      "Pure Android flagship computing machines, unmatched camera setups & security cores",
                      googlePixels
                    )}

                    {/* 7. Other Premium Devices */}
                    {renderProductShelf(
                      "Other Premium Devices",
                      "Xiaomi, OnePlus, Oppo, Tecno, Infinix, Nokia, and certified high-viability releases",
                      otherDevices
                    )}
                  </div>
                );
              })()}

                  {/* Fully Interactive Pagination component */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`p-2.5 rounded-xl border transition-all ${
                          currentPage === 1
                            ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed"
                            : "bg-white text-gray-700 border-gray-250 hover:bg-gray-100 hover:text-black cursor-pointer"
                        }`}
                        title="Previous Page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {Array.from({ length: totalPages }).map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                              currentPage === pageNum
                                ? "bg-[#1A2025] text-white border-[#1A2025]"
                                : "bg-white text-gray-700 border-gray-250 hover:bg-gray-100 hover:text-black"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`p-2.5 rounded-xl border transition-all ${
                          currentPage === totalPages
                            ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed"
                            : "bg-white text-gray-700 border-gray-250 hover:bg-gray-100 hover:text-black cursor-pointer"
                        }`}
                        title="Next Page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

            </div>
          </div>

        </div>
      </section>

      {/* 5. How It Works Section Component */}
      <HowItWorks />

      {/* 6. Trade-In Valuation Calculator Component */}
      <TradeInCalculator />

      {/* 7. Sourcing Vehicle Clearance Estimator component */}
      <VehicleImport />

      {/* 8. Verified Nigeria Clients Testimonials reviews */}
      <section className="py-24 bg-white border-b border-gray-100" id="reviews">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-milito-green bg-milito-green/10 px-3.5 py-1.5 rounded-full inline-block mb-3 border border-milito-green/20">
              User Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Trusted by Hundreds of Nigerians
            </h2>
            <p className="text-gray-600 mt-4 text-base">
              Hear directly from verify buyers who secured smartphones and imported vehicles across Lagos, Abuja, Port Harcourt and Enugu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className="bg-gray-50 hover:bg-gray-100/70 p-6 rounded-3xl border border-gray-200 group transition-all duration-300 flex flex-col justify-between shadow-sm">
                <div>
                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ))}
                  </div>

                  {/* Body Text */}
                  <p className="text-gray-700 text-xs md:text-sm leading-relaxed italic">
                    "{t.text}"
                  </p>
                </div>

                {/* Avatar and user detail */}
                <div className="mt-6 pt-5 border-t border-gray-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-gray-300">
                    <img src={t.avatar} alt="user" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-905 uppercase tracking-wide">{t.name}</h5>
                    <span className="text-[10px] text-gray-500 block">{t.location}</span>
                    <span className="text-[9px] text-milito-green font-bold block mt-0.5">Bought: {t.deviceBought}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 9. Detailed FAQ Section accordion */}
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
              Find fast clarification on how payments protection, quality grading, and vehicle logistics operate.
            </p>
          </div>

          {/* Accordions */}
          <div className="space-y-4">
            {FAQS.map((faq, index) => {
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
                    <ChevronDown className={`w-4 h-4 text-milito-green transition-transform duration-300 ${
                      isFaqOpen ? "rotate-180" : ""
                    }`} />
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

      {/* 10. Footer brand section details */}
      <Footer onScrollToSection={handleScrollToSection} onOpenTracker={() => setIsTrackerOpen(true)} />

      {/* Float support chat utility */}
      <SupportChat />

      {/* Floating Compare Bar overlay */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-[#1A2025]/95 backdrop-blur-md rounded-2xl border border-gray-800 text-white p-4 shadow-2xl flex items-center justify-between gap-4 animate-slideIn">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none w-[70%] sm:w-auto">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-milito-green hidden sm:inline">Compare list:</span>
            <div className="flex items-center gap-2">
              {compareList.map((prod) => (
                <div key={prod.id} className="relative flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 min-w-[120px] max-w-[160px] group flex-shrink-0">
                  <img src={resolveImageUrl(prod.image)} alt={prod.name} className="w-6 h-6 object-contain" />
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
              onClick={() => setIsCompareOpen(true)}
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
                  <p className="text-xs text-gray-500 mt-0.5">Review live specs and conditions of items before releasing funds into secure locked escrow custody.</p>
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
                    <div className="py-2.5 border-b border-gray-105">🏷️ Brand & rating</div>
                    <div className="py-2.5 border-b border-gray-105">🛡️ Condition & state</div>
                    <div className="py-2.5 border-b border-gray-105">💰 Locked Escrow Price</div>
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
                        <img src={resolveImageUrl(prod.image)} alt={prod.name} className="h-20 object-contain mb-2" />
                        <div>
                          <h4 className="font-extrabold text-[#1A2025] line-clamp-1">{prod.name}</h4>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 mt-1 rounded-full border inline-block ${
                            prod.condition === "Brand New"
                              ? "bg-blue-50 text-blue-650 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-250"
                          }`}>{prod.condition}</span>
                        </div>
                      </div>

                      {/* Brand & rating */}
                      <div className="py-2.5 border-b border-gray-100 flex justify-between items-center md:block">
                        <span className="md:hidden font-bold text-gray-500">Brand: </span>
                        <span className="font-extrabold text-gray-900">{prod.brand} ({prod.rating} ★)</span>
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
                        <span className="text-gray-650 leading-relaxed font-medium block">{prod.specs.screen}</span>
                      </div>

                      {/* camera */}
                      <div className="py-2.5 border-b border-gray-100 flex justify-between items-center md:block">
                        <span className="md:hidden font-bold text-gray-500">Camera: </span>
                        <span className="text-gray-650 leading-relaxed font-medium block">{prod.specs.camera}</span>
                      </div>

                      {/* CPU chip */}
                      <div className="py-2.5 border-b border-gray-100 flex justify-between items-center md:block">
                        <span className="md:hidden font-bold text-gray-500">Chipset: </span>
                        <span className="text-gray-650 leading-relaxed font-medium block">{prod.specs.chipset}</span>
                      </div>

                      {/* warranty */}
                      <div className="py-2.5 border-b border-gray-100 flex justify-between items-center md:block">
                        <span className="md:hidden font-bold text-gray-500">Warranty: </span>
                        <span className="text-gray-650 leading-relaxed font-medium block">{prod.specs.warranty}</span>
                      </div>

                      {/* SIM type */}
                      <div className="py-2.5 flex justify-between items-center md:block">
                        <span className="md:hidden font-bold text-gray-500">SIM Type: </span>
                        <span className="text-gray-650 leading-relaxed font-semibold block">{prod.specs.simType}</span>
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
                            Add to Escrow
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
                    setIsCompareOpen(false);
                  }}
                  className="px-4 py-2 border border-gray-250 hover:bg-gray-100 text-gray-750 hover:text-black rounded-xl font-bold transition cursor-pointer text-xs"
                >
                  Clear Selection
                </button>
                <button
                  onClick={() => setIsCompareOpen(false)}
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

      {/* Product Spec detailed details popup drawer */}
      {selectedProductDetails && (
        <ProductDetailsModal
          product={selectedProductDetails}
          onClose={() => setSelectedProductDetails(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Escrow Protection checkout dialog popup */}
      {isCheckoutOpen && (
        <CheckoutModal
          cart={cart}
          onClose={() => setIsCheckoutOpen(false)}
          onClearCart={handleClearCart}
        />
      )}

      {/* Parcel Delivery tracking modal */}
      {isTrackerOpen && (
        <OrderTrackerModal
          onClose={() => setIsTrackerOpen(false)}
        />
      )}

      {/* Buyer Protection / Escrow Explain Lightbox Modal */}
      {isProtectionLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-250 overflow-hidden shadow-2xl animate-scaleUp">
            
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-milito-green" />
                <span>How MILITO Protection Works</span>
              </h3>
              <button
                onClick={() => setIsProtectionLightboxOpen(false)}
                className="p-1 px-2.5 bg-gray-100 text-gray-600 hover:text-black hover:bg-gray-200 rounded text-xs transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-600 text-xs leading-relaxed">
                In Nigeria, buying high-end gadgets online often leaves customers vulnerable to fraud and 'What I ordered vs Product delivered'. We designed the **MILITO Escrow Framework** to eliminate transaction risk:
              </p>

              <div className="space-y-3.5 pt-2">
                {[
                  { title: "Safe Escrow Deposit", body: "Check out on our portal. Your funds are kept safely inside a synchronized Escrow vault which is secured from operations." },
                  { title: "In-Person Inspection", body: "Our rider delivers the parcel to your address. You are fully empowered to unbox, boot the phone, inspect battery health, test cameras and cellular signals." },
                  { title: "Authentication Release", body: "If perfectly satisfied, you sign the release waybill. Only then is money unlocked and transferred to complete the order." }
                ].map((item, index) => (
                  <div key={index} className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-150">
                    <span className="w-5 h-5 rounded-full bg-milito-green/10 text-milito-green font-extrabold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 border border-milito-green/20">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="text-gray-900 font-extrabold text-xs">{item.title}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsProtectionLightboxOpen(false)}
                  className="w-full py-3 bg-milito-green text-black font-bold rounded-xl text-xs uppercase"
                >
                  I Understand, Back to Shopping
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 11. Admin Business Dashboard Modal */}
      <AdminDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        config={config}
        onChangeConfig={(newConfig) => setConfig(newConfig)}
      />

    </div>
  );
}
