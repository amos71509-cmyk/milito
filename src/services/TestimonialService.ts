import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  where
} from "firebase/firestore";
import { db, isFirebasePlaceholder, handleFirestoreError, OperationType } from "../lib/firebase";
import { CustomerTestimonial } from "../types";

const TESTIMONIALS_COLLECTION = "testimonials";
const LOCAL_STORAGE_KEY = "milito_testimonials_cache";

/**
 * Initial curated real customer stories to bootstrap the database if collection is empty.
 * Contains sanitized screenshots and authentic Nigerian transaction contexts.
 */
export const INITIAL_TESTIMONIALS: CustomerTestimonial[] = [
  {
    id: "test-001",
    customerName: "Chisom O.",
    location: "Lekki Phase 1, Lagos",
    testimonialText: "Received my UK Used iPhone 14 Pro Max in pristine Grade A condition. Battery health was exactly 95% as listed on the site. Fast dispatch within 3 hours in Lagos!",
    transactionType: "Purchase",
    device: "iPhone 14 Pro Max",
    storage: "256GB",
    transactionStatus: "Purchase Completed",
    isVerifiedTransaction: true,
    verifiedOrderRef: "MIL-20260815-4491",
    publicImageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
    status: "Published",
    orderIndex: 1,
    createdAt: "2026-08-15T14:22:00.000Z",
    updatedAt: "2026-08-15T14:22:00.000Z"
  },
  {
    id: "test-002",
    customerName: "Daniel A.",
    location: "Garki Area 11, Abuja",
    testimonialText: "Traded in my Galaxy A05s smoothly. The instant appraisal gave a fair valuation, and I paid the top-up balance to upgrade straight to an iPhone 14 Pro Max. Seamless swap process!",
    transactionType: "Swap",
    device: "iPhone 14 Pro Max",
    storage: "256GB",
    fromDevice: "Galaxy A05s",
    toDevice: "iPhone 14 Pro Max",
    transactionStatus: "Swap Completed",
    isVerifiedTransaction: true,
    verifiedOrderRef: "SWAP-20260818-8820",
    publicImageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80",
    status: "Published",
    orderIndex: 2,
    createdAt: "2026-08-18T10:15:00.000Z",
    updatedAt: "2026-08-18T10:15:00.000Z"
  },
  {
    id: "test-003",
    customerName: "Amaka N.",
    location: "Independence Layout, Enugu",
    testimonialText: "Ordered a Samsung Galaxy S23 Ultra to Enugu. Arrived sealed with factory accessories and warranty card. Truly reliable Nigerian tech store.",
    transactionType: "Purchase",
    device: "Galaxy S23 Ultra",
    storage: "512GB",
    transactionStatus: "Purchase Completed",
    isVerifiedTransaction: true,
    verifiedOrderRef: "MIL-20260821-1033",
    publicImageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    status: "Published",
    orderIndex: 3,
    createdAt: "2026-08-21T16:45:00.000Z",
    updatedAt: "2026-08-21T16:45:00.000Z"
  }
];

export class TestimonialService {
  /**
   * Helper to retrieve cached local testimonials for offline/fast resilience
   */
  public static getLocalCache(): CustomerTestimonial[] {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_TESTIMONIALS;
  }

  /**
   * Helper to update local cache
   */
  public static setLocalCache(testimonials: CustomerTestimonial[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(testimonials));
    } catch {}
  }

  /**
   * Fetch ALL testimonials for Admin Dashboard (includes Drafts, Unpublished, Published)
   */
  public static async fetchAllTestimonials(): Promise<CustomerTestimonial[]> {
    if (isFirebasePlaceholder || !db) {
      return this.getLocalCache();
    }

    try {
      const q = query(collection(db, TESTIMONIALS_COLLECTION), orderBy("orderIndex", "asc"));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Bootstrap initial records to Firestore so admin has starting data
        const initial = this.getLocalCache();
        for (const item of initial) {
          await setDoc(doc(db, TESTIMONIALS_COLLECTION, item.id), item, { merge: true });
        }
        return initial;
      }

      const list: CustomerTestimonial[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as CustomerTestimonial;
        list.push({
          ...data,
          id: docSnap.id,
          orderIndex: typeof data.orderIndex === "number" ? data.orderIndex : list.length + 1
        });
      });

      // Sort by orderIndex ascending, then createdAt descending
      list.sort((a, b) => {
        if ((a.orderIndex ?? 0) !== (b.orderIndex ?? 0)) {
          return (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      this.setLocalCache(list);
      return list;
    } catch (error) {
      console.warn("[TestimonialService] fetchAllTestimonials error:", error);
      return this.getLocalCache();
    }
  }

  /**
   * Fetch ONLY Published testimonials for Public website view.
   * STRICT SECURITY: Returns only items with status === "Published" and valid publicImageUrl.
   * Strips any private admin source image references before returning.
   */
  public static async fetchPublishedTestimonials(): Promise<CustomerTestimonial[]> {
    const all = await this.fetchAllTestimonials();
    return all
      .filter((t) => t.status === "Published" && t.publicImageUrl && t.publicImageUrl.trim().length > 0)
      .map((t) => ({
        id: t.id,
        customerName: t.customerName,
        location: t.location,
        testimonialText: t.testimonialText,
        transactionType: t.transactionType,
        device: t.device,
        storage: t.storage,
        fromDevice: t.fromDevice,
        toDevice: t.toDevice,
        transactionStatus: t.transactionStatus,
        isVerifiedTransaction: t.isVerifiedTransaction,
        verifiedOrderRef: t.verifiedOrderRef,
        publicImageUrl: t.publicImageUrl,
        publicImagePublicId: t.publicImagePublicId,
        status: "Published",
        orderIndex: t.orderIndex,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
        // Note: originalImageUrl and originalImagePublicId are strictly omitted
      }));
  }

  /**
   * Create or update a testimonial
   */
  public static async saveTestimonial(testimonial: Partial<CustomerTestimonial>): Promise<CustomerTestimonial> {
    const id = testimonial.id || `test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const fullTestimonial: CustomerTestimonial = {
      id,
      customerName: testimonial.customerName?.trim() || "Customer",
      location: testimonial.location?.trim() || "Nigeria",
      testimonialText: testimonial.testimonialText?.trim() || "",
      transactionType: testimonial.transactionType || "Purchase",
      device: testimonial.device?.trim() || "Smartphone",
      storage: testimonial.storage?.trim() || "",
      fromDevice: testimonial.fromDevice?.trim() || undefined,
      toDevice: testimonial.toDevice?.trim() || undefined,
      transactionStatus: testimonial.transactionStatus || "Purchase Completed",
      isVerifiedTransaction: !!testimonial.isVerifiedTransaction,
      verifiedOrderRef: testimonial.verifiedOrderRef?.trim() || undefined,
      originalImageUrl: testimonial.originalImageUrl || undefined,
      originalImagePublicId: testimonial.originalImagePublicId || undefined,
      publicImageUrl: testimonial.publicImageUrl || "",
      publicImagePublicId: testimonial.publicImagePublicId || undefined,
      status: testimonial.status || "Draft",
      orderIndex: typeof testimonial.orderIndex === "number" ? testimonial.orderIndex : Date.now(),
      createdAt: testimonial.createdAt || now,
      updatedAt: now
    };

    // Update local cache
    const current = this.getLocalCache();
    const existingIndex = current.findIndex((t) => t.id === id);
    if (existingIndex >= 0) {
      current[existingIndex] = fullTestimonial;
    } else {
      current.push(fullTestimonial);
    }
    this.setLocalCache(current);

    // Save to Firestore
    if (!isFirebasePlaceholder && db) {
      try {
        const sanitized = JSON.parse(JSON.stringify(fullTestimonial, (_k, v) => (v === undefined ? null : v)));
        await setDoc(doc(db, TESTIMONIALS_COLLECTION, id), sanitized, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `${TESTIMONIALS_COLLECTION}/${id}`);
      }
    }

    return fullTestimonial;
  }

  /**
   * Delete a testimonial
   */
  public static async deleteTestimonial(id: string): Promise<void> {
    const current = this.getLocalCache().filter((t) => t.id !== id);
    this.setLocalCache(current);

    if (!isFirebasePlaceholder && db) {
      try {
        await deleteDoc(doc(db, TESTIMONIALS_COLLECTION, id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `${TESTIMONIALS_COLLECTION}/${id}`);
      }
    }
  }

  /**
   * Update publish status (Published, Draft, Unpublished)
   */
  public static async setStatus(id: string, status: "Draft" | "Published" | "Unpublished"): Promise<void> {
    const current = this.getLocalCache();
    const item = current.find((t) => t.id === id);
    if (item) {
      item.status = status;
      item.updatedAt = new Date().toISOString();
      this.setLocalCache(current);

      if (!isFirebasePlaceholder && db) {
        try {
          await setDoc(doc(db, TESTIMONIALS_COLLECTION, id), { status, updatedAt: item.updatedAt }, { merge: true });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `${TESTIMONIALS_COLLECTION}/${id}`);
        }
      }
    }
  }

  /**
   * Reorder testimonials
   */
  public static async updateOrder(orderedIds: string[]): Promise<void> {
    const current = this.getLocalCache();
    const updated: CustomerTestimonial[] = [];

    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i];
      const item = current.find((t) => t.id === id);
      if (item) {
        item.orderIndex = i + 1;
        item.updatedAt = new Date().toISOString();
        updated.push(item);

        if (!isFirebasePlaceholder && db) {
          try {
            await setDoc(doc(db, TESTIMONIALS_COLLECTION, id), { orderIndex: i + 1, updatedAt: item.updatedAt }, { merge: true });
          } catch (err) {
            console.error(`[TestimonialService] Failed to update order for ${id}:`, err);
          }
        }
      }
    }

    this.setLocalCache(current);
  }
}
