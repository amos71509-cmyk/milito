/**
 * Comprehensive Phone Brands, Models & Storage/RAM Catalogue for MILITO TECH Swap Deals
 * 
 * Covering official manufacturer catalogues:
 * - Apple (iPhone 6 to iPhone 17 Pro Max, SE series)
 * - Samsung Galaxy (S series S6-S25 Ultra, Note series, Z Fold/Flip series, A series A01-A56, M series)
 * - Infinix (Hot series, Note series, Zero series, Smart series, GT series)
 * - TECNO (Camon series, Spark series, Phantom series, Pova series, Pop series)
 * - Redmi / Xiaomi (Redmi Note series, Redmi number series, Xiaomi flagship series 10-15, Mix series)
 * - POCO (F series, X series, M series, C series)
 * - Google Pixel (Pixel 1 through Pixel 9, 9 Pro XL, 9 Pro Fold, a-series)
 * - itel (A series, S series, P series, Color Pro)
 * - OPPO (Reno series, Find series, A series, F series)
 * - Vivo (V series, Y series, X series, T series)
 * - Huawei (Pura / P series, Mate series, Nova series, Y series)
 * - Nokia (G series, C series, X series, Classic Lumia / Asha / Feature)
 * - Motorola (Edge series, Razr series, Moto G series, Moto E series)
 * - OnePlus (OnePlus 1-13, Nord series, Open)
 * - Realme (GT series, Number series, C series, Narzo series)
 * - Sony (Xperia 1, 5, 10, Pro series)
 * - Honor (Magic series, 200/90/70 series, X series)
 * - Other Brand (open text input fallback)
 */

export interface SwapBrandEntry {
  id: string;
  name: string;
  logo: string;
  popular?: boolean;
}

export interface SwapModelEntry {
  model: string;
  brand: string;
  series?: string;
  suggestedStorages?: string[];
  suggestedRams?: string[];
}

export const SWAP_STORAGE_OPTIONS: string[] = [
  "16GB",
  "32GB",
  "64GB",
  "128GB",
  "256GB",
  "512GB",
  "1TB",
  "2TB"
];

export const SWAP_RAM_OPTIONS: string[] = [
  "2GB",
  "3GB",
  "4GB",
  "6GB",
  "8GB",
  "12GB",
  "16GB",
  "24GB",
  "Standard / N/A"
];

export const SWAP_BRANDS: SwapBrandEntry[] = [
  { id: "Apple", name: "Apple (iPhone)", logo: "🍎", popular: true },
  { id: "Samsung", name: "Samsung Galaxy", logo: "📱", popular: true },
  { id: "Infinix", name: "Infinix", logo: "🚀", popular: true },
  { id: "Tecno", name: "TECNO", logo: "⚡", popular: true },
  { id: "Xiaomi", name: "Redmi / Xiaomi", logo: "🔥", popular: true },
  { id: "POCO", name: "POCO", logo: "🟡", popular: true },
  { id: "Google", name: "Google Pixel", logo: "🌐", popular: true },
  { id: "Itel", name: "itel", logo: "🔴", popular: true },
  { id: "Oppo", name: "OPPO", logo: "✨", popular: true },
  { id: "Vivo", name: "Vivo", logo: "💫", popular: true },
  { id: "OnePlus", name: "OnePlus", logo: "⭕", popular: true },
  { id: "Realme", name: "Realme", logo: "⭐", popular: true },
  { id: "Huawei", name: "Huawei", logo: "🌸", popular: false },
  { id: "Nokia", name: "Nokia", logo: "🔷", popular: false },
  { id: "Motorola", name: "Motorola", logo: "Ⓜ️", popular: false },
  { id: "Honor", name: "Honor", logo: "💎", popular: false },
  { id: "Sony", name: "Sony Xperia", logo: "📷", popular: false },
  { id: "Other", name: "Other Brand", logo: "📦", popular: false },
];

export const SWAP_MODELS_CATALOGUE: Record<string, SwapModelEntry[]> = {
  // =========================================================================
  // 1. APPLE IPHONE
  // =========================================================================
  Apple: [
    // iPhone 17 Series (Upcoming / Current Gen)
    { model: "iPhone 17 Pro Max", brand: "Apple", series: "iPhone 17 Series", suggestedStorages: ["256GB", "512GB", "1TB", "2TB"], suggestedRams: ["12GB"] },
    { model: "iPhone 17 Pro", brand: "Apple", series: "iPhone 17 Series", suggestedStorages: ["128GB", "256GB", "512GB", "1TB"], suggestedRams: ["12GB"] },
    { model: "iPhone 17 Air", brand: "Apple", series: "iPhone 17 Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["8GB"] },
    { model: "iPhone 17", brand: "Apple", series: "iPhone 17 Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["8GB"] },

    // iPhone 16 Series
    { model: "iPhone 16 Pro Max", brand: "Apple", series: "iPhone 16 Series", suggestedStorages: ["256GB", "512GB", "1TB"], suggestedRams: ["8GB"] },
    { model: "iPhone 16 Pro", brand: "Apple", series: "iPhone 16 Series", suggestedStorages: ["128GB", "256GB", "512GB", "1TB"], suggestedRams: ["8GB"] },
    { model: "iPhone 16 Plus", brand: "Apple", series: "iPhone 16 Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["8GB"] },
    { model: "iPhone 16", brand: "Apple", series: "iPhone 16 Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["8GB"] },

    // iPhone 15 Series
    { model: "iPhone 15 Pro Max", brand: "Apple", series: "iPhone 15 Series", suggestedStorages: ["256GB", "512GB", "1TB"], suggestedRams: ["8GB"] },
    { model: "iPhone 15 Pro", brand: "Apple", series: "iPhone 15 Series", suggestedStorages: ["128GB", "256GB", "512GB", "1TB"], suggestedRams: ["8GB"] },
    { model: "iPhone 15 Plus", brand: "Apple", series: "iPhone 15 Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["6GB"] },
    { model: "iPhone 15", brand: "Apple", series: "iPhone 15 Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["6GB"] },

    // iPhone 14 Series
    { model: "iPhone 14 Pro Max", brand: "Apple", series: "iPhone 14 Series", suggestedStorages: ["128GB", "256GB", "512GB", "1TB"], suggestedRams: ["6GB"] },
    { model: "iPhone 14 Pro", brand: "Apple", series: "iPhone 14 Series", suggestedStorages: ["128GB", "256GB", "512GB", "1TB"], suggestedRams: ["6GB"] },
    { model: "iPhone 14 Plus", brand: "Apple", series: "iPhone 14 Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["6GB"] },
    { model: "iPhone 14", brand: "Apple", series: "iPhone 14 Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["6GB"] },

    // iPhone 13 Series
    { model: "iPhone 13 Pro Max", brand: "Apple", series: "iPhone 13 Series", suggestedStorages: ["128GB", "256GB", "512GB", "1TB"], suggestedRams: ["6GB"] },
    { model: "iPhone 13 Pro", brand: "Apple", series: "iPhone 13 Series", suggestedStorages: ["128GB", "256GB", "512GB", "1TB"], suggestedRams: ["6GB"] },
    { model: "iPhone 13", brand: "Apple", series: "iPhone 13 Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["4GB"] },
    { model: "iPhone 13 mini", brand: "Apple", series: "iPhone 13 Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["4GB"] },

    // iPhone 12 Series
    { model: "iPhone 12 Pro Max", brand: "Apple", series: "iPhone 12 Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["6GB"] },
    { model: "iPhone 12 Pro", brand: "Apple", series: "iPhone 12 Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["6GB"] },
    { model: "iPhone 12", brand: "Apple", series: "iPhone 12 Series", suggestedStorages: ["64GB", "128GB", "256GB"], suggestedRams: ["4GB"] },
    { model: "iPhone 12 mini", brand: "Apple", series: "iPhone 12 Series", suggestedStorages: ["64GB", "128GB", "256GB"], suggestedRams: ["4GB"] },

    // iPhone 11 Series
    { model: "iPhone 11 Pro Max", brand: "Apple", series: "iPhone 11 Series", suggestedStorages: ["64GB", "256GB", "512GB"], suggestedRams: ["4GB"] },
    { model: "iPhone 11 Pro", brand: "Apple", series: "iPhone 11 Series", suggestedStorages: ["64GB", "256GB", "512GB"], suggestedRams: ["4GB"] },
    { model: "iPhone 11", brand: "Apple", series: "iPhone 11 Series", suggestedStorages: ["64GB", "128GB", "256GB"], suggestedRams: ["4GB"] },

    // iPhone X / XS / XR Series
    { model: "iPhone XS Max", brand: "Apple", series: "iPhone X Series", suggestedStorages: ["64GB", "256GB", "512GB"], suggestedRams: ["4GB"] },
    { model: "iPhone XS", brand: "Apple", series: "iPhone X Series", suggestedStorages: ["64GB", "256GB", "512GB"], suggestedRams: ["4GB"] },
    { model: "iPhone XR", brand: "Apple", series: "iPhone X Series", suggestedStorages: ["64GB", "128GB", "256GB"], suggestedRams: ["3GB"] },
    { model: "iPhone X", brand: "Apple", series: "iPhone X Series", suggestedStorages: ["64GB", "256GB"], suggestedRams: ["3GB"] },

    // iPhone SE Series
    { model: "iPhone SE (3rd Gen - 2022)", brand: "Apple", series: "iPhone SE Series", suggestedStorages: ["64GB", "128GB", "256GB"], suggestedRams: ["4GB"] },
    { model: "iPhone SE (2nd Gen - 2020)", brand: "Apple", series: "iPhone SE Series", suggestedStorages: ["64GB", "128GB", "256GB"], suggestedRams: ["3GB"] },
    { model: "iPhone SE (1st Gen - 2016)", brand: "Apple", series: "iPhone SE Series", suggestedStorages: ["16GB", "32GB", "64GB", "128GB"], suggestedRams: ["2GB"] },

    // iPhone 8, 7, 6 Classic Series
    { model: "iPhone 8 Plus", brand: "Apple", series: "iPhone 8 Series", suggestedStorages: ["64GB", "128GB", "256GB"], suggestedRams: ["3GB"] },
    { model: "iPhone 8", brand: "Apple", series: "iPhone 8 Series", suggestedStorages: ["64GB", "128GB", "256GB"], suggestedRams: ["2GB"] },
    { model: "iPhone 7 Plus", brand: "Apple", series: "iPhone 7 Series", suggestedStorages: ["32GB", "128GB", "256GB"], suggestedRams: ["3GB"] },
    { model: "iPhone 7", brand: "Apple", series: "iPhone 7 Series", suggestedStorages: ["32GB", "128GB", "256GB"], suggestedRams: ["2GB"] },
    { model: "iPhone 6s Plus", brand: "Apple", series: "iPhone 6 Series", suggestedStorages: ["16GB", "32GB", "64GB", "128GB"], suggestedRams: ["2GB"] },
    { model: "iPhone 6s", brand: "Apple", series: "iPhone 6 Series", suggestedStorages: ["16GB", "32GB", "64GB", "128GB"], suggestedRams: ["2GB"] },
    { model: "iPhone 6 Plus", brand: "Apple", series: "iPhone 6 Series", suggestedStorages: ["16GB", "64GB", "128GB"], suggestedRams: ["1GB"] },
    { model: "iPhone 6", brand: "Apple", series: "iPhone 6 Series", suggestedStorages: ["16GB", "32GB", "64GB", "128GB"], suggestedRams: ["1GB"] },
  ],

  // =========================================================================
  // 2. SAMSUNG GALAXY (A, S, Z, M, NOTE SERIES)
  // =========================================================================
  Samsung: [
    // Galaxy S Series (Modern to Classic)
    { model: "Galaxy S25 Ultra", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["256GB", "512GB", "1TB"], suggestedRams: ["12GB", "16GB"] },
    { model: "Galaxy S25+", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["12GB"] },
    { model: "Galaxy S25", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Galaxy S24 Ultra", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["256GB", "512GB", "1TB"], suggestedRams: ["12GB"] },
    { model: "Galaxy S24+", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["12GB"] },
    { model: "Galaxy S24", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Galaxy S24 FE", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["8GB"] },
    { model: "Galaxy S23 Ultra", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["256GB", "512GB", "1TB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Galaxy S23+", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB"] },
    { model: "Galaxy S23", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Galaxy S23 FE", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Galaxy S22 Ultra", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["128GB", "256GB", "512GB", "1TB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Galaxy S22+", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Galaxy S22", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Galaxy S21 Ultra 5G", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["12GB", "16GB"] },
    { model: "Galaxy S21+ 5G", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Galaxy S21 5G", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Galaxy S21 FE 5G", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Galaxy S20 Ultra 5G", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["12GB", "16GB"] },
    { model: "Galaxy S20+ 5G", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Galaxy S20 5G", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["128GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Galaxy S20 FE 5G", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Galaxy S10+ 5G", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["128GB", "512GB", "1TB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Galaxy S10+", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["128GB", "512GB", "1TB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Galaxy S10", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["128GB", "512GB"], suggestedRams: ["8GB"] },
    { model: "Galaxy S10e", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Galaxy S9+", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["64GB", "128GB", "256GB"], suggestedRams: ["6GB"] },
    { model: "Galaxy S9", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["64GB", "128GB", "256GB"], suggestedRams: ["4GB"] },
    { model: "Galaxy S8+", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "6GB"] },
    { model: "Galaxy S8", brand: "Samsung", series: "Galaxy S Series", suggestedStorages: ["64GB"], suggestedRams: ["4GB"] },

    // Galaxy Note Series
    { model: "Galaxy Note 20 Ultra 5G", brand: "Samsung", series: "Galaxy Note Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["12GB"] },
    { model: "Galaxy Note 20", brand: "Samsung", series: "Galaxy Note Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Galaxy Note 10+ 5G", brand: "Samsung", series: "Galaxy Note Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["12GB"] },
    { model: "Galaxy Note 10+", brand: "Samsung", series: "Galaxy Note Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["12GB"] },
    { model: "Galaxy Note 10", brand: "Samsung", series: "Galaxy Note Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB"] },
    { model: "Galaxy Note 9", brand: "Samsung", series: "Galaxy Note Series", suggestedStorages: ["128GB", "512GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Galaxy Note 8", brand: "Samsung", series: "Galaxy Note Series", suggestedStorages: ["64GB", "128GB", "256GB"], suggestedRams: ["6GB"] },

    // Galaxy Z Fold & Z Flip Series
    { model: "Galaxy Z Fold 6", brand: "Samsung", series: "Galaxy Z Series", suggestedStorages: ["256GB", "512GB", "1TB"], suggestedRams: ["12GB"] },
    { model: "Galaxy Z Fold 5", brand: "Samsung", series: "Galaxy Z Series", suggestedStorages: ["256GB", "512GB", "1TB"], suggestedRams: ["12GB"] },
    { model: "Galaxy Z Fold 4", brand: "Samsung", series: "Galaxy Z Series", suggestedStorages: ["256GB", "512GB", "1TB"], suggestedRams: ["12GB"] },
    { model: "Galaxy Z Fold 3 5G", brand: "Samsung", series: "Galaxy Z Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["12GB"] },
    { model: "Galaxy Z Fold 2 5G", brand: "Samsung", series: "Galaxy Z Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["12GB"] },
    { model: "Galaxy Z Flip 6", brand: "Samsung", series: "Galaxy Z Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["12GB"] },
    { model: "Galaxy Z Flip 5", brand: "Samsung", series: "Galaxy Z Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB"] },
    { model: "Galaxy Z Flip 4", brand: "Samsung", series: "Galaxy Z Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["8GB"] },
    { model: "Galaxy Z Flip 3 5G", brand: "Samsung", series: "Galaxy Z Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },

    // Galaxy A Series (A0x to A7x)
    { model: "Galaxy A56 5G", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Galaxy A55 5G", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Galaxy A54 5G", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Galaxy A53 5G", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Galaxy A52s 5G", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Galaxy A52", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["4GB", "6GB", "8GB"] },
    { model: "Galaxy A51", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "6GB", "8GB"] },
    { model: "Galaxy A50", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "6GB"] },
    { model: "Galaxy A35 5G", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Galaxy A34 5G", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Galaxy A33 5G", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Galaxy A32", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "6GB", "8GB"] },
    { model: "Galaxy A25 5G", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Galaxy A24", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["128GB"], suggestedRams: ["4GB", "6GB", "8GB"] },
    { model: "Galaxy A23 5G", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "6GB"] },
    { model: "Galaxy A23", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "6GB"] },
    { model: "Galaxy A22", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "6GB"] },
    { model: "Galaxy A16 5G", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["4GB", "6GB", "8GB"] },
    { model: "Galaxy A16", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["4GB", "6GB"] },
    { model: "Galaxy A15 5G", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["4GB", "6GB", "8GB"] },
    { model: "Galaxy A15", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["4GB", "6GB", "8GB"] },
    { model: "Galaxy A14", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "6GB"] },
    { model: "Galaxy A13", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["32GB", "64GB", "128GB"], suggestedRams: ["3GB", "4GB", "6GB"] },
    { model: "Galaxy A12", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["32GB", "64GB", "128GB"], suggestedRams: ["3GB", "4GB", "6GB"] },
    { model: "Galaxy A06", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "6GB"] },
    { model: "Galaxy A05s", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["32GB", "64GB", "128GB"], suggestedRams: ["4GB", "6GB"] },
    { model: "Galaxy A05", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "6GB"] },
    { model: "Galaxy A04s", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["32GB", "64GB", "128GB"], suggestedRams: ["3GB", "4GB"] },
    { model: "Galaxy A04", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["32GB", "64GB"], suggestedRams: ["3GB", "4GB"] },
    { model: "Galaxy A03s", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["32GB", "64GB"], suggestedRams: ["3GB", "4GB"] },
    { model: "Galaxy A02s", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["32GB", "64GB"], suggestedRams: ["3GB", "4GB"] },
    { model: "Galaxy A73 5G", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Galaxy A72", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Galaxy A71", brand: "Samsung", series: "Galaxy A Series", suggestedStorages: ["128GB"], suggestedRams: ["6GB", "8GB"] },

    // Galaxy M Series
    { model: "Galaxy M54 5G", brand: "Samsung", series: "Galaxy M Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Galaxy M53 5G", brand: "Samsung", series: "Galaxy M Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Galaxy M34 5G", brand: "Samsung", series: "Galaxy M Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Galaxy M33 5G", brand: "Samsung", series: "Galaxy M Series", suggestedStorages: ["128GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Galaxy M14 5G", brand: "Samsung", series: "Galaxy M Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "6GB"] },
    { model: "Galaxy M13", brand: "Samsung", series: "Galaxy M Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB"] },
  ],

  // =========================================================================
  // 3. INFINIX
  // =========================================================================
  Infinix: [
    // Note Series
    { model: "Note 40 Pro+ 5G", brand: "Infinix", series: "Note Series", suggestedStorages: ["256GB"], suggestedRams: ["12GB"] },
    { model: "Note 40 Pro 5G", brand: "Infinix", series: "Note Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB"] },
    { model: "Note 40 Pro", brand: "Infinix", series: "Note Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB"] },
    { model: "Note 40", brand: "Infinix", series: "Note Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB"] },
    { model: "Note 30 VIP", brand: "Infinix", series: "Note Series", suggestedStorages: ["256GB"], suggestedRams: ["12GB"] },
    { model: "Note 30 Pro", brand: "Infinix", series: "Note Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB"] },
    { model: "Note 30 5G", brand: "Infinix", series: "Note Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["4GB", "8GB"] },
    { model: "Note 30", brand: "Infinix", series: "Note Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Note 12 VIP", brand: "Infinix", series: "Note Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB"] },
    { model: "Note 12 Pro 5G", brand: "Infinix", series: "Note Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Note 12 (G96)", brand: "Infinix", series: "Note Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Note 11 Pro", brand: "Infinix", series: "Note Series", suggestedStorages: ["128GB"], suggestedRams: ["8GB"] },
    { model: "Note 11", brand: "Infinix", series: "Note Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "6GB"] },
    { model: "Note 10 Pro", brand: "Infinix", series: "Note Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Note 8", brand: "Infinix", series: "Note Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["6GB"] },

    // Hot Series
    { model: "Hot 50 Pro+", brand: "Infinix", series: "Hot Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Hot 50 Pro", brand: "Infinix", series: "Hot Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Hot 50 5G", brand: "Infinix", series: "Hot Series", suggestedStorages: ["128GB"], suggestedRams: ["4GB", "8GB"] },
    { model: "Hot 50", brand: "Infinix", series: "Hot Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Hot 40 Pro", brand: "Infinix", series: "Hot Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Hot 40", brand: "Infinix", series: "Hot Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Hot 40i", brand: "Infinix", series: "Hot Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["4GB", "8GB"] },
    { model: "Hot 30", brand: "Infinix", series: "Hot Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Hot 30i", brand: "Infinix", series: "Hot Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "8GB"] },
    { model: "Hot 30 Play", brand: "Infinix", series: "Hot Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "8GB"] },
    { model: "Hot 20", brand: "Infinix", series: "Hot Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "6GB", "8GB"] },
    { model: "Hot 20i", brand: "Infinix", series: "Hot Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["3GB", "4GB"] },
    { model: "Hot 12", brand: "Infinix", series: "Hot Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "6GB"] },
    { model: "Hot 11", brand: "Infinix", series: "Hot Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB"] },
    { model: "Hot 10", brand: "Infinix", series: "Hot Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["3GB", "4GB", "6GB"] },

    // Zero Series & GT Series
    { model: "Zero 40 5G", brand: "Infinix", series: "Zero Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["12GB"] },
    { model: "Zero 40 4G", brand: "Infinix", series: "Zero Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB"] },
    { model: "Zero 30 5G", brand: "Infinix", series: "Zero Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Zero 30 4G", brand: "Infinix", series: "Zero Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB"] },
    { model: "Zero Ultra", brand: "Infinix", series: "Zero Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB"] },
    { model: "Zero 20", brand: "Infinix", series: "Zero Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "GT 20 Pro 5G", brand: "Infinix", series: "GT Gaming Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "GT 10 Pro 5G", brand: "Infinix", series: "GT Gaming Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB"] },

    // Smart Series
    { model: "Smart 9", brand: "Infinix", series: "Smart Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["3GB", "4GB"] },
    { model: "Smart 8 Pro", brand: "Infinix", series: "Smart Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "8GB"] },
    { model: "Smart 8 Plus", brand: "Infinix", series: "Smart Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB"] },
    { model: "Smart 8", brand: "Infinix", series: "Smart Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["3GB", "4GB"] },
    { model: "Smart 7", brand: "Infinix", series: "Smart Series", suggestedStorages: ["64GB"], suggestedRams: ["3GB", "4GB"] },
    { model: "Smart 6", brand: "Infinix", series: "Smart Series", suggestedStorages: ["32GB", "64GB"], suggestedRams: ["2GB", "3GB"] },
  ],

  // =========================================================================
  // 4. TECNO
  // =========================================================================
  Tecno: [
    // Camon Series
    { model: "Camon 40 Pro", brand: "Tecno", series: "Camon Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Camon 40", brand: "Tecno", series: "Camon Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB"] },
    { model: "Camon 30 Premier 5G", brand: "Tecno", series: "Camon Series", suggestedStorages: ["512GB"], suggestedRams: ["12GB"] },
    { model: "Camon 30 Pro 5G", brand: "Tecno", series: "Camon Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["12GB"] },
    { model: "Camon 30 5G", brand: "Tecno", series: "Camon Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB"] },
    { model: "Camon 30", brand: "Tecno", series: "Camon Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Camon 30S Pro", brand: "Tecno", series: "Camon Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB"] },
    { model: "Camon 20 Premier 5G", brand: "Tecno", series: "Camon Series", suggestedStorages: ["512GB"], suggestedRams: ["8GB"] },
    { model: "Camon 20 Pro 5G", brand: "Tecno", series: "Camon Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB"] },
    { model: "Camon 20 Pro", brand: "Tecno", series: "Camon Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB"] },
    { model: "Camon 20", brand: "Tecno", series: "Camon Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Camon 19 Pro 5G", brand: "Tecno", series: "Camon Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Camon 19 Pro", brand: "Tecno", series: "Camon Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Camon 19", brand: "Tecno", series: "Camon Series", suggestedStorages: ["128GB"], suggestedRams: ["4GB", "6GB"] },
    { model: "Camon 18 Premier", brand: "Tecno", series: "Camon Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB"] },
    { model: "Camon 18", brand: "Tecno", series: "Camon Series", suggestedStorages: ["128GB"], suggestedRams: ["4GB"] },
    { model: "Camon 17 Pro", brand: "Tecno", series: "Camon Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },

    // Spark Series
    { model: "Spark 40 Pro+", brand: "Tecno", series: "Spark Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Spark 40 Pro", brand: "Tecno", series: "Spark Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Spark 40", brand: "Tecno", series: "Spark Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["4GB", "8GB"] },
    { model: "Spark 30 Pro", brand: "Tecno", series: "Spark Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Spark 30 5G", brand: "Tecno", series: "Spark Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Spark 30", brand: "Tecno", series: "Spark Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Spark 30C", brand: "Tecno", series: "Spark Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["4GB", "8GB"] },
    { model: "Spark 20 Pro+", brand: "Tecno", series: "Spark Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB"] },
    { model: "Spark 20 Pro", brand: "Tecno", series: "Spark Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Spark 20", brand: "Tecno", series: "Spark Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Spark 20C", brand: "Tecno", series: "Spark Series", suggestedStorages: ["128GB"], suggestedRams: ["4GB", "8GB"] },
    { model: "Spark 10 Pro", brand: "Tecno", series: "Spark Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Spark 10", brand: "Tecno", series: "Spark Series", suggestedStorages: ["128GB"], suggestedRams: ["4GB", "8GB"] },
    { model: "Spark 10C", brand: "Tecno", series: "Spark Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "8GB"] },
    { model: "Spark 9 Pro", brand: "Tecno", series: "Spark Series", suggestedStorages: ["128GB"], suggestedRams: ["4GB", "6GB"] },
    { model: "Spark 8P", brand: "Tecno", series: "Spark Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB"] },

    // Phantom Series
    { model: "Phantom V Fold 2 5G", brand: "Tecno", series: "Phantom Series", suggestedStorages: ["512GB"], suggestedRams: ["12GB"] },
    { model: "Phantom V Flip 2 5G", brand: "Tecno", series: "Phantom Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB"] },
    { model: "Phantom V Fold 5G", brand: "Tecno", series: "Phantom Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["12GB"] },
    { model: "Phantom V Flip 5G", brand: "Tecno", series: "Phantom Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB"] },
    { model: "Phantom X2 Pro 5G", brand: "Tecno", series: "Phantom Series", suggestedStorages: ["256GB"], suggestedRams: ["12GB"] },
    { model: "Phantom X2 5G", brand: "Tecno", series: "Phantom Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB"] },
    { model: "Phantom X", brand: "Tecno", series: "Phantom Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB"] },

    // Pova & Pop Series
    { model: "Pova 6 Pro 5G", brand: "Tecno", series: "Pova Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Pova 6 Neo", brand: "Tecno", series: "Pova Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Pova 5 Pro 5G", brand: "Tecno", series: "Pova Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Pova 5", brand: "Tecno", series: "Pova Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Pop 9 5G", brand: "Tecno", series: "Pop Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB"] },
    { model: "Pop 9", brand: "Tecno", series: "Pop Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["3GB", "4GB"] },
    { model: "Pop 8", brand: "Tecno", series: "Pop Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["3GB", "4GB"] },
    { model: "Pop 7 Pro", brand: "Tecno", series: "Pop Series", suggestedStorages: ["64GB"], suggestedRams: ["3GB", "4GB"] },
    { model: "Pop 7", brand: "Tecno", series: "Pop Series", suggestedStorages: ["64GB"], suggestedRams: ["2GB", "3GB"] },
  ],

  // =========================================================================
  // 5. REDMI / XIAOMI
  // =========================================================================
  Xiaomi: [
    // Redmi Note Series
    { model: "Redmi Note 14 Pro+ 5G", brand: "Xiaomi", series: "Redmi Note Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["12GB", "16GB"] },
    { model: "Redmi Note 14 Pro", brand: "Xiaomi", series: "Redmi Note Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Redmi Note 14", brand: "Xiaomi", series: "Redmi Note Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Redmi Note 13 Pro+ 5G", brand: "Xiaomi", series: "Redmi Note Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB", "12GB", "16GB"] },
    { model: "Redmi Note 13 Pro 5G", brand: "Xiaomi", series: "Redmi Note Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["8GB", "12GB", "16GB"] },
    { model: "Redmi Note 13 Pro 4G", brand: "Xiaomi", series: "Redmi Note Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Redmi Note 13 5G", brand: "Xiaomi", series: "Redmi Note Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB", "12GB"] },
    { model: "Redmi Note 13 4G", brand: "Xiaomi", series: "Redmi Note Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Redmi Note 12 Pro+ 5G", brand: "Xiaomi", series: "Redmi Note Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Redmi Note 12 Pro 5G", brand: "Xiaomi", series: "Redmi Note Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Redmi Note 12", brand: "Xiaomi", series: "Redmi Note Series", suggestedStorages: ["64GB", "128GB", "256GB"], suggestedRams: ["4GB", "6GB", "8GB"] },
    { model: "Redmi Note 11 Pro", brand: "Xiaomi", series: "Redmi Note Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Redmi Note 11", brand: "Xiaomi", series: "Redmi Note Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "6GB"] },
    { model: "Redmi Note 10 Pro", brand: "Xiaomi", series: "Redmi Note Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Redmi Note 10", brand: "Xiaomi", series: "Redmi Note Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "6GB"] },
    { model: "Redmi Note 9 Pro", brand: "Xiaomi", series: "Redmi Note Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["6GB"] },
    { model: "Redmi Note 8 Pro", brand: "Xiaomi", series: "Redmi Note Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["6GB", "8GB"] },

    // Redmi Number Series
    { model: "Redmi 14C", brand: "Xiaomi", series: "Redmi Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["4GB", "6GB", "8GB"] },
    { model: "Redmi 13", brand: "Xiaomi", series: "Redmi Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Redmi 13C", brand: "Xiaomi", series: "Redmi Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["4GB", "6GB", "8GB"] },
    { model: "Redmi 12", brand: "Xiaomi", series: "Redmi Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["4GB", "8GB"] },
    { model: "Redmi 12C", brand: "Xiaomi", series: "Redmi Series", suggestedStorages: ["32GB", "64GB", "128GB"], suggestedRams: ["3GB", "4GB", "6GB"] },
    { model: "Redmi 10C", brand: "Xiaomi", series: "Redmi Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB"] },
    { model: "Redmi 10", brand: "Xiaomi", series: "Redmi Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "6GB"] },
    { model: "Redmi 9C", brand: "Xiaomi", series: "Redmi Series", suggestedStorages: ["32GB", "64GB"], suggestedRams: ["2GB", "3GB", "4GB"] },
    { model: "Redmi 9A", brand: "Xiaomi", series: "Redmi Series", suggestedStorages: ["32GB"], suggestedRams: ["2GB"] },

    // Xiaomi Flagship Series
    { model: "Xiaomi 15 Pro", brand: "Xiaomi", series: "Xiaomi Flagship", suggestedStorages: ["256GB", "512GB", "1TB"], suggestedRams: ["12GB", "16GB"] },
    { model: "Xiaomi 15", brand: "Xiaomi", series: "Xiaomi Flagship", suggestedStorages: ["256GB", "512GB", "1TB"], suggestedRams: ["12GB", "16GB"] },
    { model: "Xiaomi 14 Ultra", brand: "Xiaomi", series: "Xiaomi Flagship", suggestedStorages: ["256GB", "512GB", "1TB"], suggestedRams: ["12GB", "16GB"] },
    { model: "Xiaomi 14 Pro", brand: "Xiaomi", series: "Xiaomi Flagship", suggestedStorages: ["256GB", "512GB", "1TB"], suggestedRams: ["12GB", "16GB"] },
    { model: "Xiaomi 14", brand: "Xiaomi", series: "Xiaomi Flagship", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB", "12GB", "16GB"] },
    { model: "Xiaomi 13T Pro", brand: "Xiaomi", series: "Xiaomi Flagship", suggestedStorages: ["256GB", "512GB", "1TB"], suggestedRams: ["12GB", "16GB"] },
    { model: "Xiaomi 13 Pro", brand: "Xiaomi", series: "Xiaomi Flagship", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Xiaomi 12 Pro", brand: "Xiaomi", series: "Xiaomi Flagship", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Xiaomi 12", brand: "Xiaomi", series: "Xiaomi Flagship", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB", "12GB"] },
  ],

  // =========================================================================
  // 6. POCO
  // =========================================================================
  POCO: [
    { model: "POCO F6 Pro", brand: "POCO", series: "F Series", suggestedStorages: ["256GB", "512GB", "1TB"], suggestedRams: ["12GB", "16GB"] },
    { model: "POCO F6", brand: "POCO", series: "F Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "POCO F5 Pro", brand: "POCO", series: "F Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "POCO F5", brand: "POCO", series: "F Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "POCO F4 GT", brand: "POCO", series: "F Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "POCO F4", brand: "POCO", series: "F Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB", "12GB"] },
    { model: "POCO F3", brand: "POCO", series: "F Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "POCO X6 Pro 5G", brand: "POCO", series: "X Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "POCO X6 5G", brand: "POCO", series: "X Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "POCO X5 Pro 5G", brand: "POCO", series: "X Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "POCO X5 5G", brand: "POCO", series: "X Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "POCO X4 Pro 5G", brand: "POCO", series: "X Series", suggestedStorages: ["64GB", "128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "POCO X3 Pro", brand: "POCO", series: "X Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "POCO M6 Pro", brand: "POCO", series: "M Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "POCO M5s", brand: "POCO", series: "M Series", suggestedStorages: ["64GB", "128GB", "256GB"], suggestedRams: ["4GB", "6GB", "8GB"] },
    { model: "POCO M4 Pro 5G", brand: "POCO", series: "M Series", suggestedStorages: ["64GB", "128GB", "256GB"], suggestedRams: ["4GB", "6GB", "8GB"] },
    { model: "POCO C65", brand: "POCO", series: "C Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
  ],

  // =========================================================================
  // 7. GOOGLE PIXEL
  // =========================================================================
  Google: [
    { model: "Pixel 9 Pro Fold", brand: "Google", series: "Pixel 9 Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["16GB"] },
    { model: "Pixel 9 Pro XL", brand: "Google", series: "Pixel 9 Series", suggestedStorages: ["128GB", "256GB", "512GB", "1TB"], suggestedRams: ["16GB"] },
    { model: "Pixel 9 Pro", brand: "Google", series: "Pixel 9 Series", suggestedStorages: ["128GB", "256GB", "512GB", "1TB"], suggestedRams: ["16GB"] },
    { model: "Pixel 9", brand: "Google", series: "Pixel 9 Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["12GB"] },
    { model: "Pixel 8 Pro", brand: "Google", series: "Pixel 8 Series", suggestedStorages: ["128GB", "256GB", "512GB", "1TB"], suggestedRams: ["12GB"] },
    { model: "Pixel 8", brand: "Google", series: "Pixel 8 Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Pixel 8a", brand: "Google", series: "Pixel 8 Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Pixel Fold", brand: "Google", series: "Pixel Fold Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["12GB"] },
    { model: "Pixel 7 Pro", brand: "Google", series: "Pixel 7 Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["12GB"] },
    { model: "Pixel 7", brand: "Google", series: "Pixel 7 Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Pixel 7a", brand: "Google", series: "Pixel 7 Series", suggestedStorages: ["128GB"], suggestedRams: ["8GB"] },
    { model: "Pixel 6 Pro", brand: "Google", series: "Pixel 6 Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["12GB"] },
    { model: "Pixel 6", brand: "Google", series: "Pixel 6 Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Pixel 6a", brand: "Google", series: "Pixel 6 Series", suggestedStorages: ["128GB"], suggestedRams: ["6GB"] },
    { model: "Pixel 5", brand: "Google", series: "Pixel 5 Series", suggestedStorages: ["128GB"], suggestedRams: ["8GB"] },
    { model: "Pixel 5a 5G", brand: "Google", series: "Pixel 5 Series", suggestedStorages: ["128GB"], suggestedRams: ["6GB"] },
    { model: "Pixel 4 XL", brand: "Google", series: "Pixel 4 Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["6GB"] },
    { model: "Pixel 4", brand: "Google", series: "Pixel 4 Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["6GB"] },
    { model: "Pixel 4a", brand: "Google", series: "Pixel 4 Series", suggestedStorages: ["128GB"], suggestedRams: ["6GB"] },
    { model: "Pixel 3 XL", brand: "Google", series: "Pixel 3 Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB"] },
    { model: "Pixel 3", brand: "Google", series: "Pixel 3 Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB"] },
  ],

  // =========================================================================
  // 8. ITEL
  // =========================================================================
  Itel: [
    { model: "itel Color Pro 5G", brand: "Itel", series: "Color Pro Series", suggestedStorages: ["128GB"], suggestedRams: ["6GB"] },
    { model: "itel S24", brand: "Itel", series: "S Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["4GB", "8GB"] },
    { model: "itel S23+", brand: "Itel", series: "S Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "itel S23", brand: "Itel", series: "S Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["4GB", "8GB"] },
    { model: "itel P55 5G", brand: "Itel", series: "P Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "6GB"] },
    { model: "itel P55+", brand: "Itel", series: "P Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "itel P55", brand: "Itel", series: "P Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["4GB", "8GB"] },
    { model: "itel P40+", brand: "Itel", series: "P Series", suggestedStorages: ["128GB"], suggestedRams: ["4GB"] },
    { model: "itel P40", brand: "Itel", series: "P Series", suggestedStorages: ["64GB"], suggestedRams: ["2GB", "4GB"] },
    { model: "itel A70", brand: "Itel", series: "A Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["3GB", "4GB"] },
    { model: "itel A60s", brand: "Itel", series: "A Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB"] },
    { model: "itel A60", brand: "Itel", series: "A Series", suggestedStorages: ["32GB"], suggestedRams: ["2GB"] },
    { model: "itel A58", brand: "Itel", series: "A Series", suggestedStorages: ["16GB", "32GB"], suggestedRams: ["1GB", "2GB"] },
  ],

  // =========================================================================
  // 9. OPPO
  // =========================================================================
  Oppo: [
    { model: "Find X7 Ultra", brand: "Oppo", series: "Find Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["12GB", "16GB"] },
    { model: "Find X7", brand: "Oppo", series: "Find Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["12GB", "16GB"] },
    { model: "Find N3", brand: "Oppo", series: "Find Series", suggestedStorages: ["512GB", "1TB"], suggestedRams: ["16GB"] },
    { model: "Find N3 Flip", brand: "Oppo", series: "Find Series", suggestedStorages: ["256GB"], suggestedRams: ["12GB"] },
    { model: "Find X6 Pro", brand: "Oppo", series: "Find Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["12GB", "16GB"] },
    { model: "Find X5 Pro", brand: "Oppo", series: "Find Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["12GB"] },
    { model: "Reno 12 Pro 5G", brand: "Oppo", series: "Reno Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["12GB"] },
    { model: "Reno 12 5G", brand: "Oppo", series: "Reno Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Reno 12F 5G", brand: "Oppo", series: "Reno Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Reno 11 Pro 5G", brand: "Oppo", series: "Reno Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["12GB"] },
    { model: "Reno 11 5G", brand: "Oppo", series: "Reno Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Reno 11F 5G", brand: "Oppo", series: "Reno Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB"] },
    { model: "Reno 10 Pro+ 5G", brand: "Oppo", series: "Reno Series", suggestedStorages: ["256GB"], suggestedRams: ["12GB"] },
    { model: "Reno 10 Pro 5G", brand: "Oppo", series: "Reno Series", suggestedStorages: ["256GB"], suggestedRams: ["12GB"] },
    { model: "Reno 10 5G", brand: "Oppo", series: "Reno Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Reno 8 Pro 5G", brand: "Oppo", series: "Reno Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "A98 5G", brand: "Oppo", series: "A Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB"] },
    { model: "A79 5G", brand: "Oppo", series: "A Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["4GB", "8GB"] },
    { model: "A78 5G", brand: "Oppo", series: "A Series", suggestedStorages: ["128GB"], suggestedRams: ["8GB"] },
    { model: "A78 4G", brand: "Oppo", series: "A Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "A58", brand: "Oppo", series: "A Series", suggestedStorages: ["128GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "A38", brand: "Oppo", series: "A Series", suggestedStorages: ["128GB"], suggestedRams: ["4GB"] },
    { model: "A18", brand: "Oppo", series: "A Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB"] },
    { model: "A17", brand: "Oppo", series: "A Series", suggestedStorages: ["64GB"], suggestedRams: ["4GB"] },
  ],

  // =========================================================================
  // 10. VIVO
  // =========================================================================
  Vivo: [
    { model: "Vivo X100 Ultra", brand: "Vivo", series: "X Series", suggestedStorages: ["256GB", "512GB", "1TB"], suggestedRams: ["12GB", "16GB"] },
    { model: "Vivo X100 Pro", brand: "Vivo", series: "X Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["12GB", "16GB"] },
    { model: "Vivo X100", brand: "Vivo", series: "X Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["12GB", "16GB"] },
    { model: "Vivo X90 Pro", brand: "Vivo", series: "X Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["12GB"] },
    { model: "Vivo X80 Pro", brand: "Vivo", series: "X Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Vivo V40 Pro", brand: "Vivo", series: "V Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Vivo V40", brand: "Vivo", series: "V Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Vivo V40e", brand: "Vivo", series: "V Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Vivo V30 Pro", brand: "Vivo", series: "V Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Vivo V30", brand: "Vivo", series: "V Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Vivo V30e", brand: "Vivo", series: "V Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Vivo V29 5G", brand: "Vivo", series: "V Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Vivo V27 5G", brand: "Vivo", series: "V Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Vivo V25 5G", brand: "Vivo", series: "V Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Vivo Y200 5G", brand: "Vivo", series: "Y Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Vivo Y100 5G", brand: "Vivo", series: "Y Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Vivo Y36", brand: "Vivo", series: "Y Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["4GB", "8GB"] },
    { model: "Vivo Y28", brand: "Vivo", series: "Y Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Vivo Y18", brand: "Vivo", series: "Y Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB"] },
  ],

  // =========================================================================
  // 11. ONEPLUS
  // =========================================================================
  OnePlus: [
    { model: "OnePlus 13", brand: "OnePlus", series: "Flagship", suggestedStorages: ["256GB", "512GB", "1TB"], suggestedRams: ["12GB", "16GB", "24GB"] },
    { model: "OnePlus 12", brand: "OnePlus", series: "Flagship", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["12GB", "16GB"] },
    { model: "OnePlus 12R", brand: "OnePlus", series: "Flagship", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB", "16GB"] },
    { model: "OnePlus Open", brand: "OnePlus", series: "Foldable", suggestedStorages: ["512GB"], suggestedRams: ["16GB"] },
    { model: "OnePlus 11", brand: "OnePlus", series: "Flagship", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB", "16GB"] },
    { model: "OnePlus 11R", brand: "OnePlus", series: "Flagship", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB", "16GB"] },
    { model: "OnePlus 10 Pro", brand: "OnePlus", series: "Flagship", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "OnePlus 10T", brand: "OnePlus", series: "Flagship", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB", "12GB", "16GB"] },
    { model: "OnePlus 9 Pro", brand: "OnePlus", series: "Flagship", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "OnePlus 9", brand: "OnePlus", series: "Flagship", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "OnePlus 8 Pro", brand: "OnePlus", series: "Flagship", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "OnePlus 8T", brand: "OnePlus", series: "Flagship", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "OnePlus 7T Pro", brand: "OnePlus", series: "Flagship", suggestedStorages: ["256GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "OnePlus 7 Pro", brand: "OnePlus", series: "Flagship", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB", "12GB"] },
    { model: "OnePlus Nord 4", brand: "OnePlus", series: "Nord Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["8GB", "12GB", "16GB"] },
    { model: "OnePlus Nord 3 5G", brand: "OnePlus", series: "Nord Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB", "16GB"] },
    { model: "OnePlus Nord CE4", brand: "OnePlus", series: "Nord Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "OnePlus Nord CE3 Lite 5G", brand: "OnePlus", series: "Nord Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
  ],

  // =========================================================================
  // 12. REALME
  // =========================================================================
  Realme: [
    { model: "Realme GT 6", brand: "Realme", series: "GT Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB", "12GB", "16GB"] },
    { model: "Realme GT 6T", brand: "Realme", series: "GT Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Realme GT 5 Pro", brand: "Realme", series: "GT Series", suggestedStorages: ["256GB", "512GB", "1TB"], suggestedRams: ["12GB", "16GB"] },
    { model: "Realme 13 Pro+ 5G", brand: "Realme", series: "Number Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Realme 13 Pro 5G", brand: "Realme", series: "Number Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Realme 12 Pro+ 5G", brand: "Realme", series: "Number Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Realme 12 Pro 5G", brand: "Realme", series: "Number Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Realme 12 5G", brand: "Realme", series: "Number Series", suggestedStorages: ["128GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Realme 11 Pro+ 5G", brand: "Realme", series: "Number Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Realme C67", brand: "Realme", series: "C Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Realme C65", brand: "Realme", series: "C Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Realme C55", brand: "Realme", series: "C Series", suggestedStorages: ["64GB", "128GB", "256GB"], suggestedRams: ["4GB", "6GB", "8GB"] },
    { model: "Realme C53", brand: "Realme", series: "C Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "6GB"] },
  ],

  // =========================================================================
  // 13. HUAWEI
  // =========================================================================
  Huawei: [
    { model: "Pura 70 Ultra", brand: "Huawei", series: "Pura Series", suggestedStorages: ["512GB", "1TB"], suggestedRams: ["16GB"] },
    { model: "Pura 70 Pro", brand: "Huawei", series: "Pura Series", suggestedStorages: ["256GB", "512GB", "1TB"], suggestedRams: ["12GB"] },
    { model: "Pura 70", brand: "Huawei", series: "Pura Series", suggestedStorages: ["256GB", "512GB", "1TB"], suggestedRams: ["12GB"] },
    { model: "Mate 60 Pro+", brand: "Huawei", series: "Mate Series", suggestedStorages: ["512GB", "1TB"], suggestedRams: ["16GB"] },
    { model: "Mate 60 Pro", brand: "Huawei", series: "Mate Series", suggestedStorages: ["256GB", "512GB", "1TB"], suggestedRams: ["12GB"] },
    { model: "Mate 50 Pro", brand: "Huawei", series: "Mate Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB"] },
    { model: "P60 Pro", brand: "Huawei", series: "P Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "P50 Pro", brand: "Huawei", series: "P Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "P40 Pro", brand: "Huawei", series: "P Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["8GB"] },
    { model: "P30 Pro", brand: "Huawei", series: "P Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Nova 12 Pro", brand: "Huawei", series: "Nova Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB"] },
    { model: "Nova 11 Pro", brand: "Huawei", series: "Nova Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB"] },
    { model: "Y9a", brand: "Huawei", series: "Y Series", suggestedStorages: ["128GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Y9 Prime", brand: "Huawei", series: "Y Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB"] },
  ],

  // =========================================================================
  // 14. NOKIA
  // =========================================================================
  Nokia: [
    { model: "Nokia G60 5G", brand: "Nokia", series: "G Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "6GB"] },
    { model: "Nokia G42 5G", brand: "Nokia", series: "G Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["4GB", "6GB"] },
    { model: "Nokia G22", brand: "Nokia", series: "G Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB"] },
    { model: "Nokia G21", brand: "Nokia", series: "G Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["3GB", "4GB", "6GB"] },
    { model: "Nokia C32", brand: "Nokia", series: "C Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["3GB", "4GB"] },
    { model: "Nokia C22", brand: "Nokia", series: "C Series", suggestedStorages: ["64GB"], suggestedRams: ["2GB", "3GB"] },
    { model: "Nokia C12", brand: "Nokia", series: "C Series", suggestedStorages: ["64GB"], suggestedRams: ["2GB", "3GB"] },
    { model: "Nokia X30 5G", brand: "Nokia", series: "X Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Nokia XR21", brand: "Nokia", series: "X Series", suggestedStorages: ["128GB"], suggestedRams: ["6GB"] },
    { model: "Nokia 8.3 5G", brand: "Nokia", series: "Classic", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["6GB", "8GB"] },
    { model: "Nokia 7.2", brand: "Nokia", series: "Classic", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "6GB"] },
    { model: "Nokia Lumia 1020", brand: "Nokia", series: "Classic", suggestedStorages: ["32GB", "64GB"], suggestedRams: ["2GB"] },
  ],

  // =========================================================================
  // 15. MOTOROLA
  // =========================================================================
  Motorola: [
    { model: "Edge 50 Ultra", brand: "Motorola", series: "Edge Series", suggestedStorages: ["512GB", "1TB"], suggestedRams: ["12GB", "16GB"] },
    { model: "Edge 50 Pro", brand: "Motorola", series: "Edge Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Edge 50 Fusion", brand: "Motorola", series: "Edge Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Edge 40 Pro", brand: "Motorola", series: "Edge Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["12GB"] },
    { model: "Edge 40", brand: "Motorola", series: "Edge Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Razr 50 Ultra", brand: "Motorola", series: "Razr Series", suggestedStorages: ["512GB"], suggestedRams: ["12GB"] },
    { model: "Razr 40 Ultra", brand: "Motorola", series: "Razr Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Moto G85", brand: "Motorola", series: "Moto G Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Moto G84 5G", brand: "Motorola", series: "Moto G Series", suggestedStorages: ["256GB"], suggestedRams: ["12GB"] },
    { model: "Moto G54 5G", brand: "Motorola", series: "Moto G Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["4GB", "8GB", "12GB"] },
    { model: "Moto G34 5G", brand: "Motorola", series: "Moto G Series", suggestedStorages: ["64GB", "128GB"], suggestedRams: ["4GB", "8GB"] },
    { model: "Moto G24 Power", brand: "Motorola", series: "Moto G Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["4GB", "8GB"] },
    { model: "Moto G14", brand: "Motorola", series: "Moto G Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["4GB", "8GB"] },
    { model: "Moto E13", brand: "Motorola", series: "Moto E Series", suggestedStorages: ["32GB", "64GB", "128GB"], suggestedRams: ["2GB", "4GB", "8GB"] },
  ],

  // =========================================================================
  // 16. HONOR & SONY & OTHER
  // =========================================================================
  Honor: [
    { model: "Magic 6 Pro", brand: "Honor", series: "Magic Series", suggestedStorages: ["256GB", "512GB", "1TB"], suggestedRams: ["12GB", "16GB"] },
    { model: "Magic 5 Pro", brand: "Honor", series: "Magic Series", suggestedStorages: ["512GB"], suggestedRams: ["12GB"] },
    { model: "Honor 200 Pro", brand: "Honor", series: "Number Series", suggestedStorages: ["256GB", "512GB", "1TB"], suggestedRams: ["12GB", "16GB"] },
    { model: "Honor 200", brand: "Honor", series: "Number Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Honor 90", brand: "Honor", series: "Number Series", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["8GB", "12GB", "16GB"] },
    { model: "Honor X9b", brand: "Honor", series: "X Series", suggestedStorages: ["256GB"], suggestedRams: ["8GB", "12GB"] },
    { model: "Honor X8b", brand: "Honor", series: "X Series", suggestedStorages: ["128GB", "256GB", "512GB"], suggestedRams: ["8GB"] },
    { model: "Honor X7b", brand: "Honor", series: "X Series", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["6GB", "8GB"] },
  ],

  Sony: [
    { model: "Xperia 1 VI", brand: "Sony", series: "Xperia 1", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["12GB"] },
    { model: "Xperia 1 V", brand: "Sony", series: "Xperia 1", suggestedStorages: ["256GB", "512GB"], suggestedRams: ["12GB"] },
    { model: "Xperia 5 V", brand: "Sony", series: "Xperia 5", suggestedStorages: ["128GB", "256GB"], suggestedRams: ["8GB"] },
    { model: "Xperia 10 VI", brand: "Sony", series: "Xperia 10", suggestedStorages: ["128GB"], suggestedRams: ["8GB"] },
    { model: "Xperia Pro-I", brand: "Sony", series: "Xperia Pro", suggestedStorages: ["512GB"], suggestedRams: ["12GB"] },
  ],

  Other: [
    { model: "Other Smartphone / Tablet", brand: "Other", series: "Custom Device", suggestedStorages: ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"], suggestedRams: ["2GB", "4GB", "6GB", "8GB", "12GB"] }
  ]
};

/**
 * Returns all models for a selected brand (matching aliases if needed)
 */
export function getSwapModelsForBrand(brandIdOrName: string): SwapModelEntry[] {
  if (!brandIdOrName) return [];
  const clean = brandIdOrName.trim().toLowerCase();

  for (const [key, list] of Object.entries(SWAP_MODELS_CATALOGUE)) {
    if (key.toLowerCase() === clean) return list;
  }

  // Alias matching
  if (clean.includes("apple") || clean.includes("iphone")) return SWAP_MODELS_CATALOGUE.Apple;
  if (clean.includes("samsung") || clean.includes("galaxy")) return SWAP_MODELS_CATALOGUE.Samsung;
  if (clean.includes("infinix")) return SWAP_MODELS_CATALOGUE.Infinix;
  if (clean.includes("tecno")) return SWAP_MODELS_CATALOGUE.Tecno;
  if (clean.includes("xiaomi") || clean.includes("redmi")) return SWAP_MODELS_CATALOGUE.Xiaomi;
  if (clean.includes("poco")) return SWAP_MODELS_CATALOGUE.POCO;
  if (clean.includes("pixel") || clean.includes("google")) return SWAP_MODELS_CATALOGUE.Google;
  if (clean.includes("itel")) return SWAP_MODELS_CATALOGUE.Itel;
  if (clean.includes("oppo")) return SWAP_MODELS_CATALOGUE.Oppo;
  if (clean.includes("vivo")) return SWAP_MODELS_CATALOGUE.Vivo;
  if (clean.includes("oneplus")) return SWAP_MODELS_CATALOGUE.OnePlus;
  if (clean.includes("realme")) return SWAP_MODELS_CATALOGUE.Realme;
  if (clean.includes("huawei")) return SWAP_MODELS_CATALOGUE.Huawei;
  if (clean.includes("nokia")) return SWAP_MODELS_CATALOGUE.Nokia;
  if (clean.includes("motorola") || clean.includes("moto")) return SWAP_MODELS_CATALOGUE.Motorola;
  if (clean.includes("honor")) return SWAP_MODELS_CATALOGUE.Honor;
  if (clean.includes("sony")) return SWAP_MODELS_CATALOGUE.Sony;

  return SWAP_MODELS_CATALOGUE.Other;
}
