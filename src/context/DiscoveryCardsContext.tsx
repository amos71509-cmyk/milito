import React, { createContext, useContext, useState, useEffect } from "react";
import { db, isFirebasePlaceholder } from "../lib/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

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

export const DEFAULT_DISCOVERY_CARDS_CONFIG: DiscoveryCardsConfig = {
  cards: {
    iphone: {
      id: "iphone",
      title: "Find my iPhone",
      imageUrl: "",
      imagePublicId: "",
    },
    android: {
      id: "android",
      title: "Look for my Android",
      imageUrl: "",
      imagePublicId: "",
    },
    ipad: {
      id: "ipad",
      title: "Discover my next iPad",
      imageUrl: "",
      imagePublicId: "",
    },
    wrist: {
      id: "wrist",
      title: "Search for my Wrist",
      imageUrl: "",
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
  loading: true,
  updateCardImage: async () => {},
  removeCardImage: async () => {},
});

const STORAGE_KEY = "milito_discovery_cards_config";

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
        imageUrl: typeof rawCards.iphone?.imageUrl === "string" ? rawCards.iphone.imageUrl : "",
        imagePublicId: typeof rawCards.iphone?.imagePublicId === "string" ? rawCards.iphone.imagePublicId : "",
        updatedAt: rawCards.iphone?.updatedAt || "",
      },
      android: {
        id: "android",
        title: "Look for my Android",
        imageUrl: typeof rawCards.android?.imageUrl === "string" ? rawCards.android.imageUrl : "",
        imagePublicId: typeof rawCards.android?.imagePublicId === "string" ? rawCards.android.imagePublicId : "",
        updatedAt: rawCards.android?.updatedAt || "",
      },
      ipad: {
        id: "ipad",
        title: "Discover my next iPad",
        imageUrl: typeof rawCards.ipad?.imageUrl === "string" ? rawCards.ipad.imageUrl : "",
        imagePublicId: typeof rawCards.ipad?.imagePublicId === "string" ? rawCards.ipad.imagePublicId : "",
        updatedAt: rawCards.ipad?.updatedAt || "",
      },
      wrist: {
        id: "wrist",
        title: "Search for my Wrist",
        imageUrl: typeof rawCards.wrist?.imageUrl === "string" ? rawCards.wrist.imageUrl : "",
        imagePublicId: typeof rawCards.wrist?.imagePublicId === "string" ? rawCards.wrist.imagePublicId : "",
        updatedAt: rawCards.wrist?.updatedAt || "",
      },
    },
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
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

  const [loading, setLoading] = useState(true);

  // Firestore synchronization
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      try {
        if (isFirebasePlaceholder || !db) {
          setLoading(false);
          return;
        }

        const docRef = doc(db, "config", "discovery_cards");

        unsubscribe = onSnapshot(
          docRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const remote = normalizeConfig(snapshot.data());
              setConfig((prev) => {
                // Ensure we never overwrite uploaded images with empty strings
                const merged: DiscoveryCardsConfig = {
                  cards: {
                    iphone: {
                      ...remote.cards.iphone,
                      imageUrl: remote.cards.iphone.imageUrl || prev.cards.iphone.imageUrl,
                      imagePublicId: remote.cards.iphone.imagePublicId || prev.cards.iphone.imagePublicId,
                    },
                    android: {
                      ...remote.cards.android,
                      imageUrl: remote.cards.android.imageUrl || prev.cards.android.imageUrl,
                      imagePublicId: remote.cards.android.imagePublicId || prev.cards.android.imagePublicId,
                    },
                    ipad: {
                      ...remote.cards.ipad,
                      imageUrl: remote.cards.ipad.imageUrl || prev.cards.ipad.imageUrl,
                      imagePublicId: remote.cards.ipad.imagePublicId || prev.cards.ipad.imagePublicId,
                    },
                    wrist: {
                      ...remote.cards.wrist,
                      imageUrl: remote.cards.wrist.imageUrl || prev.cards.wrist.imageUrl,
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
            }
            setLoading(false);
          },
          (err) => {
            console.warn("[DiscoveryCardsContext] Firestore listener notice:", err);
            setLoading(false);
          }
        );
      } catch (err) {
        console.warn("[DiscoveryCardsContext] Listener setup failed:", err);
        setLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) unsubscribe();
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

    // 2. Persist to Firestore
    try {
      if (!isFirebasePlaceholder && db) {
        const docRef = doc(db, "config", "discovery_cards");
        await setDoc(docRef, sanitizeForFirestore(newConfig), { merge: true });
      }
    } catch (err) {
      console.warn("[DiscoveryCardsContext] Firestore save error:", err);
    }
  };

  const updateCardImage = async (cardId: DiscoveryCardId, imageUrl: string, imagePublicId?: string) => {
    const newConfig: DiscoveryCardsConfig = {
      ...config,
      cards: {
        ...config.cards,
        [cardId]: {
          ...config.cards[cardId],
          imageUrl,
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
