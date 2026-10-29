import { Product, Testimonial, FAQ } from "./types";

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "iphone-15-pro-max",
    name: "Apple iPhone 15 Pro Max",
    brand: "Apple",
    condition: "Brand New",
    price: 1850000,
    originalPrice: 1950000,
    badge: "Best Seller",
    availability: "In Stock",
    batteryHealth: "100%",
    batteryHealthValue: "100%",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1695048133502-df5b11400a10?auto=format&fit=crop&w=800&q=80"
    ],
    storageOptions: ["256GB", "512GB", "1TB"],
    colorOptions: [
      { name: "Titanium Black", hex: "#232426" },
      { name: "Titanium Gray", hex: "#8F8A80" },
      { name: "Titanium Blue", hex: "#1D2C3F" },
      { name: "Titanium White", hex: "#E3E4E5" }
    ],
    description: "The ultimate iPhone. Featuring a strong and lightweight aerospace-grade titanium design, a ground-breaking new Action button, powerful camera system upgrades including a high-performance 5x Telephoto lens, and the ultra-fast A17 Pro chip.",
    specs: {
      screen: "6.7-inch Super Retina XDR OLED (120Hz, HDR10)",
      camera: "48MP Main + 12MP Telephoto (5x optical zoom) + 12MP Ultra-wide",
      chipset: "Apple A17 Pro (3nm)",
      ram: "8GB LPDDR5",
      batterySize: "4441 mAh (Supports 25W tech charging)",
      os: "iOS 17, upgradable to iOS 18",
      warranty: "1 Year International Apple Warranty",
      simType: "Physical Nano-SIM + eSIM (Dual Standby)"
    },
    networkCapability: "5G",
    network: "Factory Unlocked 5G",
    faceId: "Working",
    rating: 4.9,
    reviewsCount: 124,
    assignedAccessories: [
      {
        id: "iphone-charger-20w",
        name: "Apple 20W USB-C Power Adapter",
        type: "Charger",
        price: 18500,
        image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80",
        inStock: true
      },
      {
        id: "iphone-15-silicone-case",
        name: "MagSafe Shockproof Silicone Case",
        type: "Pouch/Case",
        price: 7500,
        image: "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=400&q=80",
        inStock: true
      },
      {
        id: "iphone-15-screen-guard",
        name: "9D Full Cover Curved Screen Protector",
        type: "Screen Guard",
        price: 4500,
        image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=400&q=80",
        inStock: true
      },
      {
        id: "airpods-pro-2-acc",
        name: "AirPods Pro (2nd Gen) with MagSafe Case",
        type: "Earbuds/AirPods",
        price: 245000,
        image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=400&q=80",
        inStock: true
      },
      {
        id: "anker-powerbank-20k",
        name: "20,000mAh PD Fast Charge Power Bank",
        type: "Power Bank",
        price: 32000,
        image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=400&q=80",
        inStock: true
      },
      {
        id: "iphone-camera-guard",
        name: "Sapphire Crystal Camera Lens Guard",
        type: "Camera Guard",
        price: 3500,
        image: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=400&q=80",
        inStock: true
      }
    ]
  },
  {
    id: "samsung-s24-ultra",
    name: "Samsung Galaxy S24 Ultra 5G",
    brand: "Samsung",
    condition: "Brand New",
    price: 1690000,
    originalPrice: 1750000,
    badge: "Trending",
    availability: "In Stock",
    batteryHealth: "100%",
    batteryHealthValue: "100%",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop"
    ],
    storageOptions: ["256GB", "512GB", "1TB"],
    colorOptions: [
      { name: "Titanium Gray", hex: "#6F7275" },
      { name: "Titanium Yellow", hex: "#E9D9B2" },
      { name: "Titanium Black", hex: "#1F2022" },
      { name: "Titanium Violet", hex: "#3A334B" }
    ],
    description: "Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity and possibility starting with the most important device in your life.",
    specs: {
      screen: "6.8-inch Dynamic AMOLED 2X, QHD+ (120Hz, 2600 nits Peak)",
      camera: "200MP Main + 50MP Periscope (5x optical) + 10MP Telephoto (3x optical) + 12MP Ultra-wide",
      chipset: "Snapdragon 8 Gen 3 for Galaxy (4nm)",
      ram: "12GB RAM LPDDR5X",
      batterySize: "5000 mAh (45W Super Fast Charging 2.0)",
      os: "Android 14 (One UI 6.1), 7 Years Support",
      warranty: "1 Year Official Samsung Warranty",
      simType: "Dual Physical SIM Slot for Nigeria market"
    },
    networkCapability: "5G",
    network: "Dual SIM 5G",
    fingerprint: "Working",
    faceId: "Working",
    rating: 4.8,
    reviewsCount: 96,
    assignedAccessories: [
      {
        id: "samsung-45w-charger",
        name: "Samsung 45W Super Fast Power Adapter",
        type: "Charger",
        price: 24000,
        image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80",
        inStock: true
      },
      {
        id: "s24-ultra-armor-case",
        name: "Heavy Duty Shockproof Armor Case",
        type: "Pouch/Case",
        price: 8500,
        image: "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=400&q=80",
        inStock: true
      },
      {
        id: "s24-ultra-screen-guard",
        name: "Anti-Reflective UV Curved Glass Protector",
        type: "Screen Guard",
        price: 6000,
        image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=400&q=80",
        inStock: true
      },
      {
        id: "galaxy-buds2-pro",
        name: "Samsung Galaxy Buds2 Pro Wireless Earbuds",
        type: "Earbuds/AirPods",
        price: 135000,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80",
        inStock: true
      },
      {
        id: "samsung-powerbank-10k",
        name: "25W Fast Wireless 10,000mAh Power Bank",
        type: "Power Bank",
        price: 28000,
        image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=400&q=80",
        inStock: true
      }
    ]
  },
  {
    id: "google-pixel-9-pro",
    name: "Google Pixel 9 Pro XL",
    brand: "Google Pixel",
    condition: "Brand New",
    price: 1480000,
    badge: "Smart AI",
    availability: "In Stock",
    batteryHealth: "100%",
    batteryHealthValue: "100%",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop"
    ],
    storageOptions: ["128GB", "256GB", "512GB"],
    colorOptions: [
      { name: "Obsidian Black", hex: "#222324" },
      { name: "Porcelain White", hex: "#F3EFE9" },
      { name: "Hazel Gray", hex: "#7E817D" }
    ],
    description: "Supercharged by Gemini. Pixel 9 Pro XL has the most powerful Pixel camera yet, a brilliant Super Actua display, and the advanced Google Tensor G4 chip, providing unmatched AI photography and assistant services.",
    specs: {
      screen: "6.8-inch LTPO Super Actua OLED (120Hz, 3000 nits Peak)",
      camera: "50MP Main + 48MP Telephoto (5x optical) + 48MP Ultra-wide with Macro Focus",
      chipset: "Google Tensor G4 (4nm) with Titan M2 security",
      ram: "16GB RAM",
      batterySize: "5060 mAh (Supports 37W fast charging)",
      os: "Android 14 (With 7 Years of OS & Feature Drops)",
      warranty: "1 Year Store Warranty",
      simType: "Physical SIM + eSIM"
    },
    networkCapability: "5G",
    network: "5G Factory Unlocked",
    fingerprint: "Working",
    faceId: "Working",
    rating: 4.7,
    reviewsCount: 45
  },
  {
    id: "iphone-14-pro-used",
    name: "Apple iPhone 14 Pro",
    brand: "Apple",
    condition: "Premium UK Used",
    price: 930000,
    originalPrice: 1050000,
    badge: "95% Battery Health",
    availability: "In Stock",
    batteryHealth: "95% (Excellent)",
    batteryHealthValue: "95%+",
    image: "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?q=80&w=600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?q=80&w=600&auto=format&fit=crop"
    ],
    storageOptions: ["128GB", "256GB", "512GB"],
    colorOptions: [
      { name: "Deep Purple", hex: "#3B2E40" },
      { name: "Space Black", hex: "#262627" },
      { name: "Gold Metallic", hex: "#EADDC9" },
      { name: "Silver", hex: "#E3E4E5" }
    ],
    description: "Premium UK used iPhone 14 Pro in absolute Pristine Condition. 100% network unlocked, no single scratch, verified battery state, extensively tested with our 35-point mechanical quality check.",
    specs: {
      screen: "6.1-inch Super Retina XDR OLED with Dynamic Island (120Hz)",
      camera: "48MP Main + 12MP Telephoto (3x optical) + 12MP Ultra-wide",
      chipset: "Apple A16 Bionic (4nm)",
      ram: "6GB RAM",
      batterySize: "3200 mAh (Tested health range: 88% - 94%)",
      os: "iOS 16, upgradable to iOS 18",
      warranty: "6-Month MILITO Premium Store Warranty",
      simType: "Physical Nano-SIM + eSIM capability"
    },
    networkCapability: "5G",
    network: "Factory Unlocked 5G",
    faceId: "Working",
    rating: 4.8,
    reviewsCount: 88
  },
  {
    id: "samsung-s23-ultra-used",
    name: "Samsung Galaxy S23 Ultra 5G",
    brand: "Samsung",
    condition: "Premium UK Used",
    price: 1080000,
    originalPrice: 1180000,
    badge: "Pristine Grade A",
    availability: "In Stock",
    batteryHealth: "91% (Guaranteed)",
    batteryHealthValue: "90%+",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop"
    ],
    storageOptions: ["256GB", "512GB"],
    colorOptions: [
      { name: "Phantom Black", hex: "#1A191A" },
      { name: "Green", hex: "#2A3830" },
      { name: "Cream", hex: "#F3EFE0" },
      { name: "Lavender", hex: "#D6C3D8" }
    ],
    description: "Excellent UK used Galaxy S23 Ultra. Minor cosmetic scuffs strictly restricted to edge, certified camera functioning, and flawless screen. Standard 100x Space Zoom is fully active and tested.",
    specs: {
      screen: "6.8-inch Dynamic AMOLED 2X, QHD+ (120Hz)",
      camera: "200MP Main + 10MP Periscope + 10MP Telephoto + 12MP Ultra-wide",
      chipset: "Snapdragon 8 Gen 2 for Galaxy",
      ram: "8GB / 12GB RAM",
      batterySize: "5000 mAh (Tested capacity guaranteed above 90%)",
      os: "Android 13, upgradable to Android 15",
      warranty: "6-Month MILITO Premium Store Warranty",
      simType: "Dual SIM Slot Active"
    },
    networkCapability: "5G",
    network: "Dual SIM 5G",
    fingerprint: "Working",
    faceId: "Working",
    rating: 4.7,
    reviewsCount: 62
  },
  {
    id: "iphone-13-pro-max-used",
    name: "Apple iPhone 13 Pro Max",
    brand: "Apple",
    condition: "Premium UK Used",
    price: 740000,
    originalPrice: 820000,
    badge: "Top Value",
    availability: "Reserved",
    batteryHealth: "90% (Good)",
    batteryHealthValue: "90%+",
    image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80"
    ],
    storageOptions: ["128GB", "256GB", "512GB"],
    colorOptions: [
      { name: "Sierra Blue", hex: "#A6C2DA" },
      { name: "Graphite", hex: "#3B3C3E" },
      { name: "Gold", hex: "#F4E2C7" },
      { name: "Alpine Green", hex: "#3B4E43" }
    ],
    description: "Extremely popular flagship model known for outstanding dual-day battery stamina. Our UK Used stock consists exclusively of Grade A++ devices. Absolutely no screen burns, dents or face ID faults.",
    specs: {
      screen: "6.7-inch Super Retina XDR with ProMotion (120Hz)",
      camera: "12MP Main + 12MP Telephoto + 12MP Ultra-wide",
      chipset: "Apple A15 Bionic (5nm)",
      ram: "6GB RAM",
      batterySize: "4352 mAh (Health: 85% - 91% verified)",
      os: "iOS 15, upgradable to iOS 18",
      warranty: "6-Month MILITO Store Warranty",
      simType: "Physical SIM + eSIM"
    },
    networkCapability: "5G",
    network: "Factory Unlocked 5G",
    faceId: "Working",
    rating: 4.8,
    reviewsCount: 154
  },
  {
    id: "tecno-phantom-v-fold-2",
    name: "Tecno Phantom V Fold 2 5G",
    brand: "Tecno",
    condition: "Brand New",
    price: 1150000,
    originalPrice: 1250000,
    badge: "Futuristic Fold",
    availability: "In Stock",
    batteryHealth: "100%",
    batteryHealthValue: "100%",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop"
    ],
    storageOptions: ["512GB"],
    colorOptions: [
      { name: "Karst Gray", hex: "#4B4E54" },
      { name: "Meadow Green", hex: "#324E43" }
    ],
    description: "Experience the grand fold. The Tecno Phantom V Fold 2 brings an expansive 7.85-inch LTPO 120Hz screen, custom Free-hover adjustments, dual speakers and full-on smart software optimizations to fold boundaries.",
    specs: {
      screen: "7.85 inches Foldable LTPO AMOLED + 6.42 inches Cover Display",
      camera: "50MP Main + 50MP Portrait + 50MP Ultra-wide",
      chipset: "MediaTek Dimensity 9000+ (4nm)",
      ram: "12GB RAM (+12GB Extended)",
      batterySize: "5000 mAh (45W Super Charge)",
      os: "Android 13, HiOS 13 Fold",
      warranty: "1 Year Official Tecno Warranty",
      simType: "Dual Physical Nano SIM"
    },
    networkCapability: "5G",
    network: "Dual SIM 5G",
    fingerprint: "Working",
    faceId: "Working",
    rating: 4.6,
    reviewsCount: 22
  },
  {
    id: "infinix-zero-40",
    name: "Infinix Zero 40 5G",
    brand: "Infinix",
    condition: "Brand New",
    price: 490000,
    badge: "Vlogger Edition",
    availability: "Sold Out",
    batteryHealth: "100%",
    batteryHealthValue: "100%",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop"
    ],
    storageOptions: ["256GB", "512GB"],
    colorOptions: [
      { name: "Violet Garden", hex: "#6A5D7C" },
      { name: "Rock Black", hex: "#262627" }
    ],
    description: "The ideal phone for high-fidelity content creators. With true 4K active camera stabilization on both front and back sensors, a curved 144Hz AMOLED screen, and custom vlog templates built-in.",
    specs: {
      screen: "6.78-inch curved 3D LTPS AMOLED (144Hz, Gorilla Glass 5)",
      camera: "108MP Main OIS + 50MP Ultra-wide + 2MP Depth, Front 50MP Vlog",
      chipset: "MediaTek Dimensity 8200 Ultimate (4nm)",
      ram: "12GB RAM",
      batterySize: "5000 mAh (45W Fast Charging)",
      os: "Android 14, XOS 14.5",
      warranty: "1 Year Carlcare Warranty",
      simType: "Dual SIM Slot Ready"
    },
    networkCapability: "5G",
    network: "Dual SIM 5G",
    fingerprint: "Working",
    faceId: "Working",
    rating: 4.5,
    reviewsCount: 31
  },
  {
    id: "redmi-note-13-pro-plus",
    name: "Redmi Note 13 Pro+ 5G",
    brand: "Redmi",
    condition: "Brand New",
    price: 380000,
    originalPrice: 420000,
    badge: "200MP Camera",
    availability: "In Stock",
    batteryHealth: "100%",
    batteryHealthValue: "100%",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop"
    ],
    storageOptions: ["256GB", "512GB"],
    colorOptions: [
      { name: "Aurora Purple", hex: "#C7BFE6" },
      { name: "Midnight Black", hex: "#1A1A1A" },
      { name: "Moonlight White", hex: "#ECECEC" }
    ],
    description: "Packed with flagship-level features. Sporting a breathtaking 200MP camera system, IP68 rated dust and water resistance, and an incredibly fast 120W HyperCharge that fills the battery to 100% in 19 minutes.",
    specs: {
      screen: "6.67-inch CrystalRes AMOLED (120Hz, 1800 nits Peak)",
      camera: "200MP Main OIS + 8MP Ultra-wide + 2MP Macro",
      chipset: "MediaTek Dimensity 7200-Ultra (4nm)",
      ram: "8GB / 12GB RAM",
      batterySize: "5000 mAh (120W HyperCharge Charger included)",
      os: "Xiaomi HyperOS (Android 14)",
      warranty: "1 Year Store Warranty",
      simType: "Dual physical slots (Dual Standby)"
    },
    networkCapability: "5G",
    network: "Dual SIM 5G",
    fingerprint: "Working",
    faceId: "Working",
    rating: 4.7,
    reviewsCount: 68
  },
  {
    id: "tecno-spark-20-pro",
    name: "Tecno Spark 20 Pro",
    brand: "Tecno",
    condition: "Brand New",
    price: 195000,
    badge: "Budget King",
    availability: "In Stock",
    batteryHealth: "100%",
    batteryHealthValue: "100%",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop"
    ],
    storageOptions: ["256GB"],
    colorOptions: [
      { name: "Sunset Gold", hex: "#E9CD96" },
      { name: "Frosty Ivory", hex: "#F3EFE9" },
      { name: "Temporal Black", hex: "#222324" }
    ],
    description: "Unbeatable budget speedster. Offering a gorgeous 120Hz punch-hole display, a clean 108MP main shooter, dual DTS stereo speakers, and an enormous 5000 mAh battery to keep you connected all day long.",
    specs: {
      screen: "6.78-inch IPS LCD, FHD+ (120Hz)",
      camera: "108MP Main + Auxiliary lens, 32MP Front Selfie with Dual Flash",
      chipset: "MediaTek Helio G99 Ultra (6nm)",
      ram: "8GB RAM (+8GB Extended)",
      batterySize: "5000 mAh (33W Fast Charge)",
      os: "Android 13, HiOS",
      warranty: "1 Year Carlcare Warranty",
      simType: "Dual Nano-SIM Slot"
    },
    networkCapability: "4G/LTE",
    network: "Dual Nano-SIM 4G",
    fingerprint: "Working",
    faceId: "Working",
    rating: 4.4,
    reviewsCount: 41
  },
  {
    id: "infinix-hot-40-pro",
    name: "Infinix Hot 40 Pro",
    brand: "Infinix",
    condition: "Premium UK Used",
    price: 145000,
    badge: "Best Under ₦150k",
    availability: "In Stock",
    batteryHealth: "93% (Excellent)",
    batteryHealthValue: "90%+",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop"
    ],
    storageOptions: ["128GB", "256GB"],
    colorOptions: [
      { name: "Palm Blue", hex: "#A3D4E6" },
      { name: "Horizon Gold", hex: "#EAD6B5" },
      { name: "Starlit Black", hex: "#1F1F21" }
    ],
    description: "Exceptional Grade A++ UK Used Infinix device. Thoroughly tested with zero technical faults. Provides lag-free performance, high physical battery retention, and beautiful styling.",
    specs: {
      screen: "6.78-inch IPS LCD, FHD+ (120Hz, Smart Link)",
      camera: "108MP Main + 2MP Macro + AI lens",
      chipset: "MediaTek Helio G99 (6nm)",
      ram: "8GB RAM",
      batterySize: "5000 mAh (Tested health: 93% verified)",
      os: "Android 13, XOS 13.5",
      warranty: "3-Month Store Warranty",
      simType: "Dual physical Nano SIM"
    },
    networkCapability: "4G/LTE",
    network: "Dual Nano-SIM 4G",
    fingerprint: "Working",
    faceId: "Working",
    rating: 4.3,
    reviewsCount: 19
  },
  {
    id: "redmi-13c",
    name: "Redmi 13C Dual SIM",
    brand: "Redmi",
    condition: "Brand New",
    price: 115000,
    badge: "Top Starter",
    availability: "In Stock",
    batteryHealth: "100%",
    batteryHealthValue: "100%",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop"
    ],
    storageOptions: ["128GB"],
    colorOptions: [
      { name: "Midnight Black", hex: "#1D1E1F" },
      { name: "Navy Blue", hex: "#29374B" },
      { name: "Clover Green", hex: "#5C6C5E" }
    ],
    description: "Reliable and pocket-friendly starter phone. With a smooth 90Hz display, clean triple camera setup, huge daily battery, and sleek modern design.",
    specs: {
      screen: "6.74-inch IPS LCD (90Hz, 450 nits)",
      camera: "50MP Main + 2MP Macro + Aux lens",
      chipset: "MediaTek Helio G85 (12nm)",
      ram: "6GB RAM (+6GB Turbo)",
      batterySize: "5000 mAh (18W charging support)",
      os: "MIUI 14 (Android 13)",
      warranty: "1 Year Store Warranty",
      simType: "Dual Nano-SIM + microSD slot"
    },
    networkCapability: "4G/LTE",
    network: "Dual Nano-SIM 4G",
    fingerprint: "Working",
    faceId: "Working",
    rating: 4.2,
    reviewsCount: 15
  },
  {
    id: "ipad-pro-11-m4",
    name: "Apple iPad Pro 11-inch (M4 Chip)",
    brand: "Apple",
    category: "iPad",
    condition: "Brand New",
    price: 1550000,
    originalPrice: 1650000,
    badge: "M4 Powerhouse",
    availability: "In Stock",
    batteryHealth: "100%",
    batteryHealthValue: "100%",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop"
    ],
    storageOptions: ["256GB", "512GB", "1TB"],
    colorOptions: [
      { name: "Space Black", hex: "#232426" },
      { name: "Silver", hex: "#E3E4E5" }
    ],
    description: "The thinnest Apple product ever, featuring the revolutionary Ultra Retina XDR Tandem OLED display, mind-blowing M4 performance, and support for Apple Pencil Pro.",
    specs: {
      screen: "11-inch Ultra Retina XDR Tandem OLED (120Hz ProMotion)",
      camera: "12MP Wide + LiDAR Scanner, 12MP Landscape Ultra Wide Front",
      chipset: "Apple M4 Chip (10-core GPU, Hardware Ray Tracing)",
      ram: "8GB / 16GB Unified Memory",
      batterySize: "31.29 watt-hour rechargeable lithium-polymer",
      os: "iPadOS 17, upgradable to iPadOS 18",
      warranty: "1 Year International Apple Warranty",
      simType: "Wi-Fi 6E (Optional 5G eSIM)"
    },
    networkCapability: "Wi-Fi 6E / 5G",
    network: "Wi-Fi Only & 5G Cellular",
    faceId: "Working",
    rating: 4.9,
    reviewsCount: 42
  },
  {
    id: "ipad-air-11-m2",
    name: "Apple iPad Air 11-inch (M2 Chip)",
    brand: "Apple",
    category: "iPad",
    condition: "Brand New",
    price: 980000,
    originalPrice: 1050000,
    badge: "M2 Fresh",
    availability: "In Stock",
    batteryHealth: "100%",
    batteryHealthValue: "100%",
    image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?q=80&w=800&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1561154464-82e9adf32764?q=80&w=800&auto=format&fit=crop"
    ],
    storageOptions: ["128GB", "256GB", "512GB"],
    colorOptions: [
      { name: "Space Gray", hex: "#4B4E54" },
      { name: "Starlight", hex: "#EBE6DD" },
      { name: "Blue", hex: "#C5D3E8" },
      { name: "Purple", hex: "#D8D3E5" }
    ],
    description: "Supercharged by the Apple M2 chip with phenomenal speed, a vivid Liquid Retina display, Touch ID power button, and compatibility with Apple Pencil Pro.",
    specs: {
      screen: "11-inch Liquid Retina IPS Display (P3 wide color, True Tone)",
      camera: "12MP Wide back camera, 12MP Center Stage front camera",
      chipset: "Apple M2 Chip",
      ram: "8GB RAM",
      batterySize: "28.93 watt-hour lithium-polymer",
      os: "iPadOS 17.5",
      warranty: "1 Year Apple Warranty",
      simType: "Wi-Fi 6E + eSIM 5G"
    },
    networkCapability: "5G",
    network: "Wi-Fi + Cellular (eSIM)",
    fingerprint: "Working",
    rating: 4.8,
    reviewsCount: 38
  },
  {
    id: "ipad-10th-gen",
    name: "Apple iPad 10.9-inch (10th Gen)",
    brand: "Apple",
    category: "iPad",
    condition: "Brand New",
    price: 590000,
    originalPrice: 640000,
    badge: "Top Seller",
    availability: "In Stock",
    batteryHealth: "100%",
    batteryHealthValue: "100%",
    image: "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?q=80&w=800&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?q=80&w=800&auto=format&fit=crop"
    ],
    storageOptions: ["64GB", "256GB"],
    colorOptions: [
      { name: "Silver", hex: "#E3E4E5" },
      { name: "Blue", hex: "#6F94B8" },
      { name: "Pink", hex: "#E8899E" },
      { name: "Yellow", hex: "#F3DC75" }
    ],
    description: "Colourfully reimagined with an edge-to-edge 10.9-inch Liquid Retina display, A14 Bionic chip, landscape 12MP front camera with Center Stage, and USB-C connectivity.",
    specs: {
      screen: "10.9-inch Liquid Retina display (sRGB, True Tone)",
      camera: "12MP Wide back, 12MP Landscape Ultra Wide front",
      chipset: "Apple A14 Bionic",
      ram: "4GB RAM",
      batterySize: "28.6 watt-hour lithium-polymer",
      os: "iPadOS 16, upgradable to iPadOS 18",
      warranty: "1 Year Official Apple Warranty",
      simType: "Wi-Fi Model"
    },
    networkCapability: "Wi-Fi 6",
    network: "Wi-Fi Only",
    fingerprint: "Working",
    rating: 4.7,
    reviewsCount: 56
  },
  {
    id: "ipad-pro-12-9-m2-used",
    name: "Apple iPad Pro 12.9-inch (M2 Chip)",
    brand: "Apple",
    category: "iPad",
    condition: "Premium UK Used",
    price: 1180000,
    originalPrice: 1350000,
    badge: "Grade A++ Liquid XDR",
    availability: "In Stock",
    batteryHealth: "94% (Certified)",
    batteryHealthValue: "90%+",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop"
    ],
    storageOptions: ["128GB", "256GB", "512GB"],
    colorOptions: [
      { name: "Space Gray", hex: "#4B4E54" },
      { name: "Silver", hex: "#E3E4E5" }
    ],
    description: "Grade A++ UK Used 12.9-inch iPad Pro with mini-LED Liquid Retina XDR screen. Tested, verified zero screen bleed or scratches, 94% authentic battery health.",
    specs: {
      screen: "12.9-inch Liquid Retina XDR mini-LED (1000 nits, 1600 nits peak HDR)",
      camera: "12MP Wide + 10MP Ultra Wide + LiDAR",
      chipset: "Apple M2 Chip",
      ram: "8GB RAM",
      batterySize: "40.88 watt-hour battery (94% healthy)",
      os: "iPadOS 16, upgradable to iPadOS 18",
      warranty: "6-Month MILITO Store Warranty",
      simType: "Wi-Fi + Cellular (Unlocked)"
    },
    networkCapability: "5G",
    network: "Factory Unlocked 5G Cellular",
    faceId: "Working",
    rating: 4.8,
    reviewsCount: 29
  },
  {
    id: "apple-watch-ultra-2",
    name: "Apple Watch Ultra 2 (49mm Titanium)",
    brand: "Apple",
    category: "Wrist",
    condition: "Brand New",
    price: 1250000,
    originalPrice: 1350000,
    badge: "Rugged Flagship",
    availability: "In Stock",
    batteryHealth: "100%",
    batteryHealthValue: "100%",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800&auto=format&fit=crop"
    ],
    storageOptions: ["64GB"],
    colorOptions: [
      { name: "Natural Titanium (Orange Ocean Band)", hex: "#C8A27A" },
      { name: "Titanium (Midnight Ocean Band)", hex: "#22252A" }
    ],
    description: "The most capable and rugged Apple Watch. Built with corrosion-resistant aerospace titanium, brightest 3000-nit display, precision dual-frequency GPS, and up to 36 hours of battery life.",
    specs: {
      screen: "49mm Always-On Retina LTPO OLED (3000 nits)",
      sensors: "ECG, Blood Oxygen, Temperature, Depth gauge to 40m, Compass",
      chipset: "Apple S9 SiP with 4-core Neural Engine",
      batterySize: "542 mAh (Up to 36 hrs normal / 72 hrs Low Power)",
      os: "watchOS 10, upgradable to watchOS 11",
      warranty: "1 Year Official Apple Warranty"
    },
    networkCapability: "GPS + Cellular",
    network: "GPS + Cellular",
    rating: 4.9,
    reviewsCount: 31
  },
  {
    id: "apple-watch-series-9",
    name: "Apple Watch Series 9 (45mm GPS)",
    brand: "Apple",
    category: "Wrist",
    condition: "Brand New",
    price: 640000,
    originalPrice: 690000,
    badge: "Double Tap Gesture",
    availability: "In Stock",
    batteryHealth: "100%",
    batteryHealthValue: "100%",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop"
    ],
    storageOptions: ["64GB"],
    colorOptions: [
      { name: "Midnight", hex: "#1C1D21" },
      { name: "Starlight", hex: "#E9E3D8" },
      { name: "Silver", hex: "#E3E4E5" },
      { name: "Product RED", hex: "#E23838" }
    ],
    description: "Smarter, brighter, and mightier. Powered by the S9 SiP with Double Tap gesture control, on-device Siri, and a 2000-nit edge-to-edge Retina display.",
    specs: {
      screen: "45mm Always-On Retina OLED (2000 nits)",
      sensors: "Electrical heart sensor, Optical heart sensor, Temperature sensing",
      chipset: "Apple S9 SiP",
      batterySize: "Up to 18 hours (36 hours in Low Power Mode)",
      os: "watchOS 10, upgradable to watchOS 11",
      warranty: "1 Year Apple Warranty"
    },
    networkCapability: "GPS",
    network: "GPS Only",
    rating: 4.8,
    reviewsCount: 52
  },
  {
    id: "apple-watch-series-8-used",
    name: "Apple Watch Series 8 (45mm)",
    brand: "Apple",
    category: "Wrist",
    condition: "Premium UK Used",
    price: 395000,
    originalPrice: 460000,
    badge: "Grade A Pristine",
    availability: "In Stock",
    batteryHealth: "93% (Tested)",
    batteryHealthValue: "90%+",
    image: "https://images.unsplash.com/photo-1510017803434-a899398421b3?q=80&w=800&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1510017803434-a899398421b3?q=80&w=800&auto=format&fit=crop"
    ],
    storageOptions: ["32GB"],
    colorOptions: [
      { name: "Midnight Aluminum", hex: "#1C1D21" },
      { name: "Starlight", hex: "#E9E3D8" }
    ],
    description: "Grade A++ UK Used Apple Watch Series 8. Pristine glass, no scuffs on sensor crystal, fully functional ECG and temperature monitoring with original magnetic fast charger.",
    specs: {
      screen: "45mm Always-On Retina OLED (1000 nits)",
      sensors: "ECG app, High/low heart rate notifications, Blood Oxygen, Crash Detection",
      chipset: "Apple S8 SiP 64-bit dual-core",
      batterySize: "Tested 93% battery capacity",
      os: "watchOS 9, upgradable to watchOS 11",
      warranty: "3-Month MILITO Store Warranty"
    },
    networkCapability: "GPS",
    network: "GPS Only",
    rating: 4.7,
    reviewsCount: 24
  },
  {
    id: "galaxy-watch-6-classic",
    name: "Samsung Galaxy Watch 6 Classic (47mm)",
    brand: "Samsung",
    category: "Wrist",
    condition: "Brand New",
    price: 480000,
    originalPrice: 530000,
    badge: "Rotating Bezel",
    availability: "In Stock",
    batteryHealth: "100%",
    batteryHealthValue: "100%",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800&auto=format&fit=crop"
    ],
    storageOptions: ["16GB"],
    colorOptions: [
      { name: "Black", hex: "#1F2022" },
      { name: "Silver", hex: "#E3E4E5" }
    ],
    description: "The iconic rotating bezel returns. Featuring a timeless stainless steel body, Sapphire Crystal display, advanced sleep coaching, and Samsung BioActive health sensor.",
    specs: {
      screen: "1.5-inch Super AMOLED (480x480, Sapphire Crystal)",
      sensors: "Samsung BioActive Sensor (Optical Heart + Electrical Heart + Bioelectrical Impedance)",
      chipset: "Exynos W930 dual-core 1.4GHz",
      ram: "2GB RAM + 16GB Storage",
      batterySize: "425 mAh (WPC-based wireless fast charging)",
      os: "Wear OS Powered by Samsung (One UI 5 Watch)",
      warranty: "1 Year Official Samsung Warranty"
    },
    networkCapability: "Bluetooth / Wi-Fi",
    network: "Bluetooth / Wi-Fi",
    rating: 4.7,
    reviewsCount: 29
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "rev-1",
    name: "Afeez Babatunde",
    location: "Ikeja, Lagos State",
    rating: 5,
    text: "I was highly skeptical about buying a UK used device online in Nigeria, but MILITO's transparent ordering and clear device specifications gave me full confidence. I ordered my iPhone 14 Pro, verified the Battery Health was 94% exactly as listed, and received it promptly in Ikeja. Absolute professionalism!",
    verifiedPurchase: true,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    deviceBought: "iPhone 14 Pro (UK Used)"
  },
  {
    id: "rev-2",
    name: "Chiamaka Obi",
    location: "Enugu, Enugu State",
    rating: 5,
    text: "Used their trade-in service. Form filled online, sent my iPhone 11 Pro Max. They inspected, evaluated a fair price, and I paid the top-up balance to upgrade to iPhone 15 Pro Max. Delivered securely in 48 hours to Enugu. Unbeatable service!",
    verifiedPurchase: true,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
    deviceBought: "Upgraded to iPhone 15 Pro Max"
  },
  {
    id: "rev-3",
    name: "Dr. Kunle Adeleke",
    location: "Wuse 2, Abuja",
    rating: 5,
    text: "I imported my 2021 Toyota RAV4 through MILITO vehicle importation services. The tracking process was outstanding, clearing with Nigeria Customs was completely transparent, and they kept strictly to the timeline. Excellent customer desk support.",
    verifiedPurchase: true,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
    deviceBought: "Vehicle Import Sourcing (Abuja)"
  }
];

export const FAQS: FAQ[] = [
  {
    id: "faq-1",
    question: "How does the ordering and verification process work?",
    answer: "When you discover a product you want, click 'Order Now'. Your order details are pre-filled so you can easily confirm device availability, physical condition, warranty, and delivery address directly with MILITO and the seller before completing your purchase.",
    category: "Ordering"
  },
  {
    id: "faq-2",
    question: "Do you sell genuine Brand New phones with official warranty?",
    answer: "Yes, all devices tagged 'Brand New' are 100% factory sealed and come with their standard factory manufacturer's warranty (1 year for globally unlocked Apple, Samsung, or Google products).",
    category: "Phones"
  },
  {
    id: "faq-3",
    question: "What guidelines ensure your UK Used phones are reliable?",
    answer: "Every UK Used phone undergoes our strict 'MILITO 35-Point Inspection Protocol'. We test: Touch response, Camera sensors, Face ID/Fingerprint, True Tone, Battery chemistry health (never below 85%), Speaker grids, and cellular band unlock state. Only Grade-A flawless-looking units reach our website.",
    category: "Phones"
  },
  {
    id: "faq-4",
    question: "How does the Trade-In Valuation and swap process work?",
    answer: "Submit your current phone's details in our dynamic Trade-In Estimator below. Once you get the virtual quote, click 'Submit'. We will verify, schedule a pick-up (or walk-in to our Ikeja/Abuja centers), perform a visual assessment, and complete the swap immediately with your desired gadget.",
    category: "Trade-In"
  },
  {
    id: "faq-5",
    question: "Do you offer international vehicle importation to Nigeria?",
    answer: "Yes, we handle vehicle sourcing, bidding on major auction websites (Copart, IAAI), secure shipment containers to Lagos (Tin Can / Apapa Port), and complete custom documentation and clearing under full transparency.",
    category: "Imports"
  }
];

export const NIGERIAN_STATES = [
  { name: "Lagos", code: "LOS", fee: 5000, eta: "24 Hours (Same Day/Next Day)" },
  { name: "Abuja (FCT)", code: "ABV", fee: 8000, eta: "24 - 48 Hours" },
  { name: "Oyo (Ibadan)", code: "IBY", fee: 6000, eta: "24 - 48 Hours" },
  { name: "Rivers (Port Harcourt)", code: "PHC", fee: 9000, eta: "2 - 3 Days" },
  { name: "Enugu", code: "ENU", fee: 9000, eta: "2 - 3 Days" },
  { name: "Delta (Asaba/Warri)", code: "DEL", fee: 8500, eta: "2 - 3 Days" },
  { name: "Anambra (Onitsha)", code: "ANA", fee: 8500, eta: "2 - 3 Days" },
  { name: "Kaduna", code: "KAD", fee: 9500, eta: "3 - 4 Days" },
  { name: "Kano", code: "KAN", fee: 9800, eta: "3 - 4 Days" },
  { name: "Edo (Benin City)", code: "EDO", fee: 8000, eta: "48 Hours" }
];

export interface TradeInModelEntry {
  brand: string;
  baseValue: number;
  versions: string[];
}

export const TRADE_IN_BRANDS: Array<{
  id: string;
  name: string;
  logo: string;
}> = [
  { id: "Apple", name: "Apple", logo: "🍎" },
  { id: "Samsung", name: "Samsung", logo: "📱" },
  { id: "Google", name: "Google", logo: "🌐" },
  { id: "Tecno", name: "Tecno", logo: "⚡" },
  { id: "Infinix", name: "Infinix", logo: "🚀" },
  { id: "Xiaomi", name: "Xiaomi", logo: "🔥" },
  { id: "Oppo", name: "Oppo", logo: "✨" },
  { id: "OnePlus", name: "OnePlus", logo: "🔴" },
  { id: "Huawei", name: "Huawei", logo: "🌸" },
  { id: "Nokia", name: "Nokia", logo: "🔷" },
  { id: "Itel", name: "Itel", logo: "🟡" },
  { id: "Vivo", name: "Vivo", logo: "💫" },
  { id: "Realme", name: "Realme", logo: "⭐" },
  { id: "Motorola", name: "Motorola", logo: "Ⓜ️" },
  { id: "Sony", name: "Sony", logo: "📷" },
  { id: "Honor", name: "Honor", logo: "💎" }
];

export const TRADE_IN_MODELS_DB: Record<string, TradeInModelEntry> = {
  // Apple (Older through Modern Range)
  "iPhone 17 Pro Max": { brand: "Apple", baseValue: 2100000, versions: ["256GB", "512GB", "1TB"] },
  "iPhone 17 Pro": { brand: "Apple", baseValue: 1850000, versions: ["256GB", "512GB", "1TB"] },
  "iPhone 17 Air": { brand: "Apple", baseValue: 1550000, versions: ["128GB", "256GB", "512GB"] },
  "iPhone 17": { brand: "Apple", baseValue: 1400000, versions: ["128GB", "256GB", "512GB"] },
  "iPhone 16 Pro Max": { brand: "Apple", baseValue: 1650000, versions: ["256GB", "512GB", "1TB"] },
  "iPhone 16 Pro": { brand: "Apple", baseValue: 1400000, versions: ["128GB", "256GB", "512GB", "1TB"] },
  "iPhone 16 Plus": { brand: "Apple", baseValue: 1050000, versions: ["128GB", "256GB", "512GB"] },
  "iPhone 16": { brand: "Apple", baseValue: 920000, versions: ["128GB", "256GB", "512GB"] },
  "iPhone 15 Pro Max": { brand: "Apple", baseValue: 1250000, versions: ["256GB", "512GB", "1TB"] },
  "iPhone 15 Pro": { brand: "Apple", baseValue: 1050000, versions: ["128GB", "256GB", "512GB", "1TB"] },
  "iPhone 15 Plus": { brand: "Apple", baseValue: 780000, versions: ["128GB", "256GB", "512GB"] },
  "iPhone 15": { brand: "Apple", baseValue: 690000, versions: ["128GB", "256GB", "512GB"] },
  "iPhone 14 Pro Max": { brand: "Apple", baseValue: 750000, versions: ["128GB", "256GB", "512GB", "1TB"] },
  "iPhone 14 Pro": { brand: "Apple", baseValue: 660000, versions: ["128GB", "256GB", "512GB", "1TB"] },
  "iPhone 14 Plus": { brand: "Apple", baseValue: 560000, versions: ["128GB", "256GB", "512GB"] },
  "iPhone 14": { brand: "Apple", baseValue: 490000, versions: ["128GB", "256GB", "512GB"] },
  "iPhone 13 Pro Max": { brand: "Apple", baseValue: 580000, versions: ["128GB", "256GB", "512GB", "1TB"] },
  "iPhone 13 Pro": { brand: "Apple", baseValue: 510000, versions: ["128GB", "256GB", "512GB", "1TB"] },
  "iPhone 13": { brand: "Apple", baseValue: 410000, versions: ["128GB", "256GB", "512GB"] },
  "iPhone 13 mini": { brand: "Apple", baseValue: 330000, versions: ["128GB", "256GB", "512GB"] },
  "iPhone 12 Pro Max": { brand: "Apple", baseValue: 460000, versions: ["128GB", "256GB", "512GB"] },
  "iPhone 12 Pro": { brand: "Apple", baseValue: 390000, versions: ["128GB", "256GB", "512GB"] },
  "iPhone 12": { brand: "Apple", baseValue: 320000, versions: ["64GB", "128GB", "256GB"] },
  "iPhone 12 mini": { brand: "Apple", baseValue: 240000, versions: ["64GB", "128GB", "256GB"] },
  "iPhone 11 Pro Max": { brand: "Apple", baseValue: 320000, versions: ["64GB", "256GB", "512GB"] },
  "iPhone 11 Pro": { brand: "Apple", baseValue: 270000, versions: ["64GB", "256GB", "512GB"] },
  "iPhone 11": { brand: "Apple", baseValue: 220000, versions: ["64GB", "128GB", "256GB"] },
  "iPhone XS Max": { brand: "Apple", baseValue: 190000, versions: ["64GB", "256GB", "512GB"] },
  "iPhone XS": { brand: "Apple", baseValue: 155000, versions: ["64GB", "256GB", "512GB"] },
  "iPhone XR": { brand: "Apple", baseValue: 145000, versions: ["64GB", "128GB", "256GB"] },
  "iPhone X": { brand: "Apple", baseValue: 125000, versions: ["64GB", "256GB"] },
  "iPhone 8 Plus": { brand: "Apple", baseValue: 105000, versions: ["64GB", "128GB", "256GB"] },
  "iPhone 8": { brand: "Apple", baseValue: 80000, versions: ["64GB", "128GB", "256GB"] },
  "iPhone 7 Plus": { brand: "Apple", baseValue: 70000, versions: ["32GB", "128GB", "256GB"] },
  "iPhone 7": { brand: "Apple", baseValue: 55000, versions: ["32GB", "128GB", "256GB"] },
  "iPhone 6s Plus": { brand: "Apple", baseValue: 48000, versions: ["16GB", "32GB", "64GB", "128GB"] },
  "iPhone 6s": { brand: "Apple", baseValue: 38000, versions: ["16GB", "32GB", "64GB", "128GB"] },
  "iPhone 6 Plus": { brand: "Apple", baseValue: 35000, versions: ["16GB", "64GB", "128GB"] },
  "iPhone 6": { brand: "Apple", baseValue: 28000, versions: ["16GB", "32GB", "64GB", "128GB"] },

  // Samsung
  "Galaxy S24 Ultra": { brand: "Samsung", baseValue: 1200000, versions: ["256GB", "512GB", "1TB"] },
  "Galaxy S24 Plus": { brand: "Samsung", baseValue: 850000, versions: ["256GB", "512GB"] },
  "Galaxy S24": { brand: "Samsung", baseValue: 680000, versions: ["128GB", "256GB"] },
  "Galaxy S23 Ultra": { brand: "Samsung", baseValue: 800000, versions: ["256GB", "512GB", "1TB"] },
  "Galaxy S23 Plus": { brand: "Samsung", baseValue: 610000, versions: ["128GB", "256GB"] },
  "Galaxy S23": { brand: "Samsung", baseValue: 480000, versions: ["128GB", "256GB"] },
  "Galaxy S22 Ultra": { brand: "Samsung", baseValue: 550000, versions: ["128GB", "256GB", "512GB"] },
  "Galaxy S22 Plus": { brand: "Samsung", baseValue: 420000, versions: ["128GB", "256GB"] },
  "Galaxy S22": { brand: "Samsung", baseValue: 350000, versions: ["128GB", "256GB"] },
  "Galaxy S21 Ultra": { brand: "Samsung", baseValue: 380000, versions: ["128GB", "256GB", "512GB"] },
  "Galaxy S21 Plus": { brand: "Samsung", baseValue: 290000, versions: ["128GB", "256GB"] },
  "Galaxy S21": { brand: "Samsung", baseValue: 230000, versions: ["128GB", "256GB"] },
  "Galaxy S20 Ultra": { brand: "Samsung", baseValue: 240000, versions: ["128GB", "256GB", "512GB"] },
  "Galaxy S20 Plus": { brand: "Samsung", baseValue: 190000, versions: ["128GB", "256GB"] },
  "Galaxy S20": { brand: "Samsung", baseValue: 160000, versions: ["128GB"] },
  "Galaxy S10 Plus": { brand: "Samsung", baseValue: 130000, versions: ["128GB", "512GB", "1TB"] },
  "Galaxy S10": { brand: "Samsung", baseValue: 110000, versions: ["128GB", "512GB"] },
  "Galaxy Note 20 Ultra": { brand: "Samsung", baseValue: 360000, versions: ["128GB", "256GB", "512GB"] },
  "Galaxy Note 20": { brand: "Samsung", baseValue: 250000, versions: ["128GB", "256GB"] },
  "Galaxy Note 10 Plus": { brand: "Samsung", baseValue: 210000, versions: ["256GB", "512GB"] },
  "Galaxy Z Fold 6": { brand: "Samsung", baseValue: 1450000, versions: ["256GB", "512GB", "1TB"] },
  "Galaxy Z Fold 5": { brand: "Samsung", baseValue: 950000, versions: ["256GB", "512GB", "1TB"] },
  "Galaxy Z Fold 4": { brand: "Samsung", baseValue: 650000, versions: ["256GB", "512GB"] },
  "Galaxy Z Flip 6": { brand: "Samsung", baseValue: 750000, versions: ["256GB", "512GB"] },
  "Galaxy Z Flip 5": { brand: "Samsung", baseValue: 480000, versions: ["256GB", "512GB"] },
  "Galaxy Z Flip 4": { brand: "Samsung", baseValue: 320000, versions: ["128GB", "256GB"] },
  "Galaxy A55 5G": { brand: "Samsung", baseValue: 280000, versions: ["128GB", "256GB"] },
  "Galaxy A54 5G": { brand: "Samsung", baseValue: 210000, versions: ["128GB", "256GB"] },
  "Galaxy A35 5G": { brand: "Samsung", baseValue: 190000, versions: ["128GB", "256GB"] },
  "Galaxy A25 5G": { brand: "Samsung", baseValue: 150000, versions: ["128GB", "256GB"] },
  "Galaxy A15": { brand: "Samsung", baseValue: 110000, versions: ["64GB", "128GB", "256GB"] },
  "Galaxy A14": { brand: "Samsung", baseValue: 85000, versions: ["64GB", "128GB"] },
  "Galaxy A05s": { brand: "Samsung", baseValue: 75000, versions: ["64GB", "128GB"] },

  // Google
  "Pixel 9 Pro XL": { brand: "Google", baseValue: 980000, versions: ["128GB", "256GB", "512GB"] },
  "Pixel 9 Pro": { brand: "Google", baseValue: 850000, versions: ["128GB", "256GB", "512GB"] },
  "Pixel 9": { brand: "Google", baseValue: 620000, versions: ["128GB", "256GB"] },
  "Pixel 8 Pro": { brand: "Google", baseValue: 500000, versions: ["128GB", "256GB", "512GB", "1TB"] },
  "Pixel 8": { brand: "Google", baseValue: 390000, versions: ["128GB", "256GB"] },
  "Pixel 8a": { brand: "Google", baseValue: 340000, versions: ["128GB", "256GB"] },
  "Pixel 7 Pro": { brand: "Google", baseValue: 350000, versions: ["128GB", "256GB", "512GB"] },
  "Pixel 7": { brand: "Google", baseValue: 270000, versions: ["128GB", "256GB"] },
  "Pixel 7a": { brand: "Google", baseValue: 230000, versions: ["128GB"] },
  "Pixel 6 Pro": { brand: "Google", baseValue: 220000, versions: ["128GB", "256GB", "512GB"] },
  "Pixel 6": { brand: "Google", baseValue: 175000, versions: ["128GB", "256GB"] },
  "Pixel 6a": { brand: "Google", baseValue: 145000, versions: ["128GB"] },
  "Pixel 5": { brand: "Google", baseValue: 110000, versions: ["128GB"] },

  // Tecno
  "Tecno Phantom V Fold 2": { brand: "Tecno", baseValue: 720000, versions: ["512GB"] },
  "Tecno Phantom V Fold": { brand: "Tecno", baseValue: 520000, versions: ["256GB", "512GB"] },
  "Tecno Phantom V Flip 2": { brand: "Tecno", baseValue: 460000, versions: ["256GB"] },
  "Tecno Phantom V Flip": { brand: "Tecno", baseValue: 360000, versions: ["256GB"] },
  "Tecno Camon 30 Premier": { brand: "Tecno", baseValue: 310000, versions: ["512GB"] },
  "Tecno Camon 30 Pro": { brand: "Tecno", baseValue: 240000, versions: ["256GB"] },
  "Tecno Camon 30": { brand: "Tecno", baseValue: 165000, versions: ["128GB", "256GB"] },
  "Tecno Camon 20 Pro 5G": { brand: "Tecno", baseValue: 175000, versions: ["256GB"] },
  "Tecno Camon 20 Pro": { brand: "Tecno", baseValue: 135000, versions: ["256GB"] },
  "Tecno Camon 20": { brand: "Tecno", baseValue: 110000, versions: ["128GB", "256GB"] },
  "Tecno Pova 6 Pro 5G": { brand: "Tecno", baseValue: 190000, versions: ["256GB"] },
  "Tecno Spark 20 Pro+": { brand: "Tecno", baseValue: 150000, versions: ["256GB"] },
  "Tecno Spark 20 Pro": { brand: "Tecno", baseValue: 120000, versions: ["256GB"] },
  "Tecno Spark 20": { brand: "Tecno", baseValue: 95000, versions: ["128GB", "256GB"] },
  "Tecno Spark 10 Pro": { brand: "Tecno", baseValue: 80000, versions: ["128GB", "256GB"] },
  "Tecno Pop 8": { brand: "Tecno", baseValue: 58000, versions: ["64GB", "128GB"] },
  "Tecno Pop 7": { brand: "Tecno", baseValue: 45000, versions: ["64GB"] },

  // Infinix
  "Infinix Zero 40 5G": { brand: "Infinix", baseValue: 320000, versions: ["256GB", "512GB"] },
  "Infinix Zero 30 5G": { brand: "Infinix", baseValue: 230000, versions: ["256GB"] },
  "Infinix Zero Ultra": { brand: "Infinix", baseValue: 210000, versions: ["256GB"] },
  "Infinix GT 20 Pro": { brand: "Infinix", baseValue: 240000, versions: ["256GB"] },
  "Infinix GT 10 Pro": { brand: "Infinix", baseValue: 180000, versions: ["256GB"] },
  "Infinix Note 40 Pro+ 5G": { brand: "Infinix", baseValue: 230000, versions: ["256GB"] },
  "Infinix Note 40 Pro": { brand: "Infinix", baseValue: 190000, versions: ["256GB"] },
  "Infinix Note 40": { brand: "Infinix", baseValue: 150000, versions: ["256GB"] },
  "Infinix Note 30 Pro": { brand: "Infinix", baseValue: 135000, versions: ["256GB"] },
  "Infinix Hot 40 Pro": { brand: "Infinix", baseValue: 100000, versions: ["128GB", "256GB"] },
  "Infinix Hot 40": { brand: "Infinix", baseValue: 85000, versions: ["128GB", "256GB"] },
  "Infinix Hot 30": { brand: "Infinix", baseValue: 70000, versions: ["128GB", "256GB"] },
  "Infinix Smart 8": { brand: "Infinix", baseValue: 55000, versions: ["64GB", "128GB"] },
  "Infinix Smart 7": { brand: "Infinix", baseValue: 42000, versions: ["64GB"] },

  // Xiaomi / Redmi / POCO
  "Xiaomi 14 Ultra": { brand: "Xiaomi", baseValue: 920000, versions: ["512GB", "1TB"] },
  "Xiaomi 14 Pro": { brand: "Xiaomi", baseValue: 680000, versions: ["256GB", "512GB", "1TB"] },
  "Xiaomi 14": { brand: "Xiaomi", baseValue: 540000, versions: ["256GB", "512GB"] },
  "Xiaomi 13 Ultra": { brand: "Xiaomi", baseValue: 620000, versions: ["256GB", "512GB", "1TB"] },
  "Xiaomi 13 Pro": { brand: "Xiaomi", baseValue: 480000, versions: ["256GB", "512GB"] },
  "Xiaomi 13": { brand: "Xiaomi", baseValue: 390000, versions: ["128GB", "256GB"] },
  "Redmi Note 13 Pro+ 5G": { brand: "Xiaomi", baseValue: 260000, versions: ["256GB", "512GB"] },
  "Redmi Note 13 Pro": { brand: "Xiaomi", baseValue: 200000, versions: ["256GB", "512GB"] },
  "Redmi Note 13": { brand: "Xiaomi", baseValue: 140000, versions: ["128GB", "256GB"] },
  "Redmi Note 12 Pro+": { brand: "Xiaomi", baseValue: 160000, versions: ["256GB"] },
  "Redmi Note 12 Pro": { brand: "Xiaomi", baseValue: 130000, versions: ["128GB", "256GB"] },
  "Redmi 13C": { brand: "Xiaomi", baseValue: 75000, versions: ["128GB", "256GB"] },
  "Redmi 12": { brand: "Xiaomi", baseValue: 80000, versions: ["128GB", "256GB"] },
  "POCO X6 Pro": { brand: "Xiaomi", baseValue: 250000, versions: ["256GB", "512GB"] },
  "POCO F6 Pro": { brand: "Xiaomi", baseValue: 380000, versions: ["256GB", "512GB", "1TB"] },
  "POCO F6": { brand: "Xiaomi", baseValue: 310000, versions: ["256GB", "512GB"] },

  // Oppo
  "Oppo Find X7 Ultra": { brand: "Oppo", baseValue: 820000, versions: ["256GB", "512GB"] },
  "Oppo Find N3": { brand: "Oppo", baseValue: 900000, versions: ["512GB", "1TB"] },
  "Oppo Find N3 Flip": { brand: "Oppo", baseValue: 480000, versions: ["256GB"] },
  "Oppo Reno 12 Pro": { brand: "Oppo", baseValue: 340000, versions: ["256GB", "512GB"] },
  "Oppo Reno 11 Pro": { brand: "Oppo", baseValue: 260000, versions: ["256GB", "512GB"] },
  "Oppo Reno 10": { brand: "Oppo", baseValue: 190000, versions: ["128GB", "256GB"] },
  "Oppo A78": { brand: "Oppo", baseValue: 120000, versions: ["128GB", "256GB"] },
  "Oppo A58": { brand: "Oppo", baseValue: 95000, versions: ["128GB"] },

  // OnePlus
  "OnePlus 12": { brand: "OnePlus", baseValue: 680000, versions: ["256GB", "512GB"] },
  "OnePlus 12R": { brand: "OnePlus", baseValue: 420000, versions: ["128GB", "256GB"] },
  "OnePlus Open": { brand: "OnePlus", baseValue: 920000, versions: ["512GB"] },
  "OnePlus 11": { brand: "OnePlus", baseValue: 440000, versions: ["128GB", "256GB"] },
  "OnePlus 10 Pro": { brand: "OnePlus", baseValue: 310000, versions: ["128GB", "256GB"] },
  "OnePlus 9 Pro": { brand: "OnePlus", baseValue: 220000, versions: ["128GB", "256GB"] },
  "OnePlus Nord 4": { brand: "OnePlus", baseValue: 300000, versions: ["256GB", "512GB"] },
  "OnePlus Nord CE 4": { brand: "OnePlus", baseValue: 200000, versions: ["128GB", "256GB"] },

  // Huawei
  "Huawei Pura 70 Ultra": { brand: "Huawei", baseValue: 920000, versions: ["512GB", "1TB"] },
  "Huawei Pura 70 Pro": { brand: "Huawei", baseValue: 710000, versions: ["256GB", "512GB", "1TB"] },
  "Huawei Mate 60 Pro": { brand: "Huawei", baseValue: 690000, versions: ["256GB", "512GB", "1TB"] },
  "Huawei P60 Pro": { brand: "Huawei", baseValue: 460000, versions: ["256GB", "512GB"] },
  "Huawei Nova 12": { brand: "Huawei", baseValue: 220000, versions: ["256GB", "512GB"] },

  // Vivo
  "Vivo X100 Pro": { brand: "Vivo", baseValue: 690000, versions: ["256GB", "512GB", "1TB"] },
  "Vivo X90 Pro": { brand: "Vivo", baseValue: 450000, versions: ["256GB", "512GB"] },
  "Vivo V30 Pro": { brand: "Vivo", baseValue: 310000, versions: ["256GB", "512GB"] },
  "Vivo V29": { brand: "Vivo", baseValue: 210000, versions: ["128GB", "256GB"] },
  "Vivo Y27": { brand: "Vivo", baseValue: 105000, versions: ["128GB"] },
  "Vivo Y17s": { brand: "Vivo", baseValue: 85000, versions: ["64GB", "128GB"] },

  // Realme
  "Realme GT 6": { brand: "Realme", baseValue: 390000, versions: ["256GB", "512GB"] },
  "Realme 12 Pro+ 5G": { brand: "Realme", baseValue: 260000, versions: ["256GB", "512GB"] },
  "Realme 11 Pro+ 5G": { brand: "Realme", baseValue: 195000, versions: ["256GB", "512GB"] },
  "Realme C67": { brand: "Realme", baseValue: 95000, versions: ["128GB", "256GB"] },
  "Realme C55": { brand: "Realme", baseValue: 80000, versions: ["128GB", "256GB"] },

  // Honor
  "Honor Magic 6 Pro": { brand: "Honor", baseValue: 740000, versions: ["512GB", "1TB"] },
  "Honor 200 Pro": { brand: "Honor", baseValue: 410000, versions: ["256GB", "512GB"] },
  "Honor 90": { brand: "Honor", baseValue: 230000, versions: ["256GB", "512GB"] },
  "Honor X9b": { brand: "Honor", baseValue: 185000, versions: ["256GB"] },

  // Itel
  "Itel S23+": { brand: "Itel", baseValue: 95000, versions: ["128GB", "256GB"] },
  "Itel S23": { brand: "Itel", baseValue: 65000, versions: ["128GB", "256GB"] },
  "Itel A70": { brand: "Itel", baseValue: 55000, versions: ["64GB", "128GB", "256GB"] },
  "Itel P55+": { brand: "Itel", baseValue: 78000, versions: ["128GB", "256GB"] },
  "Itel P55": { brand: "Itel", baseValue: 65000, versions: ["128GB"] },

  // Sony
  "Sony Xperia 1 VI": { brand: "Sony", baseValue: 920000, versions: ["256GB", "512GB"] },
  "Sony Xperia 1 V": { brand: "Sony", baseValue: 650000, versions: ["256GB", "512GB"] },
  "Sony Xperia 5 V": { brand: "Sony", baseValue: 490000, versions: ["128GB", "256GB"] },

  // Motorola
  "Motorola Edge 50 Ultra": { brand: "Motorola", baseValue: 710000, versions: ["512GB", "1TB"] },
  "Motorola Razr 50 Ultra": { brand: "Motorola", baseValue: 820000, versions: ["512GB"] },
  "Motorola Razr 40 Ultra": { brand: "Motorola", baseValue: 470000, versions: ["256GB"] },
  "Motorola Moto G84": { brand: "Motorola", baseValue: 140000, versions: ["256GB"] },

  // Nokia
  "Nokia XR21": { brand: "Nokia", baseValue: 240000, versions: ["128GB"] },
  "Nokia G42 5G": { brand: "Nokia", baseValue: 130000, versions: ["128GB", "256GB"] },
  "Nokia G22": { brand: "Nokia", baseValue: 85000, versions: ["64GB", "128GB"] },
  "Nokia C32": { brand: "Nokia", baseValue: 65000, versions: ["64GB", "128GB"] }
};
