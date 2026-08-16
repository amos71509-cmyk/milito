export type DeviceCondition = "Brand New" | "Premium UK Used";

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
  condition: DeviceCondition;
  price: number; // in Naira (NGN)
  originalPrice?: number; // for discount badges
  featured?: boolean; // highlight on frontpage
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
  specs: {
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
  };
  rating: number;
  reviewsCount: number;
  badge?: string; // e.g., "Best Seller", "In Stock"
  quantity?: number; // stock count
  tags?: string[]; // optional badges
  faceId?: "Working" | "Not Working" | "Not Applicable"; // Face ID state
  network?: "Factory Unlocked" | "Dual SIM" | "eSIM" | "Physical SIM"; // network standard
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
  category: "General" | "Phones" | "Payments" | "Trade-In" | "Imports";
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

export function resolveImageUrl(url: any): string {
  if (!url) return "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&q=80";
  let strUrl = "";
  if (typeof url === "object" && url !== null) {
    strUrl = url.secure_url || url.url || "";
  } else {
    strUrl = String(url);
  }
  if (!strUrl || strUrl === "[object Object]") {
    return "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&q=80";
  }
  const trimmed = strUrl.trim();
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }
  let finalUrl = trimmed;
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    const cleanPath = trimmed.startsWith("/") ? trimmed.substring(1) : trimmed;
    finalUrl = `https://res.cloudinary.com/militotech/image/upload/${cleanPath}`;
  }
  
  // Inject f_auto,q_auto automatic optimization features for fast website loading
  if (finalUrl.includes("res.cloudinary.com") && !finalUrl.includes("f_auto") && !finalUrl.includes("q_auto") && finalUrl.includes("/upload/")) {
    finalUrl = finalUrl.replace("/upload/", "/upload/f_auto,q_auto/");
  }
  
  return finalUrl;
}
