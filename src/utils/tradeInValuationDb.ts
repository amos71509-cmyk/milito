import { TradeInValuationRecord, ConditionAdjustmentRule } from "../types";

export const TRADEIN_VALUATIONS_STORAGE_KEY = "milito_tradein_valuations_db";
export const CONDITION_RULES_STORAGE_KEY = "milito_condition_adjustment_rules";

/**
 * Standard Condition Adjustment Rules
 * Configurable by MILITO Admin
 */
export const DEFAULT_CONDITION_ADJUSTMENT_RULES: ConditionAdjustmentRule[] = [
  {
    grade: "Grade A",
    label: "Grade A (Flawless / Like New)",
    adjustmentType: "percentage",
    adjustmentValue: 0, // 0% deduction
    status: "Active",
    description: "Flawless screen, frame in pristine condition, battery >= 90%, all hardware components operational."
  },
  {
    grade: "Grade B",
    label: "Grade B (Good / Minor Scratches)",
    adjustmentType: "percentage",
    adjustmentValue: -15, // -15% deduction
    status: "Active",
    description: "Minor hairline scratches on screen/body, battery >= 80%, all primary phone features operational."
  },
  {
    grade: "Grade C",
    label: "Grade C (Fair / Visible Wear)",
    adjustmentType: "percentage",
    adjustmentValue: -38, // -38% deduction
    status: "Active",
    description: "Visible scratches, scuffs or minor dents, battery in fair state, core hardware still functioning."
  },
  {
    grade: "Grade D",
    label: "Grade D (Poor / Faulty / Damaged)",
    adjustmentType: "percentage",
    adjustmentValue: -62, // -62% deduction
    status: "Active",
    description: "Deep cracks, heavy body damage, degraded battery, or non-functional ports/cameras."
  }
];

/**
 * Helper to build unique key for valuation records
 */
export function buildValuationRecordId(brand: string, model: string, storage: string): string {
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return `VAL-${clean(brand)}-${clean(model)}-${clean(storage)}`;
}

/**
 * Complete default trade-in catalogue with storage variants.
 * Specific base trade-in values are provided for key popular models (e.g. Galaxy A05s 64GB @ ₦65,000, iPhone 13 128GB @ ₦410,000)
 * while models awaiting admin pricing are set to null ready for the admin to configure.
 */
function generateDefaultValuationCatalogue(): TradeInValuationRecord[] {
  const dateStr = "2026-06-20 12:00";
  const records: TradeInValuationRecord[] = [];

  const add = (brand: string, model: string, storageVariants: Array<{ storage: string; baseValue: number | null }>) => {
    storageVariants.forEach(({ storage, baseValue }) => {
      records.push({
        id: buildValuationRecordId(brand, model, storage),
        brand,
        model,
        storage,
        baseTradeInValue: baseValue,
        status: "Active",
        lastUpdated: dateStr
      });
    });
  };

  // ==========================================
  // 1. APPLE IPHONES
  // ==========================================
  // Legacy series
  add("Apple", "iPhone 6", [{ storage: "16GB", baseValue: 25000 }, { storage: "32GB", baseValue: 28000 }, { storage: "64GB", baseValue: 32000 }, { storage: "128GB", baseValue: 36000 }]);
  add("Apple", "iPhone 6 Plus", [{ storage: "16GB", baseValue: 30000 }, { storage: "64GB", baseValue: 35000 }, { storage: "128GB", baseValue: 40000 }]);
  add("Apple", "iPhone 6s", [{ storage: "16GB", baseValue: 32000 }, { storage: "32GB", baseValue: 35000 }, { storage: "64GB", baseValue: 38000 }, { storage: "128GB", baseValue: 42000 }]);
  add("Apple", "iPhone 6s Plus", [{ storage: "16GB", baseValue: 40000 }, { storage: "32GB", baseValue: 44000 }, { storage: "64GB", baseValue: 48000 }, { storage: "128GB", baseValue: 54000 }]);

  add("Apple", "iPhone 7", [{ storage: "32GB", baseValue: 45000 }, { storage: "128GB", baseValue: 55000 }, { storage: "256GB", baseValue: 62000 }]);
  add("Apple", "iPhone 7 Plus", [{ storage: "32GB", baseValue: 60000 }, { storage: "128GB", baseValue: 70000 }, { storage: "256GB", baseValue: 80000 }]);

  add("Apple", "iPhone 8", [{ storage: "64GB", baseValue: 75000 }, { storage: "128GB", baseValue: 85000 }, { storage: "256GB", baseValue: 95000 }]);
  add("Apple", "iPhone 8 Plus", [{ storage: "64GB", baseValue: 95000 }, { storage: "128GB", baseValue: 105000 }, { storage: "256GB", baseValue: 120000 }]);

  add("Apple", "iPhone X", [{ storage: "64GB", baseValue: 115000 }, { storage: "256GB", baseValue: 135000 }]);
  add("Apple", "iPhone XR", [{ storage: "64GB", baseValue: 135000 }, { storage: "128GB", baseValue: 150000 }, { storage: "256GB", baseValue: 168000 }]);
  add("Apple", "iPhone XS", [{ storage: "64GB", baseValue: 145000 }, { storage: "256GB", baseValue: 165000 }, { storage: "512GB", baseValue: 185000 }]);
  add("Apple", "iPhone XS Max", [{ storage: "64GB", baseValue: 175000 }, { storage: "256GB", baseValue: 195000 }, { storage: "512GB", baseValue: 220000 }]);

  add("Apple", "iPhone 11", [{ storage: "64GB", baseValue: 200000 }, { storage: "128GB", baseValue: 230000 }, { storage: "256GB", baseValue: 260000 }]);
  add("Apple", "iPhone 11 Pro", [{ storage: "64GB", baseValue: 250000 }, { storage: "256GB", baseValue: 285000 }, { storage: "512GB", baseValue: 315000 }]);
  add("Apple", "iPhone 11 Pro Max", [{ storage: "64GB", baseValue: 300000 }, { storage: "256GB", baseValue: 335000 }, { storage: "512GB", baseValue: 370000 }]);

  add("Apple", "iPhone 12", [{ storage: "64GB", baseValue: 290000 }, { storage: "128GB", baseValue: 325000 }, { storage: "256GB", baseValue: 360000 }]);
  add("Apple", "iPhone 12 mini", [{ storage: "64GB", baseValue: 220000 }, { storage: "128GB", baseValue: 245000 }, { storage: "256GB", baseValue: 275000 }]);
  add("Apple", "iPhone 12 Pro", [{ storage: "128GB", baseValue: 380000 }, { storage: "256GB", baseValue: 415000 }, { storage: "512GB", baseValue: 455000 }]);
  add("Apple", "iPhone 12 Pro Max", [{ storage: "128GB", baseValue: 440000 }, { storage: "256GB", baseValue: 480000 }, { storage: "512GB", baseValue: 530000 }]);

  add("Apple", "iPhone 13", [{ storage: "128GB", baseValue: 410000 }, { storage: "256GB", baseValue: 455000 }, { storage: "512GB", baseValue: 505000 }]);
  add("Apple", "iPhone 13 mini", [{ storage: "128GB", baseValue: 315000 }, { storage: "256GB", baseValue: 350000 }, { storage: "512GB", baseValue: 395000 }]);
  add("Apple", "iPhone 13 Pro", [{ storage: "128GB", baseValue: 510000 }, { storage: "256GB", baseValue: 560000 }, { storage: "512GB", baseValue: 615000 }, { storage: "1TB", baseValue: 675000 }]);
  add("Apple", "iPhone 13 Pro Max", [{ storage: "128GB", baseValue: 580000 }, { storage: "256GB", baseValue: 635000 }, { storage: "512GB", baseValue: 695000 }, { storage: "1TB", baseValue: 760000 }]);

  add("Apple", "iPhone 14", [{ storage: "128GB", baseValue: 490000 }, { storage: "256GB", baseValue: 545000 }, { storage: "512GB", baseValue: 610000 }]);
  add("Apple", "iPhone 14 Plus", [{ storage: "128GB", baseValue: 550000 }, { storage: "256GB", baseValue: 610000 }, { storage: "512GB", baseValue: 680000 }]);
  add("Apple", "iPhone 14 Pro", [{ storage: "128GB", baseValue: 660000 }, { storage: "256GB", baseValue: 725000 }, { storage: "512GB", baseValue: 795000 }, { storage: "1TB", baseValue: 870000 }]);
  add("Apple", "iPhone 14 Pro Max", [{ storage: "128GB", baseValue: 750000 }, { storage: "256GB", baseValue: 820000 }, { storage: "512GB", baseValue: 895000 }, { storage: "1TB", baseValue: 980000 }]);

  add("Apple", "iPhone 15", [{ storage: "128GB", baseValue: 690000 }, { storage: "256GB", baseValue: 760000 }, { storage: "512GB", baseValue: 840000 }]);
  add("Apple", "iPhone 15 Plus", [{ storage: "128GB", baseValue: 780000 }, { storage: "256GB", baseValue: 860000 }, { storage: "512GB", baseValue: 945000 }]);
  add("Apple", "iPhone 15 Pro", [{ storage: "128GB", baseValue: 950000 }, { storage: "256GB", baseValue: 1050000 }, { storage: "512GB", baseValue: 1160000 }, { storage: "1TB", baseValue: 1280000 }]);
  add("Apple", "iPhone 15 Pro Max", [{ storage: "256GB", baseValue: 1220000 }, { storage: "512GB", baseValue: 1350000 }, { storage: "1TB", baseValue: 1480000 }]);

  add("Apple", "iPhone 16", [{ storage: "128GB", baseValue: 920000 }, { storage: "256GB", baseValue: 1010000 }, { storage: "512GB", baseValue: 1120000 }]);
  add("Apple", "iPhone 16 Plus", [{ storage: "128GB", baseValue: 1050000 }, { storage: "256GB", baseValue: 1160000 }, { storage: "512GB", baseValue: 1280000 }]);
  add("Apple", "iPhone 16 Pro", [{ storage: "128GB", baseValue: 1350000 }, { storage: "256GB", baseValue: 1450000 }, { storage: "512GB", baseValue: 1580000 }, { storage: "1TB", baseValue: 1720000 }]);
  add("Apple", "iPhone 16 Pro Max", [{ storage: "256GB", baseValue: 1650000 }, { storage: "512GB", baseValue: 1800000 }, { storage: "1TB", baseValue: 1980000 }]);

  // Upcoming models - ready for admin to set value
  add("Apple", "iPhone 17", [{ storage: "128GB", baseValue: null }, { storage: "256GB", baseValue: null }, { storage: "512GB", baseValue: null }]);
  add("Apple", "iPhone 17 Air", [{ storage: "128GB", baseValue: null }, { storage: "256GB", baseValue: null }, { storage: "512GB", baseValue: null }]);
  add("Apple", "iPhone 17 Pro", [{ storage: "256GB", baseValue: null }, { storage: "512GB", baseValue: null }, { storage: "1TB", baseValue: null }]);
  add("Apple", "iPhone 17 Pro Max", [{ storage: "256GB", baseValue: null }, { storage: "512GB", baseValue: null }, { storage: "1TB", baseValue: null }]);
  add("Apple", "iPhone 17e", [{ storage: "128GB", baseValue: null }, { storage: "256GB", baseValue: null }]);

  // ==========================================
  // 2. SAMSUNG GALAXY S SERIES
  // ==========================================
  add("Samsung", "Galaxy S8", [{ storage: "64GB", baseValue: 55000 }]);
  add("Samsung", "Galaxy S8+", [{ storage: "64GB", baseValue: 65000 }, { storage: "128GB", baseValue: 75000 }]);
  add("Samsung", "Galaxy S9", [{ storage: "64GB", baseValue: 70000 }, { storage: "128GB", baseValue: 80000 }, { storage: "256GB", baseValue: 90000 }]);
  add("Samsung", "Galaxy S9+", [{ storage: "64GB", baseValue: 85000 }, { storage: "128GB", baseValue: 95000 }, { storage: "256GB", baseValue: 105000 }]);
  add("Samsung", "Galaxy S10e", [{ storage: "128GB", baseValue: 95000 }, { storage: "256GB", baseValue: 110000 }]);
  add("Samsung", "Galaxy S10", [{ storage: "128GB", baseValue: 110000 }, { storage: "512GB", baseValue: 130000 }]);
  add("Samsung", "Galaxy S10+", [{ storage: "128GB", baseValue: 130000 }, { storage: "512GB", baseValue: 155000 }, { storage: "1TB", baseValue: 180000 }]);

  add("Samsung", "Galaxy S20", [{ storage: "128GB", baseValue: 160000 }]);
  add("Samsung", "Galaxy S20+", [{ storage: "128GB", baseValue: 190000 }, { storage: "256GB", baseValue: 215000 }]);
  add("Samsung", "Galaxy S20 Ultra", [{ storage: "128GB", baseValue: 240000 }, { storage: "256GB", baseValue: 270000 }, { storage: "512GB", baseValue: 300000 }]);
  add("Samsung", "Galaxy S20 FE", [{ storage: "128GB", baseValue: 145000 }, { storage: "256GB", baseValue: 165000 }]);

  add("Samsung", "Galaxy S21", [{ storage: "128GB", baseValue: 230000 }, { storage: "256GB", baseValue: 260000 }]);
  add("Samsung", "Galaxy S21+", [{ storage: "128GB", baseValue: 290000 }, { storage: "256GB", baseValue: 325000 }]);
  add("Samsung", "Galaxy S21 Ultra", [{ storage: "128GB", baseValue: 380000 }, { storage: "256GB", baseValue: 420000 }, { storage: "512GB", baseValue: 470000 }]);
  add("Samsung", "Galaxy S21 FE", [{ storage: "128GB", baseValue: 210000 }, { storage: "256GB", baseValue: 240000 }]);

  add("Samsung", "Galaxy S22", [{ storage: "128GB", baseValue: 350000 }, { storage: "256GB", baseValue: 390000 }]);
  add("Samsung", "Galaxy S22+", [{ storage: "128GB", baseValue: 420000 }, { storage: "256GB", baseValue: 465000 }]);
  add("Samsung", "Galaxy S22 Ultra", [{ storage: "128GB", baseValue: 550000 }, { storage: "256GB", baseValue: 610000 }, { storage: "512GB", baseValue: 675000 }, { storage: "1TB", baseValue: 750000 }]);

  add("Samsung", "Galaxy S23", [{ storage: "128GB", baseValue: 480000 }, { storage: "256GB", baseValue: 535000 }]);
  add("Samsung", "Galaxy S23+", [{ storage: "256GB", baseValue: 610000 }, { storage: "512GB", baseValue: 680000 }]);
  add("Samsung", "Galaxy S23 Ultra", [{ storage: "256GB", baseValue: 800000 }, { storage: "512GB", baseValue: 890000 }, { storage: "1TB", baseValue: 980000 }]);
  add("Samsung", "Galaxy S23 FE", [{ storage: "128GB", baseValue: 380000 }, { storage: "256GB", baseValue: 425000 }]);

  add("Samsung", "Galaxy S24", [{ storage: "128GB", baseValue: 680000 }, { storage: "256GB", baseValue: 750000 }]);
  add("Samsung", "Galaxy S24+", [{ storage: "256GB", baseValue: 850000 }, { storage: "512GB", baseValue: 940000 }]);
  add("Samsung", "Galaxy S24 Ultra", [{ storage: "256GB", baseValue: 1200000 }, { storage: "512GB", baseValue: 1350000 }, { storage: "1TB", baseValue: 1520000 }]);
  add("Samsung", "Galaxy S24 FE", [{ storage: "128GB", baseValue: 520000 }, { storage: "256GB", baseValue: 580000 }]);

  // Upcoming Galaxy S Series
  add("Samsung", "Galaxy S25", [{ storage: "128GB", baseValue: null }, { storage: "256GB", baseValue: null }, { storage: "512GB", baseValue: null }]);
  add("Samsung", "Galaxy S25+", [{ storage: "256GB", baseValue: null }, { storage: "512GB", baseValue: null }]);
  add("Samsung", "Galaxy S25 Ultra", [{ storage: "256GB", baseValue: null }, { storage: "512GB", baseValue: null }, { storage: "1TB", baseValue: null }]);
  add("Samsung", "Galaxy S25 Edge", [{ storage: "256GB", baseValue: null }, { storage: "512GB", baseValue: null }]);
  add("Samsung", "Galaxy S25 FE", [{ storage: "128GB", baseValue: null }, { storage: "256GB", baseValue: null }]);

  add("Samsung", "Galaxy S26", [{ storage: "128GB", baseValue: null }, { storage: "256GB", baseValue: null }]);
  add("Samsung", "Galaxy S26+", [{ storage: "256GB", baseValue: null }, { storage: "512GB", baseValue: null }]);
  add("Samsung", "Galaxy S26 Ultra", [{ storage: "256GB", baseValue: null }, { storage: "512GB", baseValue: null }, { storage: "1TB", baseValue: null }]);

  // ==========================================
  // 3. SAMSUNG GALAXY A SERIES
  // ==========================================
  add("Samsung", "Galaxy A02", [{ storage: "32GB", baseValue: 35000 }, { storage: "64GB", baseValue: 40000 }]);
  add("Samsung", "Galaxy A02s", [{ storage: "32GB", baseValue: 38000 }, { storage: "64GB", baseValue: 44000 }]);
  add("Samsung", "Galaxy A03", [{ storage: "32GB", baseValue: 40000 }, { storage: "64GB", baseValue: 46000 }, { storage: "128GB", baseValue: 52000 }]);
  add("Samsung", "Galaxy A03s", [{ storage: "32GB", baseValue: 42000 }, { storage: "64GB", baseValue: 48000 }]);
  add("Samsung", "Galaxy A04", [{ storage: "32GB", baseValue: 45000 }, { storage: "64GB", baseValue: 52000 }]);
  add("Samsung", "Galaxy A04s", [{ storage: "32GB", baseValue: 50000 }, { storage: "64GB", baseValue: 58000 }, { storage: "128GB", baseValue: 66000 }]);
  add("Samsung", "Galaxy A05", [{ storage: "64GB", baseValue: 55000 }, { storage: "128GB", baseValue: 64000 }]);
  add("Samsung", "Galaxy A05s", [
    { storage: "32GB", baseValue: 55000 },
    { storage: "64GB", baseValue: 65000 }, // Example from prompt: Galaxy A05s 64GB = ₦65,000
    { storage: "128GB", baseValue: 75000 }
  ]);
  add("Samsung", "Galaxy A06", [{ storage: "64GB", baseValue: 68000 }, { storage: "128GB", baseValue: 78000 }]);

  add("Samsung", "Galaxy A10", [{ storage: "32GB", baseValue: 38000 }]);
  add("Samsung", "Galaxy A10s", [{ storage: "32GB", baseValue: 42000 }]);
  add("Samsung", "Galaxy A11", [{ storage: "32GB", baseValue: 45000 }, { storage: "64GB", baseValue: 52000 }]);
  add("Samsung", "Galaxy A12", [{ storage: "32GB", baseValue: 52000 }, { storage: "64GB", baseValue: 60000 }, { storage: "128GB", baseValue: 70000 }]);
  add("Samsung", "Galaxy A13", [{ storage: "32GB", baseValue: 58000 }, { storage: "64GB", baseValue: 66000 }, { storage: "128GB", baseValue: 76000 }]);
  add("Samsung", "Galaxy A14", [{ storage: "64GB", baseValue: 72000 }, { storage: "128GB", baseValue: 84000 }]);
  add("Samsung", "Galaxy A14 5G", [{ storage: "64GB", baseValue: 80000 }, { storage: "128GB", baseValue: 92000 }]);
  add("Samsung", "Galaxy A15", [{ storage: "128GB", baseValue: 95000 }, { storage: "256GB", baseValue: 110000 }]);
  add("Samsung", "Galaxy A15 5G", [{ storage: "128GB", baseValue: 105000 }, { storage: "256GB", baseValue: 122000 }]);
  add("Samsung", "Galaxy A16", [{ storage: "128GB", baseValue: 115000 }, { storage: "256GB", baseValue: 130000 }]);
  add("Samsung", "Galaxy A16 5G", [{ storage: "128GB", baseValue: 125000 }, { storage: "256GB", baseValue: 142000 }]);
  add("Samsung", "Galaxy A17", [{ storage: "128GB", baseValue: null }, { storage: "256GB", baseValue: null }]);
  add("Samsung", "Galaxy A17 5G", [{ storage: "128GB", baseValue: null }, { storage: "256GB", baseValue: null }]);

  add("Samsung", "Galaxy A20", [{ storage: "32GB", baseValue: 44000 }]);
  add("Samsung", "Galaxy A20s", [{ storage: "32GB", baseValue: 48000 }, { storage: "64GB", baseValue: 55000 }]);
  add("Samsung", "Galaxy A21s", [{ storage: "32GB", baseValue: 54000 }, { storage: "64GB", baseValue: 62000 }, { storage: "128GB", baseValue: 72000 }]);
  add("Samsung", "Galaxy A22", [{ storage: "64GB", baseValue: 65000 }, { storage: "128GB", baseValue: 75000 }]);
  add("Samsung", "Galaxy A22 5G", [{ storage: "64GB", baseValue: 72000 }, { storage: "128GB", baseValue: 84000 }]);
  add("Samsung", "Galaxy A23", [{ storage: "64GB", baseValue: 80000 }, { storage: "128GB", baseValue: 92000 }]);
  add("Samsung", "Galaxy A23 5G", [{ storage: "64GB", baseValue: 88000 }, { storage: "128GB", baseValue: 102000 }]);
  add("Samsung", "Galaxy A24", [{ storage: "128GB", baseValue: 110000 }]);
  add("Samsung", "Galaxy A25", [{ storage: "128GB", baseValue: 125000 }, { storage: "256GB", baseValue: 145000 }]);
  add("Samsung", "Galaxy A25 5G", [{ storage: "128GB", baseValue: 135000 }, { storage: "256GB", baseValue: 155000 }]);
  add("Samsung", "Galaxy A26", [{ storage: "128GB", baseValue: null }, { storage: "256GB", baseValue: null }]);
  add("Samsung", "Galaxy A26 5G", [{ storage: "128GB", baseValue: null }, { storage: "256GB", baseValue: null }]);

  add("Samsung", "Galaxy A30", [{ storage: "32GB", baseValue: 48000 }, { storage: "64GB", baseValue: 56000 }]);
  add("Samsung", "Galaxy A30s", [{ storage: "64GB", baseValue: 60000 }, { storage: "128GB", baseValue: 70000 }]);
  add("Samsung", "Galaxy A31", [{ storage: "64GB", baseValue: 68000 }, { storage: "128GB", baseValue: 78000 }]);
  add("Samsung", "Galaxy A32", [{ storage: "64GB", baseValue: 78000 }, { storage: "128GB", baseValue: 90000 }]);
  add("Samsung", "Galaxy A32 5G", [{ storage: "64GB", baseValue: 85000 }, { storage: "128GB", baseValue: 98000 }]);
  add("Samsung", "Galaxy A33 5G", [{ storage: "128GB", baseValue: 120000 }, { storage: "256GB", baseValue: 138000 }]);
  add("Samsung", "Galaxy A34 5G", [{ storage: "128GB", baseValue: 145000 }, { storage: "256GB", baseValue: 168000 }]);
  add("Samsung", "Galaxy A35 5G", [{ storage: "128GB", baseValue: 175000 }, { storage: "256GB", baseValue: 200000 }]);
  add("Samsung", "Galaxy A36 5G", [{ storage: "128GB", baseValue: null }, { storage: "256GB", baseValue: null }]);
  add("Samsung", "Galaxy A37 5G", [{ storage: "128GB", baseValue: null }, { storage: "256GB", baseValue: null }]);

  add("Samsung", "Galaxy A50", [{ storage: "64GB", baseValue: 58000 }, { storage: "128GB", baseValue: 68000 }]);
  add("Samsung", "Galaxy A50s", [{ storage: "64GB", baseValue: 64000 }, { storage: "128GB", baseValue: 74000 }]);
  add("Samsung", "Galaxy A51", [{ storage: "64GB", baseValue: 74000 }, { storage: "128GB", baseValue: 86000 }]);
  add("Samsung", "Galaxy A51 5G", [{ storage: "128GB", baseValue: 95000 }]);
  add("Samsung", "Galaxy A52", [{ storage: "128GB", baseValue: 110000 }, { storage: "256GB", baseValue: 128000 }]);
  add("Samsung", "Galaxy A52 5G", [{ storage: "128GB", baseValue: 120000 }, { storage: "256GB", baseValue: 138000 }]);
  add("Samsung", "Galaxy A52s 5G", [{ storage: "128GB", baseValue: 130000 }, { storage: "256GB", baseValue: 148000 }]);
  add("Samsung", "Galaxy A53 5G", [{ storage: "128GB", baseValue: 155000 }, { storage: "256GB", baseValue: 175000 }]);
  add("Samsung", "Galaxy A54 5G", [{ storage: "128GB", baseValue: 195000 }, { storage: "256GB", baseValue: 220000 }]);
  add("Samsung", "Galaxy A55 5G", [{ storage: "128GB", baseValue: 240000 }, { storage: "256GB", baseValue: 270000 }]);
  add("Samsung", "Galaxy A56 5G", [{ storage: "128GB", baseValue: null }, { storage: "256GB", baseValue: null }]);
  add("Samsung", "Galaxy A57 5G", [{ storage: "128GB", baseValue: null }, { storage: "256GB", baseValue: null }]);

  add("Samsung", "Galaxy A70", [{ storage: "128GB", baseValue: 75000 }]);
  add("Samsung", "Galaxy A70s", [{ storage: "128GB", baseValue: 82000 }]);
  add("Samsung", "Galaxy A71", [{ storage: "128GB", baseValue: 95000 }]);
  add("Samsung", "Galaxy A71 5G", [{ storage: "128GB", baseValue: 110000 }]);
  add("Samsung", "Galaxy A72", [{ storage: "128GB", baseValue: 125000 }, { storage: "256GB", baseValue: 145000 }]);

  // ==========================================
  // 4. SAMSUNG GALAXY Z FOLD & Z FLIP SERIES
  // ==========================================
  add("Samsung", "Galaxy Z Fold", [{ storage: "512GB", baseValue: 220000 }]);
  add("Samsung", "Galaxy Z Fold2", [{ storage: "256GB", baseValue: 310000 }, { storage: "512GB", baseValue: 360000 }]);
  add("Samsung", "Galaxy Z Fold3", [{ storage: "256GB", baseValue: 420000 }, { storage: "512GB", baseValue: 480000 }]);
  add("Samsung", "Galaxy Z Fold4", [{ storage: "256GB", baseValue: 560000 }, { storage: "512GB", baseValue: 640000 }, { storage: "1TB", baseValue: 730000 }]);
  add("Samsung", "Galaxy Z Fold5", [{ storage: "256GB", baseValue: 780000 }, { storage: "512GB", baseValue: 890000 }, { storage: "1TB", baseValue: 1020000 }]);
  add("Samsung", "Galaxy Z Fold6", [{ storage: "256GB", baseValue: 1150000 }, { storage: "512GB", baseValue: 1300000 }, { storage: "1TB", baseValue: 1480000 }]);
  add("Samsung", "Galaxy Z Fold7", [{ storage: "256GB", baseValue: null }, { storage: "512GB", baseValue: null }, { storage: "1TB", baseValue: null }]);
  add("Samsung", "Galaxy Z Fold8", [{ storage: "256GB", baseValue: null }, { storage: "512GB", baseValue: null }, { storage: "1TB", baseValue: null }]);
  add("Samsung", "Galaxy Z Fold8 Ultra", [{ storage: "512GB", baseValue: null }, { storage: "1TB", baseValue: null }]);

  add("Samsung", "Galaxy Z Flip", [{ storage: "256GB", baseValue: 180000 }]);
  add("Samsung", "Galaxy Z Flip3", [{ storage: "128GB", baseValue: 240000 }, { storage: "256GB", baseValue: 275000 }]);
  add("Samsung", "Galaxy Z Flip4", [{ storage: "128GB", baseValue: 340000 }, { storage: "256GB", baseValue: 385000 }, { storage: "512GB", baseValue: 430000 }]);
  add("Samsung", "Galaxy Z Flip5", [{ storage: "256GB", baseValue: 520000 }, { storage: "512GB", baseValue: 590000 }]);
  add("Samsung", "Galaxy Z Flip6", [{ storage: "256GB", baseValue: 750000 }, { storage: "512GB", baseValue: 840000 }]);
  add("Samsung", "Galaxy Z Flip7", [{ storage: "256GB", baseValue: null }, { storage: "512GB", baseValue: null }]);
  add("Samsung", "Galaxy Z Flip7 FE", [{ storage: "128GB", baseValue: null }, { storage: "256GB", baseValue: null }]);
  add("Samsung", "Galaxy Z Flip8", [{ storage: "256GB", baseValue: null }, { storage: "512GB", baseValue: null }]);

  // ==========================================
  // 5. OTHER BRANDS (Google, Tecno, Infinix, Xiaomi, OnePlus, etc.)
  // ==========================================
  add("Google", "Pixel 6", [{ storage: "128GB", baseValue: 175000 }, { storage: "256GB", baseValue: 205000 }]);
  add("Google", "Pixel 6 Pro", [{ storage: "128GB", baseValue: 230000 }, { storage: "256GB", baseValue: 265000 }, { storage: "512GB", baseValue: 300000 }]);
  add("Google", "Pixel 7", [{ storage: "128GB", baseValue: 270000 }, { storage: "256GB", baseValue: 310000 }]);
  add("Google", "Pixel 7 Pro", [{ storage: "128GB", baseValue: 340000 }, { storage: "256GB", baseValue: 385000 }, { storage: "512GB", baseValue: 430000 }]);
  add("Google", "Pixel 8", [{ storage: "128GB", baseValue: 420000 }, { storage: "256GB", baseValue: 475000 }]);
  add("Google", "Pixel 8 Pro", [{ storage: "128GB", baseValue: 540000 }, { storage: "256GB", baseValue: 610000 }, { storage: "512GB", baseValue: 685000 }]);
  add("Google", "Pixel 9", [{ storage: "128GB", baseValue: 680000 }, { storage: "256GB", baseValue: 760000 }]);
  add("Google", "Pixel 9 Pro", [{ storage: "128GB", baseValue: 880000 }, { storage: "256GB", baseValue: 975000 }, { storage: "512GB", baseValue: 1080000 }]);
  add("Google", "Pixel 9 Pro XL", [{ storage: "128GB", baseValue: 980000 }, { storage: "256GB", baseValue: 1090000 }, { storage: "512GB", baseValue: 1220000 }]);

  add("Tecno", "Phantom X2 Pro", [{ storage: "256GB", baseValue: 240000 }]);
  add("Tecno", "Camon 30 Pro 5G", [{ storage: "256GB", baseValue: 195000 }, { storage: "512GB", baseValue: 225000 }]);
  add("Tecno", "Camon 20 Pro", [{ storage: "128GB", baseValue: 110000 }, { storage: "256GB", baseValue: 128000 }]);
  add("Tecno", "Spark 20 Pro+", [{ storage: "256GB", baseValue: 115000 }]);

  add("Infinix", "Note 40 Pro+ 5G", [{ storage: "256GB", baseValue: 210000 }]);
  add("Infinix", "Note 30 VIP", [{ storage: "256GB", baseValue: 155000 }]);
  add("Infinix", "Zero 30 5G", [{ storage: "256GB", baseValue: 180000 }]);
  add("Infinix", "Hot 40 Pro", [{ storage: "128GB", baseValue: 85000 }, { storage: "256GB", baseValue: 98000 }]);

  add("Xiaomi", "Redmi Note 13 Pro+ 5G", [{ storage: "256GB", baseValue: 245000 }, { storage: "512GB", baseValue: 280000 }]);
  add("Xiaomi", "Redmi Note 13 Pro", [{ storage: "128GB", baseValue: 165000 }, { storage: "256GB", baseValue: 190000 }]);
  add("Xiaomi", "Xiaomi 14", [{ storage: "256GB", baseValue: 560000 }, { storage: "512GB", baseValue: 630000 }]);
  add("Xiaomi", "Poco X6 Pro", [{ storage: "256GB", baseValue: 215000 }, { storage: "512GB", baseValue: 245000 }]);

  add("OnePlus", "OnePlus 12", [{ storage: "256GB", baseValue: 620000 }, { storage: "512GB", baseValue: 710000 }]);
  add("OnePlus", "OnePlus 11", [{ storage: "128GB", baseValue: 390000 }, { storage: "256GB", baseValue: 440000 }]);
  add("OnePlus", "OnePlus Nord 3", [{ storage: "128GB", baseValue: 195000 }, { storage: "256GB", baseValue: 225000 }]);

  return records;
}

/**
 * Retrieves all stored trade-in valuations from localStorage
 */
export function getStoredTradeInValuations(): TradeInValuationRecord[] {
  try {
    const saved = localStorage.getItem(TRADEIN_VALUATIONS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to read trade-in valuations database:", e);
  }

  // Initialize and persist defaults
  const defaults = generateDefaultValuationCatalogue();
  saveTradeInValuations(defaults);
  return defaults;
}

/**
 * Saves trade-in valuations to localStorage and dispatches sync event
 */
export function saveTradeInValuations(records: TradeInValuationRecord[]): void {
  try {
    localStorage.setItem(TRADEIN_VALUATIONS_STORAGE_KEY, JSON.stringify(records));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("milito_tradein_valuations_updated", { detail: records })
      );
    }
  } catch (e) {
    console.error("Failed to save trade-in valuations:", e);
  }
}

/**
 * Retrieves the condition adjustment rules
 */
export function getStoredConditionAdjustmentRules(): ConditionAdjustmentRule[] {
  try {
    const saved = localStorage.getItem(CONDITION_RULES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to read condition adjustment rules:", e);
  }
  return DEFAULT_CONDITION_ADJUSTMENT_RULES;
}

/**
 * Saves condition adjustment rules to localStorage
 */
export function saveConditionAdjustmentRules(rules: ConditionAdjustmentRule[]): void {
  try {
    localStorage.setItem(CONDITION_RULES_STORAGE_KEY, JSON.stringify(rules));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("milito_condition_rules_updated", { detail: rules })
      );
    }
  } catch (e) {
    console.error("Failed to save condition adjustment rules:", e);
  }
}

/**
 * Finds a specific valuation record for a device (brand, model, storage)
 */
export function findTradeInValuation(
  brand: string,
  model: string,
  storage: string
): TradeInValuationRecord | null {
  if (!brand || !model || !storage) return null;
  const records = getStoredTradeInValuations();
  const clean = (s: string) => s.trim().toLowerCase().replace(/[\s-_]+/g, "");

  const exactMatch = records.find(
    (r) =>
      clean(r.brand) === clean(brand) &&
      clean(r.model) === clean(model) &&
      clean(r.storage) === clean(storage)
  );
  if (exactMatch) return exactMatch;

  // Fallback match on model & storage
  return (
    records.find(
      (r) => clean(r.model) === clean(model) && clean(r.storage) === clean(storage)
    ) || null
  );
}

/**
 * Upserts a valuation record
 */
export function upsertTradeInValuation(record: Partial<TradeInValuationRecord> & {
  brand: string;
  model: string;
  storage: string;
}): TradeInValuationRecord {
  const existing = getStoredTradeInValuations();
  const id = record.id || buildValuationRecordId(record.brand, record.model, record.storage);
  const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);

  const updatedRecord: TradeInValuationRecord = {
    id,
    brand: record.brand.trim(),
    model: record.model.trim(),
    storage: record.storage.trim(),
    baseTradeInValue: typeof record.baseTradeInValue === "number" ? record.baseTradeInValue : null,
    status: record.status || "Active",
    lastUpdated: nowStr,
    notes: record.notes || ""
  };

  const filtered = existing.filter((r) => r.id !== id);
  const newList = [updatedRecord, ...filtered];
  saveTradeInValuations(newList);
  return updatedRecord;
}

/**
 * Deletes a valuation record by ID
 */
export function deleteTradeInValuation(id: string): boolean {
  const existing = getStoredTradeInValuations();
  const updated = existing.filter((r) => r.id !== id);
  if (updated.length !== existing.length) {
    saveTradeInValuations(updated);
    return true;
  }
  return false;
}
