import React, { createContext, useContext, useState, useEffect } from "react";
import { WebsiteBranding, CloudinaryImageMeta } from "../types";
import { db, isFirebasePlaceholder } from "../lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { UploadService } from "../services/UploadService";

interface BrandingContextType {
  branding: WebsiteBranding;
  loading: boolean;
  updateLogo: (meta: CloudinaryImageMeta) => Promise<void>;
  deleteLogo: () => Promise<void>;
}

const DEFAULT_BRANDING: WebsiteBranding = {
  logoUrl: "",
  logoPublicId: "",
  updatedAt: ""
};

const BrandingContext = createContext<BrandingContextType>({
  branding: DEFAULT_BRANDING,
  loading: true,
  updateLogo: async () => {},
  deleteLogo: async () => {}
});

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<WebsiteBranding>(() => {
    try {
      const saved = localStorage.getItem("milito_website_branding");
      if (saved) return JSON.parse(saved);
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
    let unsubscribe: (() => void) | undefined;

    const loadServerBranding = async () => {
      try {
        const res = await fetch("/api/branding");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.branding && data.branding.logoUrl) {
            setBranding(data.branding);
            try {
              localStorage.setItem("milito_website_branding", JSON.stringify(data.branding));
            } catch (e) {}
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

        const docRef = doc(db, "branding", "website");

        unsubscribe = onSnapshot(
          docRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data() as WebsiteBranding;
              if (data && data.logoUrl) {
                setBranding(data);
                try {
                  localStorage.setItem("milito_website_branding", JSON.stringify(data));
                } catch (e) {
                  console.warn("Failed to update localStorage:", e);
                }
              }
            } else {
              console.log("[BrandingContext] No branding document found in Firestore, using server/defaults.");
            }
            setLoading(false);
          },
          (err) => {
            console.warn("[BrandingContext] Firestore snapshot error, falling back to server/local cache:", err);
            setLoading(false);
          }
        );
      } catch (err) {
        console.warn("[BrandingContext] Failed to setup Firestore listener:", err);
        setLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const updateLogo = async (meta: CloudinaryImageMeta) => {
    const newBranding: WebsiteBranding = {
      logoUrl: meta.secure_url,
      logoPublicId: meta.public_id,
      logoMeta: meta,
      updatedAt: new Date().toISOString()
    };

    setBranding(newBranding);
    try {
      localStorage.setItem("milito_website_branding", JSON.stringify(newBranding));
    } catch (e) {
      console.warn("LocalStorage save error:", e);
    }

    // 1. Sync to Server API
    try {
      await fetch("/api/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBranding)
      });
      console.log("[BrandingContext] Logo saved to Server /api/branding");
    } catch (err) {
      console.warn("[BrandingContext] Failed to save to /api/branding:", err);
    }

    // 2. Sync to Firestore
    if (!isFirebasePlaceholder && db) {
      try {
        const docRef = doc(db, "branding", "website");
        await setDoc(docRef, newBranding, { merge: true });
        console.log("[BrandingContext] Branding logo saved to Firestore collection 'branding/website'");
      } catch (err) {
        console.error("[BrandingContext] Failed to save branding to Firestore:", err);
      }
    }
  };

  const deleteLogo = async () => {
    const previousPublicId = branding.logoPublicId;

    if (previousPublicId) {
      try {
        console.log(`[BrandingContext] Deleting logo ${previousPublicId} via UploadService...`);
        await UploadService.deleteCloudinaryImages([previousPublicId]);
      } catch (e) {
        console.warn("[BrandingContext] Error deleting image from Cloudinary:", e);
      }
    }

    const resetBranding: WebsiteBranding = {
      logoUrl: "",
      logoPublicId: "",
      logoMeta: undefined,
      updatedAt: new Date().toISOString()
    };

    setBranding(resetBranding);
    try {
      localStorage.setItem("milito_website_branding", JSON.stringify(resetBranding));
    } catch (e) {
      console.warn("LocalStorage clear error:", e);
    }

    try {
      await fetch("/api/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resetBranding)
      });
    } catch (e) {
      console.warn("Server API clear error:", e);
    }

    if (!isFirebasePlaceholder && db) {
      try {
        const docRef = doc(db, "branding", "website");
        await setDoc(docRef, resetBranding);
        console.log("[BrandingContext] Branding logo cleared from Firestore");
      } catch (err) {
        console.error("[BrandingContext] Failed to update Firestore on logo delete:", err);
      }
    }
  };

  return (
    <BrandingContext.Provider value={{ branding, loading, updateLogo, deleteLogo }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);
