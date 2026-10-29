import React, { createContext, useContext, useState, useEffect } from "react";

export type DiscoveryCardId = "iphone" | "android" | "ipad" | "wrist";

export interface DiscoveryCardItem {
  id: DiscoveryCardId;
  title: string;
  imageUrl: string;
  imagePublicId?: string;
  updatedAt?: string;
}

export interface DiscoveryCardsConfig {
  cards: {
    iphone: DiscoveryCardItem;
    android: DiscoveryCardItem;
    ipad: DiscoveryCardItem;
    wrist: DiscoveryCardItem;
  };
  updatedAt?: string;
}

export const STATIC_DISCOVERY_CARD_IMAGES: Record<DiscoveryCardId, string> = {
  iphone: "/discovery-cards/iphone.webp",
  android: "/discovery-cards/android.jpg",
  ipad: "/discovery-cards/ipad.jpg",
  wrist: "/discovery-cards/wrist.jpg",
};

export const DEFAULT_DISCOVERY_CARDS_CONFIG: DiscoveryCardsConfig = {
  cards: {
    iphone: {
      id: "iphone",
      title: "Find my iPhone",
      imageUrl: STATIC_DISCOVERY_CARD_IMAGES.iphone,
      imagePublicId: "",
    },
    android: {
      id: "android",
      title: "Look for my Android",
      imageUrl: STATIC_DISCOVERY_CARD_IMAGES.android,
      imagePublicId: "",
    },
    ipad: {
      id: "ipad",
      title: "Discover my next iPad",
      imageUrl: STATIC_DISCOVERY_CARD_IMAGES.ipad,
      imagePublicId: "",
    },
    wrist: {
      id: "wrist",
      title: "Search for my Wrist",
      imageUrl: STATIC_DISCOVERY_CARD_IMAGES.wrist,
      imagePublicId: "",
    },
  },
  updatedAt: new Date().toISOString(),
};

interface DiscoveryCardsContextType {
  config: DiscoveryCardsConfig;
  loading: boolean;
  updateCardImage: (cardId: DiscoveryCardId, imageUrl: string, imagePublicId?: string) => Promise<void>;
  removeCardImage: (cardId: DiscoveryCardId) => Promise<void>;
}

const DiscoveryCardsContext = createContext<DiscoveryCardsContextType>({
  config: DEFAULT_DISCOVERY_CARDS_CONFIG,
  loading: false,
  updateCardImage: async () => {},
  removeCardImage: async () => {},
});

const STORAGE_KEY = "milito_discovery_cards_config";

function repairAndResolveCardUrl(rawUrl: unknown, cardId: DiscoveryCardId): string {
  if (typeof rawUrl === "string" && rawUrl.trim().length > 0) {
    const trimmed = rawUrl.trim();
    // Fix WebP binary payload mislabeled with image/jpeg header (prevents iOS Safari decode failure)
    if (trimmed.startsWith("data:image/jpeg;base64,UklGR")) {
      return trimmed.replace("data:image/jpeg;base64,", "data:image/webp;base64,");
    }
    if (trimmed.startsWith("http://res.cloudinary.com/")) {
      return trimmed.replace("http://", "https://");
    }
    return trimmed;
  }
  return STATIC_DISCOVERY_CARD_IMAGES[cardId];
}

function normalizeConfig(data: any): DiscoveryCardsConfig {
  if (!data || typeof data !== "object") {
    return DEFAULT_DISCOVERY_CARDS_CONFIG;
  }

  const rawCards = data.cards || {};

  return {
    cards: {
      iphone: {
        id: "iphone",
        title: "Find my iPhone",
        imageUrl: repairAndResolveCardUrl(rawCards.iphone?.imageUrl, "iphone"),
        imagePublicId: typeof rawCards.iphone?.imagePublicId === "string" ? rawCards.iphone.imagePublicId : "",
        updatedAt: rawCards.iphone?.updatedAt || "",
      },
      android: {
        id: "android",
        title: "Look for my Android",
        imageUrl: repairAndResolveCardUrl(rawCards.android?.imageUrl, "android"),
        imagePublicId: typeof rawCards.android?.imagePublicId === "string" ? rawCards.android.imagePublicId : "",
        updatedAt: rawCards.android?.updatedAt || "",
      },
      ipad: {
        id: "ipad",
        title: "Discover my next iPad",
        imageUrl: repairAndResolveCardUrl(rawCards.ipad?.imageUrl, "ipad"),
        imagePublicId: typeof rawCards.ipad?.imagePublicId === "string" ? rawCards.ipad.imagePublicId : "",
        updatedAt: rawCards.ipad?.updatedAt || "",
      },
      wrist: {
        id: "wrist",
        title: "Search for my Wrist",
        imageUrl: repairAndResolveCardUrl(rawCards.wrist?.imageUrl, "wrist"),
        imagePublicId: typeof rawCards.wrist?.imagePublicId === "string" ? rawCards.wrist.imagePublicId : "",
        updatedAt: rawCards.wrist?.updatedAt || "",
      },
    },
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

/**
 * Compresses large data:image URIs so all 4 discovery cards fit well within Firestore's 1MB document limit
 * and decode rapidly on mobile devices.
 */
async function compressDataUriIfNeeded(imageUrl: string): Promise<string> {
  if (!imageUrl || !imageUrl.startsWith("data:image/")) {
    return imageUrl;
  }
  // Fix WebP header if needed
  const fixedUrl = imageUrl.startsWith("data:image/jpeg;base64,UklGR")
    ? imageUrl.replace("data:image/jpeg;base64,", "data:image/webp;base64,")
    : imageUrl;

  if (fixedUrl.length <= 160000) {
    return fixedUrl;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        try {
          const MAX_DIM = 720;
          let { width, height } = img;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(fixedUrl);
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.82);
          resolve(compressed.length < fixedUrl.length ? compressed : fixedUrl);
        } catch {
          resolve(fixedUrl);
        }
      };
      img.onerror = () => resolve(fixedUrl);
      img.src = fixedUrl;
    } catch {
      resolve(fixedUrl);
    }
  });
}

export const DiscoveryCardsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<DiscoveryCardsConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return normalizeConfig(parsed);
      }
    } catch (e) {
      console.warn("[DiscoveryCardsContext] Failed to read from localStorage:", e);
    }
    return DEFAULT_DISCOVERY_CARDS_CONFIG;
  });

  const [loading, setLoading] = useState(false);

  // Firestore synchronization deferred after initial paint
  useEffect(() => {
    let unsubscribeNamed: (() => void) | undefined;
    let unsubscribeDefault: (() => void) | undefined;
    let isCancelled = false;

    const timer = setTimeout(async () => {
      if (isCancelled) return;
      try {
        const [{ db, defaultDb, isFirebasePlaceholder }, { doc, onSnapshot }] = await Promise.all([
          import("../lib/firebase"),
          import("firebase/firestore")
        ]);
        if (isCancelled || isFirebasePlaceholder || (!db && !defaultDb)) {
          setLoading(false);
          return;
        }

        const handleSnapshotData = (rawData: any) => {
          const remote = normalizeConfig(rawData);
          setConfig((prev) => {
            const merged: DiscoveryCardsConfig = {
              cards: {
                iphone: {
                  ...remote.cards.iphone,
                  imageUrl: remote.cards.iphone.imageUrl || prev.cards.iphone.imageUrl || STATIC_DISCOVERY_CARD_IMAGES.iphone,
                  imagePublicId: remote.cards.iphone.imagePublicId || prev.cards.iphone.imagePublicId,
                },
                android: {
                  ...remote.cards.android,
                  imageUrl: remote.cards.android.imageUrl || prev.cards.android.imageUrl || STATIC_DISCOVERY_CARD_IMAGES.android,
                  imagePublicId: remote.cards.android.imagePublicId || prev.cards.android.imagePublicId,
                },
                ipad: {
                  ...remote.cards.ipad,
                  imageUrl: remote.cards.ipad.imageUrl || prev.cards.ipad.imageUrl || STATIC_DISCOVERY_CARD_IMAGES.ipad,
                  imagePublicId: remote.cards.ipad.imagePublicId || prev.cards.ipad.imagePublicId,
                },
                wrist: {
                  ...remote.cards.wrist,
                  imageUrl: remote.cards.wrist.imageUrl || prev.cards.wrist.imageUrl || STATIC_DISCOVERY_CARD_IMAGES.wrist,
                  imagePublicId: remote.cards.wrist.imagePublicId || prev.cards.wrist.imagePublicId,
                },
              },
              updatedAt: remote.updatedAt || new Date().toISOString(),
            };

            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            } catch (e) {}

            return merged;
          });
        };

        if (db) {
          unsubscribeNamed = onSnapshot(
            doc(db, "config", "discovery_cards"),
            (snapshot) => {
              if (snapshot.exists()) {
                handleSnapshotData(snapshot.data());
              }
              setLoading(false);
            },
            () => setLoading(false)
          );
        }

        if (defaultDb && defaultDb !== db) {
          unsubscribeDefault = onSnapshot(
            doc(defaultDb, "config", "discovery_cards"),
            (snapshot) => {
              if (snapshot.exists()) {
                handleSnapshotData(snapshot.data());
              }
              setLoading(false);
            },
            () => setLoading(false)
          );
        }
      } catch (err) {
        console.warn("[DiscoveryCardsContext] Listener setup failed:", err);
        setLoading(false);
      }
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      if (unsubscribeNamed) unsubscribeNamed();
      if (unsubscribeDefault) unsubscribeDefault();
    };
  }, []);

  const sanitizeForFirestore = (obj: any): any => {
    return JSON.parse(JSON.stringify(obj, (_k, v) => (v === undefined ? null : v)));
  };

  const persistConfig = async (newConfig: DiscoveryCardsConfig) => {
    setConfig(newConfig);

    // 1. Immediately persist to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } catch (e) {
      console.warn("[DiscoveryCardsContext] localStorage write error:", e);
    }

    // 2. Persist to both default and named Firestore databases
    try {
      const [{ db, defaultDb, isFirebasePlaceholder }, { doc, setDoc }] = await Promise.all([
        import("../lib/firebase"),
        import("firebase/firestore")
      ]);
      const payload = sanitizeForFirestore(newConfig);
      if (!isFirebasePlaceholder && db) {
        await setDoc(doc(db, "config", "discovery_cards"), payload, { merge: true });
      }
      if (!isFirebasePlaceholder && defaultDb && defaultDb !== db) {
        await setDoc(doc(defaultDb, "config", "discovery_cards"), payload, { merge: true });
      }
    } catch (err) {
      console.warn("[DiscoveryCardsContext] Firestore save error:", err);
    }
  };

  const updateCardImage = async (cardId: DiscoveryCardId, imageUrl: string, imagePublicId?: string) => {
    const optimizedUrl = await compressDataUriIfNeeded(imageUrl);
    const newConfig: DiscoveryCardsConfig = {
      ...config,
      cards: {
        ...config.cards,
        [cardId]: {
          ...config.cards[cardId],
          imageUrl: optimizedUrl,
          imagePublicId: imagePublicId || "",
          updatedAt: new Date().toISOString(),
        },
      },
      updatedAt: new Date().toISOString(),
    };

    await persistConfig(newConfig);
  };

  const removeCardImage = async (cardId: DiscoveryCardId) => {
    const newConfig: DiscoveryCardsConfig = {
      ...config,
      cards: {
        ...config.cards,
        [cardId]: {
          ...config.cards[cardId],
          imageUrl: "",
          imagePublicId: "",
          updatedAt: new Date().toISOString(),
        },
      },
      updatedAt: new Date().toISOString(),
    };

    await persistConfig(newConfig);
  };

  return (
    <DiscoveryCardsContext.Provider
      value={{
        config,
        loading,
        updateCardImage,
        removeCardImage,
      }}
    >
      {children}
    </DiscoveryCardsContext.Provider>
  );
};

export const useDiscoveryCards = () => useContext(DiscoveryCardsContext);
