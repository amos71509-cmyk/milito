import { Product } from "../types";

/**
 * Parses user input for price expressions such as:
 * - "500000", "500k", "₦500,000", "1.5m", "1.85m"
 * - "under 500k", "below 200,000", "< 500000", "less than 500k"
 * - "above 1m", "over 500k", "> 500000", "more than 1000000"
 * - "200k - 500k", "200000 to 500000"
 */
interface PriceFilterCriteria {
  minPrice?: number;
  maxPrice?: number;
  targetPrice?: number;
  tolerancePercent?: number;
}

/**
 * Converts shorthand like "500k" -> 500000, "1.5m" -> 1500000, "₦1,850,000" -> 1850000
 */
export function parsePriceValue(str: string): number | null {
  if (!str) return null;
  const clean = str.toLowerCase().replace(/[₦$,\s]/g, "").trim();
  
  if (clean.endsWith("m") || clean.endsWith("million")) {
    const num = parseFloat(clean.replace(/million|m/, ""));
    return isNaN(num) ? null : Math.round(num * 1000000);
  }
  if (clean.endsWith("k") || clean.endsWith("thousand")) {
    const num = parseFloat(clean.replace(/thousand|k/, ""));
    return isNaN(num) ? null : Math.round(num * 1000);
  }
  const directNum = parseFloat(clean);
  return isNaN(directNum) || directNum <= 0 ? null : Math.round(directNum);
}

/**
 * Analyzes search query to detect structured price intents
 */
export function extractPriceIntent(query: string): PriceFilterCriteria | null {
  const lower = query.toLowerCase().trim();

  // Pattern: "under 500k", "below 500000", "less than ₦500k", "< 500k", "max 500k"
  const underMatch = lower.match(/(?:under|below|less than|max|up to|<|<=)\s*([₦$]?\s*[\d,.]+\s*(?:k|m|million|thousand)?)/i);
  if (underMatch && underMatch[1]) {
    const val = parsePriceValue(underMatch[1]);
    if (val !== null && val >= 1000) {
      return { maxPrice: val };
    }
  }

  // Pattern: "above 500k", "over 500000", "more than ₦500k", "> 500k", "min 500k"
  const aboveMatch = lower.match(/(?:above|over|more than|min|from|>|>=)\s*([₦$]?\s*[\d,.]+\s*(?:k|m|million|thousand)?)/i);
  if (aboveMatch && aboveMatch[1]) {
    const val = parsePriceValue(aboveMatch[1]);
    if (val !== null && val >= 1000) {
      return { minPrice: val };
    }
  }

  // Pattern: "200k - 500k" or "200000 to 500000" or "200k and 500k"
  const rangeMatch = lower.match(/([₦$]?\s*[\d,.]+\s*(?:k|m|million|thousand)?)\s*(?:-|to|and)\s*([₦$]?\s*[\d,.]+\s*(?:k|m|million|thousand)?)/i);
  if (rangeMatch && rangeMatch[1] && rangeMatch[2]) {
    const minVal = parsePriceValue(rangeMatch[1]);
    const maxVal = parsePriceValue(rangeMatch[2]);
    if (minVal !== null && maxVal !== null && minVal >= 1000 && maxVal >= 1000) {
      return { minPrice: Math.min(minVal, maxVal), maxPrice: Math.max(minVal, maxVal) };
    }
  }

  // Pattern: Standalone price query like "500000", "500k", "₦500,000", "1850000"
  const standalonePriceMatch = lower.match(/^([₦$]?\s*[\d,.]+\s*(?:k|m|million|thousand)?)$/i);
  if (standalonePriceMatch && standalonePriceMatch[1]) {
    const val = parsePriceValue(standalonePriceMatch[1]);
    if (val !== null && val >= 10000) {
      // For standalone target price (e.g. 500000 or 500k), allow ±25% range or exact matching
      return { targetPrice: val, tolerancePercent: 0.25 };
    }
  }

  return null;
}

/**
 * Builds a searchable token string representation of a product.
 */
export function buildProductCorpus(product: Product): string {
  const parts: string[] = [
    product.name,
    product.brand,
    product.condition,
    product.badge || "",
    product.description || "",
    product.productType || "",
    product.categorySlug || "",
    product.batteryHealth || "",
    product.batteryHealthValue || "",
    product.batteryCondition || "",
    product.deviceLockStatus || "",
    product.networkCapability || "",
    product.network || "",
    product.faceId || "",
    product.fingerprint || "",
    product.year ? String(product.year) : "",
    product.transmission || "",
    product.fuelType || "",
    product.engineSize || "",
    product.driveType || "",
    product.location || "",
    product.vehicleStatus || "",
    product.documentation || "",
    product.interiorColor || "",
    product.vin || "",
    ...(product.vehicleFeatures || []),
    ...(product.storageOptions || []),
    ...(product.colorOptions ? product.colorOptions.map(c => typeof c === "string" ? c : c.name) : []),
    ...(product.tags || [])
  ];

  // Include price strings (raw number, formatted with commas, formatted with NGN)
  const p = product.price;
  if (typeof p === "number" && p > 0) {
    parts.push(p.toString());
    parts.push(`₦${p.toLocaleString()}`);
    parts.push(p.toLocaleString());
    parts.push(`${Math.round(p / 1000)}k`);
    parts.push(`${(p / 1000000).toFixed(2)}m`);
  }

  // Include specs
  if (product.specs) {
    for (const key of Object.keys(product.specs)) {
      const val = (product.specs as any)[key];
      if (typeof val === "string") {
        parts.push(val);
      }
    }
  }

  // Common synonyms / aliases
  const bLower = (product.brand || "").toLowerCase();
  const nLower = (product.name || "").toLowerCase();
  const pType = (product.productType || "").toLowerCase();

  // Vehicle detection & synonyms
  const isVehicle = pType === "vehicle" || Boolean(product.year || product.transmission || product.mileage) || ["toyota", "lexus", "mercedes", "mercedes-benz", "benz", "honda", "hyundai", "kia", "ford", "land rover", "bmw", "audi", "nissan", "mazda"].some(vb => bLower.includes(vb));
  if (isVehicle) {
    parts.push("vehicle");
    parts.push("vehicles");
    parts.push("car");
    parts.push("cars");
    parts.push("motor");
    parts.push("auto");
    parts.push("automobile");
    parts.push("tokunbo");
    parts.push("foreign used");
    parts.push("nigerian used");
    parts.push("suv");
    parts.push("sedan");
  } else {
    // Non-vehicle (gadgets, phones, laptops)
    parts.push("gadget");
    parts.push("gadgets");
    parts.push("tech");
  }

  // Laptop & computer synonyms
  if (nLower.includes("macbook") || nLower.includes("laptop") || nLower.includes("notebook") || nLower.includes("thinkpad") || bLower.includes("dell") || bLower.includes("hp") || bLower.includes("lenovo")) {
    parts.push("laptop");
    parts.push("laptops");
    parts.push("macbook");
    parts.push("computer");
    parts.push("pc");
  }

  // Tablet & wearable synonyms
  if (nLower.includes("ipad") || nLower.includes("tab") || nLower.includes("watch") || nLower.includes("airpod") || nLower.includes("buds")) {
    parts.push("tablet");
    parts.push("watch");
    parts.push("smartwatch");
    parts.push("audio");
    parts.push("accessories");
  }

  // Phone synonyms
  if (!isVehicle) {
    parts.push("phone");
    parts.push("phones");
    parts.push("smartphone");
    parts.push("smartphones");
    parts.push("mobile");
  }

  if (bLower.includes("apple") || nLower.includes("iphone")) {
    parts.push("apple");
    parts.push("iphone");
    parts.push("ios");
  }
  if (bLower.includes("samsung") || nLower.includes("galaxy")) {
    parts.push("samsung");
    parts.push("galaxy");
    parts.push("android");
  }
  if (bLower.includes("google") || nLower.includes("pixel")) {
    parts.push("google");
    parts.push("pixel");
    parts.push("android");
  }
  if (bLower.includes("redmi") || nLower.includes("xiaomi") || bLower.includes("xiaomi")) {
    parts.push("redmi");
    parts.push("xiaomi");
    parts.push("hyperos");
  }
  if (bLower.includes("tecno") || nLower.includes("camon") || nLower.includes("spark")) {
    parts.push("tecno");
    parts.push("hios");
  }
  if (bLower.includes("infinix") || nLower.includes("hot") || nLower.includes("zero") || nLower.includes("note")) {
    parts.push("infinix");
    parts.push("xos");
  }

  return parts.join(" ").toLowerCase();
}

/**
 * Evaluates if a single search token matches a product's search corpus.
 */
function matchToken(token: string, corpus: string, product: Product): boolean {
  if (!token) return true;

  // Direct substring match in corpus
  if (corpus.includes(token)) return true;

  // RAM matching: "8gb", "8gb ram", "12gb", "16gb"
  if (token.match(/^\d+gb$/i)) {
    // Check if storage options or specs or ram contains this storage/RAM
    const storageMatch = (product.storageOptions || []).some(s => s.toLowerCase().replace(/\s/g, "") === token);
    if (storageMatch) return true;
    
    const specsRam = product.specs?.ram?.toLowerCase() || "";
    if (specsRam.includes(token)) return true;

    const specsChip = product.specs?.chipset?.toLowerCase() || "";
    if (specsChip.includes(token)) return true;
  }

  // 5G / 4G matching
  if (token === "5g") {
    if (product.networkCapability?.toLowerCase().includes("5g")) return true;
    if (product.name.toLowerCase().includes("5g")) return true;
    if (product.specs?.simType?.toLowerCase().includes("5g")) return true;
    if (product.description.toLowerCase().includes("5g")) return true;
  }

  // Number / Price matching
  const num = parseInt(token, 10);
  if (!isNaN(num) && num > 1000) {
    if (product.price.toString().includes(token)) return true;
    // Check if within 20% range of the product price
    const diff = Math.abs(product.price - num);
    if (diff / product.price <= 0.2) return true;
  }

  return false;
}

/**
 * Scores a product's relevance to the search query.
 */
export function calculateRelevanceScore(product: Product, query: string, tokens: string[]): number {
  let score = 0;
  const q = query.toLowerCase().trim();
  const name = product.name.toLowerCase();
  const brand = product.brand.toLowerCase();

  // Exact name match
  if (name === q) score += 200;
  else if (name.startsWith(q)) score += 100;
  else if (name.includes(q)) score += 80;

  // Brand match
  if (brand === q) score += 60;
  else if (brand.includes(q)) score += 40;

  // Token matches in name
  for (const token of tokens) {
    if (name.includes(token)) score += 25;
    if (brand.includes(token)) score += 20;
    if (product.storageOptions?.some(s => s.toLowerCase().includes(token))) score += 15;
    if (product.specs?.ram?.toLowerCase().includes(token)) score += 15;
    if (product.specs?.chipset?.toLowerCase().includes(token)) score += 10;
    if (product.specs?.camera?.toLowerCase().includes(token)) score += 10;
  }

  // Stock preference: In stock products get a slight priority
  if (product.availability === "In Stock") score += 5;

  return score;
}

/**
 * Searches a list of products flexibly against a user query.
 * Returns only products that legitimately match the user's search.
 * If no products match, returns an empty array.
 */
export function searchStoreProducts(products: Product[], rawQuery: string): Product[] {
  if (!rawQuery || !rawQuery.trim()) {
    return products;
  }

  const query = rawQuery.trim();
  const lowerQuery = query.toLowerCase();

  // 1. Check for structured price intent (e.g. "under 500k", "500000", "200k - 500k")
  const priceIntent = extractPriceIntent(query);
  
  // 2. Tokenize query (filtering out common filler words unless essential)
  const stopWords = new Set(["a", "an", "the", "in", "for", "with", "of", "and", "or", "device", "devices", "phone", "phones", "gadget", "gadgets"]);
  const rawTokens = lowerQuery
    .replace(/[^\w\s₦$%+.-]/g, " ")
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length > 0);

  const meaningfulTokens = rawTokens.filter(t => !stopWords.has(t) || rawTokens.length === 1);
  const searchTokens = meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens;

  // Special check: If user typed "Samsung 8GB RAM", searchTokens = ["samsung", "8gb", "ram"]
  // If user typed "iPhone 15", searchTokens = ["iphone", "15"]
  // If user typed "256GB", searchTokens = ["256gb"]
  // If user typed "5G", searchTokens = ["5g"]
  // If user typed "500000", searchTokens = ["500000"]

  const matchedWithScores: { product: Product; score: number }[] = [];

  for (const product of products) {
    // A. Check price criteria if extracted
    if (priceIntent) {
      if (priceIntent.minPrice !== undefined && product.price < priceIntent.minPrice) {
        continue;
      }
      if (priceIntent.maxPrice !== undefined && product.price > priceIntent.maxPrice) {
        continue;
      }
      if (priceIntent.targetPrice !== undefined) {
        const tol = priceIntent.tolerancePercent || 0.25;
        const lowerBound = priceIntent.targetPrice * (1 - tol);
        const upperBound = priceIntent.targetPrice * (1 + tol);
        const priceMatches = product.price >= lowerBound && product.price <= upperBound;
        const rawStringMatches = product.price.toString().includes(priceIntent.targetPrice.toString());
        if (!priceMatches && !rawStringMatches) {
          continue;
        }
      }
    }

    // B. Token matching
    const corpus = buildProductCorpus(product);
    
    // Check if ALL search tokens match the product's corpus or attributes
    let allTokensMatch = true;
    for (const token of searchTokens) {
      // If token is part of a price specification that was already satisfied by priceIntent, skip it
      if (priceIntent && (token.match(/^\d+k$/) || token.match(/^\d+m$/) || token.match(/^\d{4,}$/))) {
        continue;
      }
      if (!matchToken(token, corpus, product)) {
        allTokensMatch = false;
        break;
      }
    }

    if (allTokensMatch) {
      const score = calculateRelevanceScore(product, query, searchTokens);
      matchedWithScores.push({ product, score });
    }
  }

  // Sort by highest relevance score
  matchedWithScores.sort((a, b) => b.score - a.score);

  return matchedWithScores.map(item => item.product);
}
