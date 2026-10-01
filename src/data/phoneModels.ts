export interface PhoneModelItem {
  id: string;
  brand: string;
  model: string; // Clean model name ONLY (e.g. "SPARK 40", "CAMON 30 Pro", "iPhone 17 Pro Max")
  series?: string;
  defaultStorageOptions?: string[];
  defaultColors?: { name: string; hex: string }[];
  ramOptions?: string[];
  networkOptions?: string[]; // e.g. ["4G"], ["4G", "5G"], or ["5G"]
  specs?: {
    screen: string;
    camera: string;
    chipset: string;
    batterySize: string;
    os: string;
    warranty: string;
    simType: string;
    frontCamera?: string;
    chargingSpeed?: string;
    refreshRate?: string;
    displayTech?: string;
    nfc?: string;
    fingerprint?: string;
    faceUnlock?: string;
    ram?: string;
  };
}

export interface BrandData {
  id: string;
  name: string;
  logo: string;
  aliases: string[];
  models: PhoneModelItem[];
}

export const PHONE_BRANDS: BrandData[] = [
  {
    id: "Apple",
    name: "Apple",
    logo: "🍎",
    aliases: ["Apple", "iPhone"],
    models: [
      // iPhone 17 Series
      {
        id: "apple-iphone-17-pro-max",
        brand: "Apple",
        model: "iPhone 17 Pro Max",
        series: "iPhone 17 Series",
        defaultStorageOptions: ["256GB", "512GB", "1TB"],
        defaultColors: [
          { name: "Cosmic Titanium", hex: "#3A3845" },
          { name: "Natural Titanium", hex: "#8F8B82" },
          { name: "Desert Titanium", hex: "#C2A88F" }
        ],
        specs: {
          screen: "6.9-inch Super Retina XDR OLED (120Hz ProMotion)",
          camera: "48MP Fusion + 48MP UltraWide + 48MP Telephoto",
          chipset: "Apple A19 Pro Bionic",
          batterySize: "4850 mAh",
          os: "iOS 19",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      },
      {
        id: "apple-iphone-17-pro",
        brand: "Apple",
        model: "iPhone 17 Pro",
        series: "iPhone 17 Series",
        defaultStorageOptions: ["128GB", "256GB", "512GB", "1TB"],
        defaultColors: [
          { name: "Cosmic Titanium", hex: "#3A3845" },
          { name: "Natural Titanium", hex: "#8F8B82" },
          { name: "Desert Titanium", hex: "#C2A88F" }
        ],
        specs: {
          screen: "6.3-inch Super Retina XDR OLED (120Hz ProMotion)",
          camera: "48MP Fusion + 48MP UltraWide + 48MP Telephoto",
          chipset: "Apple A19 Pro Bionic",
          batterySize: "3700 mAh",
          os: "iOS 19",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      },
      {
        id: "apple-iphone-17",
        brand: "Apple",
        model: "iPhone 17",
        series: "iPhone 17 Series",
        defaultStorageOptions: ["128GB", "256GB", "512GB"],
        defaultColors: [
          { name: "Black", hex: "#1C1C1E" },
          { name: "White", hex: "#F2F1EC" },
          { name: "Ultramarine", hex: "#3B5282" }
        ],
        specs: {
          screen: "6.1-inch Super Retina XDR OLED (120Hz)",
          camera: "48MP Main + 12MP UltraWide",
          chipset: "Apple A19 Bionic",
          batterySize: "3600 mAh",
          os: "iOS 19",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      },
      // iPhone 16 Series
      {
        id: "apple-iphone-16-pro-max",
        brand: "Apple",
        model: "iPhone 16 Pro Max",
        series: "iPhone 16 Series",
        defaultStorageOptions: ["256GB", "512GB", "1TB"],
        defaultColors: [
          { name: "Desert Titanium", hex: "#C2A88F" },
          { name: "Natural Titanium", hex: "#8F8B82" },
          { name: "White Titanium", hex: "#F2F1EC" },
          { name: "Black Titanium", hex: "#232325" }
        ],
        specs: {
          screen: "6.9-inch Super Retina XDR OLED (120Hz ProMotion)",
          camera: "48MP Fusion + 48MP UltraWide + 12MP 5x Telephoto",
          chipset: "Apple A18 Pro Bionic",
          batterySize: "4685 mAh",
          os: "iOS 18",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      },
      {
        id: "apple-iphone-16-pro",
        brand: "Apple",
        model: "iPhone 16 Pro",
        series: "iPhone 16 Series",
        defaultStorageOptions: ["128GB", "256GB", "512GB", "1TB"],
        defaultColors: [
          { name: "Desert Titanium", hex: "#C2A88F" },
          { name: "Natural Titanium", hex: "#8F8B82" },
          { name: "White Titanium", hex: "#F2F1EC" },
          { name: "Black Titanium", hex: "#232325" }
        ],
        specs: {
          screen: "6.3-inch Super Retina XDR OLED (120Hz ProMotion)",
          camera: "48MP Fusion + 48MP UltraWide + 12MP 5x Telephoto",
          chipset: "Apple A18 Pro Bionic",
          batterySize: "3582 mAh",
          os: "iOS 18",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      },
      {
        id: "apple-iphone-16-plus",
        brand: "Apple",
        model: "iPhone 16 Plus",
        series: "iPhone 16 Series",
        defaultStorageOptions: ["128GB", "256GB", "512GB"],
        defaultColors: [
          { name: "Ultramarine", hex: "#3B5282" },
          { name: "Teal", hex: "#4B7C7D" },
          { name: "Pink", hex: "#E3A3B3" },
          { name: "White", hex: "#F2F1EC" },
          { name: "Black", hex: "#232325" }
        ],
        specs: {
          screen: "6.7-inch Super Retina XDR OLED",
          camera: "48MP Fusion + 12MP UltraWide",
          chipset: "Apple A18 Bionic",
          batterySize: "4674 mAh",
          os: "iOS 18",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      },
      {
        id: "apple-iphone-16",
        brand: "Apple",
        model: "iPhone 16",
        series: "iPhone 16 Series",
        defaultStorageOptions: ["128GB", "256GB", "512GB"],
        defaultColors: [
          { name: "Ultramarine", hex: "#3B5282" },
          { name: "Teal", hex: "#4B7C7D" },
          { name: "Pink", hex: "#E3A3B3" },
          { name: "White", hex: "#F2F1EC" },
          { name: "Black", hex: "#232325" }
        ],
        specs: {
          screen: "6.1-inch Super Retina XDR OLED",
          camera: "48MP Fusion + 12MP UltraWide",
          chipset: "Apple A18 Bionic",
          batterySize: "3561 mAh",
          os: "iOS 18",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      },
      // iPhone 15 Series
      {
        id: "apple-iphone-15-pro-max",
        brand: "Apple",
        model: "iPhone 15 Pro Max",
        series: "iPhone 15 Series",
        defaultStorageOptions: ["256GB", "512GB", "1TB"],
        defaultColors: [
          { name: "Natural Titanium", hex: "#8F8B82" },
          { name: "Blue Titanium", hex: "#2F3847" },
          { name: "White Titanium", hex: "#F2F1EC" },
          { name: "Black Titanium", hex: "#232325" }
        ],
        specs: {
          screen: "6.7-inch Super Retina XDR OLED (120Hz ProMotion)",
          camera: "48MP Main + 12MP UltraWide + 12MP 5x Telephoto",
          chipset: "Apple A17 Pro Bionic",
          batterySize: "4422 mAh",
          os: "iOS 17",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      },
      {
        id: "apple-iphone-15-pro",
        brand: "Apple",
        model: "iPhone 15 Pro",
        series: "iPhone 15 Series",
        defaultStorageOptions: ["128GB", "256GB", "512GB", "1TB"],
        defaultColors: [
          { name: "Natural Titanium", hex: "#8F8B82" },
          { name: "Blue Titanium", hex: "#2F3847" },
          { name: "White Titanium", hex: "#F2F1EC" },
          { name: "Black Titanium", hex: "#232325" }
        ],
        specs: {
          screen: "6.1-inch Super Retina XDR OLED (120Hz ProMotion)",
          camera: "48MP Main + 12MP UltraWide + 12MP 3x Telephoto",
          chipset: "Apple A17 Pro Bionic",
          batterySize: "3274 mAh",
          os: "iOS 17",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      },
      {
        id: "apple-iphone-15-plus",
        brand: "Apple",
        model: "iPhone 15 Plus",
        series: "iPhone 15 Series",
        defaultStorageOptions: ["128GB", "256GB", "512GB"],
        defaultColors: [
          { name: "Pink", hex: "#E9C0C7" },
          { name: "Yellow", hex: "#E8DFB8" },
          { name: "Green", hex: "#C7D8C6" },
          { name: "Blue", hex: "#C6D5E3" },
          { name: "Black", hex: "#353839" }
        ],
        specs: {
          screen: "6.7-inch Super Retina XDR OLED",
          camera: "48MP Main + 12MP UltraWide",
          chipset: "Apple A16 Bionic",
          batterySize: "4383 mAh",
          os: "iOS 17",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      },
      {
        id: "apple-iphone-15",
        brand: "Apple",
        model: "iPhone 15",
        series: "iPhone 15 Series",
        defaultStorageOptions: ["128GB", "256GB", "512GB"],
        defaultColors: [
          { name: "Pink", hex: "#E9C0C7" },
          { name: "Yellow", hex: "#E8DFB8" },
          { name: "Green", hex: "#C7D8C6" },
          { name: "Blue", hex: "#C6D5E3" },
          { name: "Black", hex: "#353839" }
        ],
        specs: {
          screen: "6.1-inch Super Retina XDR OLED",
          camera: "48MP Main + 12MP UltraWide",
          chipset: "Apple A16 Bionic",
          batterySize: "3349 mAh",
          os: "iOS 17",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      },
      // iPhone 14 Series
      {
        id: "apple-iphone-14-pro-max",
        brand: "Apple",
        model: "iPhone 14 Pro Max",
        series: "iPhone 14 Series",
        defaultStorageOptions: ["128GB", "256GB", "512GB", "1TB"],
        defaultColors: [
          { name: "Deep Purple", hex: "#4B3B4E" },
          { name: "Space Black", hex: "#1C1C1E" },
          { name: "Gold", hex: "#F3E2C8" },
          { name: "Silver", hex: "#F0F0EE" }
        ],
        specs: {
          screen: "6.7-inch Super Retina XDR OLED (120Hz ProMotion)",
          camera: "48MP Main + 12MP UltraWide + 12MP 3x Telephoto",
          chipset: "Apple A16 Bionic",
          batterySize: "4323 mAh",
          os: "iOS 16",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      },
      {
        id: "apple-iphone-14-pro",
        brand: "Apple",
        model: "iPhone 14 Pro",
        series: "iPhone 14 Series",
        defaultStorageOptions: ["128GB", "256GB", "512GB", "1TB"],
        defaultColors: [
          { name: "Deep Purple", hex: "#4B3B4E" },
          { name: "Space Black", hex: "#1C1C1E" },
          { name: "Gold", hex: "#F3E2C8" },
          { name: "Silver", hex: "#F0F0EE" }
        ],
        specs: {
          screen: "6.1-inch Super Retina XDR OLED (120Hz ProMotion)",
          camera: "48MP Main + 12MP UltraWide + 12MP 3x Telephoto",
          chipset: "Apple A16 Bionic",
          batterySize: "3200 mAh",
          os: "iOS 16",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      },
      {
        id: "apple-iphone-14-plus",
        brand: "Apple",
        model: "iPhone 14 Plus",
        series: "iPhone 14 Series",
        defaultStorageOptions: ["128GB", "256GB", "512GB"],
        defaultColors: [
          { name: "Blue", hex: "#A0B0C0" },
          { name: "Purple", hex: "#E0D0E0" },
          { name: "Midnight", hex: "#1C2530" },
          { name: "Starlight", hex: "#FAF6F0" }
        ],
        specs: {
          screen: "6.7-inch Super Retina XDR OLED",
          camera: "12MP Main + 12MP UltraWide",
          chipset: "Apple A15 Bionic",
          batterySize: "4325 mAh",
          os: "iOS 16",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      },
      {
        id: "apple-iphone-14",
        brand: "Apple",
        model: "iPhone 14",
        series: "iPhone 14 Series",
        defaultStorageOptions: ["128GB", "256GB", "512GB"],
        defaultColors: [
          { name: "Blue", hex: "#A0B0C0" },
          { name: "Purple", hex: "#E0D0E0" },
          { name: "Midnight", hex: "#1C2530" },
          { name: "Starlight", hex: "#FAF6F0" }
        ],
        specs: {
          screen: "6.1-inch Super Retina XDR OLED",
          camera: "12MP Main + 12MP UltraWide",
          chipset: "Apple A15 Bionic",
          batterySize: "3279 mAh",
          os: "iOS 16",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      },
      // iPhone 13 Series
      {
        id: "apple-iphone-13-pro-max",
        brand: "Apple",
        model: "iPhone 13 Pro Max",
        series: "iPhone 13 Series",
        defaultStorageOptions: ["128GB", "256GB", "512GB", "1TB"],
        defaultColors: [
          { name: "Sierra Blue", hex: "#9BB5CE" },
          { name: "Graphite", hex: "#4C4B49" },
          { name: "Gold", hex: "#FAE7CF" },
          { name: "Silver", hex: "#F2F2F2" },
          { name: "Alpine Green", hex: "#505E4D" }
        ],
        specs: {
          screen: "6.7-inch Super Retina XDR OLED (120Hz ProMotion)",
          camera: "12MP Triple Camera + LiDAR Scanner",
          chipset: "Apple A15 Bionic",
          batterySize: "4352 mAh",
          os: "iOS 15",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      },
      {
        id: "apple-iphone-13-pro",
        brand: "Apple",
        model: "iPhone 13 Pro",
        series: "iPhone 13 Series",
        defaultStorageOptions: ["128GB", "256GB", "512GB", "1TB"],
        defaultColors: [
          { name: "Sierra Blue", hex: "#9BB5CE" },
          { name: "Graphite", hex: "#4C4B49" },
          { name: "Gold", hex: "#FAE7CF" },
          { name: "Silver", hex: "#F2F2F2" },
          { name: "Alpine Green", hex: "#505E4D" }
        ],
        specs: {
          screen: "6.1-inch Super Retina XDR OLED (120Hz ProMotion)",
          camera: "12MP Triple Camera + LiDAR Scanner",
          chipset: "Apple A15 Bionic",
          batterySize: "3095 mAh",
          os: "iOS 15",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      },
      {
        id: "apple-iphone-13",
        brand: "Apple",
        model: "iPhone 13",
        series: "iPhone 13 Series",
        defaultStorageOptions: ["128GB", "256GB", "512GB"],
        defaultColors: [
          { name: "Midnight", hex: "#1C2530" },
          { name: "Starlight", hex: "#FAF6F0" },
          { name: "Blue", hex: "#275373" },
          { name: "Pink", hex: "#FAD7DC" },
          { name: "Green", hex: "#3C513E" }
        ],
        specs: {
          screen: "6.1-inch Super Retina XDR OLED",
          camera: "12MP Dual Main Camera",
          chipset: "Apple A15 Bionic",
          batterySize: "3227 mAh",
          os: "iOS 15",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      },
      {
        id: "apple-iphone-13-mini",
        brand: "Apple",
        model: "iPhone 13 mini",
        series: "iPhone 13 Series",
        defaultStorageOptions: ["128GB", "256GB", "512GB"],
        defaultColors: [
          { name: "Midnight", hex: "#1C2530" },
          { name: "Starlight", hex: "#FAF6F0" },
          { name: "Blue", hex: "#275373" },
          { name: "Pink", hex: "#FAD7DC" }
        ],
        specs: {
          screen: "5.4-inch Super Retina XDR OLED",
          camera: "12MP Dual Main Camera",
          chipset: "Apple A15 Bionic",
          batterySize: "2438 mAh",
          os: "iOS 15",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      },
      // iPhone 12 Series
      {
        id: "apple-iphone-12-pro-max",
        brand: "Apple",
        model: "iPhone 12 Pro Max",
        series: "iPhone 12 Series",
        defaultStorageOptions: ["128GB", "256GB", "512GB"],
        defaultColors: [
          { name: "Pacific Blue", hex: "#2D4B5A" },
          { name: "Graphite", hex: "#3F3F3F" },
          { name: "Gold", hex: "#F7E3C8" },
          { name: "Silver", hex: "#ECECEC" }
        ],
        specs: {
          screen: "6.7-inch Super Retina XDR OLED",
          camera: "12MP Triple Camera + LiDAR",
          chipset: "Apple A14 Bionic",
          batterySize: "3687 mAh",
          os: "iOS 14",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      },
      {
        id: "apple-iphone-12-pro",
        brand: "Apple",
        model: "iPhone 12 Pro",
        series: "iPhone 12 Series",
        defaultStorageOptions: ["128GB", "256GB", "512GB"],
        defaultColors: [
          { name: "Pacific Blue", hex: "#2D4B5A" },
          { name: "Graphite", hex: "#3F3F3F" },
          { name: "Gold", hex: "#F7E3C8" },
          { name: "Silver", hex: "#ECECEC" }
        ],
        specs: {
          screen: "6.1-inch Super Retina XDR OLED",
          camera: "12MP Triple Camera + LiDAR",
          chipset: "Apple A14 Bionic",
          batterySize: "2815 mAh",
          os: "iOS 14",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      },
      {
        id: "apple-iphone-12",
        brand: "Apple",
        model: "iPhone 12",
        series: "iPhone 12 Series",
        defaultStorageOptions: ["64GB", "128GB", "256GB"],
        defaultColors: [
          { name: "Black", hex: "#1C1C1E" },
          { name: "White", hex: "#F2F1EC" },
          { name: "Blue", hex: "#1E3B5A" },
          { name: "Green", hex: "#D2E8D3" },
          { name: "Purple", hex: "#D8D0E0" }
        ],
        specs: {
          screen: "6.1-inch Super Retina XDR OLED",
          camera: "12MP Dual Main Camera",
          chipset: "Apple A14 Bionic",
          batterySize: "2815 mAh",
          os: "iOS 14",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      },
      {
        id: "apple-iphone-12-mini",
        brand: "Apple",
        model: "iPhone 12 mini",
        series: "iPhone 12 Series",
        defaultStorageOptions: ["64GB", "128GB", "256GB"],
        defaultColors: [
          { name: "Black", hex: "#1C1C1E" },
          { name: "White", hex: "#F2F1EC" },
          { name: "Blue", hex: "#1E3B5A" },
          { name: "Green", hex: "#D2E8D3" }
        ],
        specs: {
          screen: "5.4-inch Super Retina XDR OLED",
          camera: "12MP Dual Main Camera",
          chipset: "Apple A14 Bionic",
          batterySize: "2227 mAh",
          os: "iOS 14",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      },
      // iPhone 11 Series
      {
        id: "apple-iphone-11-pro-max",
        brand: "Apple",
        model: "iPhone 11 Pro Max",
        series: "iPhone 11 Series",
        defaultStorageOptions: ["64GB", "256GB", "512GB"],
        defaultColors: [
          { name: "Midnight Green", hex: "#4E5851" },
          { name: "Space Gray", hex: "#535150" },
          { name: "Gold", hex: "#F3E0C7" },
          { name: "Silver", hex: "#ECEBE9" }
        ],
        specs: {
          screen: "6.5-inch Super Retina XDR OLED",
          camera: "12MP Triple Camera",
          chipset: "Apple A13 Bionic",
          batterySize: "3969 mAh",
          os: "iOS 13",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      },
      {
        id: "apple-iphone-11-pro",
        brand: "Apple",
        model: "iPhone 11 Pro",
        series: "iPhone 11 Series",
        defaultStorageOptions: ["64GB", "256GB", "512GB"],
        defaultColors: [
          { name: "Midnight Green", hex: "#4E5851" },
          { name: "Space Gray", hex: "#535150" },
          { name: "Gold", hex: "#F3E0C7" },
          { name: "Silver", hex: "#ECEBE9" }
        ],
        specs: {
          screen: "5.8-inch Super Retina XDR OLED",
          camera: "12MP Triple Camera",
          chipset: "Apple A13 Bionic",
          batterySize: "3046 mAh",
          os: "iOS 13",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      },
      {
        id: "apple-iphone-11",
        brand: "Apple",
        model: "iPhone 11",
        series: "iPhone 11 Series",
        defaultStorageOptions: ["64GB", "128GB", "256GB"],
        defaultColors: [
          { name: "Black", hex: "#1C1C1E" },
          { name: "White", hex: "#F9F9F9" },
          { name: "Green", hex: "#B8D8C8" },
          { name: "Purple", hex: "#D1CDDA" },
          { name: "Yellow", hex: "#FFE680" },
          { name: "Product RED", hex: "#BA0C2F" }
        ],
        specs: {
          screen: "6.1-inch Liquid Retina HD LCD",
          camera: "12MP Dual Camera",
          chipset: "Apple A13 Bionic",
          batterySize: "3110 mAh",
          os: "iOS 13",
          warranty: "1-Year Warranty",
          simType: "Physical Nano SIM + eSIM"
        }
      }
    ]
  },
  {
    id: "Samsung",
    name: "Samsung",
    logo: "🌌",
    aliases: ["Samsung", "Galaxy"],
    models: [
      // Samsung S Series
      {
        id: "samsung-galaxy-s24-ultra",
        brand: "Samsung",
        model: "Galaxy S24 Ultra",
        series: "Galaxy S Series",
        defaultStorageOptions: ["256GB", "512GB", "1TB"],
        defaultColors: [
          { name: "Titanium Black", hex: "#2B2B2B" },
          { name: "Titanium Gray", hex: "#7A7A7A" },
          { name: "Titanium Violet", hex: "#5C527F" },
          { name: "Titanium Yellow", hex: "#E3D597" }
        ],
        specs: {
          screen: "6.8-inch Dynamic AMOLED 2X (120Hz)",
          camera: "200MP + 50MP 5x + 10MP 3x + 12MP UltraWide",
          chipset: "Snapdragon 8 Gen 3 for Galaxy",
          batterySize: "5000 mAh (45W)",
          os: "Android 14 (One UI 6.1)",
          warranty: "1-Year Warranty",
          simType: "Dual SIM / eSIM"
        }
      },
      {
        id: "samsung-galaxy-s24-plus",
        brand: "Samsung",
        model: "Galaxy S24+",
        series: "Galaxy S Series",
        defaultStorageOptions: ["256GB", "512GB"],
        defaultColors: [
          { name: "Onyx Black", hex: "#2B2B2B" },
          { name: "Marble Gray", hex: "#C2C2C2" },
          { name: "Cobalt Violet", hex: "#5C527F" }
        ],
        specs: {
          screen: "6.7-inch Dynamic AMOLED 2X (120Hz)",
          camera: "50MP Main + 10MP 3x Telephoto + 12MP UltraWide",
          chipset: "Exynos 2400 / Snapdragon 8 Gen 3",
          batterySize: "4900 mAh (45W)",
          os: "Android 14 (One UI 6.1)",
          warranty: "1-Year Warranty",
          simType: "Dual SIM / eSIM"
        }
      },
      {
        id: "samsung-galaxy-s24",
        brand: "Samsung",
        model: "Galaxy S24",
        series: "Galaxy S Series",
        defaultStorageOptions: ["128GB", "256GB", "512GB"],
        defaultColors: [
          { name: "Onyx Black", hex: "#2B2B2B" },
          { name: "Marble Gray", hex: "#C2C2C2" },
          { name: "Cobalt Violet", hex: "#5C527F" }
        ],
        specs: {
          screen: "6.2-inch Dynamic AMOLED 2X (120Hz)",
          camera: "50MP Main + 10MP 3x Telephoto + 12MP UltraWide",
          chipset: "Exynos 2400 / Snapdragon 8 Gen 3",
          batterySize: "4000 mAh (25W)",
          os: "Android 14 (One UI 6.1)",
          warranty: "1-Year Warranty",
          simType: "Dual SIM / eSIM"
        }
      },
      {
        id: "samsung-galaxy-s23-ultra",
        brand: "Samsung",
        model: "Galaxy S23 Ultra",
        series: "Galaxy S Series",
        defaultStorageOptions: ["256GB", "512GB", "1TB"],
        defaultColors: [
          { name: "Phantom Black", hex: "#1C1C1E" },
          { name: "Cream", hex: "#F3EFE0" },
          { name: "Green", hex: "#3B4E42" },
          { name: "Lavender", hex: "#D6C7E0" }
        ],
        specs: {
          screen: "6.8-inch Dynamic AMOLED 2X (120Hz)",
          camera: "200MP + 10MP 10x + 10MP 3x + 12MP UltraWide",
          chipset: "Snapdragon 8 Gen 2 for Galaxy",
          batterySize: "5000 mAh (45W)",
          os: "Android 13 (Upgradable to Android 14)",
          warranty: "1-Year Warranty",
          simType: "Dual SIM / eSIM"
        }
      },
      {
        id: "samsung-galaxy-s23-plus",
        brand: "Samsung",
        model: "Galaxy S23+",
        series: "Galaxy S Series",
        defaultStorageOptions: ["256GB", "512GB"],
        defaultColors: [
          { name: "Phantom Black", hex: "#1C1C1E" },
          { name: "Cream", hex: "#F3EFE0" }
        ],
        specs: {
          screen: "6.6-inch Dynamic AMOLED 2X (120Hz)",
          camera: "50MP + 10MP 3x + 12MP UltraWide",
          chipset: "Snapdragon 8 Gen 2",
          batterySize: "4700 mAh",
          os: "Android 13",
          warranty: "1-Year Warranty",
          simType: "Dual SIM / eSIM"
        }
      },
      {
        id: "samsung-galaxy-s23",
        brand: "Samsung",
        model: "Galaxy S23",
        series: "Galaxy S Series",
        defaultStorageOptions: ["128GB", "256GB", "512GB"],
        defaultColors: [
          { name: "Phantom Black", hex: "#1C1C1E" },
          { name: "Cream", hex: "#F3EFE0" }
        ],
        specs: {
          screen: "6.1-inch Dynamic AMOLED 2X (120Hz)",
          camera: "50MP + 10MP 3x + 12MP UltraWide",
          chipset: "Snapdragon 8 Gen 2",
          batterySize: "3900 mAh",
          os: "Android 13",
          warranty: "1-Year Warranty",
          simType: "Dual SIM / eSIM"
        }
      },
      {
        id: "samsung-galaxy-s22-ultra",
        brand: "Samsung",
        model: "Galaxy S22 Ultra",
        series: "Galaxy S Series",
        defaultStorageOptions: ["128GB", "256GB", "512GB", "1TB"],
        defaultColors: [
          { name: "Phantom Black", hex: "#1C1C1E" },
          { name: "Burgundy", hex: "#532533" },
          { name: "Green", hex: "#2E3B32" },
          { name: "Phantom White", hex: "#F2F2F2" }
        ],
        specs: {
          screen: "6.8-inch Dynamic AMOLED 2X (120Hz)",
          camera: "108MP + 10MP 10x + 10MP 3x + 12MP UltraWide",
          chipset: "Snapdragon 8 Gen 1",
          batterySize: "5000 mAh",
          os: "Android 12",
          warranty: "1-Year Warranty",
          simType: "Dual SIM / eSIM"
        }
      },
      {
        id: "samsung-galaxy-s22-plus",
        brand: "Samsung",
        model: "Galaxy S22+",
        series: "Galaxy S Series",
        defaultStorageOptions: ["128GB", "256GB"],
        defaultColors: [
          { name: "Phantom Black", hex: "#1C1C1E" },
          { name: "Phantom White", hex: "#F2F2F2" }
        ],
        specs: {
          screen: "6.6-inch Dynamic AMOLED 2X (120Hz)",
          camera: "50MP + 10MP 3x + 12MP UltraWide",
          chipset: "Snapdragon 8 Gen 1",
          batterySize: "4500 mAh",
          os: "Android 12",
          warranty: "1-Year Warranty",
          simType: "Dual SIM / eSIM"
        }
      },
      {
        id: "samsung-galaxy-s22",
        brand: "Samsung",
        model: "Galaxy S22",
        series: "Galaxy S Series",
        defaultStorageOptions: ["128GB", "256GB"],
        defaultColors: [
          { name: "Phantom Black", hex: "#1C1C1E" },
          { name: "Phantom White", hex: "#F2F2F2" }
        ],
        specs: {
          screen: "6.1-inch Dynamic AMOLED 2X (120Hz)",
          camera: "50MP + 10MP 3x + 12MP UltraWide",
          chipset: "Snapdragon 8 Gen 1",
          batterySize: "3700 mAh",
          os: "Android 12",
          warranty: "1-Year Warranty",
          simType: "Dual SIM / eSIM"
        }
      },
      {
        id: "samsung-galaxy-s21-ultra",
        brand: "Samsung",
        model: "Galaxy S21 Ultra",
        series: "Galaxy S Series",
        defaultStorageOptions: ["128GB", "256GB", "512GB"],
        defaultColors: [
          { name: "Phantom Black", hex: "#1C1C1E" },
          { name: "Phantom Silver", hex: "#D4D4D6" }
        ],
        specs: {
          screen: "6.8-inch Dynamic AMOLED 2X (120Hz)",
          camera: "108MP + 10MP 10x + 10MP 3x + 12MP UltraWide",
          chipset: "Snapdragon 888 / Exynos 2100",
          batterySize: "5000 mAh",
          os: "Android 11",
          warranty: "1-Year Warranty",
          simType: "Dual SIM / eSIM"
        }
      },
      {
        id: "samsung-galaxy-s21-plus",
        brand: "Samsung",
        model: "Galaxy S21+",
        series: "Galaxy S Series",
        defaultStorageOptions: ["128GB", "256GB"],
        defaultColors: [{ name: "Phantom Violet", hex: "#837E9E" }],
        specs: {
          screen: "6.7-inch Dynamic AMOLED 2X (120Hz)",
          camera: "64MP Telephoto + 12MP Main + 12MP UltraWide",
          chipset: "Snapdragon 888",
          batterySize: "4800 mAh",
          os: "Android 11",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "samsung-galaxy-s21",
        brand: "Samsung",
        model: "Galaxy S21",
        series: "Galaxy S Series",
        defaultStorageOptions: ["128GB", "256GB"],
        defaultColors: [{ name: "Phantom Gray", hex: "#3B3B3B" }],
        specs: {
          screen: "6.2-inch Dynamic AMOLED 2X (120Hz)",
          camera: "64MP Telephoto + 12MP Main + 12MP UltraWide",
          chipset: "Snapdragon 888",
          batterySize: "4000 mAh",
          os: "Android 11",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "samsung-galaxy-s20-ultra",
        brand: "Samsung",
        model: "Galaxy S20 Ultra",
        series: "Galaxy S Series",
        defaultStorageOptions: ["128GB", "256GB", "512GB"],
        defaultColors: [{ name: "Cosmic Gray", hex: "#4E4E4E" }],
        specs: {
          screen: "6.9-inch Dynamic AMOLED 2X (120Hz)",
          camera: "108MP + 48MP Telephoto + 12MP UltraWide",
          chipset: "Snapdragon 865",
          batterySize: "5000 mAh",
          os: "Android 10",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "samsung-galaxy-s20-plus",
        brand: "Samsung",
        model: "Galaxy S20+",
        series: "Galaxy S Series",
        defaultStorageOptions: ["128GB", "256GB", "512GB"],
        defaultColors: [{ name: "Cosmic Black", hex: "#1C1C1E" }],
        specs: {
          screen: "6.7-inch Dynamic AMOLED 2X (120Hz)",
          camera: "64MP Telephoto + 12MP Main + 12MP UltraWide",
          chipset: "Snapdragon 865",
          batterySize: "4500 mAh",
          os: "Android 10",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "samsung-galaxy-s20",
        brand: "Samsung",
        model: "Galaxy S20",
        series: "Galaxy S Series",
        defaultStorageOptions: ["128GB"],
        defaultColors: [{ name: "Cosmic Gray", hex: "#4E4E4E" }],
        specs: {
          screen: "6.2-inch Dynamic AMOLED 2X (120Hz)",
          camera: "64MP Telephoto + 12MP Main + 12MP UltraWide",
          chipset: "Snapdragon 865",
          batterySize: "4000 mAh",
          os: "Android 10",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "samsung-galaxy-s10-5g",
        brand: "Samsung",
        model: "Galaxy S10 5G",
        series: "Galaxy S Series",
        defaultStorageOptions: ["256GB", "512GB"],
        defaultColors: [{ name: "Crown Silver", hex: "#D9D9D9" }],
        specs: {
          screen: "6.7-inch Dynamic AMOLED",
          camera: "12MP + 12MP Telephoto + 16MP UltraWide + TOF 3D",
          chipset: "Snapdragon 855",
          batterySize: "4500 mAh",
          os: "Android 9.0",
          warranty: "1-Year Warranty",
          simType: "Single SIM"
        }
      },
      {
        id: "samsung-galaxy-s10-plus",
        brand: "Samsung",
        model: "Galaxy S10+",
        series: "Galaxy S Series",
        defaultStorageOptions: ["128GB", "512GB", "1TB"],
        defaultColors: [{ name: "Prism Black", hex: "#1C1C1E" }],
        specs: {
          screen: "6.4-inch Dynamic AMOLED",
          camera: "12MP + 12MP Telephoto + 16MP UltraWide",
          chipset: "Snapdragon 855",
          batterySize: "4100 mAh",
          os: "Android 9.0",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "samsung-galaxy-s10",
        brand: "Samsung",
        model: "Galaxy S10",
        series: "Galaxy S Series",
        defaultStorageOptions: ["128GB", "512GB"],
        defaultColors: [{ name: "Prism Black", hex: "#1C1C1E" }],
        specs: {
          screen: "6.1-inch Dynamic AMOLED",
          camera: "12MP + 12MP Telephoto + 16MP UltraWide",
          chipset: "Snapdragon 855",
          batterySize: "3400 mAh",
          os: "Android 9.0",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "samsung-galaxy-s10e",
        brand: "Samsung",
        model: "Galaxy S10e",
        series: "Galaxy S Series",
        defaultStorageOptions: ["128GB", "256GB"],
        defaultColors: [{ name: "Prism Black", hex: "#1C1C1E" }],
        specs: {
          screen: "5.8-inch Dynamic AMOLED",
          camera: "12MP Main + 16MP UltraWide",
          chipset: "Snapdragon 855",
          batterySize: "3100 mAh",
          os: "Android 9.0",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "samsung-galaxy-s9-plus",
        brand: "Samsung",
        model: "Galaxy S9+",
        series: "Galaxy S Series",
        defaultStorageOptions: ["64GB", "128GB", "256GB"],
        defaultColors: [{ name: "Midnight Black", hex: "#1C1C1E" }],
        specs: {
          screen: "6.2-inch Super AMOLED",
          camera: "12MP Dual Aperture + 12MP Telephoto",
          chipset: "Snapdragon 845",
          batterySize: "3500 mAh",
          os: "Android 8.0",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "samsung-galaxy-s9",
        brand: "Samsung",
        model: "Galaxy S9",
        series: "Galaxy S Series",
        defaultStorageOptions: ["64GB", "128GB", "256GB"],
        defaultColors: [{ name: "Midnight Black", hex: "#1C1C1E" }],
        specs: {
          screen: "5.8-inch Super AMOLED",
          camera: "12MP Dual Aperture Camera",
          chipset: "Snapdragon 845",
          batterySize: "3000 mAh",
          os: "Android 8.0",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "samsung-galaxy-s8-plus",
        brand: "Samsung",
        model: "Galaxy S8+",
        series: "Galaxy S Series",
        defaultStorageOptions: ["64GB", "128GB"],
        defaultColors: [{ name: "Midnight Black", hex: "#1C1C1E" }],
        specs: {
          screen: "6.2-inch Super AMOLED",
          camera: "12MP Main Camera",
          chipset: "Snapdragon 835",
          batterySize: "3500 mAh",
          os: "Android 7.0",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "samsung-galaxy-s8",
        brand: "Samsung",
        model: "Galaxy S8",
        series: "Galaxy S Series",
        defaultStorageOptions: ["64GB"],
        defaultColors: [{ name: "Midnight Black", hex: "#1C1C1E" }],
        specs: {
          screen: "5.8-inch Super AMOLED",
          camera: "12MP Main Camera",
          chipset: "Snapdragon 835",
          batterySize: "3000 mAh",
          os: "Android 7.0",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },

      // Samsung A Series
      ...[
        "Galaxy A05", "Galaxy A05s", "Galaxy A06", "Galaxy A07",
        "Galaxy A10", "Galaxy A10s", "Galaxy A10e", "Galaxy A11", "Galaxy A12", "Galaxy A13", "Galaxy A14", "Galaxy A15", "Galaxy A16", "Galaxy A17",
        "Galaxy A20", "Galaxy A20s", "Galaxy A20e", "Galaxy A21", "Galaxy A21s", "Galaxy A22", "Galaxy A23", "Galaxy A24", "Galaxy A25",
        "Galaxy A30", "Galaxy A30s", "Galaxy A31", "Galaxy A32", "Galaxy A33", "Galaxy A34", "Galaxy A35", "Galaxy A36",
        "Galaxy A40", "Galaxy A41", "Galaxy A42",
        "Galaxy A50", "Galaxy A50s", "Galaxy A51", "Galaxy A52", "Galaxy A52s", "Galaxy A53", "Galaxy A54", "Galaxy A55", "Galaxy A56",
        "Galaxy A60", "Galaxy A70", "Galaxy A70s", "Galaxy A71", "Galaxy A72", "Galaxy A73", "Galaxy A80", "Galaxy A90 5G"
      ].map(mName => ({
        id: `samsung-${mName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        brand: "Samsung",
        model: mName,
        series: "Galaxy A Series",
        defaultStorageOptions: ["64GB", "128GB", "256GB"],
        defaultColors: [
          { name: "Awesome Black", hex: "#1C1C1E" },
          { name: "Awesome Blue", hex: "#9EBED8" },
          { name: "Awesome White", hex: "#F2F2F2" }
        ],
        specs: {
          screen: "High Resolution Super AMOLED / Infinity Display",
          camera: "Multi-Lens High Resolution AI Camera",
          chipset: "Octa-Core High Performance Processor",
          batterySize: "5000 mAh",
          os: "Android (One UI)",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      }))
    ]
  },
  {
    id: "Redmi/Xiaomi",
    name: "Redmi/Xiaomi",
    logo: "🧡",
    aliases: ["Redmi/Xiaomi", "Redmi", "Xiaomi", "Mi"],
    models: [
      {
        id: "redmi-note-13-pro-plus-5g",
        brand: "Redmi/Xiaomi",
        model: "Redmi Note 13 Pro+ 5G",
        series: "Redmi Note Series",
        defaultStorageOptions: ["256GB", "512GB"],
        defaultColors: [
          { name: "Midnight Black", hex: "#1C1C1E" },
          { name: "Moonlight White", hex: "#F2F2F2" },
          { name: "Aurora Purple", hex: "#7B68EE" }
        ],
        specs: {
          screen: "6.67-inch Curved 1.5K AMOLED (120Hz)",
          camera: "200MP OIS Main + 8MP UltraWide + 2MP",
          chipset: "MediaTek Dimensity 7200 Ultra",
          batterySize: "5000 mAh (120W HyperCharge)",
          os: "Android 13 (HyperOS / MIUI 14)",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "redmi-note-13-pro",
        brand: "Redmi/Xiaomi",
        model: "Redmi Note 13 Pro",
        series: "Redmi Note Series",
        defaultStorageOptions: ["128GB", "256GB", "512GB"],
        defaultColors: [{ name: "Midnight Black", hex: "#1C1C1E" }],
        specs: {
          screen: "6.67-inch 1.5K AMOLED (120Hz)",
          camera: "200MP OIS Main Camera",
          chipset: "Snapdragon 7s Gen 2 / Helio G99 Ultra",
          batterySize: "5100 mAh (67W)",
          os: "Android 13",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "redmi-note-13",
        brand: "Redmi/Xiaomi",
        model: "Redmi Note 13",
        series: "Redmi Note Series",
        defaultStorageOptions: ["128GB", "256GB"],
        defaultColors: [{ name: "Midnight Black", hex: "#1C1C1E" }],
        specs: {
          screen: "6.67-inch AMOLED (120Hz)",
          camera: "108MP Main Camera",
          chipset: "Snapdragon 685",
          batterySize: "5000 mAh (33W)",
          os: "Android 13",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "redmi-note-12-pro-plus-5g",
        brand: "Redmi/Xiaomi",
        model: "Redmi Note 12 Pro+ 5G",
        series: "Redmi Note Series",
        defaultStorageOptions: ["256GB"],
        defaultColors: [{ name: "Obsidian Black", hex: "#1C1C1E" }],
        specs: {
          screen: "6.67-inch FHD+ Flow AMOLED (120Hz)",
          camera: "200MP OIS Main Camera",
          chipset: "MediaTek Dimensity 1080",
          batterySize: "5000 mAh (120W)",
          os: "Android 12",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "redmi-note-12-pro",
        brand: "Redmi/Xiaomi",
        model: "Redmi Note 12 Pro",
        series: "Redmi Note Series",
        defaultStorageOptions: ["128GB", "256GB"],
        defaultColors: [{ name: "Graphite Gray", hex: "#383838" }],
        specs: {
          screen: "6.67-inch FHD+ AMOLED (120Hz)",
          camera: "50MP Sony IMX766 OIS Main Camera",
          chipset: "MediaTek Dimensity 1080",
          batterySize: "5000 mAh (67W)",
          os: "Android 12",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "redmi-note-12",
        brand: "Redmi/Xiaomi",
        model: "Redmi Note 12",
        series: "Redmi Note Series",
        defaultStorageOptions: ["128GB", "256GB"],
        defaultColors: [{ name: "Onyx Gray", hex: "#2E2E2E" }],
        specs: {
          screen: "6.67-inch AMOLED (120Hz)",
          camera: "50MP Main Camera",
          chipset: "Snapdragon 685",
          batterySize: "5000 mAh (33W)",
          os: "Android 13",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "redmi-13c",
        brand: "Redmi/Xiaomi",
        model: "Redmi 13C",
        series: "Redmi Series",
        defaultStorageOptions: ["128GB", "256GB"],
        defaultColors: [{ name: "Midnight Black", hex: "#1C1C1E" }],
        specs: {
          screen: "6.74-inch HD+ (90Hz)",
          camera: "50MP AI Main Camera",
          chipset: "MediaTek Helio G85",
          batterySize: "5000 mAh (18W)",
          os: "Android 13 (MIUI 14)",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "redmi-12",
        brand: "Redmi/Xiaomi",
        model: "Redmi 12",
        series: "Redmi Series",
        defaultStorageOptions: ["128GB", "256GB"],
        defaultColors: [{ name: "Midnight Black", hex: "#1C1C1E" }],
        specs: {
          screen: "6.79-inch FHD+ (90Hz)",
          camera: "50MP Triple Camera",
          chipset: "MediaTek Helio G88",
          batterySize: "5000 mAh (18W)",
          os: "Android 13",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "xiaomi-14-ultra",
        brand: "Redmi/Xiaomi",
        model: "Xiaomi 14 Ultra",
        series: "Xiaomi Flagship Series",
        defaultStorageOptions: ["512GB", "1TB"],
        defaultColors: [
          { name: "Black Leica Leather", hex: "#1A1A1A" },
          { name: "White Leica Leather", hex: "#F5F5F5" }
        ],
        specs: {
          screen: "6.73-inch LTPO AMOLED (120Hz)",
          camera: "Quad 50MP Leica Cameras + Variable Aperture",
          chipset: "Snapdragon 8 Gen 3",
          batterySize: "5000 mAh (90W HyperCharge)",
          os: "Android 14 (HyperOS)",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "xiaomi-14-pro",
        brand: "Redmi/Xiaomi",
        model: "Xiaomi 14 Pro",
        series: "Xiaomi Flagship Series",
        defaultStorageOptions: ["256GB", "512GB", "1TB"],
        defaultColors: [{ name: "Black", hex: "#1C1C1E" }],
        specs: {
          screen: "6.73-inch LTPO AMOLED (120Hz)",
          camera: "Triple 50MP Leica System",
          chipset: "Snapdragon 8 Gen 3",
          batterySize: "4880 mAh (120W)",
          os: "Android 14 (HyperOS)",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "xiaomi-14",
        brand: "Redmi/Xiaomi",
        model: "Xiaomi 14",
        series: "Xiaomi Flagship Series",
        defaultStorageOptions: ["256GB", "512GB"],
        defaultColors: [{ name: "Black", hex: "#1C1C1E" }],
        specs: {
          screen: "6.36-inch LTPO AMOLED (120Hz)",
          camera: "Triple 50MP Leica System",
          chipset: "Snapdragon 8 Gen 3",
          batterySize: "4610 mAh (90W)",
          os: "Android 14 (HyperOS)",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "xiaomi-13t-pro",
        brand: "Redmi/Xiaomi",
        model: "Xiaomi 13T Pro",
        series: "Xiaomi Flagship Series",
        defaultStorageOptions: ["256GB", "512GB", "1TB"],
        defaultColors: [{ name: "Meadow Green", hex: "#5E7C6A" }],
        specs: {
          screen: "6.67-inch CrystalRes AMOLED (144Hz)",
          camera: "50MP Leica Main + 50MP Telephoto + 12MP UltraWide",
          chipset: "MediaTek Dimensity 9200+",
          batterySize: "5000 mAh (120W)",
          os: "Android 13",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      }
    ]
  },
  {
    id: "Tecno",
    name: "TECNO",
    logo: "⚡",
    aliases: ["TECNO", "Tecno", "tecno"],
    models: [
      // ==========================================
      // SPARK SERIES
      // ==========================================
      {
        id: "tecno-spark-30",
        brand: "TECNO",
        model: "SPARK 30",
        series: "SPARK",
        defaultStorageOptions: ["128GB", "256GB"],
        ramOptions: ["6GB", "8GB"],
        networkOptions: ["4G"],
        specs: {
          screen: "6.78-inch FHD+ 90Hz Display",
          camera: "64MP Ultra-Clear Main Camera",
          frontCamera: "13MP Dual Flash Front",
          chipset: "MediaTek Helio G91",
          batterySize: "5000 mAh (18W Fast Charge)",
          chargingSpeed: "18W Fast Charge",
          refreshRate: "90Hz",
          os: "Android 14 (HiOS 14)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (4G)",
          fingerprint: "Side-Mounted Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-spark-30-pro",
        brand: "TECNO",
        model: "SPARK 30 Pro",
        series: "SPARK",
        defaultStorageOptions: ["128GB", "256GB"],
        ramOptions: ["8GB"],
        networkOptions: ["4G"],
        specs: {
          screen: "6.78-inch AMOLED 120Hz (TÜV Low Blue Light)",
          camera: "108MP Ultra-Clear Main Camera",
          frontCamera: "13MP Front Camera",
          chipset: "MediaTek Helio G100",
          batterySize: "5000 mAh (33W Fast Charge)",
          chargingSpeed: "33W Fast Charge",
          refreshRate: "120Hz",
          os: "Android 14 (HiOS 14)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (4G)",
          fingerprint: "In-Display Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-spark-30c",
        brand: "TECNO",
        model: "SPARK 30C",
        series: "SPARK",
        defaultStorageOptions: ["64GB", "128GB", "256GB"],
        ramOptions: ["4GB", "6GB", "8GB"],
        networkOptions: ["4G"],
        specs: {
          screen: "6.67-inch HD+ 120Hz Punch-Hole Display",
          camera: "50MP HDR Main Camera",
          frontCamera: "8MP Front Flash",
          chipset: "MediaTek Helio G81",
          batterySize: "5000 mAh (18W Fast Charge)",
          chargingSpeed: "18W Fast Charge",
          refreshRate: "120Hz",
          os: "Android 14 (HiOS 14)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (4G)",
          fingerprint: "Side-Mounted Fingerprint",
          faceUnlock: "Face Unlock Supported"
        }
      },
      {
        id: "tecno-spark-30-5g",
        brand: "TECNO",
        model: "SPARK 30 5G",
        series: "SPARK",
        defaultStorageOptions: ["128GB", "256GB"],
        ramOptions: ["6GB", "8GB"],
        networkOptions: ["5G", "4G"],
        specs: {
          screen: "6.67-inch HD+ 120Hz Display",
          camera: "108MP Ultra-Clear 5G Camera",
          frontCamera: "8MP Front Camera",
          chipset: "MediaTek Dimensity 6300 5G",
          batterySize: "5000 mAh (18W Fast Charge)",
          chargingSpeed: "18W Fast Charge",
          refreshRate: "120Hz",
          os: "Android 14 (HiOS 14)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (5G)",
          fingerprint: "Side-Mounted Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-spark-40",
        brand: "TECNO",
        model: "SPARK 40",
        series: "SPARK",
        defaultStorageOptions: ["128GB", "256GB"],
        ramOptions: ["8GB"],
        networkOptions: ["4G"],
        specs: {
          screen: "6.78-inch FHD+ 120Hz IPS LCD",
          camera: "64MP AI Triple Camera",
          frontCamera: "16MP Dual Glow Front",
          chipset: "MediaTek Helio G99 Ultimate",
          batterySize: "5000 mAh (33W Fast Charge)",
          chargingSpeed: "33W Fast Charge",
          refreshRate: "120Hz",
          os: "Android 15 (HiOS 15)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (4G)",
          fingerprint: "Side-Mounted Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-spark-40-pro",
        brand: "TECNO",
        model: "SPARK 40 Pro",
        series: "SPARK",
        defaultStorageOptions: ["128GB", "256GB", "512GB"],
        ramOptions: ["8GB", "12GB"],
        networkOptions: ["4G"],
        specs: {
          screen: "6.78-inch Curved AMOLED 120Hz",
          camera: "108MP Ultra Sense Camera with OIS",
          frontCamera: "32MP Eye-Tracking Front",
          chipset: "MediaTek Helio G100",
          batterySize: "5000 mAh (45W Ultra Charge)",
          chargingSpeed: "45W Ultra Charge",
          refreshRate: "120Hz",
          os: "Android 15 (HiOS 15)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (4G)",
          fingerprint: "In-Display Optical Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-spark-40-pro-plus",
        brand: "TECNO",
        model: "SPARK 40 Pro+",
        series: "SPARK",
        defaultStorageOptions: ["256GB", "512GB"],
        ramOptions: ["8GB", "12GB"],
        networkOptions: ["5G", "4G"],
        specs: {
          screen: "6.78-inch 3D Curved AMOLED 144Hz",
          camera: "108MP OIS Camera + 32MP Front Glow",
          frontCamera: "32MP Ultra Glow Front",
          chipset: "MediaTek Dimensity 7050",
          batterySize: "5000 mAh (70W Hyper Charge)",
          chargingSpeed: "70W Hyper Charge",
          refreshRate: "144Hz",
          os: "Android 15 (HiOS 15)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (5G)",
          fingerprint: "In-Display Optical Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-spark-40c",
        brand: "TECNO",
        model: "SPARK 40C",
        series: "SPARK",
        defaultStorageOptions: ["64GB", "128GB", "256GB"],
        ramOptions: ["4GB", "6GB", "8GB"],
        networkOptions: ["4G"],
        specs: {
          screen: "6.67-inch HD+ 120Hz Punch-Hole Display",
          camera: "50MP Dual AI Camera",
          frontCamera: "8MP Front Flash",
          chipset: "MediaTek Helio G85",
          batterySize: "5000 mAh (18W Fast Charge)",
          chargingSpeed: "18W Fast Charge",
          refreshRate: "120Hz",
          os: "Android 15 (HiOS 15)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (4G)",
          fingerprint: "Side-Mounted Fingerprint",
          faceUnlock: "Face Unlock Supported"
        }
      },
      {
        id: "tecno-spark-40-5g",
        brand: "TECNO",
        model: "SPARK 40 5G",
        series: "SPARK",
        defaultStorageOptions: ["128GB", "256GB"],
        ramOptions: ["8GB"],
        networkOptions: ["5G", "4G"],
        specs: {
          screen: "6.78-inch FHD+ 120Hz Display",
          camera: "108MP Ultra-Clear 5G Camera",
          frontCamera: "16MP Front Flash",
          chipset: "MediaTek Dimensity 6400 5G",
          batterySize: "5000 mAh (33W Fast Charge)",
          chargingSpeed: "33W Fast Charge",
          refreshRate: "120Hz",
          os: "Android 15 (HiOS 15)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (5G)",
          fingerprint: "Side-Mounted Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },

      // ==========================================
      // CAMON SERIES
      // ==========================================
      {
        id: "tecno-camon-30",
        brand: "TECNO",
        model: "CAMON 30",
        series: "CAMON",
        defaultStorageOptions: ["256GB", "512GB"],
        ramOptions: ["8GB", "12GB"],
        networkOptions: ["4G"],
        specs: {
          screen: "6.78-inch AMOLED 120Hz Display",
          camera: "50MP OIS Main + 50MP Eye-Tracking AF Front",
          frontCamera: "50MP Eye-Tracking AF Front Camera",
          chipset: "MediaTek Helio G99 Ultimate",
          batterySize: "5000 mAh (70W Ultra Charge)",
          chargingSpeed: "70W Ultra Charge",
          refreshRate: "120Hz",
          os: "Android 14 (HiOS 14)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (4G)",
          fingerprint: "In-Display Optical Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-camon-30-pro",
        brand: "TECNO",
        model: "CAMON 30 Pro",
        series: "CAMON",
        defaultStorageOptions: ["256GB", "512GB"],
        ramOptions: ["12GB"],
        networkOptions: ["5G", "4G"],
        specs: {
          screen: "6.78-inch AMOLED 144Hz Display",
          camera: "50MP Sony IMX890 OIS + 50MP UltraWide + 50MP Eye AF Front",
          frontCamera: "50MP Eye AF Front Camera",
          chipset: "MediaTek Dimensity 8200 Ultimate 5G",
          batterySize: "5000 mAh (70W Ultra Charge)",
          chargingSpeed: "70W Ultra Charge",
          refreshRate: "144Hz",
          os: "Android 14 (HiOS 14)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (5G)",
          fingerprint: "In-Display Optical Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-camon-30-premier",
        brand: "TECNO",
        model: "CAMON 30 Premier",
        series: "CAMON",
        defaultStorageOptions: ["512GB"],
        ramOptions: ["12GB"],
        networkOptions: ["5G", "4G"],
        specs: {
          screen: "6.77-inch 1.5K LTPO AMOLED 120Hz (1400 nits)",
          camera: "50MP Sony IMX890 OIS + 50MP 3x Periscope Telephoto + 50MP UltraWide",
          frontCamera: "50MP Eye AF Front Camera",
          chipset: "MediaTek Dimensity 8200 Ultimate 5G + Sony PolarAce Imaging Chip",
          batterySize: "5000 mAh (70W Ultra Charge)",
          chargingSpeed: "70W Ultra Charge",
          refreshRate: "120Hz LTPO",
          os: "Android 14 (HiOS 14)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (5G)",
          fingerprint: "In-Display Optical Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-camon-30-5g",
        brand: "TECNO",
        model: "CAMON 30 5G",
        series: "CAMON",
        defaultStorageOptions: ["256GB", "512GB"],
        ramOptions: ["8GB", "12GB"],
        networkOptions: ["5G", "4G"],
        specs: {
          screen: "6.78-inch AMOLED 120Hz Display",
          camera: "50MP OIS Main + 50MP Eye AF Front Camera",
          frontCamera: "50MP Eye AF Front Camera",
          chipset: "MediaTek Dimensity 7020 5G",
          batterySize: "5000 mAh (70W Ultra Charge)",
          chargingSpeed: "70W Ultra Charge",
          refreshRate: "120Hz",
          os: "Android 14 (HiOS 14)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (5G)",
          fingerprint: "In-Display Optical Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-camon-30s",
        brand: "TECNO",
        model: "CAMON 30S",
        series: "CAMON",
        defaultStorageOptions: ["128GB", "256GB"],
        ramOptions: ["6GB", "8GB"],
        networkOptions: ["4G"],
        specs: {
          screen: "6.78-inch Curved AMOLED 120Hz Display",
          camera: "50MP Sony IMX896 OIS + 13MP Front",
          frontCamera: "13MP Front Camera",
          chipset: "MediaTek Helio G100",
          batterySize: "5000 mAh (33W Fast Charge)",
          chargingSpeed: "33W Fast Charge",
          refreshRate: "120Hz",
          os: "Android 14 (HiOS 14)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (4G)",
          fingerprint: "In-Display Optical Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-camon-30s-pro",
        brand: "TECNO",
        model: "CAMON 30S Pro",
        series: "CAMON",
        defaultStorageOptions: ["256GB"],
        ramOptions: ["8GB"],
        networkOptions: ["4G"],
        specs: {
          screen: "6.78-inch 3D Curved AMOLED 120Hz (1300 nits)",
          camera: "50MP Sony IMX896 OIS + 50MP Eye AF Front Camera",
          frontCamera: "50MP Eye AF Front Camera",
          chipset: "MediaTek Helio G100",
          batterySize: "5000 mAh (45W Wired + 20W Wireless Charge)",
          chargingSpeed: "45W Wired + 20W Wireless",
          refreshRate: "120Hz",
          os: "Android 14 (HiOS 14)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (4G)",
          fingerprint: "In-Display Optical Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-camon-40",
        brand: "TECNO",
        model: "CAMON 40",
        series: "CAMON",
        defaultStorageOptions: ["256GB", "512GB"],
        ramOptions: ["8GB", "12GB"],
        networkOptions: ["4G"],
        specs: {
          screen: "6.78-inch AMOLED 120Hz FHD+",
          camera: "64MP Sony OIS Main + 50MP Front",
          frontCamera: "50MP Eye-Tracking Front",
          chipset: "MediaTek Helio G100 Ultimate",
          batterySize: "5000 mAh (45W Fast Charge)",
          chargingSpeed: "45W Fast Charge",
          refreshRate: "120Hz",
          os: "Android 15 (HiOS 15)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (4G)",
          fingerprint: "In-Display Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-camon-40-pro",
        brand: "TECNO",
        model: "CAMON 40 Pro",
        series: "CAMON",
        defaultStorageOptions: ["256GB", "512GB"],
        ramOptions: ["12GB"],
        networkOptions: ["5G", "4G"],
        specs: {
          screen: "6.78-inch 1.5K AMOLED 144Hz",
          camera: "50MP Sony IMX906 OIS + 50MP UltraWide + 50MP Front",
          frontCamera: "50MP Eye-Tracking AF Front",
          chipset: "MediaTek Dimensity 8300 Ultra 5G",
          batterySize: "5100 mAh (70W Fast Charge)",
          chargingSpeed: "70W Fast Charge",
          refreshRate: "144Hz",
          os: "Android 15 (HiOS 15)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (5G)",
          fingerprint: "In-Display Optical Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-camon-40-premier-5g",
        brand: "TECNO",
        model: "CAMON 40 Premier 5G",
        series: "CAMON",
        defaultStorageOptions: ["512GB", "1TB"],
        ramOptions: ["12GB", "16GB"],
        networkOptions: ["5G", "4G"],
        specs: {
          screen: "6.78-inch 1.5K LTPO AMOLED 144Hz (1600 nits)",
          camera: "50MP Sony LYT-808 OIS + 50MP 3x Periscope Telephoto + 50MP UltraWide",
          frontCamera: "50MP 4K60fps Eye AF Front",
          chipset: "MediaTek Dimensity 8350 Ultimate 5G + AI Vision Processor",
          batterySize: "5200 mAh (70W Ultra Charge + 30W Wireless)",
          chargingSpeed: "70W Ultra Charge + 30W Wireless",
          refreshRate: "144Hz LTPO",
          os: "Android 15 (HiOS 15)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (5G)",
          fingerprint: "In-Display Ultrasonic Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },

      // ==========================================
      // POVA SERIES
      // ==========================================
      {
        id: "tecno-pova-6",
        brand: "TECNO",
        model: "POVA 6",
        series: "POVA",
        defaultStorageOptions: ["128GB", "256GB"],
        ramOptions: ["8GB", "12GB"],
        networkOptions: ["4G"],
        specs: {
          screen: "6.78-inch FHD+ AMOLED 120Hz (Dynamic-Eye Design)",
          camera: "108MP Ultra-Clear + 32MP Dual Flash Front",
          frontCamera: "32MP Dual Flash Front",
          chipset: "MediaTek Helio G99 Ultimate",
          batterySize: "6000 mAh (70W Ultra Charge)",
          chargingSpeed: "70W Ultra Charge",
          refreshRate: "120Hz",
          os: "Android 14 (HiOS 14)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (4G)",
          fingerprint: "In-Display Optical Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-pova-6-pro-5g",
        brand: "TECNO",
        model: "POVA 6 Pro 5G",
        series: "POVA",
        defaultStorageOptions: ["256GB"],
        ramOptions: ["8GB", "12GB"],
        networkOptions: ["5G", "4G"],
        specs: {
          screen: "6.78-inch FHD+ AMOLED 120Hz (Dynamic Mini-LED Effect)",
          camera: "108MP Triple AI Camera + 32MP Front",
          frontCamera: "32MP Front Camera",
          chipset: "MediaTek Dimensity 6080 5G",
          batterySize: "6000 mAh (70W Ultra Charge + 10W Reverse Charge)",
          chargingSpeed: "70W Ultra Charge",
          refreshRate: "120Hz",
          os: "Android 14 (HiOS 14)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (5G)",
          fingerprint: "In-Display Optical Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-pova-6-neo",
        brand: "TECNO",
        model: "POVA 6 Neo",
        series: "POVA",
        defaultStorageOptions: ["128GB", "256GB"],
        ramOptions: ["8GB"],
        networkOptions: ["4G"],
        specs: {
          screen: "6.78-inch FHD+ 120Hz Display",
          camera: "50MP Dual Rear Camera + 8MP Front",
          frontCamera: "8MP Front Camera",
          chipset: "MediaTek Helio G99 Ultimate",
          batterySize: "7000 mAh (33W Ultra Charge)",
          chargingSpeed: "33W Ultra Charge",
          refreshRate: "120Hz",
          os: "Android 14 (HiOS 14)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (4G)",
          fingerprint: "Side-Mounted Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-pova-7",
        brand: "TECNO",
        model: "POVA 7",
        series: "POVA",
        defaultStorageOptions: ["128GB", "256GB"],
        ramOptions: ["8GB", "12GB"],
        networkOptions: ["4G"],
        specs: {
          screen: "6.78-inch FHD+ AMOLED 120Hz",
          camera: "108MP AI Gaming Camera",
          frontCamera: "32MP Front Camera",
          chipset: "MediaTek Helio G100 Gaming Processor",
          batterySize: "6000 mAh (70W Ultra Charge)",
          chargingSpeed: "70W Ultra Charge",
          refreshRate: "120Hz",
          os: "Android 15 (HiOS 15)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (4G)",
          fingerprint: "In-Display Optical Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-pova-7-5g",
        brand: "TECNO",
        model: "POVA 7 5G",
        series: "POVA",
        defaultStorageOptions: ["128GB", "256GB"],
        ramOptions: ["8GB", "12GB"],
        networkOptions: ["5G", "4G"],
        specs: {
          screen: "6.78-inch FHD+ AMOLED 120Hz",
          camera: "108MP AI Dual Camera + 32MP Front",
          frontCamera: "32MP Front Camera",
          chipset: "MediaTek Dimensity 6300 5G",
          batterySize: "6000 mAh (70W Ultra Charge)",
          chargingSpeed: "70W Ultra Charge",
          refreshRate: "120Hz",
          os: "Android 15 (HiOS 15)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (5G)",
          fingerprint: "In-Display Optical Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-pova-7-pro-5g",
        brand: "TECNO",
        model: "POVA 7 Pro 5G",
        series: "POVA",
        defaultStorageOptions: ["256GB", "512GB"],
        ramOptions: ["12GB"],
        networkOptions: ["5G", "4G"],
        specs: {
          screen: "6.78-inch FHD+ AMOLED 144Hz Mech-Light Interface",
          camera: "108MP OIS Gaming Camera + 32MP Front",
          frontCamera: "32MP Front Camera",
          chipset: "MediaTek Dimensity 7050 5G",
          batterySize: "6000 mAh (80W Ultra Charge)",
          chargingSpeed: "80W Ultra Charge",
          refreshRate: "144Hz",
          os: "Android 15 (HiOS 15)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (5G)",
          fingerprint: "In-Display Optical Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-pova-7-ultra-5g",
        brand: "TECNO",
        model: "POVA 7 Ultra 5G",
        series: "POVA",
        defaultStorageOptions: ["256GB", "512GB"],
        ramOptions: ["12GB", "16GB"],
        networkOptions: ["5G", "4G"],
        specs: {
          screen: "6.8-inch 1.5K AMOLED 144Hz Gaming Display",
          camera: "108MP OIS + 13MP UltraWide + 50MP Front",
          frontCamera: "50MP Front Gaming Camera",
          chipset: "MediaTek Dimensity 8200 Ultimate 5G",
          batterySize: "7000 mAh (90W Hyper Charge)",
          chargingSpeed: "90W Hyper Charge",
          refreshRate: "144Hz",
          os: "Android 15 (HiOS 15)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (5G)",
          fingerprint: "In-Display Ultrasonic Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-pova-curve-5g",
        brand: "TECNO",
        model: "POVA Curve 5G",
        series: "POVA",
        defaultStorageOptions: ["256GB"],
        ramOptions: ["8GB", "12GB"],
        networkOptions: ["5G", "4G"],
        specs: {
          screen: "6.78-inch 3D Curved AMOLED 120Hz",
          camera: "108MP OIS Dual Camera + 32MP Front",
          frontCamera: "32MP Front Camera",
          chipset: "MediaTek Dimensity 7020 5G",
          batterySize: "6000 mAh (70W Ultra Charge)",
          chargingSpeed: "70W Ultra Charge",
          refreshRate: "120Hz",
          os: "Android 15 (HiOS 15)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (5G)",
          fingerprint: "In-Display Optical Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },

      // ==========================================
      // POP SERIES
      // ==========================================
      {
        id: "tecno-pop-9",
        brand: "TECNO",
        model: "POP 9",
        series: "POP",
        defaultStorageOptions: ["64GB", "128GB"],
        ramOptions: ["3GB", "4GB"],
        networkOptions: ["4G"],
        specs: {
          screen: "6.67-inch HD+ 120Hz Punch-Hole Display",
          camera: "13MP Dual Camera + 8MP Front",
          frontCamera: "8MP Front Flash",
          chipset: "Unisoc T606 Octa-Core",
          batterySize: "5000 mAh (15W Fast Charge)",
          chargingSpeed: "15W Fast Charge",
          refreshRate: "120Hz",
          os: "Android 14 (Go Edition)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (4G)",
          fingerprint: "Side-Mounted Fingerprint",
          faceUnlock: "Face Unlock Supported"
        }
      },
      {
        id: "tecno-pop-9-5g",
        brand: "TECNO",
        model: "POP 9 5G",
        series: "POP",
        defaultStorageOptions: ["64GB", "128GB"],
        ramOptions: ["4GB", "8GB"],
        networkOptions: ["5G", "4G"],
        specs: {
          screen: "6.67-inch HD+ 120Hz Punch-Hole Display",
          camera: "48MP Sony IMX582 Main + 8MP Front",
          frontCamera: "8MP Front Camera",
          chipset: "MediaTek Dimensity 6300 5G",
          batterySize: "5000 mAh (18W Fast Charge)",
          chargingSpeed: "18W Fast Charge",
          refreshRate: "120Hz",
          os: "Android 14",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (5G)",
          fingerprint: "Side-Mounted Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-pop-8",
        brand: "TECNO",
        model: "POP 8",
        series: "POP",
        defaultStorageOptions: ["64GB", "128GB"],
        ramOptions: ["3GB", "4GB"],
        networkOptions: ["4G"],
        specs: {
          screen: "6.6-inch HD+ 90Hz Dynamic Port",
          camera: "13MP Dual Rear + 8MP Front Flash",
          frontCamera: "8MP Front Flash",
          chipset: "Unisoc T606 Octa-Core",
          batterySize: "5000 mAh (10W Charge)",
          chargingSpeed: "10W Charge",
          refreshRate: "90Hz",
          os: "Android 13 (Go Edition)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (4G)",
          fingerprint: "Side-Mounted Fingerprint",
          faceUnlock: "Face Unlock Supported"
        }
      },
      {
        id: "tecno-pop-8-pro",
        brand: "TECNO",
        model: "POP 8 Pro",
        series: "POP",
        defaultStorageOptions: ["64GB", "128GB"],
        ramOptions: ["4GB"],
        networkOptions: ["4G"],
        specs: {
          screen: "6.6-inch HD+ 90Hz Display",
          camera: "13MP Dual Rear + 8MP Front",
          frontCamera: "8MP Front Camera",
          chipset: "Unisoc T606 Octa-Core",
          batterySize: "5000 mAh (18W Charge)",
          chargingSpeed: "18W Charge",
          refreshRate: "90Hz",
          os: "Android 13 (Go Edition)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (4G)",
          fingerprint: "Side-Mounted Fingerprint",
          faceUnlock: "Face Unlock Supported"
        }
      },
      {
        id: "tecno-pop-7",
        brand: "TECNO",
        model: "POP 7",
        series: "POP",
        defaultStorageOptions: ["64GB"],
        ramOptions: ["2GB", "3GB"],
        networkOptions: ["4G"],
        specs: {
          screen: "6.6-inch HD+ Dot Notch Display",
          camera: "8MP Dual Camera + 5MP Front",
          frontCamera: "5MP Front Camera",
          chipset: "Unisoc SC9863A1",
          batterySize: "5000 mAh",
          os: "Android 12 (Go Edition)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (4G)",
          fingerprint: "Rear Fingerprint Sensor",
          faceUnlock: "Face Unlock Supported"
        }
      },
      {
        id: "tecno-pop-7-pro",
        brand: "TECNO",
        model: "POP 7 Pro",
        series: "POP",
        defaultStorageOptions: ["64GB"],
        ramOptions: ["3GB", "4GB"],
        networkOptions: ["4G"],
        specs: {
          screen: "6.56-inch HD+ Dot Notch Display",
          camera: "13MP Dual Camera + 5MP Front",
          frontCamera: "5MP Front Camera",
          chipset: "MediaTek Helio A22",
          batterySize: "5000 mAh (10W Type-C)",
          chargingSpeed: "10W Fast Charge",
          os: "Android 12 (Go Edition)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (4G)",
          fingerprint: "Rear Fingerprint Sensor",
          faceUnlock: "Face Unlock Supported"
        }
      },
      {
        id: "tecno-pop-6",
        brand: "TECNO",
        model: "POP 6",
        series: "POP",
        defaultStorageOptions: ["32GB"],
        ramOptions: ["2GB"],
        networkOptions: ["4G"],
        specs: {
          screen: "6.1-inch HD+ Dot Notch Display",
          camera: "5MP Dual Camera",
          frontCamera: "5MP Front Camera",
          chipset: "Quad-Core 1.3 GHz",
          batterySize: "5000 mAh",
          os: "Android 11 (Go Edition)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (4G)",
          fingerprint: "Rear Fingerprint Sensor",
          faceUnlock: "Face Unlock Supported"
        }
      },
      {
        id: "tecno-pop-6-pro",
        brand: "TECNO",
        model: "POP 6 Pro",
        series: "POP",
        defaultStorageOptions: ["32GB", "64GB"],
        ramOptions: ["2GB", "3GB"],
        networkOptions: ["4G"],
        specs: {
          screen: "6.56-inch HD+ Dot Notch Display",
          camera: "8MP Dual Camera + 5MP Front",
          frontCamera: "5MP Front Camera",
          chipset: "MediaTek Helio A22",
          batterySize: "5000 mAh",
          os: "Android 12 (Go Edition)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (4G)",
          fingerprint: "Side-Mounted Fingerprint",
          faceUnlock: "Face Unlock Supported"
        }
      },

      // ==========================================
      // PHANTOM SERIES
      // ==========================================
      {
        id: "tecno-phantom-v-fold-2-5g",
        brand: "TECNO",
        model: "PHANTOM V Fold2 5G",
        series: "PHANTOM",
        defaultStorageOptions: ["512GB"],
        ramOptions: ["12GB"],
        networkOptions: ["5G", "4G"],
        specs: {
          screen: "7.85-inch 2K+ 120Hz Foldable LTPO AMOLED + 6.42-inch FHD+ 120Hz Cover AMOLED",
          camera: "50MP OIS Main + 50MP 2x Portrait + 50MP UltraWide + Dual 32MP Front",
          frontCamera: "Dual 32MP (Cover & Inner) Cameras",
          chipset: "MediaTek Dimensity 9000+ 5G (4nm)",
          batterySize: "5750 mAh (70W Ultra Charge + 15W Wireless)",
          chargingSpeed: "70W Ultra Charge + 15W Wireless",
          refreshRate: "120Hz LTPO",
          os: "Android 14 (HiOS Fold 14)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (5G)",
          fingerprint: "Side-Mounted Fast Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-phantom-v-flip-2-5g",
        brand: "TECNO",
        model: "PHANTOM V Flip2 5G",
        series: "PHANTOM",
        defaultStorageOptions: ["256GB"],
        ramOptions: ["8GB"],
        networkOptions: ["5G", "4G"],
        specs: {
          screen: "6.9-inch FHD+ 120Hz Foldable LTPO AMOLED + 3.64-inch 120Hz Cover Display",
          camera: "50MP OIS Main + 50MP UltraWide + 32MP AF Front",
          frontCamera: "32MP AF Front Camera with Flash",
          chipset: "MediaTek Dimensity 8020 5G (6nm)",
          batterySize: "4720 mAh (70W Ultra Charge)",
          chargingSpeed: "70W Ultra Charge",
          refreshRate: "120Hz LTPO",
          os: "Android 14 (HiOS Flip 14)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (5G)",
          fingerprint: "Side-Mounted Fast Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-phantom-v-fold-5g",
        brand: "TECNO",
        model: "PHANTOM V Fold 5G",
        series: "PHANTOM",
        defaultStorageOptions: ["256GB", "512GB"],
        ramOptions: ["12GB"],
        networkOptions: ["5G", "4G"],
        specs: {
          screen: "7.85-inch 2K+ 120Hz Foldable LTPO AMOLED + 6.42-inch FHD+ 120Hz Cover",
          camera: "50MP Main + 50MP Telephoto + 13MP UltraWide + Dual 32MP/16MP Front",
          frontCamera: "32MP Cover + 16MP Inner Front",
          chipset: "MediaTek Dimensity 9000+ 5G (4nm)",
          batterySize: "5000 mAh (66W Flash Charge)",
          chargingSpeed: "66W Flash Charge",
          refreshRate: "120Hz LTPO",
          os: "Android 13 (HiOS Fold)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (5G)",
          fingerprint: "Side-Mounted Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-phantom-v-flip-5g",
        brand: "TECNO",
        model: "PHANTOM V Flip 5G",
        series: "PHANTOM",
        defaultStorageOptions: ["256GB"],
        ramOptions: ["8GB"],
        networkOptions: ["5G", "4G"],
        specs: {
          screen: "6.9-inch FHD+ 120Hz Foldable LTPO AMOLED + 1.32-inch Circular Cover AMOLED",
          camera: "64MP RGBW Main + 13MP UltraWide + 32MP Dual-Flash Front",
          frontCamera: "32MP Dual-Flash Front Camera",
          chipset: "MediaTek Dimensity 8050 5G",
          batterySize: "4000 mAh (45W Flash Charge)",
          chargingSpeed: "45W Flash Charge",
          refreshRate: "120Hz LTPO",
          os: "Android 13 (HiOS Flip)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (5G)",
          fingerprint: "Side-Mounted Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-phantom-x2-pro-5g",
        brand: "TECNO",
        model: "PHANTOM X2 Pro 5G",
        series: "PHANTOM",
        defaultStorageOptions: ["256GB"],
        ramOptions: ["12GB"],
        networkOptions: ["5G", "4G"],
        specs: {
          screen: "6.8-inch Curved FHD+ AMOLED 120Hz",
          camera: "50MP Retractable Portrait Lens + 50MP Main + 13MP UltraWide + 32MP Front",
          frontCamera: "32MP Front Camera",
          chipset: "MediaTek Dimensity 9000 5G (4nm)",
          batterySize: "5160 mAh (45W Fast Charge)",
          chargingSpeed: "45W Fast Charge",
          refreshRate: "120Hz",
          os: "Android 12 (HiOS 12)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (5G)",
          fingerprint: "In-Display Optical Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-phantom-x2-5g",
        brand: "TECNO",
        model: "PHANTOM X2 5G",
        series: "PHANTOM",
        defaultStorageOptions: ["256GB"],
        ramOptions: ["8GB"],
        networkOptions: ["5G", "4G"],
        specs: {
          screen: "6.8-inch Curved FHD+ AMOLED 120Hz",
          camera: "64MP RGBW OIS Main + 13MP UltraWide + 32MP Front",
          frontCamera: "32MP Front Camera",
          chipset: "MediaTek Dimensity 9000 5G (4nm)",
          batterySize: "5160 mAh (45W Fast Charge)",
          chargingSpeed: "45W Fast Charge",
          refreshRate: "120Hz",
          os: "Android 12 (HiOS 12)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (5G)",
          fingerprint: "In-Display Optical Fingerprint",
          faceUnlock: "Face Unlock Supported",
          nfc: "Yes"
        }
      },
      {
        id: "tecno-phantom-x",
        brand: "TECNO",
        model: "PHANTOM X",
        series: "PHANTOM",
        defaultStorageOptions: ["256GB"],
        ramOptions: ["8GB"],
        networkOptions: ["4G"],
        specs: {
          screen: "6.7-inch 3D Borderless OLED 90Hz",
          camera: "50MP Ultra-Night Main + 13MP Portrait + 8MP UltraWide + 48MP+8MP Dual Front",
          frontCamera: "48MP + 8MP Dual Front",
          chipset: "MediaTek Helio G95",
          batterySize: "4700 mAh (33W Flash Charge)",
          chargingSpeed: "33W Flash Charge",
          refreshRate: "90Hz",
          os: "Android 11 (HiOS 7.6)",
          warranty: "1-Year Warranty",
          simType: "Dual Nano SIM (4G)",
          fingerprint: "In-Display Optical Fingerprint",
          faceUnlock: "Face Unlock Supported"
        }
      }
    ]
  }
];

/**
 * Returns list of model items for a specified brand.
 */
export function getModelsForBrand(brandName: string): PhoneModelItem[] {
  if (!brandName) return [];
  const normalized = brandName.trim().toLowerCase();
  
  const foundBrand = PHONE_BRANDS.find(b =>
    b.name.toLowerCase() === normalized ||
    b.aliases.some(a => a.toLowerCase() === normalized)
  );

  return foundBrand ? foundBrand.models : [];
}

/**
 * Returns distinct series list for a specified brand.
 */
export function getSeriesForBrand(brandName: string): string[] {
  const models = getModelsForBrand(brandName);
  if (!models.length) return [];
  
  const seriesSet = new Set<string>();
  models.forEach(m => {
    if (m.series && m.series.trim()) {
      seriesSet.add(m.series.trim());
    }
  });
  
  return Array.from(seriesSet);
}

/**
 * Returns models for a brand optionally filtered by series.
 */
export function getModelsForBrandAndSeries(brandName: string, seriesName?: string): PhoneModelItem[] {
  const models = getModelsForBrand(brandName);
  if (!seriesName || seriesName === "All" || seriesName === "All Series") {
    return models;
  }
  
  const normSeries = seriesName.trim().toLowerCase();
  return models.filter(m => m.series && m.series.trim().toLowerCase() === normSeries);
}

/**
 * Finds exact phone model spec details in database.
 */
export function getPhoneModelDetails(brandName: string, modelName: string): PhoneModelItem | undefined {
  const models = getModelsForBrand(brandName);
  if (!models.length) return undefined;
  
  const normModel = modelName.trim().toLowerCase();
  return models.find(m => m.model.toLowerCase() === normModel);
}
