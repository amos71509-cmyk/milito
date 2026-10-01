export type DeviceCondition = "Brand New" | "Premium UK Used" | "Foreign Used" | "Nigerian Used" | "Tokunbo" | "Fairly Used" | "Used" | string;

export type ProductType = "phone" | "vehicle";

export interface CloudinaryImageMeta {
  secure_url: string;
  public_id: string;
  original_filename?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  created_at?: string;
}

export interface BrandItem {
  id: string;
  name: string;
  logoUrl?: string;
  logoPublicId?: string;
  logoMeta?: CloudinaryImageMeta;
}

export interface WebsiteBranding {
  logoUrl: string;
  logoPublicId: string;
  logoMeta?: CloudinaryImageMeta;
  brandLogos?: BrandItem[];
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  productType?: ProductType; // "phone" | "vehicle"
  condition: DeviceCondition;
  price: number; // in Naira (NGN)
  originalPrice?: number; // for discount badges
  featured?: boolean; // highlight on frontpage

  // Vehicle specific fields
  year?: string | number; // e.g. "2020", 2020
  mileage?: string; // e.g. "85,000 km"
  mileageNumber?: number; // numeric mileage
  transmission?: string; // e.g. "Automatic", "Manual", "CVT"
  fuelType?: string; // e.g. "Petrol", "Diesel", "Hybrid", "Electric"
  engine?: string; // e.g. "2.5L", "3.5L V6"
  driveType?: string; // e.g. "FWD", "RWD", "AWD", "4WD"
  bodyType?: string; // e.g. "Sedan", "SUV", "Coupe"
  engineSize?: string; // e.g. "3.5L V6", "2.0L 4-Cylinder"
  color?: string; // e.g. "Black", "White"
  exteriorColor?: string; // e.g. "Black", "White"
  interiorColor?: string; // e.g. "Beige", "Black Leather"
  vin?: string; // Vehicle Identification Number / Chassis
  vehicleFeatures?: string[]; // e.g. ["Sunroof", "Leather Seats", "Reverse Camera"]
  vehicleStatus?: "Available" | "Reserved" | "Sold" | "Sold Out" | string;
  documentation?: "Complete" | "Available" | "Pending" | "Other" | string;
  location?: string; // e.g. "Lagos", "Abuja"
  customBrand?: string;
  customModel?: string;
  series?: string;

  // Phone specific fields
  batteryHealth?: string; // e.g. "100%", "95%", "90%" for Apple/iPhone
  batteryHealthValue?: string; // e.g. "90%+", "95%+", "100%"
  batteryCondition?: "Excellent" | "Very Good" | "Good" | "Normal" | "Fair" | "Needs Attention" | string; // For Android (Samsung, Tecno, Redmi, etc.)
  deviceLockStatus?: "Unlocked" | "Carrier Locked" | "SIM Locked" | "Account Locked" | "Unknown" | string;
  availability?: "In Stock" | "Reserved" | "Sold Out";
  image: string;
  imagePublicId?: string;
  gallery: string[];
  galleryPublicIds?: string[];
  thumbnail?: {
    secure_url: string;
    public_id: string;
  };
  galleryImages?: CloudinaryImageMeta[];
  storageOptions: string[]; // e.g. ["128GB", "256GB", "512GB"]
  colorOptions: { name: string; hex: string }[];
  description: string;
  specs?: {
    screen: string;
    camera: string;
    chipset: string;
    batterySize: string;
    os: string;
    warranty: string;
    simType: string;
    ram?: string;
    trueTone?: string;
    icloudStatus?: string;
    carrierLock?: string;
    sPen?: string;
    eSimSupport?: string;
    androidVersion?: string;
    accessories?: string;
    knoxStatus?: string;
    biometrics?: string;
    titanM2?: string;
    ramExtension?: string;
    fingerprint?: string;
    faceUnlock?: string;
  };
  rating: number;
  reviewsCount: number;
  badge?: string; // e.g., "Best Seller", "In Stock"
  quantity?: number; // stock count
  stockQuantity?: number; // live inventory remaining count
  tags?: string[]; // optional badges
  faceId?: "Working" | "Not Working" | "Not Applicable" | string; // Face ID state
  fingerprint?: "Working" | "Not Working" | "Not Available" | string; // Fingerprint sensor state
  networkCapability?: "4G" | "5G" | "4G/5G" | string;
  network?: "Factory Unlocked" | "Dual SIM" | "eSIM" | "Physical SIM" | "Network Unlocked" | "SIM Unlocked" | "Locked" | string; // network standard
  categorySlug?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string; // unique cart item key (productId + storage + color)
  product: Product;
  quantity: number;
  selectedStorage: string;
  selectedColor: { name: string; hex: string };
}

export type PaymentStatus = "pending" | "pending_verification" | "paid" | "failed" | "refunded";
export type OrderStatus = "created" | "payment_verification_pending" | "protected" | "confirmed" | "processing" | "in_transit" | "delivered" | "cancelled";

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  city?: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  selectedSpecification: {
    storage?: string;
    color?: string;
    condition?: string;
    specsSummary?: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ProtectedOrder {
  id: string; // Firestore document ID
  orderId: string; // Customer-facing unique Order ID, e.g., MIL-20260820-XXXX
  orderSource?: string; // e.g. "whatsapp", "instagram", "facebook", "tiktok", "qr", "direct"
  customer: CustomerInfo;
  items: OrderItem[];
  // Summary for single-product checkout compatibility
  productId: string;
  productName: string;
  productImage: string;
  selectedSpecification: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentProvider?: string; // e.g., "manual_bank_transfer" | "paystack"
  paymentReference?: string;
  paymentTransactionId?: string;
  transferNotice?: {
    senderName?: string;
    senderBank?: string;
    narration?: string;
    transferReference?: string | null;
    notifiedAt?: string;
  };
  adminNotes?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string; // e.g., "Lagos, NG"
  rating: number;
  text: string;
  verifiedPurchase: boolean;
  avatar: string;
  deviceBought: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: "General" | "Phones" | "Payments" | "Trade-In" | "Imports" | "Ordering";
}

export type TradeInBrandName = 
  | "Apple"
  | "Samsung"
  | "Google"
  | "Tecno"
  | "Infinix"
  | "Xiaomi"
  | "Oppo"
  | "OnePlus"
  | "Huawei"
  | "Nokia"
  | "Itel"
  | "Vivo"
  | "Realme"
  | "Motorola"
  | "Sony"
  | "Honor";

export interface SwapDeviceConditionAnswers {
  screen?: "flawless" | "minor_scratches" | "visible_scratches" | "cracked" | "" | string;
  body?: "flawless" | "minor_scuffs" | "visible_dents" | "damaged" | "" | string;
  camera?: "working" | "minor_issue" | "faulty" | "" | string;
  batteryHealth?: number | null; // e.g. 91 (for 91%) or null
  batteryCondition?: "excellent" | "good" | "fair" | "poor" | "" | string;
  batteryState?: "excellent" | "good" | "service";
  otherFunctions?: {
    screenTouch?: boolean;
    cameras?: boolean;
    speakers?: boolean;
    microphone?: boolean;
    chargingPort?: boolean;
    buttons?: boolean;
    wifiBluetooth?: boolean;
    faceOrFingerprint?: boolean;
    [key: string]: boolean | undefined;
  };
  checklistReviewed?: boolean;
}

export type SwapStatus = 
  | "Submitted" 
  | "Under Review" 
  | "Awaiting Inspection" 
  | "Value Adjusted" 
  | "Approved" 
  | "Swap Confirmed" 
  | "Completed" 
  | "Cancelled"
  | "Declined";

export interface DevicePhotoMeta {
  url: string; // Cloudinary secure URL
  publicId?: string;
  original_filename?: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  created_at?: string;
}

export interface SwapRequest {
  id: string; // e.g. "MIL-SWAP-00421"
  customerName: string;
  customerPhone: string;
  customerLocation: string;
  currentDevice: {
    brand: string;
    model: string;
    storage: string;
    answers: SwapDeviceConditionAnswers;
    estimatedGrade: "Grade A" | "Grade B" | "Grade C" | "Grade D";
    estimatedValue: number;
    photos?: string[]; // Array of Cloudinary secure URLs
  };
  devicePhotos?: DevicePhotoMeta[]; // Full photo metadata with Cloudinary URLs & publicIds
  targetProduct: {
    id: string;
    name: string;
    brand: string;
    price: number;
    condition: string;
    image: string;
    storage?: string;
  };
  calculation: {
    currentDeviceValue: number;
    targetDevicePrice: number;
    difference: number; // positive = top-up required, negative = cash back / value surplus
    isTopUp: boolean;
  };
  status: SwapStatus;
  customerNotes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TradeInValuationRecord {
  id: string; // e.g. "VAL-samsung-galaxy-a05s-64gb"
  brand: string;
  model: string;
  storage: string;
  baseTradeInValue: number | null; // number in Naira, null if not set by admin
  status: "Active" | "Inactive";
  lastUpdated: string;
  notes?: string;
}

export interface ConditionAdjustmentRule {
  grade: "Grade A" | "Grade B" | "Grade C" | "Grade D";
  label: string;
  adjustmentType: "percentage" | "fixed";
  adjustmentValue: number; // percentage (e.g. 0, -15, -38, -62) or fixed deduction in NGN
  status: "Active" | "Inactive";
  description: string;
}

export interface TradeInValuation {
  brand: string;
  model: string;
  storage: string;
  grading: "A" | "B" | "C" | "D";
  valuation: number;
}

export interface StepItem {
  number: number;
  title: string;
  subtitle: string;
  description: string;
}

// Fallback visual indicator constant for images that are not yet uploaded or offline
export const NO_IMAGE_AVAILABLE = "";

/**
 * Computes a normalized, canonical deduplication key for any image input.
 * Handles Cloudinary URLs (with/without transformations, version tags, extensions),
 * Unsplash URLs, relative paths, and public IDs so that multiple references
 * to the exact same image asset are never duplicated.
 */
export function getImageCanonicalKey(input: any): string {
  if (!input) return "";
  let raw = "";
  if (typeof input === "object" && input !== null) {
    raw =
      input.public_id ||
      input.secure_url ||
      input.url ||
      input.previewUrl ||
      input.src ||
      input.imagePublicId ||
      input.image ||
      "";
  } else {
    raw = String(input);
  }
  let clean = raw.trim();
  if (!clean || clean === "[object Object]") return "";

  // Blob and data URLs: pass directly
  if (clean.startsWith("blob:") || clean.startsWith("data:")) {
    return clean;
  }

  // Cloudinary normalization: extract canonical public_id
  if (clean.includes("cloudinary.com") || clean.includes("res.cloudinary.com")) {
    try {
      const urlObj = new URL(clean.startsWith("http") ? clean : `https://${clean}`);
      const pathname = urlObj.pathname;
      const uploadIdx = pathname.indexOf("/upload/");
      if (uploadIdx !== -1) {
        let afterUpload = pathname.substring(uploadIdx + "/upload/".length);
        const parts = afterUpload.split("/");
        const idParts: string[] = [];
        let passedTransforms = false;

        for (const part of parts) {
          if (!passedTransforms) {
            // Version tag e.g. v1723456789
            if (/^v\d+$/.test(part)) {
              passedTransforms = true;
              continue;
            }
            // Transformation segments e.g. w_800, c_limit, f_auto, q_auto
            if (/^(?:[a-z]{1,2}_|auto|limit|fill|crop)/.test(part) || part.includes(",")) {
              continue;
            }
            passedTransforms = true;
          }
          idParts.push(part);
        }

        let publicId = idParts.join("/");
        publicId = publicId.replace(/\.[a-zA-Z0-9]+$/, "");
        if (publicId) {
          return `cloudinary:${publicId.toLowerCase()}`;
        }
      }
    } catch {
      // fallback
    }
  }

  // If plain public_id (e.g. militotech_catalog/xyz)
  if (!clean.startsWith("http://") && !clean.startsWith("https://") && !clean.startsWith("/")) {
    const pid = clean.replace(/\.[a-zA-Z0-9]+$/, "");
    return `cloudinary:${pid.toLowerCase()}`;
  }

  // Unsplash normalization
  if (clean.includes("images.unsplash.com")) {
    const match = clean.match(/photo-[a-zA-Z0-9-]+/);
    if (match) {
      return `unsplash:${match[0]}`;
    }
  }

  // General URL normalization: remove search query and hash
  try {
    const parsed = new URL(clean.startsWith("http") ? clean : `https://${clean}`);
    return `url:${parsed.host.toLowerCase()}${parsed.pathname.toLowerCase()}`;
  } catch {
    return `raw:${clean.toLowerCase()}`;
  }
}

/**
 * Safely extracts all original image URLs associated with a product.
 * Guarantees zero duplication between thumbnail, galleryImages, gallery, and public IDs.
 */
export function extractProductOriginalImages(product: any): string[] {
  if (!product) return [];
  const urls: string[] = [];
  const seenKeys = new Set<string>();

  const add = (u: any) => {
    if (!u) return;
    const resolved = resolveImageUrl(u);
    if (!resolved) return;
    const key = getImageCanonicalKey(u) || getImageCanonicalKey(resolved);
    if (!key) return;

    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      urls.push(resolved);
    }
  };

  // Priority 1: thumbnail.secure_url / thumbnail.url / thumbnail
  if (product.thumbnail) {
    if (typeof product.thumbnail === "object") {
      if (product.thumbnail.secure_url) add(product.thumbnail.secure_url);
      else if (product.thumbnail.url) add(product.thumbnail.url);
      else add(product.thumbnail);
    } else {
      add(product.thumbnail);
    }
  }

  // Priority 2: image / imageUrl
  if (product.image) add(product.image);
  if (product.imageUrl) add(product.imageUrl);

  // Priority 3: galleryImages array
  if (Array.isArray(product.galleryImages) && product.galleryImages.length > 0) {
    product.galleryImages.forEach((item: any) => {
      if (item) {
        if (typeof item === "object") {
          if (item.secure_url) add(item.secure_url);
          else if (item.url) add(item.url);
          else add(item);
        } else {
          add(item);
        }
      }
    });
  }

  // Priority 4: gallery array
  if (Array.isArray(product.gallery) && product.gallery.length > 0) {
    product.gallery.forEach((item: any) => add(item));
  }

  // Priority 5: Additional metadata fallbacks
  if (product.secure_url) add(product.secure_url);
  if (product.url) add(product.url);
  if (product.imagePublicId) add(product.imagePublicId);
  if (product.public_id) add(product.public_id);

  return urls;
}

/**
 * Resolves an image input into the exact original uploaded URL.
 * NEVER substitutes a placeholder or generic phone image.
 * Returns empty string "" if no image data is found.
 */
export function resolveImageUrl(
  input: any,
  options?: { width?: number; quality?: string; brand?: string }
): string {
  if (!input) {
    return "";
  }

  // Handle arrays (e.g. gallery array passed)
  if (Array.isArray(input)) {
    if (input.length === 0) return "";
    return resolveImageUrl(input[0], options);
  }

  // Handle objects (CloudinaryImageMeta, Product, MediaItem, or nested thumbnail)
  let rawUrl = "";
  if (typeof input === "object" && input !== null) {
    rawUrl =
      input.secure_url ||
      input.url ||
      input.previewUrl ||
      input.src ||
      input.link ||
      (input.thumbnail
        ? typeof input.thumbnail === "object"
          ? input.thumbnail.secure_url || input.thumbnail.url
          : input.thumbnail
        : "") ||
      (input.image
        ? typeof input.image === "object"
          ? input.image.secure_url || input.image.url
          : input.image
        : "") ||
      (Array.isArray(input.galleryImages) && input.galleryImages[0]
        ? typeof input.galleryImages[0] === "object"
          ? input.galleryImages[0].secure_url || input.galleryImages[0].url
          : input.galleryImages[0]
        : "") ||
      (Array.isArray(input.gallery) && input.gallery[0]
        ? typeof input.gallery[0] === "object"
          ? input.gallery[0].secure_url || input.gallery[0].url
          : input.gallery[0]
        : "") ||
      (input.imagePublicId
        ? `https://res.cloudinary.com/militotech/image/upload/${input.imagePublicId}`
        : "") ||
      (input.public_id
        ? `https://res.cloudinary.com/militotech/image/upload/${input.public_id}`
        : "") ||
      (Array.isArray(input.galleryPublicIds) && input.galleryPublicIds[0]
        ? `https://res.cloudinary.com/militotech/image/upload/${input.galleryPublicIds[0]}`
        : "") ||
      input.imageUrl ||
      "";
  } else {
    rawUrl = String(input);
  }

  if (!rawUrl || rawUrl === "[object Object]" || rawUrl.trim() === "") {
    return "";
  }

  const trimmed = rawUrl.trim();

  // Blob and data URLs: pass through directly
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  // Local assets (starting with "/" or static files)
  if (trimmed.startsWith("/") || trimmed.endsWith(".svg") || trimmed.endsWith(".ico")) {
    return trimmed;
  }

  let finalUrl = trimmed;

  // If not starting with http/https, treat as relative Cloudinary public ID
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    const cleanPath = trimmed.startsWith("/") ? trimmed.substring(1) : trimmed;
    finalUrl = `https://res.cloudinary.com/militotech/image/upload/${cleanPath}`;
  }

  return finalUrl;
}

// Fallback image helper provides verified, high-quality device images matching the brand/product type
export function getFallbackImage(brand?: string, productType?: string): string {
  const normBrand = (brand || "").toLowerCase().trim();
  const isVehicle = productType === "vehicle" || normBrand.includes("toyota") || normBrand.includes("lexus") || normBrand.includes("mercedes") || normBrand.includes("bmw") || normBrand.includes("honda");
  
  if (isVehicle) {
    return "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80";
  }
  
  if (normBrand.includes("apple") || normBrand.includes("iphone")) {
    return "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80";
  }
  if (normBrand.includes("samsung") || normBrand.includes("galaxy")) {
    return "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80";
  }
  if (normBrand.includes("pixel") || normBrand.includes("google")) {
    return "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80";
  }
  if (normBrand.includes("xiaomi") || normBrand.includes("redmi") || normBrand.includes("poco")) {
    return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80";
  }
  if (normBrand.includes("tecno") || normBrand.includes("infinix")) {
    return "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80";
  }

  return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80";
}

export interface ShowcaseMediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  publicId?: string;
  posterUrl?: string;
  posterPublicId?: string;
  title?: string;
  active: boolean;
  order: number;
}

export interface VehicleShowcaseConfig {
  enabled: boolean;
  headline: string;
  subheadline: string;
  description: string;
  ctaText: string;
  ctaTarget: string; // e.g. "/vehicles", "vehicles", "#vehicles"
  autoRotate: boolean;
  rotationIntervalSeconds: number; // default: 2 seconds
  transitionType: "crossfade" | "slide" | "fade";
  items: ShowcaseMediaItem[];
  updatedAt?: string;
}

export const DEFAULT_VEHICLE_SHOWCASE_CONFIG: VehicleShowcaseConfig = {
  enabled: true,
  headline: "LOOKING FOR A VEHICLE?",
  subheadline: "Source your next ride through MILITO.",
  description: "Browse verified Foreign Used (Tokunbo) and Nigerian Used vehicles with authentic Customs Service clearance, 35-point mechanical inspection, and door-to-door delivery across Nigeria.",
  ctaText: "EXPLORE VEHICLES →",
  ctaTarget: "/vehicles",
  autoRotate: true,
  rotationIntervalSeconds: 2,
  transitionType: "crossfade",
  items: [
    {
      id: "media-1",
      type: "image",
      url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=85",
      title: "Toyota Land Cruiser Prado & Luxury SUVs",
      active: true,
      order: 1
    },
    {
      id: "media-2",
      type: "video",
      url: "https://res.cloudinary.com/militotech/video/upload/v1782058769/9f6ae906f73ccfec6f37203801e8eb81_720w_l1qwvu.mp4",
      posterUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85",
      title: "Direct Port Clearing & Inspection",
      active: true,
      order: 2
    },
    {
      id: "media-3",
      type: "image",
      url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=85",
      title: "Certified Tokunbo Sports & Executive Sedans",
      active: true,
      order: 3
    }
  ]
};

export type TestimonialTransactionType = "Purchase" | "Swap" | "Gadget Purchase" | "Other";

export type TestimonialTransactionStatus = 
  | "Purchase Completed" 
  | "Swap Completed" 
  | "Transaction Completed";

export type TestimonialPublishStatus = "Draft" | "Published" | "Unpublished";

export interface RedactionBox {
  id: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  width: number; // percentage 0 - 100
  height: number; // percentage 0 - 100
  style?: "solid-black" | "blur" | "dark-gray";
}

export interface RedactionStroke {
  id: string;
  points: { x: number; y: number }[]; // percentage 0 - 100
  radius: number;
  style?: "solid-black" | "blur" | "dark-gray";
}

export interface CustomerTestimonial {
  id: string;
  customerName: string;
  location: string;
  testimonialText: string;
  transactionType: TestimonialTransactionType;
  device: string;
  storage?: string;
  fromDevice?: string; // For Swap story format: "FROM THIS → TO THIS"
  toDevice?: string;   // For Swap story format: "FROM THIS → TO THIS"
  transactionStatus: TestimonialTransactionStatus;
  isVerifiedTransaction?: boolean;
  verifiedOrderRef?: string; // Actual order ID / reference if verified in MILITO system
  
  // Images (Security separation)
  originalImageUrl?: string; // Private source screenshot (Admin only, never exposed publicly)
  originalImagePublicId?: string;
  publicImageUrl: string; // Sanitized, permanently flattened & redacted public image (Cloudinary URL)
  publicImagePublicId?: string;
  
  status: TestimonialPublishStatus; // "Draft" | "Published" | "Unpublished"
  orderIndex?: number;
  createdAt: string;
  updatedAt?: string;
}

// ----------------------------------------------------
// MILITO CUSTOMER NOTIFICATIONS & ALERTS (PHASE 1)
// ----------------------------------------------------

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProductAlertType = "RESTOCK" | "PRICE_CHANGE";
export type AlertNotificationType = "RESTOCK" | "PRICE_CHANGE" | "PRICE_DROP" | "PRICE_INCREASE" | string;

export interface ProductAlert {
  id: string;
  customerId: string;
  productId: string;
  productName: string;
  alertType: ProductAlertType;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NotificationStatus = "PENDING" | "PROCESSING" | "SENT" | "FAILED";
export type NotificationChannel = "WHATSAPP" | "SMS" | "EMAIL";

export interface NotificationJob {
  id: string;
  customerId: string;
  productId: string;
  alertId: string;
  notificationType: AlertNotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  status: NotificationStatus;
  attempts: number;
  createdAt: string;
  scheduledAt?: string;
  sentAt?: string | null;
  error?: string | null;
  eventId?: string;
  metadata?: {
    productName?: string;
    oldPrice?: number;
    newPrice?: number;
    oldQuantity?: number;
    newQuantity?: number;
    priceDiff?: number;
    currency?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string | null;
    [key: string]: any;
  };
}

export interface ProductChangeDetectionParams {
  productId: string;
  productName: string;
  oldPrice?: number;
  newPrice?: number;
  oldQuantity?: number;
  newQuantity?: number;
  oldAvailability?: string;
  newAvailability?: string;
  eventId?: string;
  source?: string;
}

export interface ProductChangeDetectionResult {
  success: boolean;
  productId: string;
  productName: string;
  priceChange: {
    detected: boolean;
    eventType: "PRICE_DROP" | "PRICE_INCREASE" | null;
    oldPrice?: number;
    newPrice?: number;
    queuedCount: number;
  };
  stockChange: {
    detected: boolean;
    isRestock: boolean;
    oldQuantity?: number;
    newQuantity?: number;
    queuedCount: number;
  };
  totalQueued: number;
  queuedJobs: NotificationJob[];
  message: string;
  error?: string;
}

export interface SubscribeAlertParams {
  productId: string;
  productName: string;
  customerName: string;
  phone: string;
  email?: string;
  alertType: ProductAlertType;
}

export interface SubscribeAlertResult {
  success: boolean;
  isExisting: boolean;
  message: string;
  alertId?: string;
  customerId?: string;
  error?: string;
}

export interface ProductAlertStats {
  productId: string;
  productName: string;
  alertType: ProductAlertType;
  count: number;
  subscribers: {
    customerName: string;
    phone: string;
    email?: string | null;
    createdAt: string;
  }[];
}


