import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface CustomerUser {
  id: string;
  email: string;
  name: string;
}

interface CustomerAuthContextType {
  currentUser: CustomerUser | null;
  isLoggedIn: boolean;
  likedProductIds: string[];
  isProductLiked: (productId: string) => boolean;
  toggleLikeProduct: (productId: string) => Promise<{ success: boolean; requiresAuth?: boolean; action?: "added" | "removed" }>;
  login: (email: string, name?: string) => Promise<boolean>;
  signup: (email: string, name: string) => Promise<boolean>;
  logout: () => void;
  isAuthPromptOpen: boolean;
  openAuthPrompt: () => void;
  closeAuthPrompt: () => void;
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = "milito_customer_auth_user";

function generateUserIdFromEmail(email: string): string {
  const clean = email.toLowerCase().trim();
  // Safe URL-friendly alphanumeric ID based on email
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const cleanPrefix = clean.replace(/[^a-z0-9]/g, "_").slice(0, 16);
  return `cust_${cleanPrefix}_${Math.abs(hash).toString(36)}`;
}

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error reading saved customer user:", e);
    }
    return null;
  });

  const [likedProductIds, setLikedProductIds] = useState<string[]>([]);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Load liked products from Firestore (and local backup) whenever currentUser changes
  useEffect(() => {
    if (!currentUser) {
      setLikedProductIds([]);
      return;
    }

    let isMounted = true;

    // 1. Initial rapid restore from localStorage cache
    try {
      const cached = localStorage.getItem(`milito_liked_${currentUser.id}`);
      if (cached) {
        setLikedProductIds(JSON.parse(cached));
      }
    } catch (e) {}

    // 2. Fetch authoritative state from Firestore
    async function fetchFromFirestore() {
      if (!currentUser) return;
      try {
        const [{ db, isFirebasePlaceholder }, { doc, getDoc, setDoc }] = await Promise.all([
          import("../lib/firebase"),
          import("firebase/firestore")
        ]);
        if (isFirebasePlaceholder || !db || !isMounted) return;
        const userRef = doc(db, "customers", currentUser.id);
        const snap = await getDoc(userRef);
        if (snap.exists() && isMounted) {
          const data = snap.data();
          const savedList: string[] = Array.isArray(data.likedProductIds) ? data.likedProductIds : [];
          setLikedProductIds(savedList);
          try {
            localStorage.setItem(`milito_liked_${currentUser.id}`, JSON.stringify(savedList));
          } catch (e) {}
        } else if (!snap.exists() && isMounted) {
          // Initialize customer record in Firestore
          await setDoc(userRef, {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            likedProductIds: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        }
      } catch (err) {
        console.warn("Could not sync liked products from Firestore:", err);
      }
    }

    fetchFromFirestore();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const isProductLiked = useCallback((productId: string) => {
    return likedProductIds.includes(productId);
  }, [likedProductIds]);

  const toggleLikeProduct = useCallback(async (productId: string) => {
    if (!currentUser) {
      setIsAuthPromptOpen(true);
      return { success: false, requiresAuth: true };
    }

    const isCurrentlyLiked = likedProductIds.includes(productId);
    const updated = isCurrentlyLiked
      ? likedProductIds.filter(id => id !== productId)
      : [...likedProductIds, productId];

    const action = isCurrentlyLiked ? ("removed" as const) : ("added" as const);

    // Update local state immediately for instant responsive UI
    setLikedProductIds(updated);

    try {
      localStorage.setItem(`milito_liked_${currentUser.id}`, JSON.stringify(updated));
    } catch (e) {}

    // Persist to Firestore
    try {
      const [{ db, isFirebasePlaceholder }, { doc, setDoc }] = await Promise.all([
        import("../lib/firebase"),
        import("firebase/firestore")
      ]);
      if (!isFirebasePlaceholder && db) {
        const userRef = doc(db, "customers", currentUser.id);
        await setDoc(userRef, {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          likedProductIds: updated,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
    } catch (err) {
      console.error("Failed to update liked products in Firestore:", err);
    }

    return { success: true, action };
  }, [currentUser, likedProductIds]);

  const login = useCallback(async (email: string, name?: string) => {
    const cleanEmail = email.trim();
    if (!cleanEmail) return false;

    const id = generateUserIdFromEmail(cleanEmail);
    const displayName = name?.trim() || cleanEmail.split("@")[0] || "Customer";

    const user: CustomerUser = {
      id,
      email: cleanEmail,
      name: displayName,
    };

    setCurrentUser(user);
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    } catch (e) {}

    // Upsert customer in Firestore
    try {
      const [{ db, isFirebasePlaceholder }, { doc, getDoc, setDoc }] = await Promise.all([
        import("../lib/firebase"),
        import("firebase/firestore")
      ]);
      if (!isFirebasePlaceholder && db) {
        const userRef = doc(db, "customers", id);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          const existingLikes = Array.isArray(data.likedProductIds) ? data.likedProductIds : [];
          setLikedProductIds(existingLikes);
          try {
            localStorage.setItem(`milito_liked_${id}`, JSON.stringify(existingLikes));
          } catch (e) {}
        } else {
          await setDoc(userRef, {
            id,
            name: displayName,
            email: cleanEmail,
            likedProductIds: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        }
      }
    } catch (e) {
      console.warn("Firestore customer login sync error:", e);
    }

    setIsAuthPromptOpen(false);
    return true;
  }, []);

  const signup = useCallback(async (email: string, name: string) => {
    return login(email, name);
  }, [login]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setLikedProductIds([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    } catch (e) {}
    setIsProfileModalOpen(false);
  }, []);

  return (
    <CustomerAuthContext.Provider
      value={{
        currentUser,
        isLoggedIn: Boolean(currentUser),
        likedProductIds,
        isProductLiked,
        toggleLikeProduct,
        login,
        signup,
        logout,
        isAuthPromptOpen,
        openAuthPrompt: () => setIsAuthPromptOpen(true),
        closeAuthPrompt: () => setIsAuthPromptOpen(false),
        isProfileModalOpen,
        openProfileModal: () => setIsProfileModalOpen(true),
        closeProfileModal: () => setIsProfileModalOpen(false),
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
}
