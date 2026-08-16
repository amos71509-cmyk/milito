import React, { createContext, useContext, useState, useEffect } from "react";
import { WebsiteBranding, CloudinaryImageMeta, BrandItem } from "../types";
import { db, isFirebasePlaceholder } from "../lib/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { UploadService } from "../services/UploadService";
import { getApiUrl } from "../lib/api";

export const DEFAULT_BRAND_LOGOS: BrandItem[] = [
  { id: "apple", name: "Apple" },
  { id: "samsung", name: "Samsung" },
  { id: "tecno", name: "Tecno" },
  { id: "redmi", name: "Redmi / Xiaomi" },
  { id: "google-pixel", name: "Google Pixel" },
  { id: "infinix", name: "Infinix" },
  { id: "oppo", name: "Oppo" },
  { id: "vivo", name: "Vivo" }
];

interface BrandingContextType {
  branding: WebsiteBranding;
  loading: boolean;
  updateLogo: (meta: CloudinaryImageMeta) => Promise<void>;
  deleteLogo: () => Promise<void>;
  updateBrandLogo: (brandId: string, meta: CloudinaryImageMeta) => Promise<void>;
  addBrand: (name: string, meta?: CloudinaryImageMeta) => Promise<void>;
  deleteBrandLogo: (brandId: string) => Promise<void>;
  deleteBrand: (brandId: string) => Promise<void>;
}

const DEFAULT_BRANDING: WebsiteBranding = {
  logoUrl: "",
  logoPublicId: "",
  brandLogos: DEFAULT_BRAND_LOGOS,
  updatedAt: ""
};

const BrandingContext = createContext<BrandingContextType>({
  branding: DEFAULT_BRANDING,
  loading: true,
  updateLogo: async () => {},
  deleteLogo: async () => {},
  updateBrandLogo: async () => {},
  addBrand: async () => {},
  deleteBrandLogo: async () => {},
  deleteBrand: async () => {}
});

const normalizeBranding = (data: any): WebsiteBranding | null => {
  if (!data || typeof data !== "object") return null;

  const logoUrl =
    data.logoUrl ||
    data.logo ||
    data.url ||
    data.secure_url ||
    (data.logoMeta && data.logoMeta.secure_url) ||
    "";

  const logoPublicId =
    data.logoPublicId ||
    data.public_id ||
    (data.logoMeta && data.logoMeta.public_id) ||
    "";

  let storedBrandLogos: BrandItem[] = Array.isArray(data.brandLogos) ? data.brandLogos : [];
  if (storedBrandLogos.length === 0) {
    storedBrandLogos = [...DEFAULT_BRAND_LOGOS];
  } else {
    // Ensure all standard default brands are present if omitted
    const existingIds = new Set(storedBrandLogos.map(b => b.id.toLowerCase()));
    DEFAULT_BRAND_LOGOS.forEach(def => {
      if (!existingIds.has(def.id.toLowerCase())) {
        storedBrandLogos.push(def);
      }
    });
  }

  return {
    logoUrl,
    logoPublicId,
    logoMeta: data.logoMeta || (logoUrl ? { secure_url: logoUrl, public_id: logoPublicId } : undefined),
    brandLogos: storedBrandLogos,
    updatedAt: data.updatedAt || new Date().toISOString()
  };
};

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<WebsiteBranding>(() => {
    try {
      const saved = localStorage.getItem("milito_website_branding");
      if (saved) {
        const parsed = JSON.parse(saved);
        const normalized = normalizeBranding(parsed);
        if (normalized) return normalized;
      }
    } catch (e) {
      console.warn("Failed to load branding from localStorage:", e);
    }
    return DEFAULT_BRANDING;
  });

  const [loading, setLoading] = useState(true);

  // Sync favicon whenever logoUrl changes
  useEffect(() => {
    if (branding.logoUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "shortcut icon";
        document.getElementsByTagName("head")[0].appendChild(link);
      }
      link.href = branding.logoUrl;
    }
  }, [branding.logoUrl]);

  // Subscribe to Firestore & fetch Server API Branding
  useEffect(() => {
    let unsubscribe1: (() => void) | undefined;
    let unsubscribe2: (() => void) | undefined;

    const loadServerBranding = async () => {
      try {
        const res = await fetch(getApiUrl("/api/branding"));
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.branding) {
            const normalized = normalizeBranding(data.branding);
            if (normalized) {
              setBranding(prev => {
                const serverBrandLogos = [...(normalized.brandLogos || [])];
                const prevBrandLogos = prev.brandLogos || [];
                
                // Merge brand logos so custom uploaded logos are preserved
                const finalBrandLogos = serverBrandLogos.map(sBrand => {
                  if (!sBrand.logoUrl) {
                    const match = prevBrandLogos.find(p => p.id.toLowerCase() === sBrand.id.toLowerCase());
                    if (match?.logoUrl) return match;
                  }
                  return sBrand;
                });

                prevBrandLogos.forEach(pBrand => {
                  if (!finalBrandLogos.some(f => f.id.toLowerCase() === pBrand.id.toLowerCase())) {
                    finalBrandLogos.push(pBrand);
                  }
                });

                const merged = {
                  ...normalized,
                  logoUrl: normalized.logoUrl || prev.logoUrl,
                  logoPublicId: normalized.logoPublicId || prev.logoPublicId,
                  brandLogos: finalBrandLogos
                };

                try {
                  localStorage.setItem("milito_website_branding", JSON.stringify(merged));
                } catch (e) {}

                return merged;
              });
            }
          }
        }
      } catch (err) {
        console.warn("[BrandingContext] Server API fetch error:", err);
      }
    };

    loadServerBranding();

    const setupListener = async () => {
      try {
        if (isFirebasePlaceholder || !db) {
          setLoading(false);
          return;
        }

        const handleSnapshot = (snapshot: any) => {
          if (snapshot.exists()) {
            const normalized = normalizeBranding(snapshot.data());
            if (normalized) {
              setBranding(prev => {
                const fsBrandLogos = [...(normalized.brandLogos || [])];
                const prevBrandLogos = prev.brandLogos || [];

                const finalBrandLogos = fsBrandLogos.map(fBrand => {
                  if (!fBrand.logoUrl) {
                    const match = prevBrandLogos.find(p => p.id.toLowerCase() === fBrand.id.toLowerCase());
                    if (match?.logoUrl) return match;
                  }
                  return fBrand;
                });

                prevBrandLogos.forEach(pBrand => {
                  if (!finalBrandLogos.some(f => f.id.toLowerCase() === pBrand.id.toLowerCase())) {
                    finalBrandLogos.push(pBrand);
                  }
                });

                const merged = {
                  ...normalized,
                  logoUrl: normalized.logoUrl || prev.logoUrl,
                  logoPublicId: normalized.logoPublicId || prev.logoPublicId,
                  brandLogos: finalBrandLogos
                };

                try {
                  localStorage.setItem("milito_website_branding", JSON.stringify(merged));
                } catch (e) {}

                return merged;
              });
            }
          }
          setLoading(false);
        };

        const docRef1 = doc(db, "branding", "website");
        const docRef2 = doc(db, "config", "branding");

        unsubscribe1 = onSnapshot(docRef1, handleSnapshot, (err) => {
          console.warn("[BrandingContext] Firestore branding/website snapshot error:", err);
          setLoading(false);
        });

        unsubscribe2 = onSnapshot(docRef2, handleSnapshot, (err) => {
          console.warn("[BrandingContext] Firestore config/branding snapshot error:", err);
          setLoading(false);
        });
      } catch (err) {
        console.warn("[BrandingContext] Failed to setup Firestore listener:", err);
        setLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe1) unsubscribe1();
      if (unsubscribe2) unsubscribe2();
    };
  }, []);

  const sanitizeForFirestore = (obj: any): any => {
    return JSON.parse(JSON.stringify(obj, (_k, v) => (v === undefined ? null : v)));
  };

  const saveBrandingData = async (newBranding: WebsiteBranding) => {
    setBranding(newBranding);
    try {
      localStorage.setItem("milito_website_branding", JSON.stringify(newBranding));
    } catch (e) {
      console.warn("LocalStorage save error:", e);
    }

    try {
      await fetch(getApiUrl("/api/branding"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBranding)
      });
    } catch (err) {
      console.warn("[BrandingContext] Failed to save to /api/branding:", err);
    }

    if (!isFirebasePlaceholder && db) {
      try {
        const firestoreData = sanitizeForFirestore(newBranding);
        await setDoc(doc(db, "branding", "website"), firestoreData, { merge: true });
        await setDoc(doc(db, "config", "branding"), firestoreData, { merge: true });
      } catch (err) {
        console.error("[BrandingContext] Failed to save branding to Firestore:", err);
      }
    }
  };

  const updateLogo = async (meta: CloudinaryImageMeta) => {
    const newBranding: WebsiteBranding = {
      ...branding,
      logoUrl: meta.secure_url,
      logoPublicId: meta.public_id,
      logoMeta: meta,
      updatedAt: new Date().toISOString()
    };
    await saveBrandingData(newBranding);
  };

  const deleteLogo = async () => {
    const previousPublicId = branding.logoPublicId;
    if (previousPublicId) {
      try {
        await UploadService.deleteCloudinaryImages([previousPublicId]);
      } catch (e) {
        console.warn("[BrandingContext] Error deleting image from Cloudinary:", e);
      }
    }

    const resetBranding: WebsiteBranding = {
      ...branding,
      logoUrl: "",
      logoPublicId: "",
      logoMeta: undefined,
      updatedAt: new Date().toISOString()
    };
    await saveBrandingData(resetBranding);
  };

  const updateBrandLogo = async (brandId: string, meta: CloudinaryImageMeta) => {
    const currentList = branding.brandLogos || DEFAULT_BRAND_LOGOS;
    const updated = currentList.map(b => {
      if (b.id.toLowerCase() === brandId.toLowerCase() || b.name.toLowerCase() === brandId.toLowerCase()) {
        return {
          ...b,
          logoUrl: meta.secure_url,
          logoPublicId: meta.public_id,
          logoMeta: meta
        };
      }
      return b;
    });

    const newBranding = { ...branding, brandLogos: updated, updatedAt: new Date().toISOString() };
    await saveBrandingData(newBranding);
  };

  const addBrand = async (name: string, meta?: CloudinaryImageMeta) => {
    const currentList = branding.brandLogos || DEFAULT_BRAND_LOGOS;
    const brandId = name.toLowerCase().trim().replace(/[^a-z0-9]/g, "-");
    
    const existingIndex = currentList.findIndex(b => b.id === brandId || b.name.toLowerCase() === name.toLowerCase());
    let updated: BrandItem[];
    if (existingIndex >= 0) {
      updated = [...currentList];
      updated[existingIndex] = {
        ...updated[existingIndex],
        name,
        logoUrl: meta?.secure_url || updated[existingIndex].logoUrl,
        logoPublicId: meta?.public_id || updated[existingIndex].logoPublicId,
        logoMeta: meta || updated[existingIndex].logoMeta
      };
    } else {
      const newBrandItem: BrandItem = {
        id: brandId,
        name,
        logoUrl: meta?.secure_url,
        logoPublicId: meta?.public_id,
        logoMeta: meta
      };
      updated = [...currentList, newBrandItem];
    }

    const newBranding = { ...branding, brandLogos: updated, updatedAt: new Date().toISOString() };
    await saveBrandingData(newBranding);
  };

  const deleteBrandLogo = async (brandId: string) => {
    const currentList = branding.brandLogos || DEFAULT_BRAND_LOGOS;
    const target = currentList.find(b => b.id.toLowerCase() === brandId.toLowerCase());
    if (target?.logoPublicId) {
      try {
        await UploadService.deleteCloudinaryImages([target.logoPublicId]);
      } catch (e) {
        console.warn("Delete brand logo Cloudinary error:", e);
      }
    }

    const updated = currentList.map(b => {
      if (b.id.toLowerCase() === brandId.toLowerCase()) {
        return { ...b, logoUrl: undefined, logoPublicId: undefined, logoMeta: undefined };
      }
      return b;
    });

    const newBranding = { ...branding, brandLogos: updated, updatedAt: new Date().toISOString() };
    await saveBrandingData(newBranding);
  };

  const deleteBrand = async (brandId: string) => {
    const currentList = branding.brandLogos || DEFAULT_BRAND_LOGOS;
    const target = currentList.find(b => b.id.toLowerCase() === brandId.toLowerCase());
    if (target?.logoPublicId) {
      try {
        await UploadService.deleteCloudinaryImages([target.logoPublicId]);
      } catch (e) {
        console.warn("Delete brand logo Cloudinary error:", e);
      }
    }

    const updated = currentList.filter(b => b.id.toLowerCase() !== brandId.toLowerCase());
    const newBranding = { ...branding, brandLogos: updated, updatedAt: new Date().toISOString() };
    await saveBrandingData(newBranding);
  };

  return (
    <BrandingContext.Provider
      value={{
        branding,
        loading,
        updateLogo,
        deleteLogo,
        updateBrandLogo,
        addBrand,
        deleteBrandLogo,
        deleteBrand
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);
