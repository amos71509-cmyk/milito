import React, { createContext, useContext, useState, useEffect } from "react";
import { VehicleShowcaseConfig, ShowcaseMediaItem, DEFAULT_VEHICLE_SHOWCASE_CONFIG } from "../types";
import { db, isFirebasePlaceholder } from "../lib/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

interface VehicleShowcaseContextType {
  config: VehicleShowcaseConfig;
  loading: boolean;
  saveConfig: (newConfig: VehicleShowcaseConfig) => Promise<void>;
  addMediaItem: (item: Omit<ShowcaseMediaItem, "id" | "order">) => Promise<void>;
  updateMediaItem: (id: string, updates: Partial<ShowcaseMediaItem>) => Promise<void>;
  deleteMediaItem: (id: string) => Promise<void>;
  toggleMediaItemActive: (id: string) => Promise<void>;
  reorderMediaItems: (startIndex: number, endIndex: number) => Promise<void>;
  resetToDefault: () => Promise<void>;
}

const VehicleShowcaseContext = createContext<VehicleShowcaseContextType>({
  config: DEFAULT_VEHICLE_SHOWCASE_CONFIG,
  loading: true,
  saveConfig: async () => {},
  addMediaItem: async () => {},
  updateMediaItem: async () => {},
  deleteMediaItem: async () => {},
  toggleMediaItemActive: async () => {},
  reorderMediaItems: async () => {},
  resetToDefault: async () => {}
});

const STORAGE_KEY = "milito_vehicle_showcase_config";

function normalizeConfig(data: any): VehicleShowcaseConfig {
  if (!data || typeof data !== "object") {
    return DEFAULT_VEHICLE_SHOWCASE_CONFIG;
  }

  const rawItems: any[] = Array.isArray(data.items) ? data.items : [];
  const normalizedItems: ShowcaseMediaItem[] = rawItems
    .filter((it: any) => it && (it.url || it.secure_url))
    .map((it: any, index: number) => {
      const url = it.url || it.secure_url || "";
      const isVideo =
        it.type === "video" ||
        /\.(mp4|webm|mov|mkv|m4v|avi)(\?.*)?$/i.test(url) ||
        url.includes("/video/");
      return {
        id: it.id || `showcase-media-${Date.now()}-${index}`,
        type: isVideo ? ("video" as const) : ("image" as const),
        url: url,
        publicId: it.publicId || it.public_id || "",
        posterUrl: it.posterUrl || it.poster_url || "",
        posterPublicId: it.posterPublicId || it.poster_public_id || "",
        title: it.title || `Media Slide #${index + 1}`,
        active: it.active !== undefined ? Boolean(it.active) : true,
        order: typeof it.order === "number" ? it.order : index + 1
      };
    });

  const finalItems = normalizedItems.length > 0 ? normalizedItems : DEFAULT_VEHICLE_SHOWCASE_CONFIG.items;

  return {
    enabled: data.enabled !== undefined ? Boolean(data.enabled) : DEFAULT_VEHICLE_SHOWCASE_CONFIG.enabled,
    headline: data.headline || DEFAULT_VEHICLE_SHOWCASE_CONFIG.headline,
    subheadline: data.subheadline || DEFAULT_VEHICLE_SHOWCASE_CONFIG.subheadline,
    description: data.description !== undefined ? data.description : DEFAULT_VEHICLE_SHOWCASE_CONFIG.description,
    ctaText: data.ctaText || DEFAULT_VEHICLE_SHOWCASE_CONFIG.ctaText,
    ctaTarget: data.ctaTarget || DEFAULT_VEHICLE_SHOWCASE_CONFIG.ctaTarget,
    autoRotate: data.autoRotate !== undefined ? Boolean(data.autoRotate) : DEFAULT_VEHICLE_SHOWCASE_CONFIG.autoRotate,
    rotationIntervalSeconds: Math.max(1, Number(data.rotationIntervalSeconds) || DEFAULT_VEHICLE_SHOWCASE_CONFIG.rotationIntervalSeconds),
    transitionType: data.transitionType || DEFAULT_VEHICLE_SHOWCASE_CONFIG.transitionType,
    items: finalItems,
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

export function VehicleShowcaseProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<VehicleShowcaseConfig>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        return normalizeConfig(JSON.parse(cached));
      }
    } catch (e) {
      console.warn("[ShowcaseContext] LocalStorage read failed:", e);
    }
    return DEFAULT_VEHICLE_SHOWCASE_CONFIG;
  });

  const [loading, setLoading] = useState(true);

  // Real-time Firestore sync with local caching
  useEffect(() => {
    if (isFirebasePlaceholder || !db) {
      setLoading(false);
      return;
    }

    try {
      const showcaseDocRef = doc(db, "site_settings", "vehicle_showcase");
      const unsubscribe = onSnapshot(
        showcaseDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            const normalized = normalizeConfig(data);
            setConfig(normalized);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
            } catch (err) {
              console.warn("[ShowcaseContext] LocalStorage sync failed:", err);
            }
          }
          setLoading(false);
        },
        (error) => {
          console.warn("[ShowcaseContext] Firestore subscription error:", error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn("[ShowcaseContext] Setup error:", e);
      setLoading(false);
    }
  }, []);

  const saveConfig = async (newConfig: VehicleShowcaseConfig) => {
    const prepared: VehicleShowcaseConfig = {
      ...newConfig,
      rotationIntervalSeconds: Math.max(1, Number(newConfig.rotationIntervalSeconds) || 2),
      updatedAt: new Date().toISOString()
    };

    // Instant local state update
    setConfig(prepared);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prepared));
    } catch (e) {
      console.warn("[ShowcaseContext] LocalStorage save error:", e);
    }

    // Persist to Firestore site_settings/vehicle_showcase
    if (!isFirebasePlaceholder && db) {
      try {
        const showcaseDocRef = doc(db, "site_settings", "vehicle_showcase");
        await setDoc(showcaseDocRef, prepared, { merge: true });
        console.log("[ShowcaseContext] Persisted vehicle showcase to Firestore successfully");
      } catch (err) {
        console.error("[ShowcaseContext] Firestore save error:", err);
        throw err;
      }
    }
  };

  const addMediaItem = async (item: Omit<ShowcaseMediaItem, "id" | "order">) => {
    const newItem: ShowcaseMediaItem = {
      ...item,
      id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      order: config.items.length + 1,
      active: item.active !== undefined ? item.active : true
    };
    const updatedItems = [...config.items, newItem];
    await saveConfig({ ...config, items: updatedItems });
  };

  const updateMediaItem = async (id: string, updates: Partial<ShowcaseMediaItem>) => {
    const updatedItems = config.items.map((it) => (it.id === id ? { ...it, ...updates } : it));
    await saveConfig({ ...config, items: updatedItems });
  };

  const deleteMediaItem = async (id: string) => {
    const updatedItems = config.items.filter((it) => it.id !== id);
    await saveConfig({ ...config, items: updatedItems });
  };

  const toggleMediaItemActive = async (id: string) => {
    const updatedItems = config.items.map((it) => (it.id === id ? { ...it, active: !it.active } : it));
    await saveConfig({ ...config, items: updatedItems });
  };

  const reorderMediaItems = async (startIndex: number, endIndex: number) => {
    const result: ShowcaseMediaItem[] = [...config.items];
    const [removed] = result.splice(startIndex, 1);
    if (removed) {
      result.splice(endIndex, 0, removed);
    }
    const updatedItems: ShowcaseMediaItem[] = result.map((item, idx) => ({ ...item, order: idx + 1 }));
    await saveConfig({ ...config, items: updatedItems });
  };

  const resetToDefault = async () => {
    await saveConfig(DEFAULT_VEHICLE_SHOWCASE_CONFIG);
  };

  return (
    <VehicleShowcaseContext.Provider
      value={{
        config,
        loading,
        saveConfig,
        addMediaItem,
        updateMediaItem,
        deleteMediaItem,
        toggleMediaItemActive,
        reorderMediaItems,
        resetToDefault
      }}
    >
      {children}
    </VehicleShowcaseContext.Provider>
  );
}

export function useVehicleShowcase() {
  return useContext(VehicleShowcaseContext);
}
