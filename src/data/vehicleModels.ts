export interface VehicleModelItem {
  id: string;
  brand: string;
  model: string; // Clean model name ONLY (e.g. "Camry", "Corolla", "C300", "RX 350")
  series?: string; // Series or model family
  defaultBodyType?: string;
  defaultEngine?: string;
  defaultTransmission?: string;
  defaultFuelType?: string;
  defaultDriveType?: string;
}

export interface VehicleBrandData {
  id: string;
  name: string;
  logo: string;
  aliases: string[];
  models: VehicleModelItem[];
}

export const VEHICLE_BRANDS: VehicleBrandData[] = [
  {
    id: "Toyota",
    name: "Toyota",
    logo: "🚗",
    aliases: ["Toyota"],
    models: [
      // Sedans & Hatchbacks
      { id: "toyota-camry", brand: "Toyota", model: "Camry", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "2.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "toyota-corolla", brand: "Toyota", model: "Corolla", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "1.8L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "toyota-avalon", brand: "Toyota", model: "Avalon", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "3.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "toyota-yaris", brand: "Toyota", model: "Yaris", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "1.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "toyota-crown", brand: "Toyota", model: "Crown", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "2.5L Hybrid", defaultTransmission: "Automatic", defaultFuelType: "Hybrid", defaultDriveType: "AWD" },
      // SUVs & Crossovers
      { id: "toyota-rav4", brand: "Toyota", model: "RAV4", series: "SUVs & Crossovers", defaultBodyType: "SUV", defaultEngine: "2.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "toyota-venza", brand: "Toyota", model: "Venza", series: "SUVs & Crossovers", defaultBodyType: "SUV", defaultEngine: "2.5L Hybrid", defaultTransmission: "Automatic", defaultFuelType: "Hybrid", defaultDriveType: "AWD" },
      { id: "toyota-highlander", brand: "Toyota", model: "Highlander", series: "SUVs & Crossovers", defaultBodyType: "SUV", defaultEngine: "3.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "toyota-4runner", brand: "Toyota", model: "4Runner", series: "SUVs & Crossovers", defaultBodyType: "SUV", defaultEngine: "4.0L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "toyota-prado", brand: "Toyota", model: "Land Cruiser Prado", series: "SUVs & Crossovers", defaultBodyType: "SUV", defaultEngine: "2.8L Diesel", defaultTransmission: "Automatic", defaultFuelType: "Diesel", defaultDriveType: "4WD" },
      { id: "toyota-landcruiser", brand: "Toyota", model: "Land Cruiser", series: "SUVs & Crossovers", defaultBodyType: "SUV", defaultEngine: "3.5L Twin Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "toyota-fortuner", brand: "Toyota", model: "Fortuner", series: "SUVs & Crossovers", defaultBodyType: "SUV", defaultEngine: "2.8L Diesel", defaultTransmission: "Automatic", defaultFuelType: "Diesel", defaultDriveType: "4WD" },
      { id: "toyota-sequoia", brand: "Toyota", model: "Sequoia", series: "SUVs & Crossovers", defaultBodyType: "SUV", defaultEngine: "3.5L Hybrid", defaultTransmission: "Automatic", defaultFuelType: "Hybrid", defaultDriveType: "4WD" },
      { id: "toyota-corolla-cross", brand: "Toyota", model: "Corolla Cross", series: "SUVs & Crossovers", defaultBodyType: "SUV", defaultEngine: "1.8L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      // Trucks & Vans
      { id: "toyota-hilux", brand: "Toyota", model: "Hilux", series: "Trucks & Pickups", defaultBodyType: "Pickup", defaultEngine: "2.8L Diesel", defaultTransmission: "Automatic", defaultFuelType: "Diesel", defaultDriveType: "4WD" },
      { id: "toyota-tacoma", brand: "Toyota", model: "Tacoma", series: "Trucks & Pickups", defaultBodyType: "Pickup", defaultEngine: "3.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "toyota-tundra", brand: "Toyota", model: "Tundra", series: "Trucks & Pickups", defaultBodyType: "Pickup", defaultEngine: "3.5L Twin Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "toyota-sienna", brand: "Toyota", model: "Sienna", series: "Vans & Minivans", defaultBodyType: "Minivan", defaultEngine: "2.5L Hybrid", defaultTransmission: "Automatic", defaultFuelType: "Hybrid", defaultDriveType: "FWD" },
      { id: "toyota-hiace", brand: "Toyota", model: "HiAce", series: "Vans & Minivans", defaultBodyType: "Bus", defaultEngine: "2.7L", defaultTransmission: "Manual", defaultFuelType: "Petrol", defaultDriveType: "RWD" }
    ]
  },
  {
    id: "Lexus",
    name: "Lexus",
    logo: "🚗",
    aliases: ["Lexus"],
    models: [
      // Sedans
      { id: "lexus-is250", brand: "Lexus", model: "IS 250", series: "IS Series", defaultBodyType: "Sedan", defaultEngine: "2.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "RWD" },
      { id: "lexus-is300", brand: "Lexus", model: "IS 300", series: "IS Series", defaultBodyType: "Sedan", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "RWD" },
      { id: "lexus-is350", brand: "Lexus", model: "IS 350", series: "IS Series", defaultBodyType: "Sedan", defaultEngine: "3.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "RWD" },
      { id: "lexus-es350", brand: "Lexus", model: "ES 350", series: "ES Series", defaultBodyType: "Sedan", defaultEngine: "3.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "lexus-es300h", brand: "Lexus", model: "ES 300h", series: "ES Series", defaultBodyType: "Sedan", defaultEngine: "2.5L Hybrid", defaultTransmission: "Automatic", defaultFuelType: "Hybrid", defaultDriveType: "FWD" },
      { id: "lexus-gs350", brand: "Lexus", model: "GS 350", series: "GS Series", defaultBodyType: "Sedan", defaultEngine: "3.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "RWD" },
      { id: "lexus-ls460", brand: "Lexus", model: "LS 460", series: "LS Series", defaultBodyType: "Sedan", defaultEngine: "4.6L V8", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "RWD" },
      { id: "lexus-ls500", brand: "Lexus", model: "LS 500", series: "LS Series", defaultBodyType: "Sedan", defaultEngine: "3.5L Twin Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      // SUVs
      { id: "lexus-ux250h", brand: "Lexus", model: "UX 250h", series: "UX Series", defaultBodyType: "SUV", defaultEngine: "2.0L Hybrid", defaultTransmission: "Automatic", defaultFuelType: "Hybrid", defaultDriveType: "FWD" },
      { id: "lexus-nx200t", brand: "Lexus", model: "NX 200t", series: "NX Series", defaultBodyType: "SUV", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "lexus-nx300", brand: "Lexus", model: "NX 300", series: "NX Series", defaultBodyType: "SUV", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "lexus-nx350", brand: "Lexus", model: "NX 350", series: "NX Series", defaultBodyType: "SUV", defaultEngine: "2.4L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "lexus-rx330", brand: "Lexus", model: "RX 330", series: "RX Series", defaultBodyType: "SUV", defaultEngine: "3.3L V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "lexus-rx350", brand: "Lexus", model: "RX 350", series: "RX Series", defaultBodyType: "SUV", defaultEngine: "3.5L V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "lexus-rx450h", brand: "Lexus", model: "RX 450h", series: "RX Series", defaultBodyType: "SUV", defaultEngine: "3.5L Hybrid", defaultTransmission: "Automatic", defaultFuelType: "Hybrid", defaultDriveType: "AWD" },
      { id: "lexus-gx460", brand: "Lexus", model: "GX 460", series: "GX Series", defaultBodyType: "SUV", defaultEngine: "4.6L V8", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "lexus-gx550", brand: "Lexus", model: "GX 550", series: "GX Series", defaultBodyType: "SUV", defaultEngine: "3.4L Twin Turbo V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "lexus-lx570", brand: "Lexus", model: "LX 570", series: "LX Series", defaultBodyType: "SUV", defaultEngine: "5.7L V8", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "lexus-lx600", brand: "Lexus", model: "LX 600", series: "LX Series", defaultBodyType: "SUV", defaultEngine: "3.5L Twin Turbo V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "lexus-tx350", brand: "Lexus", model: "TX 350", series: "TX Series", defaultBodyType: "SUV", defaultEngine: "2.4L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" }
    ]
  },
  {
    id: "Mercedes-Benz",
    name: "Mercedes-Benz",
    logo: "🚗",
    aliases: ["Mercedes-Benz", "Mercedes", "Benz"],
    models: [
      // C-Class
      { id: "mb-c200", brand: "Mercedes-Benz", model: "C 200", series: "C-Class", defaultBodyType: "Sedan", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "RWD" },
      { id: "mb-c300", brand: "Mercedes-Benz", model: "C 300", series: "C-Class", defaultBodyType: "Sedan", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "RWD" },
      { id: "mb-c43", brand: "Mercedes-Benz", model: "AMG C 43", series: "C-Class", defaultBodyType: "Sedan", defaultEngine: "3.0L BiTurbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "mb-c63", brand: "Mercedes-Benz", model: "AMG C 63", series: "C-Class", defaultBodyType: "Sedan", defaultEngine: "4.0L BiTurbo V8", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "RWD" },
      // E-Class
      { id: "mb-e200", brand: "Mercedes-Benz", model: "E 200", series: "E-Class", defaultBodyType: "Sedan", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "RWD" },
      { id: "mb-e300", brand: "Mercedes-Benz", model: "E 300", series: "E-Class", defaultBodyType: "Sedan", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "RWD" },
      { id: "mb-e350", brand: "Mercedes-Benz", model: "E 350", series: "E-Class", defaultBodyType: "Sedan", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "RWD" },
      { id: "mb-e450", brand: "Mercedes-Benz", model: "E 450", series: "E-Class", defaultBodyType: "Sedan", defaultEngine: "3.0L Inline-6 Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "mb-e63", brand: "Mercedes-Benz", model: "AMG E 63 S", series: "E-Class", defaultBodyType: "Sedan", defaultEngine: "4.0L BiTurbo V8", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      // S-Class & Maybach
      { id: "mb-s500", brand: "Mercedes-Benz", model: "S 500", series: "S-Class", defaultBodyType: "Sedan", defaultEngine: "3.0L Inline-6 Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "mb-s550", brand: "Mercedes-Benz", model: "S 550", series: "S-Class", defaultBodyType: "Sedan", defaultEngine: "4.7L BiTurbo V8", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "RWD" },
      { id: "mb-s580", brand: "Mercedes-Benz", model: "S 580", series: "S-Class", defaultBodyType: "Sedan", defaultEngine: "4.0L BiTurbo V8", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "mb-maybach-s680", brand: "Mercedes-Benz", model: "Maybach S 680", series: "Maybach", defaultBodyType: "Sedan", defaultEngine: "6.0L BiTurbo V12", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      // CLA & A-Class
      { id: "mb-cla250", brand: "Mercedes-Benz", model: "CLA 250", series: "CLA-Class", defaultBodyType: "Coupe", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "mb-a220", brand: "Mercedes-Benz", model: "A 220", series: "A-Class", defaultBodyType: "Sedan", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      // SUVs (GLA, GLB, GLC, GLE, GLS, G-Class)
      { id: "mb-gla250", brand: "Mercedes-Benz", model: "GLA 250", series: "GLA-Class", defaultBodyType: "SUV", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "mb-glb250", brand: "Mercedes-Benz", model: "GLB 250", series: "GLB-Class", defaultBodyType: "SUV", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "mb-glc300", brand: "Mercedes-Benz", model: "GLC 300", series: "GLC-Class", defaultBodyType: "SUV", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "mb-gle350", brand: "Mercedes-Benz", model: "GLE 350", series: "GLE-Class", defaultBodyType: "SUV", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "mb-gle450", brand: "Mercedes-Benz", model: "GLE 450", series: "GLE-Class", defaultBodyType: "SUV", defaultEngine: "3.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "mb-gle53", brand: "Mercedes-Benz", model: "AMG GLE 53", series: "GLE-Class", defaultBodyType: "SUV", defaultEngine: "3.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "mb-gle63", brand: "Mercedes-Benz", model: "AMG GLE 63 S", series: "GLE-Class", defaultBodyType: "SUV", defaultEngine: "4.0L BiTurbo V8", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "mb-gls450", brand: "Mercedes-Benz", model: "GLS 450", series: "GLS-Class", defaultBodyType: "SUV", defaultEngine: "3.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "mb-gls580", brand: "Mercedes-Benz", model: "GLS 580", series: "GLS-Class", defaultBodyType: "SUV", defaultEngine: "4.0L BiTurbo V8", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "mb-maybach-gls600", brand: "Mercedes-Benz", model: "Maybach GLS 600", series: "Maybach", defaultBodyType: "SUV", defaultEngine: "4.0L BiTurbo V8", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "mb-g550", brand: "Mercedes-Benz", model: "G 550", series: "G-Class", defaultBodyType: "SUV", defaultEngine: "4.0L BiTurbo V8", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "mb-g63", brand: "Mercedes-Benz", model: "AMG G 63", series: "G-Class", defaultBodyType: "SUV", defaultEngine: "4.0L BiTurbo V8", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" }
    ]
  },
  {
    id: "BMW",
    name: "BMW",
    logo: "🚗",
    aliases: ["BMW"],
    models: [
      // 3 & 4 Series
      { id: "bmw-320i", brand: "BMW", model: "320i", series: "3 Series", defaultBodyType: "Sedan", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "RWD" },
      { id: "bmw-330i", brand: "BMW", model: "330i", series: "3 Series", defaultBodyType: "Sedan", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "RWD" },
      { id: "bmw-m340i", brand: "BMW", model: "M340i", series: "3 Series", defaultBodyType: "Sedan", defaultEngine: "3.0L Turbo Inline-6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "bmw-m3", brand: "BMW", model: "M3", series: "3 Series", defaultBodyType: "Sedan", defaultEngine: "3.0L Twin Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "RWD" },
      { id: "bmw-430i", brand: "BMW", model: "430i", series: "4 Series", defaultBodyType: "Coupe", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "RWD" },
      { id: "bmw-m4", brand: "BMW", model: "M4", series: "4 Series", defaultBodyType: "Coupe", defaultEngine: "3.0L Twin Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "RWD" },
      // 5 & 7 Series
      { id: "bmw-520i", brand: "BMW", model: "520i", series: "5 Series", defaultBodyType: "Sedan", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "RWD" },
      { id: "bmw-530i", brand: "BMW", model: "530i", series: "5 Series", defaultBodyType: "Sedan", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "RWD" },
      { id: "bmw-540i", brand: "BMW", model: "540i", series: "5 Series", defaultBodyType: "Sedan", defaultEngine: "3.0L Turbo Inline-6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "RWD" },
      { id: "bmw-m5", brand: "BMW", model: "M5", series: "5 Series", defaultBodyType: "Sedan", defaultEngine: "4.4L Twin Turbo V8", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "bmw-740i", brand: "BMW", model: "740i", series: "7 Series", defaultBodyType: "Sedan", defaultEngine: "3.0L Turbo Inline-6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "RWD" },
      { id: "bmw-750i", brand: "BMW", model: "750i", series: "7 Series", defaultBodyType: "Sedan", defaultEngine: "4.4L Twin Turbo V8", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      // X Series SUVs
      { id: "bmw-x1", brand: "BMW", model: "X1", series: "X Series", defaultBodyType: "SUV", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "bmw-x3", brand: "BMW", model: "X3", series: "X Series", defaultBodyType: "SUV", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "bmw-x4", brand: "BMW", model: "X4", series: "X Series", defaultBodyType: "SUV", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "bmw-x5", brand: "BMW", model: "X5", series: "X Series", defaultBodyType: "SUV", defaultEngine: "3.0L Turbo Inline-6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "bmw-x6", brand: "BMW", model: "X6", series: "X Series", defaultBodyType: "SUV", defaultEngine: "3.0L Turbo Inline-6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "bmw-x7", brand: "BMW", model: "X7", series: "X Series", defaultBodyType: "SUV", defaultEngine: "3.0L Turbo Inline-6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" }
    ]
  },
  {
    id: "Audi",
    name: "Audi",
    logo: "🚗",
    aliases: ["Audi"],
    models: [
      { id: "audi-a3", brand: "Audi", model: "A3", series: "A Series", defaultBodyType: "Sedan", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "audi-a4", brand: "Audi", model: "A4", series: "A Series", defaultBodyType: "Sedan", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "audi-a6", brand: "Audi", model: "A6", series: "A Series", defaultBodyType: "Sedan", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "audi-a7", brand: "Audi", model: "A7", series: "A Series", defaultBodyType: "Sedan", defaultEngine: "3.0L Turbo V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "audi-a8", brand: "Audi", model: "A8", series: "A Series", defaultBodyType: "Sedan", defaultEngine: "3.0L Turbo V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "audi-q3", brand: "Audi", model: "Q3", series: "Q Series", defaultBodyType: "SUV", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "audi-q5", brand: "Audi", model: "Q5", series: "Q Series", defaultBodyType: "SUV", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "audi-q7", brand: "Audi", model: "Q7", series: "Q Series", defaultBodyType: "SUV", defaultEngine: "3.0L Turbo V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "audi-q8", brand: "Audi", model: "Q8", series: "Q Series", defaultBodyType: "SUV", defaultEngine: "3.0L Turbo V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" }
    ]
  },
  {
    id: "Honda",
    name: "Honda",
    logo: "🚗",
    aliases: ["Honda"],
    models: [
      { id: "honda-accord", brand: "Honda", model: "Accord", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "1.5L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "honda-civic", brand: "Honda", model: "Civic", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "2.0L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "honda-city", brand: "Honda", model: "City", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "1.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "honda-crv", brand: "Honda", model: "CR-V", series: "SUVs & Crossovers", defaultBodyType: "SUV", defaultEngine: "1.5L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "honda-pilot", brand: "Honda", model: "Pilot", series: "SUVs & Crossovers", defaultBodyType: "SUV", defaultEngine: "3.5L V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "honda-hrv", brand: "Honda", model: "HR-V", series: "SUVs & Crossovers", defaultBodyType: "SUV", defaultEngine: "2.0L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "honda-passport", brand: "Honda", model: "Passport", series: "SUVs & Crossovers", defaultBodyType: "SUV", defaultEngine: "3.5L V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "honda-odyssey", brand: "Honda", model: "Odyssey", series: "Minivans", defaultBodyType: "Minivan", defaultEngine: "3.5L V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" }
    ]
  },
  {
    id: "Hyundai",
    name: "Hyundai",
    logo: "🚗",
    aliases: ["Hyundai"],
    models: [
      { id: "hyundai-elantra", brand: "Hyundai", model: "Elantra", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "2.0L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "hyundai-sonata", brand: "Hyundai", model: "Sonata", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "2.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "hyundai-accent", brand: "Hyundai", model: "Accent", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "1.6L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "hyundai-tucson", brand: "Hyundai", model: "Tucson", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "hyundai-santafe", brand: "Hyundai", model: "Santa Fe", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.5L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "hyundai-palisade", brand: "Hyundai", model: "Palisade", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "3.8L V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "hyundai-creta", brand: "Hyundai", model: "Creta", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "1.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "hyundai-kona", brand: "Hyundai", model: "Kona", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.0L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" }
    ]
  },
  {
    id: "Kia",
    name: "Kia",
    logo: "🚗",
    aliases: ["Kia"],
    models: [
      { id: "kia-rio", brand: "Kia", model: "Rio", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "1.6L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "kia-cerato", brand: "Kia", model: "Cerato / Forte", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "2.0L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "kia-k5", brand: "Kia", model: "Optima / K5", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "1.6L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "kia-sportage", brand: "Kia", model: "Sportage", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "kia-sorento", brand: "Kia", model: "Sorento", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.5L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "kia-telluride", brand: "Kia", model: "Telluride", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "3.8L V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "kia-seltos", brand: "Kia", model: "Seltos", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.0L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "kia-carnival", brand: "Kia", model: "Carnival", series: "Minivans", defaultBodyType: "Minivan", defaultEngine: "3.5L V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" }
    ]
  },
  {
    id: "Ford",
    name: "Ford",
    logo: "🚗",
    aliases: ["Ford"],
    models: [
      { id: "ford-explorer", brand: "Ford", model: "Explorer", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.3L EcoBoost", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "ford-edge", brand: "Ford", model: "Edge", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.0L EcoBoost", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "ford-escape", brand: "Ford", model: "Escape", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "1.5L EcoBoost", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "ford-expedition", brand: "Ford", model: "Expedition", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "3.5L EcoBoost V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "ford-f150", brand: "Ford", model: "F-150", series: "Trucks & Pickups", defaultBodyType: "Pickup", defaultEngine: "3.5L EcoBoost V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "ford-ranger", brand: "Ford", model: "Ranger", series: "Trucks & Pickups", defaultBodyType: "Pickup", defaultEngine: "2.0L BiTurbo Diesel", defaultTransmission: "Automatic", defaultFuelType: "Diesel", defaultDriveType: "4WD" },
      { id: "ford-everest", brand: "Ford", model: "Everest", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.0L BiTurbo Diesel", defaultTransmission: "Automatic", defaultFuelType: "Diesel", defaultDriveType: "4WD" },
      { id: "ford-fusion", brand: "Ford", model: "Fusion", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "2.0L EcoBoost", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "ford-mustang", brand: "Ford", model: "Mustang", series: "Sports", defaultBodyType: "Coupe", defaultEngine: "5.0L V8", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "RWD" }
    ]
  },
  {
    id: "Nissan",
    name: "Nissan",
    logo: "🚗",
    aliases: ["Nissan"],
    models: [
      { id: "nissan-altima", brand: "Nissan", model: "Altima", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "2.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "nissan-maxima", brand: "Nissan", model: "Maxima", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "3.5L V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "nissan-sentra", brand: "Nissan", model: "Sentra", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "2.0L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "nissan-pathfinder", brand: "Nissan", model: "Pathfinder", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "3.5L V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "nissan-patrol", brand: "Nissan", model: "Patrol", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "5.6L V8", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "nissan-xtrail", brand: "Nissan", model: "X-Trail / Rogue", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "nissan-murano", brand: "Nissan", model: "Murano", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "3.5L V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "nissan-navara", brand: "Nissan", model: "Navara", series: "Trucks & Pickups", defaultBodyType: "Pickup", defaultEngine: "2.5L Diesel", defaultTransmission: "Automatic", defaultFuelType: "Diesel", defaultDriveType: "4WD" }
    ]
  },
  {
    id: "Volkswagen",
    name: "Volkswagen",
    logo: "🚗",
    aliases: ["Volkswagen", "VW"],
    models: [
      { id: "vw-golf", brand: "Volkswagen", model: "Golf", series: "Hatchbacks", defaultBodyType: "Hatchback", defaultEngine: "2.0L TSI", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "vw-passat", brand: "Volkswagen", model: "Passat", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "2.0L TSI", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "vw-jetta", brand: "Volkswagen", model: "Jetta", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "1.4L TSI", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "vw-tiguan", brand: "Volkswagen", model: "Tiguan", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.0L TSI", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "vw-touareg", brand: "Volkswagen", model: "Touareg", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "3.0L V6 TDI", defaultTransmission: "Automatic", defaultFuelType: "Diesel", defaultDriveType: "AWD" },
      { id: "vw-atlas", brand: "Volkswagen", model: "Atlas / Teramont", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "3.6L V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" }
    ]
  },
  {
    id: "Mazda",
    name: "Mazda",
    logo: "🚗",
    aliases: ["Mazda"],
    models: [
      { id: "mazda-3", brand: "Mazda", model: "Mazda3", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "2.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "mazda-6", brand: "Mazda", model: "Mazda6", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "2.5L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "mazda-cx30", brand: "Mazda", model: "CX-30", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "mazda-cx5", brand: "Mazda", model: "CX-5", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "mazda-cx9", brand: "Mazda", model: "CX-9", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.5L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "mazda-cx90", brand: "Mazda", model: "CX-90", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "3.3L Turbo Inline-6", defaultTransmission: "Automatic", defaultFuelType: "Hybrid", defaultDriveType: "AWD" }
    ]
  },
  {
    id: "Chevrolet",
    name: "Chevrolet",
    logo: "🚗",
    aliases: ["Chevrolet", "Chevy"],
    models: [
      { id: "chevy-malibu", brand: "Chevrolet", model: "Malibu", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "1.5L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "chevy-camaro", brand: "Chevrolet", model: "Camaro", series: "Sports", defaultBodyType: "Coupe", defaultEngine: "6.2L V8", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "RWD" },
      { id: "chevy-corvette", brand: "Chevrolet", model: "Corvette", series: "Sports", defaultBodyType: "Coupe", defaultEngine: "6.2L V8", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "RWD" },
      { id: "chevy-equinox", brand: "Chevrolet", model: "Equinox", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "1.5L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "chevy-traverse", brand: "Chevrolet", model: "Traverse", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "3.6L V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "chevy-tahoe", brand: "Chevrolet", model: "Tahoe", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "5.3L V8", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "chevy-suburban", brand: "Chevrolet", model: "Suburban", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "5.3L V8", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "chevy-silverado", brand: "Chevrolet", model: "Silverado", series: "Trucks", defaultBodyType: "Pickup", defaultEngine: "5.3L V8", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" }
    ]
  },
  {
    id: "Land Rover",
    name: "Land Rover",
    logo: "🚗",
    aliases: ["Land Rover"],
    models: [
      { id: "lr-defender", brand: "Land Rover", model: "Defender 110", series: "Defender", defaultBodyType: "SUV", defaultEngine: "3.0L Turbo Inline-6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "lr-defender-90", brand: "Land Rover", model: "Defender 90", series: "Defender", defaultBodyType: "SUV", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "lr-defender-130", brand: "Land Rover", model: "Defender 130", series: "Defender", defaultBodyType: "SUV", defaultEngine: "3.0L Turbo Inline-6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "lr-discovery", brand: "Land Rover", model: "Discovery", series: "Discovery", defaultBodyType: "SUV", defaultEngine: "3.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "lr-discovery-sport", brand: "Land Rover", model: "Discovery Sport", series: "Discovery", defaultBodyType: "SUV", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" }
    ]
  },
  {
    id: "Range Rover",
    name: "Range Rover",
    logo: "🚗",
    aliases: ["Range Rover"],
    models: [
      { id: "rr-vogue", brand: "Range Rover", model: "Range Rover Vogue", series: "Full Size", defaultBodyType: "SUV", defaultEngine: "4.4L Twin Turbo V8", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "rr-autobiography", brand: "Range Rover", model: "Range Rover Autobiography", series: "Full Size", defaultBodyType: "SUV", defaultEngine: "4.4L Twin Turbo V8", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "rr-sport", brand: "Range Rover", model: "Range Rover Sport", series: "Sport", defaultBodyType: "SUV", defaultEngine: "3.0L Turbo Inline-6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "rr-sport-svr", brand: "Range Rover", model: "Range Rover Sport SVR", series: "Sport", defaultBodyType: "SUV", defaultEngine: "5.0L Supercharged V8", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "rr-velar", brand: "Range Rover", model: "Range Rover Velar", series: "Velar", defaultBodyType: "SUV", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "rr-evoque", brand: "Range Rover", model: "Range Rover Evoque", series: "Evoque", defaultBodyType: "SUV", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" }
    ]
  },
  {
    id: "Volvo",
    name: "Volvo",
    logo: "🚗",
    aliases: ["Volvo"],
    models: [
      { id: "volvo-s60", brand: "Volvo", model: "S60", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Hybrid", defaultDriveType: "AWD" },
      { id: "volvo-s90", brand: "Volvo", model: "S90", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Hybrid", defaultDriveType: "AWD" },
      { id: "volvo-xc40", brand: "Volvo", model: "XC40", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "volvo-xc60", brand: "Volvo", model: "XC60", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Hybrid", defaultDriveType: "AWD" },
      { id: "volvo-xc90", brand: "Volvo", model: "XC90", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.0L Turbo Supercharged", defaultTransmission: "Automatic", defaultFuelType: "Hybrid", defaultDriveType: "AWD" }
    ]
  },
  {
    id: "Porsche",
    name: "Porsche",
    logo: "🚗",
    aliases: ["Porsche"],
    models: [
      { id: "porsche-911", brand: "Porsche", model: "911 Carrera", series: "911", defaultBodyType: "Coupe", defaultEngine: "3.0L Twin Turbo Boxer-6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "RWD" },
      { id: "porsche-cayenne", brand: "Porsche", model: "Cayenne", series: "Cayenne", defaultBodyType: "SUV", defaultEngine: "3.0L Turbo V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "porsche-cayenne-coupe", brand: "Porsche", model: "Cayenne Coupe", series: "Cayenne", defaultBodyType: "SUV", defaultEngine: "4.0L Twin Turbo V8", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "porsche-macan", brand: "Porsche", model: "Macan", series: "Macan", defaultBodyType: "SUV", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "porsche-panamera", brand: "Porsche", model: "Panamera", series: "Panamera", defaultBodyType: "Sedan", defaultEngine: "2.9L Twin Turbo V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "porsche-taycan", brand: "Porsche", model: "Taycan", series: "Taycan", defaultBodyType: "Sedan", defaultEngine: "Dual Electric Motor", defaultTransmission: "Automatic", defaultFuelType: "Electric", defaultDriveType: "AWD" }
    ]
  },
  {
    id: "Jeep",
    name: "Jeep",
    logo: "🚗",
    aliases: ["Jeep"],
    models: [
      { id: "jeep-wrangler", brand: "Jeep", model: "Wrangler Unlimited", series: "Wrangler", defaultBodyType: "SUV", defaultEngine: "3.6L V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "jeep-grand-cherokee", brand: "Jeep", model: "Grand Cherokee", series: "Grand Cherokee", defaultBodyType: "SUV", defaultEngine: "3.6L V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "jeep-cherokee", brand: "Jeep", model: "Cherokee", series: "Cherokee", defaultBodyType: "SUV", defaultEngine: "2.4L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "jeep-compass", brand: "Jeep", model: "Compass", series: "Compass", defaultBodyType: "SUV", defaultEngine: "2.4L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "jeep-gladiator", brand: "Jeep", model: "Gladiator", series: "Pickups", defaultBodyType: "Pickup", defaultEngine: "3.6L V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" }
    ]
  },
  {
    id: "Subaru",
    name: "Subaru",
    logo: "🚗",
    aliases: ["Subaru"],
    models: [
      { id: "subaru-forester", brand: "Subaru", model: "Forester", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.5L Boxer", defaultTransmission: "CVT", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "subaru-outback", brand: "Subaru", model: "Outback", series: "Wagons", defaultBodyType: "Wagon", defaultEngine: "2.5L Boxer", defaultTransmission: "CVT", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "subaru-crosstrek", brand: "Subaru", model: "Crosstrek", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.0L Boxer", defaultTransmission: "CVT", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "subaru-wrx", brand: "Subaru", model: "WRX", series: "Sports", defaultBodyType: "Sedan", defaultEngine: "2.4L Turbo Boxer", defaultTransmission: "Manual", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "subaru-legacy", brand: "Subaru", model: "Legacy", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "2.5L Boxer", defaultTransmission: "CVT", defaultFuelType: "Petrol", defaultDriveType: "AWD" }
    ]
  },
  {
    id: "Peugeot",
    name: "Peugeot",
    logo: "🚗",
    aliases: ["Peugeot"],
    models: [
      { id: "peugeot-208", brand: "Peugeot", model: "208", series: "Hatchbacks", defaultBodyType: "Hatchback", defaultEngine: "1.2L PureTech", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "peugeot-301", brand: "Peugeot", model: "301", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "1.6L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "peugeot-308", brand: "Peugeot", model: "308", series: "Hatchbacks", defaultBodyType: "Hatchback", defaultEngine: "1.2L PureTech", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "peugeot-508", brand: "Peugeot", model: "508", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "1.6L PureTech", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "peugeot-2008", brand: "Peugeot", model: "2008", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "1.2L PureTech", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "peugeot-3008", brand: "Peugeot", model: "3008", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "1.6L PureTech", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "peugeot-5008", brand: "Peugeot", model: "5008", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "1.6L PureTech", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" }
    ]
  },
  {
    id: "Mitsubishi",
    name: "Mitsubishi",
    logo: "🚗",
    aliases: ["Mitsubishi"],
    models: [
      { id: "mitsubishi-pajero", brand: "Mitsubishi", model: "Pajero", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "3.5L V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "mitsubishi-pajero-sport", brand: "Mitsubishi", model: "Pajero Sport", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.4L Diesel", defaultTransmission: "Automatic", defaultFuelType: "Diesel", defaultDriveType: "4WD" },
      { id: "mitsubishi-outlander", brand: "Mitsubishi", model: "Outlander", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.5L", defaultTransmission: "CVT", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "mitsubishi-asx", brand: "Mitsubishi", model: "ASX", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.0L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "mitsubishi-eclipse-cross", brand: "Mitsubishi", model: "Eclipse Cross", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "1.5L Turbo", defaultTransmission: "CVT", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "mitsubishi-l200", brand: "Mitsubishi", model: "L200 Triton", series: "Trucks", defaultBodyType: "Pickup", defaultEngine: "2.4L Diesel", defaultTransmission: "Automatic", defaultFuelType: "Diesel", defaultDriveType: "4WD" }
    ]
  },
  {
    id: "Suzuki",
    name: "Suzuki",
    logo: "🚗",
    aliases: ["Suzuki"],
    models: [
      { id: "suzuki-swift", brand: "Suzuki", model: "Swift", series: "Hatchbacks", defaultBodyType: "Hatchback", defaultEngine: "1.2L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "suzuki-vitara", brand: "Suzuki", model: "Grand Vitara", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "1.5L", defaultTransmission: "Automatic", defaultFuelType: "Hybrid", defaultDriveType: "AWD" },
      { id: "suzuki-jimny", brand: "Suzuki", model: "Jimny", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "1.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "suzuki-baleno", brand: "Suzuki", model: "Baleno", series: "Hatchbacks", defaultBodyType: "Hatchback", defaultEngine: "1.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "suzuki-ertiga", brand: "Suzuki", model: "Ertiga", series: "Minivans", defaultBodyType: "Minivan", defaultEngine: "1.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" }
    ]
  },
  {
    id: "Innoson",
    name: "Innoson",
    logo: "🚗",
    aliases: ["Innoson", "IVM"],
    models: [
      { id: "ivm-g5", brand: "Innoson", model: "IVM G5", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.4L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "ivm-g6", brand: "Innoson", model: "IVM G6", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "ivm-g80", brand: "Innoson", model: "IVM G80", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "3.0L Turbo V6", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "ivm-granite", brand: "Innoson", model: "IVM Granite", series: "Pickups", defaultBodyType: "Pickup", defaultEngine: "2.4L", defaultTransmission: "Manual", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "ivm-caris", brand: "Innoson", model: "IVM Caris", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "1.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "ivm-connect", brand: "Innoson", model: "IVM Connect", series: "Hatchbacks", defaultBodyType: "Hatchback", defaultEngine: "1.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "ivm-fox", brand: "Innoson", model: "IVM Fox", series: "Hatchbacks", defaultBodyType: "Hatchback", defaultEngine: "1.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "ivm-umu", brand: "Innoson", model: "IVM Umu", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "1.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" }
    ]
  },
  {
    id: "Geely",
    name: "Geely",
    logo: "🚗",
    aliases: ["Geely"],
    models: [
      { id: "geely-coolray", brand: "Geely", model: "Coolray", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "1.5L Turbo", defaultTransmission: "DCT", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "geely-emgrand", brand: "Geely", model: "Emgrand", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "1.5L", defaultTransmission: "CVT", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "geely-azkarra", brand: "Geely", model: "Azkarra", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "1.5L Turbo Hybrid", defaultTransmission: "Automatic", defaultFuelType: "Hybrid", defaultDriveType: "AWD" },
      { id: "geely-tugella", brand: "Geely", model: "Tugella", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" },
      { id: "geely-okavango", brand: "Geely", model: "Okavango", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "1.5L Turbo Hybrid", defaultTransmission: "DCT", defaultFuelType: "Hybrid", defaultDriveType: "FWD" },
      { id: "geely-monjaro", brand: "Geely", model: "Monjaro", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "AWD" }
    ]
  },
  {
    id: "Chery",
    name: "Chery",
    logo: "🚗",
    aliases: ["Chery"],
    models: [
      { id: "chery-tiggo2", brand: "Chery", model: "Tiggo 2 Pro", series: "Tiggo Series", defaultBodyType: "SUV", defaultEngine: "1.5L", defaultTransmission: "CVT", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "chery-tiggo4", brand: "Chery", model: "Tiggo 4 Pro", series: "Tiggo Series", defaultBodyType: "SUV", defaultEngine: "1.5L Turbo", defaultTransmission: "CVT", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "chery-tiggo7", brand: "Chery", model: "Tiggo 7 Pro", series: "Tiggo Series", defaultBodyType: "SUV", defaultEngine: "1.5L Turbo", defaultTransmission: "DCT", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "chery-tiggo8", brand: "Chery", model: "Tiggo 8 Pro", series: "Tiggo Series", defaultBodyType: "SUV", defaultEngine: "2.0L Turbo", defaultTransmission: "DCT", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "chery-arrizo5", brand: "Chery", model: "Arrizo 5", series: "Arrizo Series", defaultBodyType: "Sedan", defaultEngine: "1.5L", defaultTransmission: "CVT", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "chery-arrizo6", brand: "Chery", model: "Arrizo 6 Pro", series: "Arrizo Series", defaultBodyType: "Sedan", defaultEngine: "1.5L Turbo", defaultTransmission: "CVT", defaultFuelType: "Petrol", defaultDriveType: "FWD" }
    ]
  },
  {
    id: "GAC",
    name: "GAC",
    logo: "🚗",
    aliases: ["GAC", "GAC Motor"],
    models: [
      { id: "gac-gs3", brand: "GAC", model: "GS3 Emzoom", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "1.5L Turbo", defaultTransmission: "DCT", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "gac-gs4", brand: "GAC", model: "GS4", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "1.5L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "gac-gs5", brand: "GAC", model: "GS5", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "1.5L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "gac-gs8", brand: "GAC", model: "GS8", series: "SUVs", defaultBodyType: "SUV", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "4WD" },
      { id: "gac-ga4", brand: "GAC", model: "GA4", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "1.5L", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "gac-ga8", brand: "GAC", model: "GA8", series: "Sedans", defaultBodyType: "Sedan", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "gac-gn6", brand: "GAC", model: "GN6", series: "MPVs", defaultBodyType: "Minivan", defaultEngine: "1.5L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" },
      { id: "gac-gn8", brand: "GAC", model: "GN8", series: "MPVs", defaultBodyType: "Minivan", defaultEngine: "2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Petrol", defaultDriveType: "FWD" }
    ]
  },
  {
    id: "BYD",
    name: "BYD",
    logo: "🚗",
    aliases: ["BYD"],
    models: [
      { id: "byd-seal", brand: "BYD", model: "Seal", series: "Ocean Series", defaultBodyType: "Sedan", defaultEngine: "Dual Electric Motor", defaultTransmission: "Automatic", defaultFuelType: "Electric", defaultDriveType: "AWD" },
      { id: "byd-dolphin", brand: "BYD", model: "Dolphin", series: "Ocean Series", defaultBodyType: "Hatchback", defaultEngine: "Electric Motor", defaultTransmission: "Automatic", defaultFuelType: "Electric", defaultDriveType: "FWD" },
      { id: "byd-atto3", brand: "BYD", model: "Atto 3", series: "Ocean Series", defaultBodyType: "SUV", defaultEngine: "Electric Motor", defaultTransmission: "Automatic", defaultFuelType: "Electric", defaultDriveType: "FWD" },
      { id: "byd-han", brand: "BYD", model: "Han", series: "Dynasty Series", defaultBodyType: "Sedan", defaultEngine: "Dual Electric Motor", defaultTransmission: "Automatic", defaultFuelType: "Electric", defaultDriveType: "AWD" },
      { id: "byd-tang", brand: "BYD", model: "Tang", series: "Dynasty Series", defaultBodyType: "SUV", defaultEngine: "Dual Electric Motor", defaultTransmission: "Automatic", defaultFuelType: "Electric", defaultDriveType: "AWD" },
      { id: "byd-song-plus", brand: "BYD", model: "Song Plus DM-i", series: "Dynasty Series", defaultBodyType: "SUV", defaultEngine: "1.5L Plug-in Hybrid", defaultTransmission: "Automatic", defaultFuelType: "Plug-in Hybrid", defaultDriveType: "FWD" },
      { id: "byd-qin-plus", brand: "BYD", model: "Qin Plus DM-i", series: "Dynasty Series", defaultBodyType: "Sedan", defaultEngine: "1.5L Plug-in Hybrid", defaultTransmission: "Automatic", defaultFuelType: "Plug-in Hybrid", defaultDriveType: "FWD" },
      { id: "byd-yangwang-u8", brand: "BYD", model: "Yangwang U8", series: "Yangwang", defaultBodyType: "SUV", defaultEngine: "Quad Electric Motors + 2.0L Turbo", defaultTransmission: "Automatic", defaultFuelType: "Plug-in Hybrid", defaultDriveType: "4WD" }
    ]
  }
];

export const VEHICLE_CONDITIONS = [
  "Brand New",
  "Foreign Used",
  "Nigerian Used",
  "Tokunbo",
  "Fairly Used",
  "Used"
] as const;

export const VEHICLE_TRANSMISSIONS = [
  "Automatic",
  "Manual",
  "CVT",
  "DCT",
  "AMT",
  "Other"
] as const;

export const VEHICLE_FUEL_TYPES = [
  "Petrol",
  "Diesel",
  "Hybrid",
  "Electric",
  "Plug-in Hybrid",
  "Other"
] as const;

export const VEHICLE_DRIVE_TYPES = [
  "FWD",
  "RWD",
  "AWD",
  "4WD"
] as const;

export const VEHICLE_BODY_TYPES = [
  "Sedan",
  "SUV",
  "Coupe",
  "Convertible",
  "Hatchback",
  "Wagon",
  "Pickup",
  "Minivan",
  "Van",
  "Truck",
  "Bus",
  "Other"
] as const;

export const VEHICLE_EXTERIOR_COLORS = [
  "Black",
  "White",
  "Silver",
  "Grey",
  "Blue",
  "Red",
  "Green",
  "Brown",
  "Gold",
  "Other"
] as const;

export const VEHICLE_INTERIOR_COLORS = [
  "Black",
  "Beige",
  "Brown",
  "Grey",
  "Red",
  "Tan",
  "Other"
] as const;

export const VEHICLE_STATUSES = [
  "Available",
  "Reserved",
  "Sold",
  "Sold Out"
] as const;

export const VEHICLE_DOCUMENTATION_STATUSES = [
  "Complete",
  "Available",
  "Pending",
  "Other"
] as const;

export const VEHICLE_LOCATIONS = [
  "Lagos",
  "Abuja",
  "Enugu",
  "Anambra",
  "Port Harcourt",
  "Onitsha",
  "Nsukka",
  "Ibadan",
  "Kano",
  "Other"
] as const;

export const VEHICLE_YEARS = Array.from({ length: 17 }, (_, i) => String(2026 - i)); // 2026 down to 2010

/**
 * Returns all models for a specific vehicle brand.
 */
export function getModelsForVehicleBrand(brandName: string): VehicleModelItem[] {
  if (!brandName || !brandName.trim()) return [];
  const norm = brandName.trim().toLowerCase();
  const brand = VEHICLE_BRANDS.find(
    (b) =>
      b.name.toLowerCase() === norm ||
      b.id.toLowerCase() === norm ||
      b.aliases.some((a) => a.toLowerCase() === norm)
  );
  return brand ? brand.models : [];
}

/**
 * Returns distinct series list for a specified vehicle brand.
 */
export function getSeriesForVehicleBrand(brandName: string): string[] {
  const models = getModelsForVehicleBrand(brandName);
  if (!models.length) return [];
  const seriesSet = new Set<string>();
  models.forEach((m) => {
    if (m.series && m.series.trim()) {
      seriesSet.add(m.series.trim());
    }
  });
  return Array.from(seriesSet);
}

/**
 * Returns models for a vehicle brand optionally filtered by series.
 */
export function getModelsForVehicleBrandAndSeries(
  brandName: string,
  seriesName?: string
): VehicleModelItem[] {
  const models = getModelsForVehicleBrand(brandName);
  if (!seriesName || seriesName === "All" || seriesName === "All Series") {
    return models;
  }
  const normSeries = seriesName.trim().toLowerCase();
  return models.filter((m) => m.series && m.series.trim().toLowerCase() === normSeries);
}

/**
 * Finds exact vehicle model spec preset details in database.
 */
export function getVehicleModelDetails(
  brandName: string,
  modelName: string
): VehicleModelItem | undefined {
  const models = getModelsForVehicleBrand(brandName);
  if (!models.length) return undefined;
  const normModel = modelName.trim().toLowerCase();
  return models.find((m) => m.model.toLowerCase() === normModel);
}
