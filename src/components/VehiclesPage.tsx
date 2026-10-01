import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { 
  Car, 
  ArrowLeft, 
  ShieldCheck, 
  Search, 
  Filter, 
  FileCheck2, 
  SlidersHorizontal, 
  Wrench, 
  Sparkles,
  PhoneCall,
  CheckCircle2,
  HelpCircle,
  Truck,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check
} from "lucide-react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { Product } from "../types";
import ProductCard from "./ProductCard";
import VehicleImport from "./VehicleImport";

interface VehiclesPageProps {
  vehicles: Product[];
  compareList: Product[];
  onToggleCompare: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  onBackToGadgets: () => void;
  onScrollToSection: (id: string) => void;
  onShareProduct?: (product: Product) => void;
}

export default function VehiclesPage({
  vehicles,
  compareList,
  onToggleCompare,
  onOpenDetails,
  onQuickAdd,
  onBackToGadgets,
  onScrollToSection,
  onShareProduct,
}: VehiclesPageProps) {
  const shouldReduceMotion = useReducedMotion();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const chipsScrollRef = useRef<HTMLDivElement>(null);

  // Filter States with Session Storage Hydration for retention
  const [vehicleSearch, setVehicleSearch] = useState<string>(() => {
    try {
      return sessionStorage.getItem("milito_vehicle_search") || "";
    } catch {
      return "";
    }
  });

  const [selectedMake, setSelectedMake] = useState<string>(() => {
    try {
      return sessionStorage.getItem("milito_vehicle_make") || "All";
    } catch {
      return "All";
    }
  });

  const [conditionFilter, setConditionFilter] = useState<string>(() => {
    try {
      return sessionStorage.getItem("milito_vehicle_condition") || "All";
    } catch {
      return "All";
    }
  });

  const [priceRangeFilter, setPriceRangeFilter] = useState<string>(() => {
    try {
      return sessionStorage.getItem("milito_vehicle_price") || "All";
    } catch {
      return "All";
    }
  });

  const [locationFilter, setLocationFilter] = useState<string>(() => {
    try {
      return sessionStorage.getItem("milito_vehicle_location") || "All";
    } catch {
      return "All";
    }
  });

  const [bodyTypeFilter, setBodyTypeFilter] = useState<string>(() => {
    try {
      return sessionStorage.getItem("milito_vehicle_body_type") || "All";
    } catch {
      return "All";
    }
  });

  const [priceSort, setPriceSort] = useState<"Default" | "LowToHigh" | "HighToLow" | "Newest">(() => {
    try {
      return (sessionStorage.getItem("milito_vehicle_sort") as any) || "Default";
    } catch {
      return "Default";
    }
  });

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Persist state to session storage
  useEffect(() => {
    try {
      sessionStorage.setItem("milito_vehicle_search", vehicleSearch);
      sessionStorage.setItem("milito_vehicle_make", selectedMake);
      sessionStorage.setItem("milito_vehicle_condition", conditionFilter);
      sessionStorage.setItem("milito_vehicle_price", priceRangeFilter);
      sessionStorage.setItem("milito_vehicle_location", locationFilter);
      sessionStorage.setItem("milito_vehicle_body_type", bodyTypeFilter);
      sessionStorage.setItem("milito_vehicle_sort", priceSort);
    } catch {
      // ignore
    }
  }, [vehicleSearch, selectedMake, conditionFilter, priceRangeFilter, locationFilter, bodyTypeFilter, priceSort]);

  // Derive unique Makes/Brands from vehicles
  const availableMakes = useMemo(() => {
    const brandSet = new Set<string>();
    vehicles.forEach((v) => {
      if (v.brand && v.brand.trim()) {
        brandSet.add(v.brand.trim());
      }
    });
    const standardMakes = ["Toyota", "Lexus", "Mercedes-Benz", "Honda", "Hyundai", "Kia", "Ford", "Land Rover", "BMW", "Audi", "Nissan", "Mazda"];
    const foundStandard = standardMakes.filter((m) => brandSet.has(m));
    const otherFound = Array.from(brandSet).filter((m) => !standardMakes.includes(m));
    return ["All", ...foundStandard, ...otherFound];
  }, [vehicles]);

  // Derive unique Locations from vehicles
  const availableLocations = useMemo(() => {
    const locSet = new Set<string>();
    vehicles.forEach((v) => {
      if (v.location && v.location.trim()) {
        locSet.add(v.location.trim());
      }
    });
    const standardLocs = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Enugu", "Asaba", "Kano", "Kaduna"];
    const foundStandard = standardLocs.filter((l) => locSet.has(l));
    const others = Array.from(locSet).filter((l) => !standardLocs.includes(l));
    return ["All", ...foundStandard, ...others];
  }, [vehicles]);

  // Derive unique Body Types from vehicles
  const availableBodyTypes = useMemo(() => {
    const typeSet = new Set<string>();
    vehicles.forEach((v) => {
      if (v.bodyType && v.bodyType.trim()) {
        typeSet.add(v.bodyType.trim());
      }
    });
    const standardTypes = ["SUV", "Sedan", "Truck", "Coupe", "Hatchback", "Convertible", "Van / Minivan"];
    const foundStandard = standardTypes.filter((t) => typeSet.has(t));
    const others = Array.from(typeSet).filter((t) => !standardTypes.includes(t));
    return ["All", ...foundStandard, ...others];
  }, [vehicles]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (vehicleSearch.trim()) count++;
    if (selectedMake !== "All") count++;
    if (conditionFilter !== "All") count++;
    if (priceRangeFilter !== "All") count++;
    if (locationFilter !== "All") count++;
    if (bodyTypeFilter !== "All") count++;
    if (priceSort !== "Default") count++;
    return count;
  }, [vehicleSearch, selectedMake, conditionFilter, priceRangeFilter, locationFilter, bodyTypeFilter, priceSort]);

  // Reset all filters helper
  const handleResetFilters = useCallback(() => {
    setVehicleSearch("");
    setSelectedMake("All");
    setConditionFilter("All");
    setPriceRangeFilter("All");
    setLocationFilter("All");
    setBodyTypeFilter("All");
    setPriceSort("Default");
  }, []);

  // Check chips scroll status
  const checkChipsScroll = useCallback(() => {
    if (chipsScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = chipsScrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  }, []);

  useEffect(() => {
    checkChipsScroll();
    window.addEventListener("resize", checkChipsScroll);
    return () => window.removeEventListener("resize", checkChipsScroll);
  }, [checkChipsScroll]);

  const scrollChips = (direction: "left" | "right") => {
    if (chipsScrollRef.current) {
      const scrollAmount = direction === "left" ? -220 : 220;
      chipsScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkChipsScroll, 300);
    }
  };

  // Filter & Search computation
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((v) => {
        // 1. Search (Make, Model, Year, Name, Description, Location, VIN, Fuel, Transmission)
        if (vehicleSearch.trim()) {
          const q = vehicleSearch.toLowerCase();
          const matchName = (v.name || "").toLowerCase().includes(q);
          const matchBrand = (v.brand || "").toLowerCase().includes(q);
          const matchDesc = (v.description || "").toLowerCase().includes(q);
          const matchYear = v.year ? String(v.year).includes(q) : false;
          const matchLoc = (v.location || "").toLowerCase().includes(q);
          const matchTrans = (v.transmission || "").toLowerCase().includes(q);
          const matchBody = (v.bodyType || "").toLowerCase().includes(q);
          const matchFuel = (v.fuelType || "").toLowerCase().includes(q);
          const matchDrive = (v.driveType || "").toLowerCase().includes(q);

          if (!matchName && !matchBrand && !matchDesc && !matchYear && !matchLoc && !matchTrans && !matchBody && !matchFuel && !matchDrive) {
            return false;
          }
        }

        // 2. Make
        if (selectedMake !== "All" && v.brand !== selectedMake) {
          return false;
        }

        // 3. Condition
        if (conditionFilter !== "All") {
          const cond = (v.condition || "").toLowerCase();
          if (conditionFilter === "Foreign Used" && !cond.includes("foreign") && !cond.includes("tokunbo")) {
            return false;
          }
          if (conditionFilter === "Nigerian Used" && !cond.includes("nigerian")) {
            return false;
          }
          if (conditionFilter === "Brand New" && !cond.includes("brand new")) {
            return false;
          }
        }

        // 4. Price Range
        if (priceRangeFilter !== "All") {
          const p = v.price || 0;
          if (priceRangeFilter === "under-10m" && p >= 10000000) return false;
          if (priceRangeFilter === "10m-25m" && (p < 10000000 || p > 25000000)) return false;
          if (priceRangeFilter === "25m-50m" && (p < 25000000 || p > 50000000)) return false;
          if (priceRangeFilter === "50m-100m" && (p < 50000000 || p > 100000000)) return false;
          if (priceRangeFilter === "above-100m" && p < 100000000) return false;
        }

        // 5. Location
        if (locationFilter !== "All" && v.location !== locationFilter) {
          return false;
        }

        // 6. Body Type
        if (bodyTypeFilter !== "All" && v.bodyType !== bodyTypeFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (priceSort === "LowToHigh") return (a.price || 0) - (b.price || 0);
        if (priceSort === "HighToLow") return (b.price || 0) - (a.price || 0);
        if (priceSort === "Newest") {
          const yearA = parseInt(String(a.year || "0"), 10) || 0;
          const yearB = parseInt(String(b.year || "0"), 10) || 0;
          return yearB - yearA;
        }
        // Default: featured first, then standard order
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }, [vehicles, vehicleSearch, selectedMake, conditionFilter, priceRangeFilter, locationFilter, bodyTypeFilter, priceSort]);

  // Quick Chips Categories List
  const quickCategories = useMemo(() => {
    const chips: { label: string; action: () => void; isActive: boolean }[] = [
      {
        label: "All Vehicles",
        action: () => {
          setSelectedMake("All");
          setBodyTypeFilter("All");
          setConditionFilter("All");
          setPriceRangeFilter("All");
        },
        isActive: selectedMake === "All" && bodyTypeFilter === "All" && conditionFilter === "All" && priceRangeFilter === "All"
      },
      {
        label: "SUVs",
        action: () => setBodyTypeFilter(bodyTypeFilter === "SUV" ? "All" : "SUV"),
        isActive: bodyTypeFilter === "SUV"
      },
      {
        label: "Sedans",
        action: () => setBodyTypeFilter(bodyTypeFilter === "Sedan" ? "All" : "Sedan"),
        isActive: bodyTypeFilter === "Sedan"
      },
      {
        label: "Trucks",
        action: () => setBodyTypeFilter(bodyTypeFilter === "Truck" ? "All" : "Truck"),
        isActive: bodyTypeFilter === "Truck"
      },
      {
        label: "Toyota",
        action: () => setSelectedMake(selectedMake === "Toyota" ? "All" : "Toyota"),
        isActive: selectedMake === "Toyota"
      },
      {
        label: "Lexus",
        action: () => setSelectedMake(selectedMake === "Lexus" ? "All" : "Lexus"),
        isActive: selectedMake === "Lexus"
      },
      {
        label: "Mercedes-Benz",
        action: () => setSelectedMake(selectedMake === "Mercedes-Benz" ? "All" : "Mercedes-Benz"),
        isActive: selectedMake === "Mercedes-Benz"
      },
      {
        label: "Honda",
        action: () => setSelectedMake(selectedMake === "Honda" ? "All" : "Honda"),
        isActive: selectedMake === "Honda"
      },
      {
        label: "Foreign Used (Tokunbo)",
        action: () => setConditionFilter(conditionFilter === "Foreign Used" ? "All" : "Foreign Used"),
        isActive: conditionFilter === "Foreign Used"
      },
      {
        label: "Nigerian Used",
        action: () => setConditionFilter(conditionFilter === "Nigerian Used" ? "All" : "Nigerian Used"),
        isActive: conditionFilter === "Nigerian Used"
      },
      {
        label: "Under ₦25M",
        action: () => setPriceRangeFilter(priceRangeFilter === "10m-25m" ? "All" : "10m-25m"),
        isActive: priceRangeFilter === "10m-25m"
      }
    ];
    return chips;
  }, [selectedMake, bodyTypeFilter, conditionFilter, priceRangeFilter]);

  return (
    <div className="bg-gray-50/60 min-h-screen pb-20 animate-fadeIn text-[#0F172A]">
      
      {/* 1. TOP HEADER & BREADCRUMB SECTION */}
      <section className="relative bg-[#111827] text-white pt-10 pb-12 sm:pt-14 sm:pb-16 overflow-hidden border-b border-gray-800">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.03] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00B14F]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Breadcrumb row */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <button
              onClick={onBackToGadgets}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-bold transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Phones & Gadgets</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onScrollToSection("vehicle-import")}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#00B14F] hover:underline cursor-pointer"
              >
                <span>Customs Duty Estimator ↓</span>
              </button>
              <a
                href="https://wa.me/2348000000000?text=Hello%20MILITO%20Automotive,%20I%20want%20to%20inquire%20about%20a%20vehicle."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00B14F]/20 border border-[#00B14F]/40 text-[#00B14F] hover:bg-[#00B14F] hover:text-black text-xs font-black transition"
              >
                <PhoneCall className="w-3 h-3" />
                <span>WhatsApp Desk</span>
              </a>
            </div>
          </div>

          {/* Core Title and Subtitle */}
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00B14F]/15 border border-[#00B14F]/30 text-[#00B14F] text-xs font-black uppercase tracking-widest mb-3"
            >
              <Car className="w-3.5 h-3.5" />
              <span>MILITO AUTOMOTIVE</span>
            </motion.div>

            <motion.h1
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight"
            >
              Find Your Next Ride
            </motion.h1>

            <motion.p
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-gray-300 mt-2.5 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto"
            >
              Browse available vehicles by make, model, price, condition and location. Every car is inspected for authentic documentation, mechanical fitness and transparent pricing.
            </motion.p>
          </div>

        </div>
      </section>

      {/* 2. STICKY AUTOMOTIVE SHOPPING NAVIGATION CONTROLS */}
      <div 
        id="vehicles-sticky-controls"
        className="sticky top-20 sm:top-24 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] transition-all duration-200 w-full"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 space-y-2 sm:space-y-2.5">
          
          {/* Top Row: Search Input + Quick Filter Selectors + Mobile Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Prominent Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-gray-400 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                id="vehicle-main-search-input"
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
                placeholder="SEARCH VEHICLES... (e.g. Toyota Camry, Lexus RX350, Mercedes Benz C300, Honda Accord)..."
                className="w-full bg-gray-50 hover:bg-gray-100/90 focus:bg-white border border-gray-250 focus:border-[#00B14F] focus:ring-2 focus:ring-[#00B14F]/20 pl-9 sm:pl-11 pr-9 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium text-[#0F172A] placeholder-gray-400 focus:outline-none transition-all shadow-2xs"
              />
              {vehicleSearch && (
                <button
                  type="button"
                  id="vehicle-clear-search-btn"
                  onClick={() => setVehicleSearch("")}
                  className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-black rounded-full hover:bg-gray-200 transition cursor-pointer"
                  title="Clear Search"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>

            {/* Desktop Make Dropdown */}
            <div className="hidden lg:flex items-center gap-1.5">
              <div className="relative">
                <select
                  id="vehicle-sticky-make-select"
                  value={selectedMake}
                  onChange={(e) => setSelectedMake(e.target.value)}
                  className={`text-xs font-bold py-2 sm:py-2.5 px-3 rounded-xl sm:rounded-2xl border transition-all cursor-pointer focus:outline-none pr-8 appearance-none shadow-2xs ${
                    selectedMake !== "All"
                      ? "bg-[#00B14F] text-white border-[#00B14F] shadow-sm"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-250 hover:border-gray-300"
                  }`}
                >
                  <option value="All" className="bg-white text-gray-900">Make: All</option>
                  {availableMakes.filter(m => m !== "All").map((make) => (
                    <option key={make} value={make} className="bg-white text-gray-900">{make}</option>
                  ))}
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className={`text-[10px] font-black ${selectedMake !== "All" ? "text-white" : "text-gray-500"}`}>▼</span>
                </div>
              </div>

              {/* Desktop Price Dropdown */}
              <div className="relative">
                <select
                  id="vehicle-sticky-price-select"
                  value={priceRangeFilter}
                  onChange={(e) => setPriceRangeFilter(e.target.value)}
                  className={`text-xs font-bold py-2 sm:py-2.5 px-3 rounded-xl sm:rounded-2xl border transition-all cursor-pointer focus:outline-none pr-8 appearance-none shadow-2xs ${
                    priceRangeFilter !== "All"
                      ? "bg-[#00B14F] text-white border-[#00B14F] shadow-sm"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-250 hover:border-gray-300"
                  }`}
                >
                  <option value="All" className="bg-white text-gray-900">Price: All</option>
                  <option value="under-10m" className="bg-white text-gray-900">Under ₦10M</option>
                  <option value="10m-25m" className="bg-white text-gray-900">₦10M - ₦25M</option>
                  <option value="25m-50m" className="bg-white text-gray-900">₦25M - ₦50M</option>
                  <option value="50m-100m" className="bg-white text-gray-900">₦50M - ₦100M</option>
                  <option value="above-100m" className="bg-white text-gray-900">Above ₦100M</option>
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className={`text-[10px] font-black ${priceRangeFilter !== "All" ? "text-white" : "text-gray-500"}`}>▼</span>
                </div>
              </div>

              {/* Desktop Condition Dropdown */}
              <div className="relative">
                <select
                  id="vehicle-sticky-condition-select"
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                  className={`text-xs font-bold py-2 sm:py-2.5 px-3 rounded-xl sm:rounded-2xl border transition-all cursor-pointer focus:outline-none pr-8 appearance-none shadow-2xs ${
                    conditionFilter !== "All"
                      ? "bg-[#00B14F] text-white border-[#00B14F] shadow-sm"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-250 hover:border-gray-300"
                  }`}
                >
                  <option value="All" className="bg-white text-gray-900">Condition: All</option>
                  <option value="Foreign Used" className="bg-white text-gray-900">Foreign Used (Tokunbo)</option>
                  <option value="Nigerian Used" className="bg-white text-gray-900">Nigerian Used</option>
                  <option value="Brand New" className="bg-white text-gray-900">Brand New</option>
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className={`text-[10px] font-black ${conditionFilter !== "All" ? "text-white" : "text-gray-500"}`}>▼</span>
                </div>
              </div>

              {/* Desktop Location Dropdown */}
              <div className="relative">
                <select
                  id="vehicle-sticky-location-select"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className={`text-xs font-bold py-2 sm:py-2.5 px-3 rounded-xl sm:rounded-2xl border transition-all cursor-pointer focus:outline-none pr-8 appearance-none shadow-2xs ${
                    locationFilter !== "All"
                      ? "bg-[#00B14F] text-white border-[#00B14F] shadow-sm"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-250 hover:border-gray-300"
                  }`}
                >
                  <option value="All" className="bg-white text-gray-900">Location: All</option>
                  {availableLocations.filter(l => l !== "All").map((loc) => (
                    <option key={loc} value={loc} className="bg-white text-gray-900">{loc}</option>
                  ))}
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className={`text-[10px] font-black ${locationFilter !== "All" ? "text-white" : "text-gray-500"}`}>▼</span>
                </div>
              </div>

              {/* Desktop Sort Dropdown */}
              <div className="relative">
                <select
                  id="vehicle-sticky-sort-select"
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value as any)}
                  className={`text-xs font-bold py-2 sm:py-2.5 px-3 rounded-xl sm:rounded-2xl border transition-all cursor-pointer focus:outline-none pr-8 appearance-none shadow-2xs ${
                    priceSort !== "Default"
                      ? "bg-[#111827] text-white border-[#111827]"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-250 hover:border-gray-300"
                  }`}
                >
                  <option value="Default" className="bg-white text-gray-900">Sort: Featured</option>
                  <option value="LowToHigh" className="bg-white text-gray-900">Price: Low to High</option>
                  <option value="HighToLow" className="bg-white text-gray-900">Price: High to Low</option>
                  <option value="Newest" className="bg-white text-gray-900">Year: Newest First</option>
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className={`text-[10px] font-black ${priceSort !== "Default" ? "text-white" : "text-gray-500"}`}>▼</span>
                </div>
              </div>
            </div>

            {/* Mobile / Tablet Filter Button (Opens Bottom Sheet / Modal) */}
            <button
              type="button"
              id="vehicle-mobile-filter-btn"
              onClick={() => setIsMobileFiltersOpen(true)}
              className={`lg:hidden flex items-center gap-1.5 py-2 sm:py-2.5 px-3 sm:px-3.5 rounded-xl sm:rounded-2xl border text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs ${
                activeFiltersCount > 0
                  ? "bg-[#00B14F] text-black border-[#00B14F]"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-250"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center ml-0.5">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Clear all active filters if any active */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

          </div>

          {/* Bottom Row: Horizontally Scrollable Category / Vehicle Type Chips */}
          <div className="relative flex items-center">
            
            {/* Scroll Left indicator button */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => scrollChips("left")}
                className="absolute -left-1 z-10 p-1 rounded-full bg-white/95 border border-gray-250 shadow-md text-gray-700 hover:text-black hidden sm:flex items-center justify-center cursor-pointer"
                title="Scroll categories left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Horizontal Chips Carousel */}
            <div
              ref={chipsScrollRef}
              onScroll={checkChipsScroll}
              className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1 w-full scroll-smooth"
            >
              {quickCategories.map((cat, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={cat.action}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer select-none shrink-0 ${
                    cat.isActive
                      ? "bg-[#111827] text-white shadow-xs font-black scale-100"
                      : "bg-gray-100/90 hover:bg-gray-200 text-gray-700 border border-transparent"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Scroll Right indicator button */}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => scrollChips("right")}
                className="absolute -right-1 z-10 p-1 rounded-full bg-white/95 border border-gray-250 shadow-md text-gray-700 hover:text-black hidden sm:flex items-center justify-center cursor-pointer"
                title="Scroll categories right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

          </div>

        </div>
      </div>

      {/* 3. MAIN VEHICLES CATALOGUE GRID SECTION */}
      <section className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="vehicles-catalog">
        
        {/* Results summary header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span>Live Vehicle Stock</span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#00B14F]/15 text-[#00B14F] border border-[#00B14F]/30">
                {filteredVehicles.length} Available
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Showing {filteredVehicles.length} of {vehicles.length} verified listings in our Nigerian catalogue.
            </p>
          </div>

          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">
                Active filters ({activeFiltersCount}):
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-[#00B14F] hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Vehicles Grid or Empty State */}
        {filteredVehicles.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-14 border border-gray-200 text-center shadow-xs max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200 text-[#00B14F]">
              <Car className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-black text-gray-900">No matching vehicles found</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
              We couldn't find vehicles matching your search criteria. Our inventory is frequently updated with newly cleared port containers. You can reset filters or request a custom vehicle import.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition cursor-pointer"
              >
                Reset Search Filters
              </button>
              <button
                type="button"
                onClick={() => onScrollToSection("vehicle-import")}
                className="px-6 py-2.5 rounded-xl bg-[#00B14F] hover:bg-[#009643] text-black text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-md"
              >
                <span>Request Custom Import</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 items-start">
            {filteredVehicles.map((vehicle) => (
              <ProductCard
                key={vehicle.id}
                product={vehicle}
                isComparing={compareList.some((p) => p.id === vehicle.id)}
                onToggleCompare={onToggleCompare}
                onOpenDetails={onOpenDetails}
                onQuickAdd={onQuickAdd}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. CUSTOMS DUTIES & CLEARING ESTIMATOR */}
      <div className="mt-6">
        <VehicleImport />
      </div>

      {/* 5. VEHICLE SOURCING STEPS / HOW IT WORKS */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#00B14F] bg-[#00B14F]/10 px-3.5 py-1.5 rounded-full inline-block mb-3 border border-[#00B14F]/20">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            How to Buy or Import a Vehicle through MILITO
          </h2>
          <p className="text-gray-600 mt-2 text-xs sm:text-sm">
            Step-by-step transparent process with zero hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#00B14F] flex items-center justify-center font-extrabold text-sm mb-4 border border-emerald-200">
              1
            </div>
            <h4 className="text-sm font-bold text-gray-900 mb-1">Select or Request</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Choose from our verified in-stock vehicles or submit your custom make, model, and budget requirements.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#00B14F] flex items-center justify-center font-extrabold text-sm mb-4 border border-emerald-200">
              2
            </div>
            <h4 className="text-sm font-bold text-gray-900 mb-1">Inspection & Video</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Receive high-definition walkaround video, diagnostic computer scan reports, and physical inspection review.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#00B14F] flex items-center justify-center font-extrabold text-sm mb-4 border border-emerald-200">
              3
            </div>
            <h4 className="text-sm font-bold text-gray-900 mb-1">Customs & Paperwork</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              We provide full genuine Nigeria Customs Service duty payment receipts, assessment documents, and transfer papers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#00B14F] flex items-center justify-center font-extrabold text-sm mb-4 border border-emerald-200">
              4
            </div>
            <h4 className="text-sm font-bold text-gray-900 mb-1">Pickup or Delivery</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Pick up at our designated Lagos facility or enjoy secured interstate flatbed vehicle logistics to your doorstep.
            </p>
          </div>
        </div>

        {/* Bottom Back Button */}
        <div className="mt-14 text-center">
          <button
            type="button"
            onClick={onBackToGadgets}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#111827] hover:bg-black text-white text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Phones & Gadgets Storefront</span>
          </button>
        </div>
      </section>

      {/* 6. MOBILE FILTER BOTTOM SHEET / MODAL */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 50 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? {} : { opacity: 0, y: 50 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto flex flex-col border border-gray-200 shadow-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-150">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#00B14F]" />
                  <h3 className="text-sm font-black text-gray-900">Automotive Filters</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1 text-gray-400 hover:text-black rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Make selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Make / Brand</label>
                <select
                  value={selectedMake}
                  onChange={(e) => setSelectedMake(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#00B14F]"
                >
                  <option value="All">All Makes</option>
                  {availableMakes.filter(m => m !== "All").map((make) => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>
              </div>

              {/* Condition selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Condition</label>
                <div className="grid grid-cols-2 gap-2">
                  {["All", "Foreign Used", "Nigerian Used", "Brand New"].map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setConditionFilter(cond)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold text-center transition ${
                        conditionFilter === cond
                          ? "bg-[#00B14F] text-black"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Price Range</label>
                <select
                  value={priceRangeFilter}
                  onChange={(e) => setPriceRangeFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#00B14F]"
                >
                  <option value="All">All Prices</option>
                  <option value="under-10m">Under ₦10M</option>
                  <option value="10m-25m">₦10M - ₦25M</option>
                  <option value="25m-50m">₦25M - ₦50M</option>
                  <option value="50m-100m">₦50M - ₦100M</option>
                  <option value="above-100m">Above ₦100M</option>
                </select>
              </div>

              {/* Location selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Location</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#00B14F]"
                >
                  <option value="All">All Locations</option>
                  {availableLocations.filter(l => l !== "All").map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Body Type selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle Type / Body</label>
                <select
                  value={bodyTypeFilter}
                  onChange={(e) => setBodyTypeFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#00B14F]"
                >
                  <option value="All">All Types</option>
                  {availableBodyTypes.filter(t => t !== "All").map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Sort by */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Sort Order</label>
                <select
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#00B14F]"
                >
                  <option value="Default">Featured First</option>
                  <option value="LowToHigh">Price: Low to High</option>
                  <option value="HighToLow">Price: High to Low</option>
                  <option value="Newest">Year: Newest First</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-150 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2.5 rounded-xl border border-gray-250 text-gray-700 text-xs font-bold hover:bg-gray-50"
                >
                  Reset All
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#00B14F] text-black text-xs font-black uppercase tracking-wider hover:bg-[#009643]"
                >
                  Apply Filters ({filteredVehicles.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
