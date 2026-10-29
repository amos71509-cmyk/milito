import React, { useState, useRef, useEffect, useMemo } from "react";
import { ShoppingCart, Menu, X, User, Trash2, LogIn, LogOut, Check, Search, ShieldCheck, Car, Sparkles, ArrowRight, Plus, Lock, Package } from "lucide-react";
import { CartItem, Product, ProductAccessory, resolveImageUrl } from "../types";
import { useBranding } from "../context/BrandingContext";
import { lockBodyScroll, unlockBodyScroll } from "../utils/scrollRetention";
import WhatsAppOrderButton from "./WhatsAppOrderButton";
import { searchStoreProducts } from "../utils/searchUtils";
import { createAccessoryCartProduct } from "../utils/deliveryDate";

interface HeaderProps {
  cart: CartItem[];
  onUpdateCartQty: (key: string, qty: number) => void;
  onRemoveFromCart: (key: string) => void;
  onOpenCheckout: () => void;
  onOpenTracker: () => void;
  onScrollToSection: (id: string) => void;
  onOpenDashboard: () => void;
  activePage?: "gateway" | "gadgets" | "vehicles" | "swap-deals" | "store";
  onNavigatePage?: (page: "gateway" | "gadgets" | "vehicles" | "swap-deals" | "store", sectionId?: string) => void;
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
  onExecuteSearch?: (query: string) => void;
  isCartOpen?: boolean;
  onOpenCart?: () => void;
  onCloseCart?: () => void;
  isLoginModalOpen?: boolean;
  onOpenLoginModal?: () => void;
  onCloseLoginModal?: () => void;
  isCategoryMode?: boolean;
  onNavigateHome?: () => void;
  onAddToCart?: (product: Product, selectedStorage?: string, selectedColor?: { name: string; hex: string }) => void;
}

export default function Header({
  cart,
  onUpdateCartQty,
  onRemoveFromCart,
  onOpenCheckout,
  onOpenTracker,
  onScrollToSection,
  onOpenDashboard,
  activePage = "gadgets",
  onNavigatePage,
  products = [],
  onSelectProduct,
  onExecuteSearch,
  isCartOpen: controlledIsCartOpen,
  onOpenCart: controlledOnOpenCart,
  onCloseCart: controlledOnCloseCart,
  isLoginModalOpen: controlledIsLoginModalOpen,
  onOpenLoginModal: controlledOnOpenLoginModal,
  onCloseLoginModal: controlledOnCloseLoginModal,
  isCategoryMode = false,
  onNavigateHome,
  onAddToCart,
}: HeaderProps) {
  const { branding } = useBranding();
  const [logoFailed, setLogoFailed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [localIsCartOpen, setLocalIsCartOpen] = useState(false);
  const [localIsLoginModalOpen, setLocalIsLoginModalOpen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isCartOpen = controlledIsCartOpen !== undefined ? controlledIsCartOpen : localIsCartOpen;
  const setIsCartOpen = (open: boolean) => {
    if (open) {
      if (controlledOnOpenCart) controlledOnOpenCart();
      setLocalIsCartOpen(true);
    } else {
      if (controlledOnCloseCart) controlledOnCloseCart();
      setLocalIsCartOpen(false);
    }
  };

  const isLoginModalOpen = controlledIsLoginModalOpen !== undefined ? controlledIsLoginModalOpen : localIsLoginModalOpen;
  const setIsLoginModalOpen = (open: boolean) => {
    if (open) {
      if (controlledOnOpenLoginModal) controlledOnOpenLoginModal();
      setLocalIsLoginModalOpen(true);
    } else {
      if (controlledOnCloseLoginModal) controlledOnCloseLoginModal();
      setLocalIsLoginModalOpen(false);
    }
  };

  useEffect(() => {
    if (isCartOpen || isLoginModalOpen) {
      lockBodyScroll();
      return () => {
        unlockBodyScroll();
      };
    }
  }, [isCartOpen, isLoginModalOpen]);

  // Recommended gadget accessories based on cart items + catalog
  const recommendedAccessories = useMemo<Array<{ accessory: ProductAccessory; parentProduct?: Product }>>(() => {
    const list: Array<{ accessory: ProductAccessory; parentProduct?: Product }> = [];
    const seenIds = new Set<string>();

    // 1. Collect strictly from products in the cart that have assigned accessories
    let hasPhoneWithAssigned = false;
    cart.forEach((item) => {
      if (item.product.assignedAccessories && item.product.assignedAccessories.length > 0) {
        hasPhoneWithAssigned = true;
        item.product.assignedAccessories.forEach((acc) => {
          if (acc && acc.id && acc.price > 0 && !seenIds.has(acc.id)) {
            seenIds.add(acc.id);
            list.push({ accessory: acc, parentProduct: item.product });
          }
        });
      }
    });

    // Per requirement: If accessories are assigned to products in the cart, ONLY those assigned accessories appear
    if (hasPhoneWithAssigned) {
      return list;
    }

    // Fallback: If products in cart don't have assigned accessories yet, check catalog
    if (products && products.length > 0 && list.length < 5) {
      products.forEach((prod) => {
        if (prod.assignedAccessories && prod.assignedAccessories.length > 0) {
          prod.assignedAccessories.forEach((acc) => {
            if (acc && acc.id && acc.price > 0 && !seenIds.has(acc.id) && list.length < 6) {
              seenIds.add(acc.id);
              list.push({ accessory: acc, parentProduct: prod });
            }
          });
        }
      });
    }

    // 3. Fallback verified accessories if none found
    if (list.length === 0) {
      const fallbackAccs: ProductAccessory[] = [
        {
          id: "apple-20w-fast-charger",
          name: "Apple 20W USB-C Fast Adapter",
          type: "Charger",
          price: 18500,
          image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80",
          inStock: true,
        },
        {
          id: "samsung-45w-fast-charger",
          name: "Samsung 45W Super Fast Power Adapter",
          type: "Charger",
          price: 24000,
          image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80",
          inStock: true,
        },
        {
          id: "tempered-glass-screen-protector",
          name: "9H Armor Tempered Glass Screen Protector",
          type: "Screen Protector",
          price: 6500,
          image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=400&q=80",
          inStock: true,
        },
        {
          id: "magsafe-shockproof-case",
          name: "MagSafe Armor Shockproof Clear Case",
          type: "Case",
          price: 9500,
          image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=400&q=80",
          inStock: true,
        },
      ];
      fallbackAccs.forEach((acc) => {
        list.push({ accessory: acc });
      });
    }

    return list;
  }, [cart, products]);

  const handleAddAccessoryToCart = (acc: ProductAccessory, parent?: Product) => {
    if (!onAddToCart) return;
    const accProduct = createAccessoryCartProduct(acc, parent);
    onAddToCart(accProduct, "Standard", { name: "Default", hex: "#000" });
  };

  const isAccessoryInCart = (accId: string, accName: string) => {
    return cart.some(
      (item) =>
        item.id.includes(accId) ||
        item.product.id.includes(accId) ||
        item.product.name.toLowerCase() === accName.toLowerCase()
    );
  };

  // Click outside and escape key handler for search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Filter products for immediate search results (strictly scoped to current experience)
  const isVehicleExperience = activePage === "vehicles";

  const scopedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    return products.filter((p) =>
      isVehicleExperience ? p.productType === "vehicle" : (p.productType || "phone") !== "vehicle"
    );
  }, [products, isVehicleExperience]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || scopedProducts.length === 0) return [];
    return searchStoreProducts(scopedProducts, searchQuery).slice(0, 7);
  }, [searchQuery, scopedProducts]);

  const handleSelectSearchResult = (product: Product) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    if (onSelectProduct) {
      onSelectProduct(product);
    } else if (onNavigatePage) {
      if (isVehicleExperience) {
        onNavigatePage("vehicles");
      } else {
        onNavigatePage("store");
      }
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearchOpen(false);

    if (isVehicleExperience && onNavigatePage) {
      onNavigatePage("vehicles", "vehicles-catalog");
    } else if (onExecuteSearch) {
      onExecuteSearch(query);
    } else if (onNavigatePage) {
      onNavigatePage("store");
    }
  };

  const handleQuickTagClick = (tag: string) => {
    setSearchQuery(tag);
    setIsSearchOpen(true);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const tapTimesRef = useRef<number[]>([]);
  const lastTapProcessedRef = useRef<number>(0);
  const noticeTimeoutRef = useRef<any>(null);
  const [clickNotice, setClickNotice] = useState("");

  const handleBrandTap = (e?: React.SyntheticEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const now = Date.now();
    // Deduplicate touchstart/touchend/click firing for the same tap within 200ms
    if (now - lastTapProcessedRef.current < 200) {
      return;
    }
    lastTapProcessedRef.current = now;

    // Filter to taps in the last 4.5 seconds
    tapTimesRef.current = tapTimesRef.current.filter((t) => now - t < 4500);
    tapTimesRef.current.push(now);
    const taps = tapTimesRef.current.length;

    // 2. If 5 or more taps reached, immediately open Admin Dashboard!
    if (taps >= 5) {
      tapTimesRef.current = [];
      if (noticeTimeoutRef.current) clearTimeout(noticeTimeoutRef.current);

      setClickNotice("🔓 Admin Access: Opening Dashboard!");
      onOpenDashboard();

      noticeTimeoutRef.current = setTimeout(() => {
        setClickNotice("");
      }, 3500);
      return;
    }

    // 3. Clear, encouraging feedback as user taps towards 5
    if (taps >= 2) {
      const remaining = 5 - taps;
      if (noticeTimeoutRef.current) clearTimeout(noticeTimeoutRef.current);
      setClickNotice(`⚙️ Admin Access: tap ${remaining} more time${remaining > 1 ? "s" : ""}...`);
      noticeTimeoutRef.current = setTimeout(() => {
        setClickNotice("");
      }, 2000);
    }

    // 4. Single-tap default navigation only on initial tap
    if (taps === 1) {
      if (isCategoryMode && onNavigateHome) {
        onNavigateHome();
      } else {
        onScrollToSection("hero");
      }
    }
  };

  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [inputEmail, setInputEmail] = useState("");
  const [inputName, setInputName] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(p);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail || !inputPassword || (authMode === "signup" && !inputName)) {
      setErrorMessage("Please fill all required fields.");
      return;
    }

    if (authMode === "signup") {
      setUserName(inputName);
      setUserEmail(inputEmail);
    } else {
      setUserName(inputEmail.split("@")[0]);
      setUserEmail(inputEmail);
    }

    setIsLoggedIn(true);
    setIsLoginModalOpen(false);
    setErrorMessage("");
    // Clear inputs
    setInputEmail("");
    setInputName("");
    setInputPassword("");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    setUserName("");
  };

  const handleNavClick = (sectionId: string, pageTarget?: "gateway" | "gadgets" | "store" | "vehicles" | "swap-deals") => {
    if (pageTarget === "gateway") {
      if (onNavigatePage) {
        onNavigatePage("gateway");
      }
      return;
    }

    if ((sectionId === "hero" || pageTarget === "gadgets") && onNavigateHome && !isVehicleExperience) {
      onNavigateHome();
      return;
    }

    if (pageTarget) {
      if (onNavigatePage) {
        onNavigatePage(pageTarget as any, sectionId);
      } else {
        onScrollToSection(sectionId);
      }
      return;
    }

    if (sectionId === "store" || sectionId === "shop") {
      if (onNavigatePage) {
        onNavigatePage("store" as any);
      } else {
        onScrollToSection("store-inventory");
      }
    } else if (sectionId === "trade-in" || sectionId === "swap-deals") {
      if (onNavigatePage) {
        onNavigatePage("swap-deals");
      } else {
        onScrollToSection(sectionId);
      }
    } else if (isVehicleExperience) {
      onScrollToSection(sectionId);
    } else {
      if (onNavigatePage) {
        onNavigatePage("gadgets", sectionId);
      } else {
        onScrollToSection(sectionId);
      }
    }
  };

  const navLinks = isVehicleExperience
    ? [
        { label: "← Main Carousel", sectionId: "", page: "gateway" },
        { label: "Vehicle Catalog", sectionId: "vehicles-catalog", page: "vehicles" },
        { label: "Customs Estimator", sectionId: "vehicle-import", page: "vehicles" },
        { label: "Buying Steps", sectionId: "car-buying-steps", page: "vehicles" },
      ]
    : [
        { label: "← Main Carousel", sectionId: "", page: "gateway" },
        { label: "Home", sectionId: "hero", page: "gadgets" },
        { label: "Store", sectionId: "store", page: "store" },
        { label: "Trade-In", sectionId: "trade-in", page: "swap-deals" },
        { label: "Quality Check", sectionId: "how-it-works", page: "gadgets" },
      ];

  return (
    <>
      {clickNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[10000] bg-black/95 text-milito-green text-xs font-black px-4 py-2.5 rounded-full border border-milito-green/50 shadow-[0_4px_30px_rgba(0,177,79,0.35)] tracking-wide flex items-center gap-2 pointer-events-none animate-bounce">
          <div className="w-2.5 h-2.5 rounded-full bg-milito-green animate-ping"></div>
          {clickNotice}
        </div>
      )}

      {/* Sticky Header with Logo on left, Prominent Search in center, and Controls on right */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-150/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-300 w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4 h-16 sm:h-20 py-1.5 sm:py-2">
            
            {/* Top-Left: MILITO Logo */}
            <div 
              role="button"
              tabIndex={0}
              aria-label="MILITO TECH HOME Logo - tap 5x for Admin Dashboard"
              style={{ touchAction: 'manipulation' }}
              className={`flex-shrink-0 flex items-center gap-1.5 sm:gap-2.5 cursor-pointer select-none active:opacity-75 transition-opacity ${
                isCategoryMode ? "py-1" : ""
              }`}
              onClick={handleBrandTap}
            >
              {branding.logoUrl && !logoFailed ? (
                <div className="flex items-center gap-1.5 sm:gap-2.5 py-0 pointer-events-none">
                  <img 
                    src={resolveImageUrl(branding.logoUrl, { width: 420 })} 
                    alt="MILITO TECH HOME Logo" 
                    onError={() => setLogoFailed(true)}
                    className="h-14 sm:h-[72px] md:h-[76px] max-w-[180px] sm:max-w-[260px] md:max-w-[320px] w-auto object-contain bg-transparent p-0 border-0 shadow-none mix-blend-multiply scale-110 sm:scale-125 origin-left transition-all duration-200 pointer-events-none"
                  />
                  <span className={`font-black text-[#1A2025] tracking-wider pointer-events-none ${
                    isCategoryMode
                      ? "text-sm sm:text-lg md:text-xl inline"
                      : "text-xs sm:text-base md:text-lg hidden xl:inline"
                  }`}>
                    MILITO <span className="text-milito-green">{isVehicleExperience ? "AUTO" : "TECH"}</span>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3 pointer-events-none">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 text-xl sm:text-3xl rounded-xl bg-milito-green flex items-center justify-center font-black text-[#1A2025] leading-none shadow-[0_3px_10px_rgba(0,177,79,0.2)]">
                    M
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-[#1A2025] tracking-wider leading-tight text-base sm:text-xl md:text-2xl">
                      MILITO <span className="text-milito-green">{isVehicleExperience ? "AUTO" : "TECH"}</span>
                    </span>
                    <span className="text-[8px] sm:text-[10px] tracking-[0.2em] uppercase text-gray-500 font-bold -mt-0.5">
                      {isVehicleExperience ? "MOTORS" : "HOME"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Prominent Search Bar (Between Logo and Hamburger/Menu Controls) - Hidden inside Category space, Store page, and Vehicles page (which has its own sticky search bar) */}
            {!isCategoryMode && activePage !== "store" && activePage !== "vehicles" && (
              <div className="flex-1 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-1 sm:mx-3 relative min-w-0" ref={searchContainerRef}>
                <form onSubmit={handleSearchSubmit} className="relative w-full">
                  <div className="relative flex items-center group">
                    <Search className="absolute left-2.5 sm:left-3.5 w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-400 pointer-events-none transition-colors group-focus-within:text-milito-green" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsSearchOpen(true);
                      }}
                      onFocus={() => setIsSearchOpen(true)}
                      placeholder="Search phones, iPads, smartwatches..."
                      aria-label="Search catalogue"
                      className="w-full pl-8 sm:pl-10 pr-7 sm:pr-8 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100/90 hover:bg-gray-100 focus:bg-white text-gray-900 placeholder-gray-400 rounded-full border border-gray-200/90 focus:outline-none focus:border-milito-green focus:ring-2 focus:ring-milito-green/30 transition-all duration-200 shadow-inner"
                    />
                    {searchQuery ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          if (searchInputRef.current) searchInputRef.current.focus();
                        }}
                        className="absolute right-2 sm:right-2.5 p-1 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : null}
                  </div>
                </form>

                {/* Instant Search Results / Recommendations Dropdown */}
                {isSearchOpen && (
                  <div className="fixed top-17 left-2 right-2 sm:absolute sm:top-full sm:left-0 sm:right-0 mt-1.5 sm:mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200/90 overflow-hidden z-50 max-h-[70vh] sm:max-h-[60vh] flex flex-col animate-scaleUp">
                    
                    {/* Results Header */}
                    {searchQuery.trim().length > 0 ? (
                      <div className="p-3 bg-gray-50 border-b border-gray-150 flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-700">
                          {searchResults.length > 0
                            ? `Found ${searchResults.length} matching items`
                            : "No direct match"}
                        </span>
                        <span className="text-[10px] text-gray-500">Press Enter for all</span>
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50 border-b border-gray-150 text-xs">
                        <span className="font-extrabold text-gray-700 uppercase tracking-wider text-[10px]">
                          Popular Device Searches
                        </span>
                      </div>
                    )}

                    {/* Results Body */}
                    <div className="overflow-y-auto divide-y divide-gray-100 flex-1">
                      {searchQuery.trim().length === 0 ? (
                        <div className="p-3.5 space-y-3">
                          <div className="flex flex-wrap gap-1.5">
                            {["iPhone 15 Pro", "Samsung S24", "iPad Pro", "Google Pixel", "Apple Watch", "Grade A++"].map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => handleQuickTagClick(tag)}
                                className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 hover:bg-milito-green hover:text-black text-gray-750 transition-colors cursor-pointer border border-gray-200"
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                          <p className="text-[11px] text-gray-400 italic">
                            Search by brand, model, storage, condition, or price (e.g. "under 500k").
                          </p>
                        </div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((product) => {
                          const isVehicle = product.productType === "vehicle";
                          const thumbUrl = resolveImageUrl(
                            product.thumbnail?.secure_url || product.thumbnail || product.image || product.galleryImages?.[0]?.secure_url || product.gallery?.[0],
                            { width: 100, brand: product.brand }
                          );

                          return (
                            <div
                              key={product.id}
                              onClick={() => handleSelectSearchResult(product)}
                              className="p-2.5 sm:p-3 hover:bg-gray-50 flex items-center gap-3 cursor-pointer transition-colors"
                            >
                              <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-gray-100 border border-gray-200 p-1 flex items-center justify-center overflow-hidden">
                                <img
                                  src={thumbUrl}
                                  alt={product.name}
                                  className="w-full h-full object-contain"
                                  loading="lazy"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                                    {product.name}
                                  </h4>
                                  {isVehicle ? (
                                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                                      <Car className="w-2.5 h-2.5" /> Vehicle
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-gray-100 text-gray-700 border border-gray-250">
                                      {product.condition || "Phone"}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-gray-500 truncate mt-0.5">
                                  {isVehicle
                                    ? `${product.brand} • ${product.year || ""} • ${product.transmission || ""}`
                                    : `${product.brand} • ${(product.storageOptions || []).slice(0, 2).join("/") || "Unlocked"}`}
                                </p>
                              </div>

                              <div className="text-right flex-shrink-0">
                                <div className="text-xs sm:text-sm font-extrabold text-milito-green font-mono">
                                  {formatPrice(product.price)}
                                </div>
                                <span className={`text-[9px] font-bold ${
                                  product.availability === "Sold Out" ? "text-red-500" : "text-emerald-700"
                                }`}>
                                  {product.availability || "In Stock"}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-6 text-center">
                          <p className="text-xs font-semibold text-gray-700">
                            No matching devices for "{searchQuery}"
                          </p>
                          <p className="text-[11px] text-gray-500 mt-1">
                            Try searching by model name like "iPhone 14", "Galaxy S23", or "iPad Pro".
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Dropdown Footer Action */}
                    {searchQuery.trim().length > 0 && searchResults.length > 0 && (
                      <div className="p-2.5 bg-gray-50 border-t border-gray-150 text-center">
                        <button
                          type="button"
                          onClick={() => handleSearchSubmit()}
                          className="w-full py-2 px-3 rounded-xl bg-milito-green hover:brightness-105 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <span>View all matching results</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                  </div>
                )}
              </div>
            )}

            {/* Category Mode: Shows ONLY MILITO logo + Cart icon + Hamburger/menu */}
            {isCategoryMode ? (
              <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                {/* Cart Button */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 sm:p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 hover:text-gray-900 transition-all border border-gray-200 cursor-pointer text-gray-850"
                  title="View Shopping Cart"
                  aria-label="View Shopping Cart"
                >
                  <ShoppingCart className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-current" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-milito-green text-black text-[10px] font-black shadow-md">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </button>

                {/* Hamburger/Menu Toggle */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 sm:p-2.5 text-gray-700 hover:text-black rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200/80"
                  aria-label="Toggle Navigation Menu"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
                </button>
              </div>
            ) : (
              <>
                {/* Desktop Navigation Links */}
                <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
                  {navLinks.map((link) => {
                    const isCurrentActive = 
                      link.page === "store" 
                        ? activePage === "store"
                        : link.page === "gadgets" && link.sectionId === "hero"
                        ? activePage === "gadgets"
                        : link.page === "swap-deals"
                        ? activePage === "swap-deals"
                        : false;

                    return (
                      <button
                        key={link.label}
                        onClick={() => handleNavClick(link.sectionId, link.page as any)}
                        className={`text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer px-2.5 py-1.5 rounded-xl whitespace-nowrap shrink-0 ${
                          isCurrentActive
                            ? "text-[#00B14F] bg-[#00B14F]/10 font-black"
                            : "text-gray-700 hover:text-milito-green hover:bg-gray-100/60"
                        }`}
                      >
                        {link.label}
                      </button>
                    );
                  })}
                </nav>

                {/* Desktop Icons Area */}
                <div className="hidden md:flex items-center space-x-3">
                  {isLoggedIn ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                        <div className="w-2 h-2 rounded-full bg-milito-green"></div>
                        <span className="text-xs text-gray-700 font-semibold">{userName}</span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                        title="Sign Out"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAuthMode("login");
                        setIsLoginModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full bg-gray-100 hover:bg-gray-200 hover:text-gray-900 transition-all border border-gray-200 cursor-pointer text-gray-800"
                    >
                      <User className="w-3.5 h-3.5" />
                      Login
                    </button>
                  )}

                  {/* Cart Button (Gadget experience only) */}
                  {!isVehicleExperience && (
                    <button
                      onClick={() => setIsCartOpen(true)}
                      className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200 hover:text-gray-900 transition-all border border-gray-200 cursor-pointer text-gray-850"
                      title="View Shopping Cart"
                    >
                      <ShoppingCart className="w-4.5 h-4.5 text-current" />
                      {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-milito-green text-black text-[10px] font-black shadow-md">
                          {cart.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                      )}
                    </button>
                  )}
                </div>

                {/* Mobile Controls: Cart + Hamburger/Menu */}
                <div className="flex md:hidden items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
                  {/* Mobile Cart (Gadget experience only) */}
                  {!isVehicleExperience && (
                    <button
                      onClick={() => setIsCartOpen(true)}
                      className="relative p-1.5 sm:p-2 rounded-full bg-gray-100 text-gray-850 border border-gray-200 cursor-pointer"
                      title="Shopping Cart"
                    >
                      <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                      {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-milito-green text-black text-[9px] font-black">
                          {cart.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                      )}
                    </button>
                  )}

                  {/* Existing Hamburger/Menu Toggle */}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-1.5 sm:p-2 text-gray-700 hover:text-black rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    aria-label="Toggle Navigation Menu"
                  >
                    {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>

        {/* Mobile menu panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white py-4 px-6 space-y-4 animate-fadeIn shadow-lg">
            {branding.logoUrl && (
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <img
                  src={branding.logoUrl}
                  alt="Website Logo"
                  className="h-12 sm:h-14 max-w-[220px] object-contain mix-blend-multiply bg-transparent p-0 border-0 shadow-none"
                />
              </div>
            )}
            <div className="flex flex-col space-y-2.5 font-semibold text-base">
              {navLinks.map((link) => {
                const isCurrentActive = 
                  link.page === "store" 
                    ? activePage === "store"
                    : link.page === "gadgets" && link.sectionId === "hero"
                    ? activePage === "gadgets"
                    : link.page === "swap-deals"
                    ? activePage === "swap-deals"
                    : false;

                return (
                  <button
                    key={link.label}
                    onClick={() => {
                      handleNavClick(link.sectionId, link.page as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`text-left py-2 px-3 rounded-xl transition-colors font-bold ${
                      isCurrentActive
                        ? "text-[#00B14F] bg-[#00B14F]/10 font-black"
                        : "text-gray-800 hover:text-milito-green hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
              {!isVehicleExperience && (
                <button
                  onClick={() => {
                    onOpenTracker();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left py-2 px-3 text-gray-800 hover:text-milito-green transition-colors font-bold"
                >
                  Track Order
                </button>
              )}
              <button
                onClick={() => {
                  onOpenDashboard();
                  setIsMobileMenuOpen(false);
                }}
                className="text-left py-2 px-3 text-gray-600 hover:text-milito-green transition-colors font-bold text-xs flex items-center gap-1.5"
              >
                <span>⚙️</span>
                <span>Admin Dashboard</span>
              </button>
            </div>

            <div className="border-t border-gray-100 pt-3 flex flex-col space-y-3">
              {isLoggedIn ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Account: {userName}</span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-sm text-red-500 flex items-center gap-1.5"
                  >
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setIsLoginModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-milito-green text-black font-extrabold shadow-md cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  Account Login
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Cart Sidebar Slide-Over */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsCartOpen(false)}
            ></div>

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col bg-white shadow-2xl border-l border-gray-200 animate-slideIn">
                  {/* Cart Header */}
                  <div className="flex items-center justify-between px-6 py-6 border-b border-gray-150">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-milito-green" />
                      <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider" id="slide-over-title">
                        Shopping Cart
                      </h2>
                    </div>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="rounded-md p-1.5 text-gray-550 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Cart List */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-20">
                        <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-150 flex items-center justify-center text-gray-400 mb-4">
                          <ShoppingCart className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-800">Your cart is empty</h3>
                        <p className="text-xs text-gray-500 mt-1 max-w-xs">
                          You haven't added any premium gadgets to your cart yet. Explore our featured smartphones to get started!
                        </p>
                        <button
                          onClick={() => {
                            setIsCartOpen(false);
                            onScrollToSection("shop");
                          }}
                          className="mt-6 px-5 py-2.5 text-xs font-semibold rounded-full bg-milito-green text-black hover:bg-opacity-90 transition cursor-pointer font-bold"
                        >
                          Browse Smartphones
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="divide-y divide-gray-150">
                        {cart.map((item) => (
                          <div key={item.id} className="flex py-4 first:pt-0 last:pb-0 gap-4">
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50 p-1 flex items-center justify-center">
                              <img
                                src={resolveImageUrl(
                                  item.product.thumbnail?.secure_url || item.product.thumbnail || item.product.image || item.product.galleryImages?.[0]?.secure_url || item.product.gallery?.[0],
                                  { width: 160, brand: item.product.brand }
                                )}
                                alt={item.product.name}
                                loading="lazy"
                                decoding="async"
                                referrerPolicy="no-referrer"
                                className="h-full object-contain"
                              />
                            </div>

                            <div className="flex flex-1 flex-col">
                              <div>
                                <div className="flex justify-between text-sm font-semibold text-gray-950">
                                  <h3 className="line-clamp-1">{item.product.name}</h3>
                                  <p className="ml-4 text-milito-green font-bold font-mono">{formatPrice(item.product.price * item.quantity)}</p>
                                </div>
                                <div className="mt-1 flex gap-2 text-[11px] text-gray-500">
                                  <span className="bg-gray-150 text-gray-700 px-2 py-0.5 rounded font-mono font-medium">{item.selectedStorage}</span>
                                  <span className="flex items-center gap-1.5 bg-gray-150 text-gray-750 px-2 py-0.5 rounded">
                                    <span className="w-2.5 h-2.5 rounded-full border border-gray-300 inline-block" style={{ backgroundColor: item.selectedColor.hex }}></span>
                                    {item.selectedColor.name}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-1 flex-col justify-end text-xs mt-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center border border-gray-250 rounded-lg overflow-hidden bg-gray-50">
                                    <button
                                      onClick={() => onUpdateCartQty(item.id, item.quantity - 1)}
                                      className="px-2.5 py-1 text-gray-500 hover:text-black hover:bg-gray-200 cursor-pointer font-bold"
                                    >
                                      -
                                    </button>
                                    <span className="px-3 text-gray-900 font-bold text-xs">{item.quantity}</span>
                                    <button
                                      onClick={() => onUpdateCartQty(item.id, item.quantity + 1)}
                                      className="px-2.5 py-1 text-gray-500 hover:text-black hover:bg-gray-200 cursor-pointer font-bold"
                                    >
                                      +
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => onRemoveFromCart(item.id)}
                                    className="font-bold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Recommended Gadget Accessories in Cart */}
                      {recommendedAccessories.length > 0 && (
                        <div className="pt-4 border-t border-gray-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-milito-green" />
                              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                                Recommended Accessories
                              </h4>
                            </div>
                            <span className="text-[10px] text-gray-500 font-bold">Frequently added</span>
                          </div>

                          <div className="space-y-2">
                            {recommendedAccessories.map(({ accessory, parentProduct }) => {
                              const added = isAccessoryInCart(accessory.id, accessory.name);
                              return (
                                <div
                                  key={accessory.id}
                                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-gray-100/90 transition-colors"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-11 h-11 rounded-lg border border-gray-200 bg-white p-1 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                      {accessory.image ? (
                                        <img
                                          src={accessory.image}
                                          alt={accessory.name}
                                          className="w-full h-full object-contain"
                                        />
                                      ) : (
                                        <Package className="w-5 h-5 text-gray-400" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-gray-900 truncate leading-tight">
                                        {accessory.name}
                                      </p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs font-mono font-black text-milito-green">
                                          {formatPrice(accessory.price)}
                                        </span>
                                        {accessory.type && (
                                          <span className="text-[9px] uppercase font-bold text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                            {accessory.type}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {added ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex-shrink-0">
                                      <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                      Added
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleAddAccessoryToCart(accessory, parentProduct)}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-milito-green text-gray-900 hover:text-black border border-gray-300 hover:border-milito-green text-xs font-black shadow-xs active:scale-95 transition-all cursor-pointer flex-shrink-0"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Add</span>
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                    )}
                  </div>

                  {/* Cart Footer */}
                  {cart.length > 0 && (
                    <div className="border-t border-gray-200 px-6 py-5 bg-gray-50">
                      <div className="flex justify-between text-base font-bold text-gray-900 mb-2">
                        <span>Subtotal</span>
                        <span className="text-xl text-milito-green font-black font-mono">{formatPrice(cartTotal)}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 mb-4 flex items-center gap-1.5 bg-white p-2.5 rounded-xl border border-gray-200 shadow-xs leading-normal">
                        <ShieldCheck className="w-4 h-4 text-milito-green flex-shrink-0" />
                        <span>Verified MILITO gadgets. Prompt dispatch & direct tracking nationwide.</span>
                      </p>

                      <div className="space-y-2.5">
                        {/* Check Out button */}
                        <button
                          onClick={() => {
                            setIsCartOpen(false);
                            onOpenCheckout();
                          }}
                          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#00B14F] hover:bg-[#009944] px-6 py-4 text-sm font-black uppercase tracking-wider text-black shadow-lg shadow-[#00B14F]/25 hover:shadow-xl active:scale-98 transition duration-200 cursor-pointer min-h-[50px]"
                          id="cart-drawer-checkout-btn"
                        >
                          <Lock className="w-4 h-4 text-black" />
                          <span>Check Out</span>
                          <ArrowRight className="w-4 h-4 text-black" />
                        </button>

                        <button
                          onClick={() => setIsCartOpen(false)}
                          className="w-full flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-xs font-semibold text-gray-750 hover:bg-gray-100 transition cursor-pointer"
                        >
                          Continue Shopping
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login / Auth Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full border border-gray-250 overflow-hidden shadow-2xl animate-scaleUp">
            <div className="px-6 py-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-950 font-sans">
                {authMode === "login" ? "Welcome Back" : "Create Brand Account"}
              </h3>
              <button 
                onClick={() => setIsLoginModalOpen(false)}
                className="w-6 h-6 rounded flex items-center justify-center bg-gray-100 text-gray-500 hover:text-black hover:bg-gray-200 transition cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-100 border border-red-200 text-xs text-red-700 font-semibold leading-relaxed">
                  {errorMessage}
                </div>
              )}

              {authMode === "signup" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="e.g. Samuel Alao"
                    className="w-full px-4 py-2.5 text-sm rounded-lg bg-white border border-gray-300 focus:outline-none focus:border-milito-green text-gray-900 transition placeholder-gray-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-white border border-gray-300 focus:outline-none focus:border-milito-green text-gray-900 transition placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-white border border-gray-300 focus:outline-none focus:border-milito-green text-gray-900 transition placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-milito-green text-black font-extrabold shadow-lg hover:bg-opacity-90 active:scale-98 transition duration-200 mt-2 text-sm cursor-pointer uppercase tracking-wider"
              >
                {authMode === "login" ? "Login Securely" : "Register with MILITO"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === "login" ? "signup" : "login");
                    setErrorMessage("");
                  }}
                  className="text-xs text-gray-550 hover:text-milito-green transition font-medium cursor-pointer"
                >
                  {authMode === "login" 
                    ? "New to MILITO TECH HOME? Create an Account" 
                    : "Already have an account? Log In"
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
