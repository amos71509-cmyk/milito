export interface PhoneModelSpec {
  model: string;
  series: string;
  screen: string;
  screenSize: string;
  refreshRate: string;
  chipset: string;
  camera: string;
  frontCamera: string;
  batterySize: string;
  os: string;
  simType: string;
  network: string;
  has5G: boolean;
  defaultStorageOptions: string[];
  defaultRamOptions?: string[];
  knownColors: { name: string; hex: string }[];
}

export interface PhoneSeries {
  seriesName: string;
  models: PhoneModelSpec[];
}

export interface PhoneBrandCatalog {
  brandId: string;
  brandName: string;
  logo: string;
  tag: string;
  bg: string;
  seriesList: PhoneSeries[];
}

export const PHONE_CATALOG: PhoneBrandCatalog[] = [
  {
    brandId: "Apple",
    brandName: "Apple",
    logo: "🍎",
    tag: "iPhone Series • iOS",
    bg: "from-gray-900 to-black",
    seriesList: [
      {
        seriesName: "iPhone 16 Series",
        models: [
          {
            model: "iPhone 16 Pro Max",
            series: "iPhone 16 Series",
            screen: "6.9-inch Super Retina XDR OLED (120Hz ProMotion)",
            screenSize: "6.9-inch",
            refreshRate: "120Hz LTPO",
            chipset: "Apple A18 Pro Bionic (3nm)",
            camera: "48MP Fusion + 48MP UltraWide + 12MP 5x Telephoto",
            frontCamera: "12MP TrueDepth",
            batterySize: "4685 mAh (MagSafe 25W)",
            os: "iOS 18",
            simType: "Physical Nano SIM + eSIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["256GB", "512GB", "1TB"],
            defaultRamOptions: ["8GB"],
            knownColors: [
              { name: "Desert Titanium", hex: "#C2A88F" },
              { name: "Natural Titanium", hex: "#8F8B82" },
              { name: "White Titanium", hex: "#F2F1EC" },
              { name: "Black Titanium", hex: "#232325" }
            ]
          },
          {
            model: "iPhone 16 Pro",
            series: "iPhone 16 Series",
            screen: "6.3-inch Super Retina XDR OLED (120Hz ProMotion)",
            screenSize: "6.3-inch",
            refreshRate: "120Hz LTPO",
            chipset: "Apple A18 Pro Bionic (3nm)",
            camera: "48MP Fusion + 48MP UltraWide + 12MP 5x Telephoto",
            frontCamera: "12MP TrueDepth",
            batterySize: "3582 mAh (MagSafe 25W)",
            os: "iOS 18",
            simType: "Physical Nano SIM + eSIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["128GB", "256GB", "512GB", "1TB"],
            defaultRamOptions: ["8GB"],
            knownColors: [
              { name: "Desert Titanium", hex: "#C2A88F" },
              { name: "Natural Titanium", hex: "#8F8B82" },
              { name: "White Titanium", hex: "#F2F1EC" },
              { name: "Black Titanium", hex: "#232325" }
            ]
          },
          {
            model: "iPhone 16 Plus",
            series: "iPhone 16 Series",
            screen: "6.7-inch Super Retina XDR OLED",
            screenSize: "6.7-inch",
            refreshRate: "60Hz",
            chipset: "Apple A18 Bionic (3nm)",
            camera: "48MP Fusion + 12MP UltraWide",
            frontCamera: "12MP TrueDepth",
            batterySize: "4674 mAh",
            os: "iOS 18",
            simType: "Physical Nano SIM + eSIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["128GB", "256GB", "512GB"],
            defaultRamOptions: ["8GB"],
            knownColors: [
              { name: "Ultramarine", hex: "#3B5282" },
              { name: "Teal", hex: "#819C9A" },
              { name: "Pink", hex: "#E3A3B4" },
              { name: "White", hex: "#F5F5F0" },
              { name: "Black", hex: "#1C1C1E" }
            ]
          },
          {
            model: "iPhone 16",
            series: "iPhone 16 Series",
            screen: "6.1-inch Super Retina XDR OLED",
            screenSize: "6.1-inch",
            refreshRate: "60Hz",
            chipset: "Apple A18 Bionic (3nm)",
            camera: "48MP Fusion + 12MP UltraWide",
            frontCamera: "12MP TrueDepth",
            batterySize: "3561 mAh",
            os: "iOS 18",
            simType: "Physical Nano SIM + eSIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["128GB", "256GB", "512GB"],
            defaultRamOptions: ["8GB"],
            knownColors: [
              { name: "Ultramarine", hex: "#3B5282" },
              { name: "Teal", hex: "#819C9A" },
              { name: "Pink", hex: "#E3A3B4" },
              { name: "White", hex: "#F5F5F0" },
              { name: "Black", hex: "#1C1C1E" }
            ]
          }
        ]
      },
      {
        seriesName: "iPhone 15 Series",
        models: [
          {
            model: "iPhone 15 Pro Max",
            series: "iPhone 15 Series",
            screen: "6.7-inch Super Retina XDR OLED (120Hz ProMotion)",
            screenSize: "6.7-inch",
            refreshRate: "120Hz LTPO",
            chipset: "Apple A17 Pro Bionic (3nm)",
            camera: "48MP Main + 12MP UltraWide + 12MP 5x Telephoto",
            frontCamera: "12MP TrueDepth",
            batterySize: "4422 mAh",
            os: "iOS 17",
            simType: "Physical Nano SIM + eSIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["256GB", "512GB", "1TB"],
            defaultRamOptions: ["8GB"],
            knownColors: [
              { name: "Natural Titanium", hex: "#8F8B82" },
              { name: "Blue Titanium", hex: "#2C3E50" },
              { name: "White Titanium", hex: "#F2F1EC" },
              { name: "Black Titanium", hex: "#232325" }
            ]
          },
          {
            model: "iPhone 15 Pro",
            series: "iPhone 15 Series",
            screen: "6.1-inch Super Retina XDR OLED (120Hz ProMotion)",
            screenSize: "6.1-inch",
            refreshRate: "120Hz LTPO",
            chipset: "Apple A17 Pro Bionic (3nm)",
            camera: "48MP Main + 12MP UltraWide + 12MP 3x Telephoto",
            frontCamera: "12MP TrueDepth",
            batterySize: "3274 mAh",
            os: "iOS 17",
            simType: "Physical Nano SIM + eSIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["128GB", "256GB", "512GB", "1TB"],
            defaultRamOptions: ["8GB"],
            knownColors: [
              { name: "Natural Titanium", hex: "#8F8B82" },
              { name: "Blue Titanium", hex: "#2C3E50" },
              { name: "White Titanium", hex: "#F2F1EC" },
              { name: "Black Titanium", hex: "#232325" }
            ]
          },
          {
            model: "iPhone 15 Plus",
            series: "iPhone 15 Series",
            screen: "6.7-inch Super Retina XDR OLED Dynamic Island",
            screenSize: "6.7-inch",
            refreshRate: "60Hz",
            chipset: "Apple A16 Bionic",
            camera: "48MP Main + 12MP UltraWide",
            frontCamera: "12MP TrueDepth",
            batterySize: "4383 mAh",
            os: "iOS 17",
            simType: "Physical Nano SIM + eSIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["128GB", "256GB", "512GB"],
            defaultRamOptions: ["6GB"],
            knownColors: [
              { name: "Black", hex: "#1C1C1E" },
              { name: "Blue", hex: "#D1E2EC" },
              { name: "Green", hex: "#D0E3D4" },
              { name: "Yellow", hex: "#F5E6AA" },
              { name: "Pink", hex: "#F6D2D6" }
            ]
          },
          {
            model: "iPhone 15",
            series: "iPhone 15 Series",
            screen: "6.1-inch Super Retina XDR OLED Dynamic Island",
            screenSize: "6.1-inch",
            refreshRate: "60Hz",
            chipset: "Apple A16 Bionic",
            camera: "48MP Main + 12MP UltraWide",
            frontCamera: "12MP TrueDepth",
            batterySize: "3349 mAh",
            os: "iOS 17",
            simType: "Physical Nano SIM + eSIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["128GB", "256GB", "512GB"],
            defaultRamOptions: ["6GB"],
            knownColors: [
              { name: "Black", hex: "#1C1C1E" },
              { name: "Blue", hex: "#D1E2EC" },
              { name: "Green", hex: "#D0E3D4" },
              { name: "Yellow", hex: "#F5E6AA" },
              { name: "Pink", hex: "#F6D2D6" }
            ]
          }
        ]
      },
      {
        seriesName: "iPhone 14 Series",
        models: [
          {
            model: "iPhone 14 Pro Max",
            series: "iPhone 14 Series",
            screen: "6.7-inch Super Retina XDR OLED (120Hz Dynamic Island)",
            screenSize: "6.7-inch",
            refreshRate: "120Hz LTPO",
            chipset: "Apple A16 Bionic",
            camera: "48MP Main + 12MP UltraWide + 12MP 3x Telephoto",
            frontCamera: "12MP TrueDepth",
            batterySize: "4323 mAh",
            os: "iOS 16",
            simType: "Physical Nano SIM + eSIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["128GB", "256GB", "512GB", "1TB"],
            defaultRamOptions: ["6GB"],
            knownColors: [
              { name: "Deep Purple", hex: "#483D8B" },
              { name: "Space Black", hex: "#1C1C1E" },
              { name: "Gold", hex: "#D4AF37" },
              { name: "Silver", hex: "#F0F0ED" }
            ]
          },
          {
            model: "iPhone 14 Pro",
            series: "iPhone 14 Series",
            screen: "6.1-inch Super Retina XDR OLED (120Hz Dynamic Island)",
            screenSize: "6.1-inch",
            refreshRate: "120Hz LTPO",
            chipset: "Apple A16 Bionic",
            camera: "48MP Main + 12MP UltraWide + 12MP 3x Telephoto",
            frontCamera: "12MP TrueDepth",
            batterySize: "3200 mAh",
            os: "iOS 16",
            simType: "Physical Nano SIM + eSIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["128GB", "256GB", "512GB", "1TB"],
            defaultRamOptions: ["6GB"],
            knownColors: [
              { name: "Deep Purple", hex: "#483D8B" },
              { name: "Space Black", hex: "#1C1C1E" },
              { name: "Gold", hex: "#D4AF37" },
              { name: "Silver", hex: "#F0F0ED" }
            ]
          },
          {
            model: "iPhone 14 Plus",
            series: "iPhone 14 Series",
            screen: "6.7-inch Super Retina XDR OLED",
            screenSize: "6.7-inch",
            refreshRate: "60Hz",
            chipset: "Apple A15 Bionic (5-core GPU)",
            camera: "12MP Main + 12MP UltraWide",
            frontCamera: "12MP TrueDepth",
            batterySize: "4325 mAh",
            os: "iOS 16",
            simType: "Physical Nano SIM + eSIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["128GB", "256GB", "512GB"],
            defaultRamOptions: ["6GB"],
            knownColors: [
              { name: "Midnight", hex: "#191970" },
              { name: "Starlight", hex: "#F5F5F0" },
              { name: "Blue", hex: "#A0C4DF" },
              { name: "Purple", hex: "#D8D4F0" },
              { name: "(PRODUCT)RED", hex: "#BA0C2F" }
            ]
          },
          {
            model: "iPhone 14",
            series: "iPhone 14 Series",
            screen: "6.1-inch Super Retina XDR OLED",
            screenSize: "6.1-inch",
            refreshRate: "60Hz",
            chipset: "Apple A15 Bionic (5-core GPU)",
            camera: "12MP Main + 12MP UltraWide",
            frontCamera: "12MP TrueDepth",
            batterySize: "3279 mAh",
            os: "iOS 16",
            simType: "Physical Nano SIM + eSIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["128GB", "256GB", "512GB"],
            defaultRamOptions: ["6GB"],
            knownColors: [
              { name: "Midnight", hex: "#191970" },
              { name: "Starlight", hex: "#F5F5F0" },
              { name: "Blue", hex: "#A0C4DF" },
              { name: "Purple", hex: "#D8D4F0" },
              { name: "(PRODUCT)RED", hex: "#BA0C2F" }
            ]
          }
        ]
      },
      {
        seriesName: "iPhone 13 Series",
        models: [
          {
            model: "iPhone 13 Pro Max",
            series: "iPhone 13 Series",
            screen: "6.7-inch Super Retina XDR OLED (120Hz ProMotion)",
            screenSize: "6.7-inch",
            refreshRate: "120Hz LTPO",
            chipset: "Apple A15 Bionic",
            camera: "12MP Main + 12MP UltraWide + 12MP 3x Telephoto",
            frontCamera: "12MP TrueDepth",
            batterySize: "4352 mAh",
            os: "iOS 15",
            simType: "Physical Nano SIM + eSIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["128GB", "256GB", "512GB", "1TB"],
            defaultRamOptions: ["6GB"],
            knownColors: [
              { name: "Sierra Blue", hex: "#A2C3D2" },
              { name: "Graphite", hex: "#3B3B3C" },
              { name: "Gold", hex: "#F2E3C6" },
              { name: "Silver", hex: "#F1F2ED" },
              { name: "Alpine Green", hex: "#506351" }
            ]
          },
          {
            model: "iPhone 13 Pro",
            series: "iPhone 13 Series",
            screen: "6.1-inch Super Retina XDR OLED (120Hz ProMotion)",
            screenSize: "6.1-inch",
            refreshRate: "120Hz LTPO",
            chipset: "Apple A15 Bionic",
            camera: "12MP Main + 12MP UltraWide + 12MP 3x Telephoto",
            frontCamera: "12MP TrueDepth",
            batterySize: "3095 mAh",
            os: "iOS 15",
            simType: "Physical Nano SIM + eSIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["128GB", "256GB", "512GB", "1TB"],
            defaultRamOptions: ["6GB"],
            knownColors: [
              { name: "Sierra Blue", hex: "#A2C3D2" },
              { name: "Graphite", hex: "#3B3B3C" },
              { name: "Gold", hex: "#F2E3C6" },
              { name: "Silver", hex: "#F1F2ED" }
            ]
          },
          {
            model: "iPhone 13",
            series: "iPhone 13 Series",
            screen: "6.1-inch Super Retina XDR OLED",
            screenSize: "6.1-inch",
            refreshRate: "60Hz",
            chipset: "Apple A15 Bionic",
            camera: "12MP Main + 12MP UltraWide",
            frontCamera: "12MP TrueDepth",
            batterySize: "3227 mAh",
            os: "iOS 15",
            simType: "Physical Nano SIM + eSIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["128GB", "256GB", "512GB"],
            defaultRamOptions: ["4GB"],
            knownColors: [
              { name: "Midnight", hex: "#191970" },
              { name: "Starlight", hex: "#F5F5F0" },
              { name: "Blue", hex: "#436582" },
              { name: "Pink", hex: "#FBE2E5" },
              { name: "Green", hex: "#384A3B" }
            ]
          },
          {
            model: "iPhone 13 mini",
            series: "iPhone 13 Series",
            screen: "5.4-inch Super Retina XDR OLED",
            screenSize: "5.4-inch",
            refreshRate: "60Hz",
            chipset: "Apple A15 Bionic",
            camera: "12MP Main + 12MP UltraWide",
            frontCamera: "12MP TrueDepth",
            batterySize: "2438 mAh",
            os: "iOS 15",
            simType: "Physical Nano SIM + eSIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["128GB", "256GB", "512GB"],
            defaultRamOptions: ["4GB"],
            knownColors: [
              { name: "Midnight", hex: "#191970" },
              { name: "Starlight", hex: "#F5F5F0" },
              { name: "Blue", hex: "#436582" }
            ]
          }
        ]
      },
      {
        seriesName: "iPhone 12 Series & Older",
        models: [
          {
            model: "iPhone 12 Pro Max",
            series: "iPhone 12 Series & Older",
            screen: "6.7-inch Super Retina XDR OLED",
            screenSize: "6.7-inch",
            refreshRate: "60Hz",
            chipset: "Apple A14 Bionic",
            camera: "12MP Triple Camera",
            frontCamera: "12MP TrueDepth",
            batterySize: "3687 mAh",
            os: "iOS 14",
            simType: "Physical Nano SIM + eSIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["128GB", "256GB", "512GB"],
            defaultRamOptions: ["6GB"],
            knownColors: [
              { name: "Pacific Blue", hex: "#2B4C59" },
              { name: "Graphite", hex: "#464646" },
              { name: "Gold", hex: "#F3E3C3" }
            ]
          },
          {
            model: "iPhone 12 Pro",
            series: "iPhone 12 Series & Older",
            screen: "6.1-inch Super Retina XDR OLED",
            screenSize: "6.1-inch",
            refreshRate: "60Hz",
            chipset: "Apple A14 Bionic",
            camera: "12MP Triple Camera",
            frontCamera: "12MP TrueDepth",
            batterySize: "2815 mAh",
            os: "iOS 14",
            simType: "Physical Nano SIM + eSIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["128GB", "256GB", "512GB"],
            defaultRamOptions: ["6GB"],
            knownColors: [
              { name: "Pacific Blue", hex: "#2B4C59" },
              { name: "Graphite", hex: "#464646" },
              { name: "Silver", hex: "#F1F2ED" }
            ]
          },
          {
            model: "iPhone 12",
            series: "iPhone 12 Series & Older",
            screen: "6.1-inch Super Retina XDR OLED",
            screenSize: "6.1-inch",
            refreshRate: "60Hz",
            chipset: "Apple A14 Bionic",
            camera: "12MP Dual Camera",
            frontCamera: "12MP TrueDepth",
            batterySize: "2815 mAh",
            os: "iOS 14",
            simType: "Physical Nano SIM + eSIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["64GB", "128GB", "256GB"],
            defaultRamOptions: ["4GB"],
            knownColors: [
              { name: "Black", hex: "#1C1C1E" },
              { name: "White", hex: "#F5F5F0" },
              { name: "Blue", hex: "#1D4E89" },
              { name: "Green", hex: "#B8D8BA" }
            ]
          },
          {
            model: "iPhone 11 Pro Max",
            series: "iPhone 12 Series & Older",
            screen: "6.5-inch Super Retina XDR OLED",
            screenSize: "6.5-inch",
            refreshRate: "60Hz",
            chipset: "Apple A13 Bionic",
            camera: "12MP Triple Camera",
            frontCamera: "12MP TrueDepth",
            batterySize: "3969 mAh",
            os: "iOS 13",
            simType: "Physical Nano SIM + eSIM",
            network: "4G LTE",
            has5G: false,
            defaultStorageOptions: ["64GB", "256GB", "512GB"],
            defaultRamOptions: ["4GB"],
            knownColors: [
              { name: "Midnight Green", hex: "#4E5851" },
              { name: "Space Gray", hex: "#535150" },
              { name: "Gold", hex: "#EADDC7" },
              { name: "Silver", hex: "#EBEBEB" }
            ]
          },
          {
            model: "iPhone 11",
            series: "iPhone 12 Series & Older",
            screen: "6.1-inch Liquid Retina HD LCD",
            screenSize: "6.1-inch",
            refreshRate: "60Hz",
            chipset: "Apple A13 Bionic",
            camera: "12MP Dual Camera",
            frontCamera: "12MP TrueDepth",
            batterySize: "3110 mAh",
            os: "iOS 13",
            simType: "Physical Nano SIM + eSIM",
            network: "4G LTE",
            has5G: false,
            defaultStorageOptions: ["64GB", "128GB", "256GB"],
            defaultRamOptions: ["4GB"],
            knownColors: [
              { name: "Black", hex: "#1C1C1E" },
              { name: "White", hex: "#F5F5F0" },
              { name: "Purple", hex: "#D1C4E9" },
              { name: "Yellow", hex: "#FFF59D" },
              { name: "Green", hex: "#B2DFDB" }
            ]
          },
          {
            model: "iPhone XR",
            series: "iPhone 12 Series & Older",
            screen: "6.1-inch Liquid Retina LCD",
            screenSize: "6.1-inch",
            refreshRate: "60Hz",
            chipset: "Apple A12 Bionic",
            camera: "12MP Single Camera",
            frontCamera: "7MP TrueDepth",
            batterySize: "2942 mAh",
            os: "iOS 12",
            simType: "Physical Nano SIM",
            network: "4G LTE",
            has5G: false,
            defaultStorageOptions: ["64GB", "128GB"],
            defaultRamOptions: ["3GB"],
            knownColors: [
              { name: "Black", hex: "#1C1C1E" },
              { name: "White", hex: "#F5F5F0" },
              { name: "Coral", hex: "#FF6F61" },
              { name: "Blue", hex: "#4A90E2" }
            ]
          }
        ]
      }
    ]
  },
  {
    brandId: "Samsung",
    brandName: "Samsung",
    logo: "🌌",
    tag: "Galaxy S • Z • A • Note",
    bg: "from-blue-900/80 to-slate-900",
    seriesList: [
      {
        seriesName: "Galaxy S Series",
        models: [
          {
            model: "Galaxy S24 Ultra",
            series: "Galaxy S Series",
            screen: "6.8-inch Dynamic AMOLED 2X 120Hz LTPO",
            screenSize: "6.8-inch",
            refreshRate: "120Hz LTPO",
            chipset: "Snapdragon 8 Gen 3 for Galaxy",
            camera: "200MP Quad Camera + 100x Space Zoom",
            frontCamera: "12MP Dual Pixel",
            batterySize: "5000 mAh (45W Super Fast Charging)",
            os: "Android 14 / One UI 6.1",
            simType: "Dual Physical SIM + eSIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["256GB", "512GB", "1TB"],
            defaultRamOptions: ["12GB"],
            knownColors: [
              { name: "Titanium Gray", hex: "#6B7280" },
              { name: "Titanium Black", hex: "#18181B" },
              { name: "Titanium Violet", hex: "#7E22CE" },
              { name: "Titanium Yellow", hex: "#EAB308" }
            ]
          },
          {
            model: "Galaxy S24+",
            series: "Galaxy S Series",
            screen: "6.7-inch Dynamic AMOLED 2X 120Hz",
            screenSize: "6.7-inch",
            refreshRate: "120Hz",
            chipset: "Exynos 2400 / Snapdragon 8 Gen 3",
            camera: "50MP Triple Camera",
            frontCamera: "12MP",
            batterySize: "4900 mAh (45W Charge)",
            os: "Android 14 / One UI 6.1",
            simType: "Dual Nano SIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["256GB", "512GB"],
            defaultRamOptions: ["12GB"],
            knownColors: [
              { name: "Onyx Black", hex: "#1C1C1E" },
              { name: "Marble Gray", hex: "#D1D5DB" },
              { name: "Cobalt Violet", hex: "#4338CA" }
            ]
          },
          {
            model: "Galaxy S24",
            series: "Galaxy S Series",
            screen: "6.2-inch Dynamic AMOLED 2X 120Hz",
            screenSize: "6.2-inch",
            refreshRate: "120Hz",
            chipset: "Exynos 2400 / Snapdragon 8 Gen 3",
            camera: "50MP Triple Camera",
            frontCamera: "12MP",
            batterySize: "4000 mAh (25W Charge)",
            os: "Android 14 / One UI 6.1",
            simType: "Dual Nano SIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["128GB", "256GB", "512GB"],
            defaultRamOptions: ["8GB"],
            knownColors: [
              { name: "Onyx Black", hex: "#1C1C1E" },
              { name: "Amber Yellow", hex: "#FACC15" },
              { name: "Cobalt Violet", hex: "#4338CA" }
            ]
          },
          {
            model: "Galaxy S23 Ultra",
            series: "Galaxy S Series",
            screen: "6.8-inch Dynamic AMOLED 2X 120Hz",
            screenSize: "6.8-inch",
            refreshRate: "120Hz LTPO",
            chipset: "Snapdragon 8 Gen 2 for Galaxy",
            camera: "200MP Quad Camera + 100x Zoom",
            frontCamera: "12MP",
            batterySize: "5000 mAh",
            os: "Android 13 / One UI 5.1",
            simType: "Dual Nano SIM + eSIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["256GB", "512GB", "1TB"],
            defaultRamOptions: ["8GB", "12GB"],
            knownColors: [
              { name: "Phantom Black", hex: "#18181B" },
              { name: "Green", hex: "#3B4D3C" },
              { name: "Cream", hex: "#F5F2EB" },
              { name: "Lavender", hex: "#D8C7D8" }
            ]
          },
          {
            model: "Galaxy S23 FE",
            series: "Galaxy S Series",
            screen: "6.4-inch Dynamic AMOLED 2X 120Hz",
            screenSize: "6.4-inch",
            refreshRate: "120Hz",
            chipset: "Exynos 2200 / Snapdragon 8 Gen 1",
            camera: "50MP Triple Camera",
            frontCamera: "10MP",
            batterySize: "4500 mAh",
            os: "Android 13",
            simType: "Dual Nano SIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["128GB", "256GB"],
            defaultRamOptions: ["8GB"],
            knownColors: [
              { name: "Mint", hex: "#A8E6CF" },
              { name: "Graphite", hex: "#333333" },
              { name: "Purple", hex: "#9C27B0" }
            ]
          },
          {
            model: "Galaxy S22 Ultra",
            series: "Galaxy S Series",
            screen: "6.8-inch Dynamic AMOLED 2X 120Hz",
            screenSize: "6.8-inch",
            refreshRate: "120Hz LTPO",
            chipset: "Snapdragon 8 Gen 1 / Exynos 2200",
            camera: "108MP Quad Camera + 100x Zoom",
            frontCamera: "40MP",
            batterySize: "5000 mAh",
            os: "Android 12",
            simType: "Dual Nano SIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["128GB", "256GB", "512GB"],
            defaultRamOptions: ["8GB", "12GB"],
            knownColors: [
              { name: "Phantom Black", hex: "#18181B" },
              { name: "Burgundy", hex: "#501B28" },
              { name: "Green", hex: "#2E473B" }
            ]
          }
        ]
      },
      {
        seriesName: "Galaxy Z Fold & Flip Series",
        models: [
          {
            model: "Galaxy Z Fold 6",
            series: "Galaxy Z Fold & Flip Series",
            screen: "7.6-inch Dynamic AMOLED 2X Foldable 120Hz",
            screenSize: "7.6-inch",
            refreshRate: "120Hz LTPO",
            chipset: "Snapdragon 8 Gen 3 for Galaxy",
            camera: "50MP Triple Pro Camera",
            frontCamera: "10MP Cover + 4MP Under Display",
            batterySize: "4400 mAh",
            os: "Android 14 / One UI 6.1.1",
            simType: "Dual Nano SIM + eSIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["256GB", "512GB", "1TB"],
            defaultRamOptions: ["12GB"],
            knownColors: [
              { name: "Navy", hex: "#1D2A44" },
              { name: "Silver Shadow", hex: "#C5C7CA" },
              { name: "Pink", hex: "#F3D3D9" }
            ]
          },
          {
            model: "Galaxy Z Flip 6",
            series: "Galaxy Z Fold & Flip Series",
            screen: "6.7-inch Dynamic AMOLED 2X Foldable 120Hz",
            screenSize: "6.7-inch",
            refreshRate: "120Hz",
            chipset: "Snapdragon 8 Gen 3 for Galaxy",
            camera: "50MP Dual Camera",
            frontCamera: "10MP",
            batterySize: "4000 mAh",
            os: "Android 14",
            simType: "Nano SIM + eSIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["256GB", "512GB"],
            defaultRamOptions: ["12GB"],
            knownColors: [
              { name: "Blue", hex: "#8DA4C4" },
              { name: "Mint", hex: "#BEE5D3" },
              { name: "Yellow", hex: "#F7E38B" },
              { name: "Shadow Gray", hex: "#4B4D52" }
            ]
          },
          {
            model: "Galaxy Z Fold 5",
            series: "Galaxy Z Fold & Flip Series",
            screen: "7.6-inch Dynamic AMOLED 2X 120Hz",
            screenSize: "7.6-inch",
            refreshRate: "120Hz",
            chipset: "Snapdragon 8 Gen 2 for Galaxy",
            camera: "50MP Triple Camera",
            frontCamera: "10MP Cover + 4MP Under Display",
            batterySize: "4400 mAh",
            os: "Android 13",
            simType: "Dual Nano SIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["256GB", "512GB", "1TB"],
            defaultRamOptions: ["12GB"],
            knownColors: [
              { name: "Icy Blue", hex: "#A8C3D8" },
              { name: "Phantom Black", hex: "#18181B" },
              { name: "Cream", hex: "#F5F2EB" }
            ]
          }
        ]
      },
      {
        seriesName: "Galaxy A & Note Series",
        models: [
          {
            model: "Galaxy A55 5G",
            series: "Galaxy A & Note Series",
            screen: "6.6-inch Super AMOLED 120Hz",
            screenSize: "6.6-inch",
            refreshRate: "120Hz",
            chipset: "Exynos 1480 (4nm)",
            camera: "50MP OIS Triple Camera",
            frontCamera: "32MP",
            batterySize: "5000 mAh (25W Fast Charge)",
            os: "Android 14 / One UI 6.1",
            simType: "Dual Nano SIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["128GB", "256GB"],
            defaultRamOptions: ["8GB", "12GB"],
            knownColors: [
              { name: "Awesome Iceblue", hex: "#C7E5F0" },
              { name: "Awesome Navy", hex: "#1B2A4A" },
              { name: "Awesome Lilac", hex: "#E3D5E8" },
              { name: "Awesome Lemon", hex: "#EBF1B2" }
            ]
          },
          {
            model: "Galaxy A35 5G",
            series: "Galaxy A & Note Series",
            screen: "6.6-inch Super AMOLED 120Hz",
            screenSize: "6.6-inch",
            refreshRate: "120Hz",
            chipset: "Exynos 1380",
            camera: "50MP Triple Camera",
            frontCamera: "13MP",
            batterySize: "5000 mAh",
            os: "Android 14",
            simType: "Dual Nano SIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["128GB", "256GB"],
            defaultRamOptions: ["6GB", "8GB"],
            knownColors: [
              { name: "Awesome Iceblue", hex: "#C7E5F0" },
              { name: "Awesome Navy", hex: "#1B2A4A" }
            ]
          },
          {
            model: "Galaxy A15 5G",
            series: "Galaxy A & Note Series",
            screen: "6.5-inch Super AMOLED 90Hz",
            screenSize: "6.5-inch",
            refreshRate: "90Hz",
            chipset: "MediaTek Dimensity 6100+",
            camera: "50MP Triple Camera",
            frontCamera: "13MP",
            batterySize: "5000 mAh",
            os: "Android 14",
            simType: "Dual Nano SIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["128GB", "256GB"],
            defaultRamOptions: ["4GB", "6GB", "8GB"],
            knownColors: [
              { name: "Brave Black", hex: "#1C1C1E" },
              { name: "Optimistic Blue", hex: "#8DA4C4" }
            ]
          },
          {
            model: "Galaxy Note 20 Ultra",
            series: "Galaxy A & Note Series",
            screen: "6.9-inch Dynamic AMOLED 2X 120Hz",
            screenSize: "6.9-inch",
            refreshRate: "120Hz",
            chipset: "Snapdragon 865+ / Exynos 990",
            camera: "108MP Triple Camera + 50x Zoom",
            frontCamera: "10MP",
            batterySize: "4500 mAh (S-Pen Included)",
            os: "Android 10 (Upgradable)",
            simType: "Dual Nano SIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["128GB", "256GB", "512GB"],
            defaultRamOptions: ["12GB"],
            knownColors: [
              { name: "Mystic Bronze", hex: "#9E6D5D" },
              { name: "Mystic Black", hex: "#1C1C1E" },
              { name: "Mystic White", hex: "#F0F0ED" }
            ]
          }
        ]
      }
    ]
  },
  {
    brandId: "Tecno",
    brandName: "Tecno",
    logo: "⚡",
    tag: "PHANTOM • CAMON • POVA • SPARK • POP",
    bg: "from-emerald-900/60 to-slate-900",
    seriesList: [
      {
        seriesName: "CAMON Series",
        models: [
          {
            model: "Tecno Camon 30 Premier 5G",
            series: "CAMON Series",
            screen: "6.77-inch 1.5K LTPO AMOLED 120Hz",
            screenSize: "6.77-inch",
            refreshRate: "120Hz LTPO",
            chipset: "MediaTek Dimensity 8200 Ultimate 5G",
            camera: "50MP Sony IMX890 OIS + 50MP Periscope 70mm + 50MP UltraWide",
            frontCamera: "50MP Eye-AF Front",
            batterySize: "5000 mAh (70W Ultra Charge)",
            os: "HiOS 14 (Android 14)",
            simType: "Dual Nano SIM",
            network: "5G / 4G LTE",
            has5G: true,
            defaultStorageOptions: ["512GB"],
            defaultRamOptions: ["12GB"],
            knownColors: [
              { name: "Alps Snowy Silver", hex: "#D8DCE0" },
              { name: "Hawaii Lava Black", hex: "#1C1C1E" }
            ]
          },
          {
            model: "Tecno Camon 30 Pro 5G",
            series: "CAMON Series",
            screen: "6.78-inch AMOLED 144Hz",
            screenSize: "6.78-inch",
            refreshRate: "144Hz",
            chipset: "MediaTek Dimensity 8200 Ultimate 5G",
            camera: "50MP OIS Triple Camera",
            frontCamera: "50MP Eye Tracking",
            batterySize: "5000 mAh (70W Ultra Charge)",
            os: "HiOS 14 (Android 14)",
            simType: "Dual Nano SIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["256GB", "512GB"],
            defaultRamOptions: ["12GB"],
            knownColors: [
              { name: "Iceland Basalt Black", hex: "#1C1C1E" },
              { name: "Alps Snowy Silver", hex: "#D8DCE0" }
            ]
          },
          {
            model: "Tecno Camon 30 5G",
            series: "CAMON Series",
            screen: "6.78-inch AMOLED 120Hz",
            screenSize: "6.78-inch",
            refreshRate: "120Hz",
            chipset: "MediaTek Dimensity 7020 5G",
            camera: "50MP OIS Ultra-Clear Camera",
            frontCamera: "50MP Eye-AF",
            batterySize: "5000 mAh (70W Fast Charge)",
            os: "HiOS 14 (Android 14)",
            simType: "Dual Nano SIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["256GB", "512GB"],
            defaultRamOptions: ["8GB", "12GB"],
            knownColors: [
              { name: "Iceland Basalt Black", hex: "#1C1C1E" },
              { name: "Sahara Sand Gold", hex: "#EADDC7" },
              { name: "Emerald Green", hex: "#2E473B" }
            ]
          },
          {
            model: "Tecno Camon 20 Premier 5G",
            series: "CAMON Series",
            screen: "6.67-inch AMOLED 120Hz",
            screenSize: "6.67-inch",
            refreshRate: "120Hz",
            chipset: "MediaTek Dimensity 8050",
            camera: "50MP RGBW OIS + 108MP UltraWide",
            frontCamera: "32MP Dual Flash",
            batterySize: "5000 mAh (45W Charge)",
            os: "HiOS 13",
            simType: "Dual Nano SIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["512GB"],
            defaultRamOptions: ["8GB"],
            knownColors: [
              { name: "Dark Welkin", hex: "#1C1C1E" },
              { name: "Serenity Blue", hex: "#8DA4C4" }
            ]
          }
        ]
      },
      {
        seriesName: "POVA & PHANTOM Series",
        models: [
          {
            model: "Tecno Pova 6 Pro 5G",
            series: "POVA & PHANTOM Series",
            screen: "6.78-inch AMOLED 120Hz Dynamic Light Arc",
            screenSize: "6.78-inch",
            refreshRate: "120Hz",
            chipset: "MediaTek Dimensity 6080 5G",
            camera: "108MP Ultra Clarity AI Camera",
            frontCamera: "32MP Dual Flash",
            batterySize: "6000 mAh (70W Ultra Charge)",
            os: "HiOS 14 (Android 14)",
            simType: "Dual Nano SIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["256GB"],
            defaultRamOptions: ["8GB", "12GB"],
            knownColors: [
              { name: "Comet Green", hex: "#2E7D32" },
              { name: "Meteor Gray", hex: "#37474F" }
            ]
          },
          {
            model: "Tecno Phantom V Fold",
            series: "POVA & PHANTOM Series",
            screen: "7.85-inch LTPO AMOLED Foldable 120Hz",
            screenSize: "7.85-inch",
            refreshRate: "120Hz LTPO",
            chipset: "MediaTek Dimensity 9000+ Flagship 5G",
            camera: "50MP Triple Pro Camera",
            frontCamera: "32MP Cover + 16MP Inner",
            batterySize: "5000 mAh (66W Fast Charge)",
            os: "HiOS 13 Fold",
            simType: "Dual Nano SIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["256GB", "512GB"],
            defaultRamOptions: ["12GB"],
            knownColors: [
              { name: "Black", hex: "#1C1C1E" },
              { name: "White", hex: "#F5F5F0" }
            ]
          }
        ]
      },
      {
        seriesName: "SPARK & POP Series",
        models: [
          {
            model: "Tecno Spark 20 Pro+",
            series: "SPARK & POP Series",
            screen: "6.78-inch 3D Curved AMOLED 120Hz",
            screenSize: "6.78-inch",
            refreshRate: "120Hz",
            chipset: "MediaTek Helio G99 Ultimate",
            camera: "108MP Ultra-Sensing Camera",
            frontCamera: "32MP Dual Flash",
            batterySize: "5000 mAh (33W Super Charge)",
            os: "HiOS 13.6 (Android 14)",
            simType: "Dual Nano SIM",
            network: "4G LTE",
            has5G: false,
            defaultStorageOptions: ["256GB"],
            defaultRamOptions: ["8GB"],
            knownColors: [
              { name: "Temporal Orbits", hex: "#1C1C1E" },
              { name: "Lunar Frost", hex: "#E0E0E0" },
              { name: "Radiant Starstream", hex: "#E0F7FA" },
              { name: "Magic Skin Green", hex: "#2E7D32" }
            ]
          },
          {
            model: "Tecno Spark 20 Pro",
            series: "SPARK & POP Series",
            screen: "6.78-inch FHD+ 120Hz",
            screenSize: "6.78-inch",
            refreshRate: "120Hz",
            chipset: "MediaTek Helio G99",
            camera: "108MP Ultra-Sensing Camera",
            frontCamera: "32MP Dual Flash",
            batterySize: "5000 mAh (33W Charge)",
            os: "HiOS 13",
            simType: "Dual Nano SIM",
            network: "4G LTE",
            has5G: false,
            defaultStorageOptions: ["256GB"],
            defaultRamOptions: ["8GB", "12GB"],
            knownColors: [
              { name: "Moonlit Black", hex: "#1C1C1E" },
              { name: "Frosty Ivory", hex: "#F5F5F0" }
            ]
          },
          {
            model: "Tecno Pop 8",
            series: "SPARK & POP Series",
            screen: "6.6-inch 90Hz Smart Port Display",
            screenSize: "6.6-inch",
            refreshRate: "90Hz",
            chipset: "Unisoc T606",
            camera: "13MP Dual AI Camera",
            frontCamera: "8MP Dual Flash",
            batterySize: "5000 mAh (10W Charge)",
            os: "Android 13 Go Edition",
            simType: "Dual Nano SIM",
            network: "4G LTE",
            has5G: false,
            defaultStorageOptions: ["64GB", "128GB"],
            defaultRamOptions: ["3GB", "4GB"],
            knownColors: [
              { name: "Mystery White", hex: "#F5F5F0" },
              { name: "Alpenglow Gold", hex: "#EADDC7" },
              { name: "Gravity Black", hex: "#1C1C1E" }
            ]
          }
        ]
      }
    ]
  },
  {
    brandId: "Redmi / Xiaomi",
    brandName: "Redmi / Xiaomi",
    logo: "🧡",
    tag: "Xiaomi • Redmi Note • POCO",
    bg: "from-orange-900/60 to-slate-900",
    seriesList: [
      {
        seriesName: "Redmi Note Series",
        models: [
          {
            model: "Redmi Note 13 Pro+ 5G",
            series: "Redmi Note Series",
            screen: "6.67-inch 1.5K 3D Curved AMOLED 120Hz",
            screenSize: "6.67-inch",
            refreshRate: "120Hz",
            chipset: "MediaTek Dimensity 7200 Ultra (4nm)",
            camera: "200MP OIS Flagship Camera",
            frontCamera: "16MP",
            batterySize: "5000 mAh (120W HyperCharge - 19 mins)",
            os: "Xiaomi HyperOS (Android 14)",
            simType: "Dual Nano SIM + eSIM",
            network: "5G / 4G LTE",
            has5G: true,
            defaultStorageOptions: ["256GB", "512GB"],
            defaultRamOptions: ["8GB", "12GB"],
            knownColors: [
              { name: "Midnight Black", hex: "#18181B" },
              { name: "Moonlight White", hex: "#F4F4F5" },
              { name: "Aurora Purple", hex: "#9333EA" }
            ]
          },
          {
            model: "Redmi Note 13 Pro 5G",
            series: "Redmi Note Series",
            screen: "6.67-inch 1.5K AMOLED 120Hz",
            screenSize: "6.67-inch",
            refreshRate: "120Hz",
            chipset: "Snapdragon 7s Gen 2 (4nm)",
            camera: "200MP OIS Camera",
            frontCamera: "16MP",
            batterySize: "5100 mAh (67W Turbo Charge)",
            os: "Xiaomi HyperOS",
            simType: "Dual Nano SIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["128GB", "256GB", "512GB"],
            defaultRamOptions: ["8GB", "12GB"],
            knownColors: [
              { name: "Midnight Black", hex: "#18181B" },
              { name: "Ocean Teal", hex: "#0D9488" },
              { name: "Aurora Purple", hex: "#9333EA" }
            ]
          },
          {
            model: "Redmi Note 13 4G",
            series: "Redmi Note Series",
            screen: "6.67-inch FHD+ AMOLED 120Hz",
            screenSize: "6.67-inch",
            refreshRate: "120Hz",
            chipset: "Snapdragon 685 (6nm)",
            camera: "108MP Triple Camera",
            frontCamera: "16MP",
            batterySize: "5000 mAh (33W Fast Charge)",
            os: "MIUI 14 / HyperOS Ready",
            simType: "Dual Nano SIM",
            network: "4G LTE",
            has5G: false,
            defaultStorageOptions: ["128GB", "256GB"],
            defaultRamOptions: ["6GB", "8GB"],
            knownColors: [
              { name: "Midnight Black", hex: "#18181B" },
              { name: "Mint Green", hex: "#A7F3D0" },
              { name: "Ice Blue", hex: "#BAE6FD" }
            ]
          },
          {
            model: "Redmi Note 12 Pro+ 5G",
            series: "Redmi Note Series",
            screen: "6.67-inch FHD+ Flow AMOLED 120Hz",
            screenSize: "6.67-inch",
            refreshRate: "120Hz",
            chipset: "MediaTek Dimensity 1080",
            camera: "200MP OIS Camera",
            frontCamera: "16MP",
            batterySize: "5000 mAh (120W Charge)",
            os: "MIUI 14",
            simType: "Dual Nano SIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["256GB"],
            defaultRamOptions: ["8GB", "12GB"],
            knownColors: [
              { name: "Midnight Black", hex: "#18181B" },
              { name: "Polar White", hex: "#F4F4F5" },
              { name: "Sky Blue", hex: "#38BDF8" }
            ]
          }
        ]
      },
      {
        seriesName: "Xiaomi Flagship Series",
        models: [
          {
            model: "Xiaomi 14 Ultra",
            series: "Xiaomi Flagship Series",
            screen: "6.73-inch WQHD+ LTPO AMOLED 120Hz 3000nits",
            screenSize: "6.73-inch",
            refreshRate: "120Hz LTPO",
            chipset: "Snapdragon 8 Gen 3 Flagship",
            camera: "Leica Quad 50MP 1-inch Stepless Variable Aperture",
            frontCamera: "32MP Leica",
            batterySize: "5000 mAh (90W HyperCharge + 80W Wireless)",
            os: "Xiaomi HyperOS",
            simType: "Dual Nano SIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["256GB", "512GB", "1TB"],
            defaultRamOptions: ["12GB", "16GB"],
            knownColors: [
              { name: "Black Vegan Leather", hex: "#18181B" },
              { name: "White Vegan Leather", hex: "#F4F4F5" }
            ]
          },
          {
            model: "Xiaomi 14",
            series: "Xiaomi Flagship Series",
            screen: "6.36-inch 1.5K LTPO AMOLED 120Hz",
            screenSize: "6.36-inch",
            refreshRate: "120Hz LTPO",
            chipset: "Snapdragon 8 Gen 3",
            camera: "Leica Triple 50MP Camera",
            frontCamera: "32MP",
            batterySize: "4610 mAh (90W HyperCharge)",
            os: "Xiaomi HyperOS",
            simType: "Dual Nano SIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["256GB", "512GB"],
            defaultRamOptions: ["12GB"],
            knownColors: [
              { name: "Black", hex: "#18181B" },
              { name: "White", hex: "#F4F4F5" },
              { name: "Jade Green", hex: "#065F46" }
            ]
          }
        ]
      },
      {
        seriesName: "POCO & Redmi Number Series",
        models: [
          {
            model: "POCO X6 Pro 5G",
            series: "POCO & Redmi Number Series",
            screen: "6.67-inch 1.5K Flow AMOLED 120Hz",
            screenSize: "6.67-inch",
            refreshRate: "120Hz",
            chipset: "MediaTek Dimensity 8300 Ultra (4nm)",
            camera: "64MP OIS Triple Camera",
            frontCamera: "16MP",
            batterySize: "5000 mAh (67W Turbo Charge)",
            os: "Xiaomi HyperOS",
            simType: "Dual Nano SIM",
            network: "5G / LTE",
            has5G: true,
            defaultStorageOptions: ["256GB", "512GB"],
            defaultRamOptions: ["8GB", "12GB"],
            knownColors: [
              { name: "POCO Yellow", hex: "#EAB308" },
              { name: "Black", hex: "#18181B" },
              { name: "Gray", hex: "#6B7280" }
            ]
          },
          {
            model: "Redmi 13C",
            series: "POCO & Redmi Number Series",
            screen: "6.74-inch 90Hz HD+ Display",
            screenSize: "6.74-inch",
            refreshRate: "90Hz",
            chipset: "MediaTek Helio G85",
            camera: "50MP AI Dual Camera",
            frontCamera: "8MP",
            batterySize: "5000 mAh (18W Charge)",
            os: "MIUI 14 for POCO/Redmi",
            simType: "Dual Nano SIM",
            network: "4G LTE",
            has5G: false,
            defaultStorageOptions: ["128GB", "256GB"],
            defaultRamOptions: ["4GB", "6GB", "8GB"],
            knownColors: [
              { name: "Midnight Black", hex: "#18181B" },
              { name: "Navy Blue", hex: "#1E3A8A" },
              { name: "Clover Green", hex: "#166534" }
            ]
          }
        ]
      }
    ]
  }
];

// Lookup Helpers
export function getBrandCatalog(brandId: string): PhoneBrandCatalog | undefined {
  if (!brandId) return undefined;
  const normalized = brandId.trim().toLowerCase();
  return PHONE_CATALOG.find((b) => {
    const idNorm = b.brandId.toLowerCase();
    const nameNorm = b.brandName.toLowerCase();
    return (
      idNorm === normalized ||
      nameNorm === normalized ||
      (normalized.includes("xiaomi") && idNorm.includes("xiaomi")) ||
      (normalized.includes("redmi") && idNorm.includes("redmi")) ||
      (normalized.includes("tecno") && idNorm.includes("tecno")) ||
      (normalized.includes("infinix") && idNorm.includes("tecno"))
    );
  });
}

export function getAllModelsForBrand(brandId: string): PhoneModelSpec[] {
  const brandCat = getBrandCatalog(brandId);
  if (!brandCat) return [];
  const models: PhoneModelSpec[] = [];
  brandCat.seriesList.forEach((s) => {
    s.models.forEach((m) => models.push(m));
  });
  return models;
}

export function findModelInCatalog(brandId: string, modelName: string): PhoneModelSpec | undefined {
  if (!modelName) return undefined;
  const models = getAllModelsForBrand(brandId);
  const normModel = modelName.trim().toLowerCase();

  // Exact match first
  let found = models.find((m) => m.model.toLowerCase() === normModel);
  if (found) return found;

  // Fuzzy match
  found = models.find(
    (m) =>
      normModel.includes(m.model.toLowerCase()) ||
      m.model.toLowerCase().includes(normModel)
  );
  return found;
}
