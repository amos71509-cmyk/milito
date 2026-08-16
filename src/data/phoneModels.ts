export interface PhoneModelItem {
  id: string;
  brand: string;
  model: string; // Clean model name ONLY (e.g. "iPhone 17 Pro Max", "Galaxy A55")
  series?: string;
  defaultStorageOptions?: string[];
  defaultColors?: { name: string; hex: string }[];
  specs?: {
    screen: string;
    camera: string;
    chipset: string;
    batterySize: string;
    os: string;
    warranty: string;
    simType: string;
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
    id: "Tecno",
    name: "Tecno",
    logo: "⚡",
    aliases: ["Tecno"],
    models: [
      {
        id: "tecno-camon-30-pro-5g",
        brand: "Tecno",
        model: "Camon 30 Pro 5G",
        series: "Camon Series",
        defaultStorageOptions: ["256GB", "512GB"],
        defaultColors: [
          { name: "Alps Snowy Silver", hex: "#C0C0C0" },
          { name: "Iceland Basalt Black", hex: "#1F1F1F" }
        ],
        specs: {
          screen: "6.78-inch AMOLED (144Hz)",
          camera: "50MP OIS Main + 50MP UltraWide + 2MP",
          chipset: "MediaTek Dimensity 8200 Ultimate 5G",
          batterySize: "5000 mAh (70W Fast Charge)",
          os: "Android 14 (HiOS 14)",
          warranty: "1-Year Warranty",
          simType: "Dual Physical SIM"
        }
      },
      {
        id: "tecno-camon-30-premier",
        brand: "Tecno",
        model: "Camon 30 Premier",
        series: "Camon Series",
        defaultStorageOptions: ["512GB"],
        defaultColors: [{ name: "Alps Snowy Silver", hex: "#C0C0C0" }],
        specs: {
          screen: "6.77-inch LTPO AMOLED (120Hz)",
          camera: "50MP OIS + 50MP Periscope Telephoto + 50MP UltraWide",
          chipset: "MediaTek Dimensity 8200 Ultimate",
          batterySize: "5000 mAh (70W)",
          os: "Android 14",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "tecno-camon-30-5g",
        brand: "Tecno",
        model: "Camon 30 5G",
        series: "Camon Series",
        defaultStorageOptions: ["256GB", "512GB"],
        defaultColors: [{ name: "Iceland Basalt Black", hex: "#1F1F1F" }],
        specs: {
          screen: "6.78-inch AMOLED (120Hz)",
          camera: "50MP OIS Main Camera",
          chipset: "MediaTek Dimensity 7020 5G",
          batterySize: "5000 mAh (70W)",
          os: "Android 14",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "tecno-camon-30",
        brand: "Tecno",
        model: "Camon 30",
        series: "Camon Series",
        defaultStorageOptions: ["128GB", "256GB"],
        defaultColors: [{ name: "Uyuni Salt White", hex: "#F5F5F5" }],
        specs: {
          screen: "6.78-inch AMOLED (120Hz)",
          camera: "50MP Main Camera",
          chipset: "MediaTek Helio G99 Ultimate",
          batterySize: "5000 mAh (70W)",
          os: "Android 14",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "tecno-camon-20-premier-5g",
        brand: "Tecno",
        model: "Camon 20 Premier 5G",
        series: "Camon Series",
        defaultStorageOptions: ["512GB"],
        defaultColors: [{ name: "Dark Welkin", hex: "#232B38" }],
        specs: {
          screen: "6.67-inch AMOLED (120Hz)",
          camera: "50MP RGBW OIS + 108MP UltraWide",
          chipset: "MediaTek Dimensity 8050 5G",
          batterySize: "5000 mAh (45W)",
          os: "Android 13",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "tecno-camon-20-pro-5g",
        brand: "Tecno",
        model: "Camon 20 Pro 5G",
        series: "Camon Series",
        defaultStorageOptions: ["256GB"],
        defaultColors: [{ name: "Dark Welkin", hex: "#232B38" }],
        specs: {
          screen: "6.67-inch AMOLED (120Hz)",
          camera: "64MP RGBW OIS Main Camera",
          chipset: "MediaTek Dimensity 8050",
          batterySize: "5000 mAh",
          os: "Android 13",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "tecno-camon-20-pro",
        brand: "Tecno",
        model: "Camon 20 Pro",
        series: "Camon Series",
        defaultStorageOptions: ["256GB"],
        defaultColors: [{ name: "Predawn Black", hex: "#1C1C1E" }],
        specs: {
          screen: "6.67-inch AMOLED (120Hz)",
          camera: "64MP RGBW Main Camera",
          chipset: "MediaTek Helio G99",
          batterySize: "5000 mAh",
          os: "Android 13",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "tecno-camon-20",
        brand: "Tecno",
        model: "Camon 20",
        series: "Camon Series",
        defaultStorageOptions: ["256GB"],
        defaultColors: [{ name: "Predawn Black", hex: "#1C1C1E" }],
        specs: {
          screen: "6.67-inch AMOLED",
          camera: "64MP Main Camera",
          chipset: "MediaTek Helio G85",
          batterySize: "5000 mAh",
          os: "Android 13",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "tecno-phantom-v-fold",
        brand: "Tecno",
        model: "Phantom V Fold",
        series: "Phantom Series",
        defaultStorageOptions: ["256GB", "512GB"],
        defaultColors: [{ name: "Black", hex: "#1C1C1E" }],
        specs: {
          screen: "7.85-inch Foldable LTPO AMOLED (120Hz)",
          camera: "50MP Main + 50MP Telephoto + 13MP UltraWide",
          chipset: "MediaTek Dimensity 9000+",
          batterySize: "5000 mAh (45W)",
          os: "Android 13",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "tecno-phantom-v-flip",
        brand: "Tecno",
        model: "Phantom V Flip",
        series: "Phantom Series",
        defaultStorageOptions: ["256GB"],
        defaultColors: [{ name: "Iconic Black", hex: "#1C1C1E" }],
        specs: {
          screen: "6.9-inch Foldable LTPO AMOLED (120Hz)",
          camera: "64MP Main + 13MP UltraWide",
          chipset: "MediaTek Dimensity 8050",
          batterySize: "4000 mAh (45W)",
          os: "Android 13",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "tecno-spark-20-pro-plus",
        brand: "Tecno",
        model: "Spark 20 Pro+",
        series: "Spark Series",
        defaultStorageOptions: ["256GB"],
        defaultColors: [{ name: "Temporal Orbits", hex: "#1C1C1E" }],
        specs: {
          screen: "6.78-inch Curved AMOLED (120Hz)",
          camera: "108MP Ultra-Sensing Main Camera",
          chipset: "MediaTek Helio G99 Ultimate",
          batterySize: "5000 mAh (33W)",
          os: "Android 14",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "tecno-spark-20-pro",
        brand: "Tecno",
        model: "Spark 20 Pro",
        series: "Spark Series",
        defaultStorageOptions: ["256GB"],
        defaultColors: [{ name: "Moonlit Black", hex: "#1C1C1E" }],
        specs: {
          screen: "6.78-inch FHD+ IPS LCD (120Hz)",
          camera: "108MP Main Camera",
          chipset: "MediaTek Helio G99",
          batterySize: "5000 mAh (33W)",
          os: "Android 13",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "tecno-spark-20",
        brand: "Tecno",
        model: "Spark 20",
        series: "Spark Series",
        defaultStorageOptions: ["128GB", "256GB"],
        defaultColors: [{ name: "Gravity Black", hex: "#1C1C1E" }],
        specs: {
          screen: "6.56-inch HD+ (90Hz)",
          camera: "50MP Main Camera",
          chipset: "MediaTek Helio G85",
          batterySize: "5000 mAh",
          os: "Android 13",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      },
      {
        id: "tecno-pova-6-pro",
        brand: "Tecno",
        model: "Pova 6 Pro",
        series: "Pova Series",
        defaultStorageOptions: ["256GB"],
        defaultColors: [{ name: "Comet Green", hex: "#2E5B3D" }],
        specs: {
          screen: "6.78-inch AMOLED (120Hz)",
          camera: "108MP Ultra-Clear Main Camera",
          chipset: "MediaTek Dimensity 6080 5G",
          batterySize: "6000 mAh (70W Fast Charge)",
          os: "Android 14",
          warranty: "1-Year Warranty",
          simType: "Dual SIM"
        }
      }
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
 * Finds exact phone model spec details in database.
 */
export function getPhoneModelDetails(brandName: string, modelName: string): PhoneModelItem | undefined {
  const models = getModelsForBrand(brandName);
  if (!models.length) return undefined;
  
  const normModel = modelName.trim().toLowerCase();
  return models.find(m => m.model.toLowerCase() === normModel);
}
