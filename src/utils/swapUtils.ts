import { SwapDeviceConditionAnswers, SwapRequest, SwapStatus, Product, DevicePhotoMeta } from "../types";
import { db, isFirebasePlaceholder } from "../lib/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs, 
  deleteDoc, 
  onSnapshot, 
  query,
  where
} from "firebase/firestore";
import { 
  findTradeInValuation, 
  getStoredConditionAdjustmentRules, 
  getStoredTradeInValuations 
} from "./tradeInValuationDb";

export const SWAP_STATUSES: SwapStatus[] = [
  "Submitted",
  "Under Review",
  "Awaiting Inspection",
  "Value Adjusted",
  "Approved",
  "Swap Confirmed",
  "Completed",
  "Cancelled",
  "Declined"
];

/**
 * Checks if user has answered all required condition questions
 */
export function isConditionComplete(
  answers: SwapDeviceConditionAnswers,
  brand: string = "Apple"
): boolean {
  if (!answers.screen) return false;
  if (!answers.body) return false;

  const isApple = brand.toLowerCase().includes("apple");
  if (isApple) {
    if (typeof answers.batteryHealth !== "number" || answers.batteryHealth < 50 || answers.batteryHealth > 100) {
      return false;
    }
  } else {
    const hasCondition = Boolean(answers.batteryCondition);
    const hasPercentage = typeof answers.batteryHealth === "number" && answers.batteryHealth >= 50 && answers.batteryHealth <= 100;
    if (!hasCondition && !hasPercentage) {
      return false;
    }
  }

  // Functional checklist must have been acknowledged/reviewed
  if (!answers.checklistReviewed) return false;

  return true;
}

/**
 * Calculates suggested condition grade based on actual user answers
 */
export function calculateEstimatedGrade(
  answers: SwapDeviceConditionAnswers,
  brand: string = "Apple"
): {
  grade: "Grade A" | "Grade B" | "Grade C" | "Grade D";
  summary: string;
  score: number;
} | null {
  if (!isConditionComplete(answers, brand)) {
    return null;
  }

  let score = 100;

  // Screen Impact (35% weight)
  if (answers.screen === "minor_scratches") score -= 8;
  else if (answers.screen === "visible_scratches") score -= 20;
  else if (answers.screen === "cracked") score -= 45;

  // Body Impact (25% weight)
  if (answers.body === "minor_scuffs") score -= 6;
  else if (answers.body === "visible_dents") score -= 16;
  else if (answers.body === "damaged") score -= 35;

  // Camera Impact (15% weight)
  if (answers.camera === "minor_issue") score -= 12;
  else if (answers.camera === "faulty") score -= 30;

  // Battery Impact (15% weight)
  const isApple = brand.toLowerCase().includes("apple");
  if (isApple && typeof answers.batteryHealth === "number") {
    const bh = answers.batteryHealth;
    if (bh >= 95) {
      // No reduction
    } else if (bh >= 88) {
      score -= 5;
    } else if (bh >= 82) {
      score -= 12;
    } else if (bh >= 75) {
      score -= 22;
    } else {
      score -= 32;
    }
  } else {
    if (answers.batteryCondition === "excellent") {
      // No reduction
    } else if (answers.batteryCondition === "good") {
      score -= 6;
    } else if (answers.batteryCondition === "fair") {
      score -= 18;
    } else if (answers.batteryCondition === "poor") {
      score -= 30;
    } else if (typeof answers.batteryHealth === "number") {
      const bh = answers.batteryHealth;
      if (bh < 80) score -= 22;
      else if (bh < 88) score -= 10;
    }
  }

  // Functional features checklist
  const funcs = answers.otherFunctions || {};
  if (funcs.screenTouch === false) score -= 25;
  if (funcs.cameras === false) score -= 15;
  if (funcs.chargingPort === false) score -= 20;
  if (funcs.speakers === false) score -= 8;
  if (funcs.microphone === false) score -= 8;
  if (funcs.buttons === false) score -= 6;
  if (funcs.wifiBluetooth === false) score -= 25;
  if (funcs.faceOrFingerprint === false) score -= 15;

  // Clamp score
  score = Math.max(15, Math.min(100, score));

  if (score >= 88) {
    return {
      grade: "Grade A",
      summary: "Estimated based on the information you provided. Final valuation is subject to physical inspection.",
      score
    };
  } else if (score >= 70) {
    return {
      grade: "Grade B",
      summary: "Estimated based on the information you provided. Final valuation is subject to physical inspection.",
      score
    };
  } else if (score >= 48) {
    return {
      grade: "Grade C",
      summary: "Estimated based on the information you provided. Final valuation is subject to physical inspection.",
      score
    };
  } else {
    return {
      grade: "Grade D",
      summary: "Estimated based on the information you provided. Final valuation is subject to physical inspection.",
      score
    };
  }
}

export interface SwapValuationResult {
  isComplete: boolean;
  isValuationSet: boolean;
  baseTradeInValue: number | null;
  conditionAdjustment: number;
  estimatedValue: number; // Estimated Swap Credit
  grade: "Grade A" | "Grade B" | "Grade C" | "Grade D" | null;
  gradeSummary: string;
  rulePercentage: number;
}

/**
 * Calculates estimated device value based on Admin-set Base Trade-In Value and condition adjustments.
 * If Base Trade-In Value is NOT set by admin or inactive, isValuationSet is false and estimatedValue is 0.
 */
export function calculateSwapValuation(
  modelName: string,
  selectedStorage: string,
  answers: SwapDeviceConditionAnswers,
  brand: string = "Apple"
): SwapValuationResult {
  if (!modelName || !selectedStorage) {
    return {
      isComplete: false,
      isValuationSet: false,
      baseTradeInValue: null,
      conditionAdjustment: 0,
      estimatedValue: 0,
      grade: null,
      gradeSummary: "",
      rulePercentage: 0
    };
  }

  const gradeCalc = calculateEstimatedGrade(answers, brand);
  if (!gradeCalc) {
    return {
      isComplete: false,
      isValuationSet: false,
      baseTradeInValue: null,
      conditionAdjustment: 0,
      estimatedValue: 0,
      grade: null,
      gradeSummary: "",
      rulePercentage: 0
    };
  }

  // Look up Admin-set valuation in Trade-In Valuations Database
  const valuationRecord = findTradeInValuation(brand, modelName, selectedStorage);

  if (
    !valuationRecord ||
    valuationRecord.status === "Inactive" ||
    valuationRecord.baseTradeInValue === null ||
    valuationRecord.baseTradeInValue <= 0
  ) {
    // Valuation is NOT set by admin
    return {
      isComplete: true,
      isValuationSet: false,
      baseTradeInValue: null,
      conditionAdjustment: 0,
      estimatedValue: 0,
      grade: gradeCalc.grade,
      gradeSummary: gradeCalc.summary,
      rulePercentage: 0
    };
  }

  const baseTradeInValue = valuationRecord.baseTradeInValue;

  // Retrieve admin condition adjustment rules
  const rules = getStoredConditionAdjustmentRules();
  const matchedRule = rules.find((r) => r.grade === gradeCalc.grade && r.status === "Active");

  let conditionAdjustment = 0;
  let rulePct = 0;

  if (matchedRule) {
    if (matchedRule.adjustmentType === "percentage") {
      rulePct = matchedRule.adjustmentValue; // e.g. -15 for -15%
      conditionAdjustment = Math.round((baseTradeInValue * (rulePct / 100)) / 500) * 500;
    } else {
      conditionAdjustment = matchedRule.adjustmentValue;
    }
  } else {
    // Default standard multipliers if rule not found
    const defaultMultipliers: Record<string, number> = {
      "Grade A": 0,
      "Grade B": -15,
      "Grade C": -38,
      "Grade D": -62
    };
    rulePct = defaultMultipliers[gradeCalc.grade] || 0;
    conditionAdjustment = Math.round((baseTradeInValue * (rulePct / 100)) / 500) * 500;
  }

  // Base Trade-In Value + / - Condition Adjustments = Estimated Swap Credit
  const estimatedSwapCredit = Math.max(0, baseTradeInValue + conditionAdjustment);

  return {
    isComplete: true,
    isValuationSet: true,
    baseTradeInValue,
    conditionAdjustment,
    estimatedValue: estimatedSwapCredit,
    grade: gradeCalc.grade,
    gradeSummary: gradeCalc.summary,
    rulePercentage: rulePct
  };
}

/**
 * Generates a unique, non-colliding Swap ID (e.g. MIL-SWAP-00421)
 */
export function generateSwapId(): string {
  const existingRequests = getStoredSwapRequests();
  const existingIds = new Set(existingRequests.map(r => r.id));

  // Generate random 5-digit number padded with leading zeros
  let newId = "";
  let attempts = 0;
  do {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    newId = `MIL-SWAP-${randomNum}`;
    attempts++;
  } while (existingIds.has(newId) && attempts < 100);

  return newId;
}

const STORAGE_KEY = "milito_swap_requests";

/**
 * Strips undefined values to prevent Firestore serialization errors
 */
function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      sanitized[key] = sanitizeForFirestore(value);
    }
  }
  return sanitized;
}

/**
 * Strips sensitive admin-only data and returns a clean, customer-safe representation for tracking.
 */
export function sanitizeSwapRequestForCustomer(request: SwapRequest): SwapRequest {
  return {
    id: request.id,
    customerName: request.customerName || "Customer",
    customerPhone: request.customerPhone || "",
    status: request.status || "Submitted",
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    customerLocation: request.customerLocation || "",
    currentDevice: {
      brand: request.currentDevice?.brand || "",
      model: request.currentDevice?.model || "Device",
      storage: request.currentDevice?.storage || "",
      estimatedGrade: (request.currentDevice?.estimatedGrade || "Grade B") as "Grade A" | "Grade B" | "Grade C" | "Grade D",
      estimatedValue: Number(request.currentDevice?.estimatedValue) || 0,
      answers: {
        screen: request.currentDevice?.answers?.screen,
        body: request.currentDevice?.answers?.body,
        camera: request.currentDevice?.answers?.camera,
        batteryHealth: request.currentDevice?.answers?.batteryHealth,
        batteryCondition: request.currentDevice?.answers?.batteryCondition,
        otherFunctions: request.currentDevice?.answers?.otherFunctions,
      } as any,
    },
    targetProduct: {
      id: request.targetProduct?.id || "",
      name: request.targetProduct?.name || "Upgrade Device",
      brand: request.targetProduct?.brand || "",
      price: Number(request.targetProduct?.price) || 0,
      condition: request.targetProduct?.condition || "Brand New",
      image: request.targetProduct?.image || "",
      storage: request.targetProduct?.storage || "",
    },
    calculation: {
      currentDeviceValue: Number(request.calculation?.currentDeviceValue) || Number(request.currentDevice?.estimatedValue) || 0,
      targetDevicePrice: Number(request.calculation?.targetDevicePrice) || Number(request.targetProduct?.price) || 0,
      difference: Number(request.calculation?.difference) || 0,
      isTopUp: Boolean(request.calculation?.isTopUp),
    },
    adminNotes: request.adminNotes ? String(request.adminNotes) : undefined,
  };
}

/**
 * Retrieves all stored swap requests from localStorage (immediate local cache).
 * Never returns demo or fake requests.
 */
export function getStoredSwapRequests(): SwapRequest[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Filter out legacy sample requests if any were cached in local storage
        const filtered = parsed.filter(
          (r) => r && r.id && r.id !== "MIL-SWAP-00421" && r.id !== "MIL-SWAP-00389"
        );
        return filtered;
      }
    }
  } catch (e) {
    console.error("Failed to read swap requests from cache:", e);
  }
  return [];
}

/**
 * Queries Firestore strictly for an exact Swap Request matching the tracking ID.
 * Returns null if no matching record exists in Firestore.
 * Never falls back to demo or mock data.
 */
export async function lookupSwapRequestByTrackingId(rawId: string): Promise<SwapRequest | null> {
  if (!rawId || typeof rawId !== "string") return null;
  const trimmed = rawId.trim();
  if (!trimmed) return null;

  const normalizedId = trimmed.toUpperCase();

  // 1. Direct Firestore queries
  if (!isFirebasePlaceholder && db) {
    try {
      // Check primary collection 'swap_requests' by Document ID
      const primaryDocRef = doc(db, "swap_requests", normalizedId);
      const primarySnap = await getDoc(primaryDocRef);
      if (primarySnap.exists()) {
        const data = primarySnap.data() as SwapRequest;
        if (data && data.id && (data.id.toUpperCase() === normalizedId || data.id === trimmed)) {
          return sanitizeSwapRequestForCustomer(data);
        }
      }

      // Check with exact raw casing if different
      if (trimmed !== normalizedId) {
        const rawDocRef = doc(db, "swap_requests", trimmed);
        const rawSnap = await getDoc(rawDocRef);
        if (rawSnap.exists()) {
          const data = rawSnap.data() as SwapRequest;
          if (data && data.id && (data.id === trimmed || data.id.toUpperCase() === normalizedId)) {
            return sanitizeSwapRequestForCustomer(data);
          }
        }
      }

      // Query by 'id' field in swap_requests
      const qPrimary = query(collection(db, "swap_requests"), where("id", "==", normalizedId));
      const querySnapPrimary = await getDocs(qPrimary);
      if (!querySnapPrimary.empty) {
        for (const docSnap of querySnapPrimary.docs) {
          const data = docSnap.data() as SwapRequest;
          if (data && data.id && data.id.toUpperCase() === normalizedId) {
            return sanitizeSwapRequestForCustomer(data);
          }
        }
      }

      // Check secondary collection 'swapAppraisalRequests' by Document ID
      const secondaryDocRef = doc(db, "swapAppraisalRequests", normalizedId);
      const secondarySnap = await getDoc(secondaryDocRef);
      if (secondarySnap.exists()) {
        const data = secondarySnap.data() as SwapRequest;
        if (data && data.id && (data.id.toUpperCase() === normalizedId || data.id === trimmed)) {
          return sanitizeSwapRequestForCustomer(data);
        }
      }

      // Query by 'id' field in swapAppraisalRequests
      const qSecondary = query(collection(db, "swapAppraisalRequests"), where("id", "==", normalizedId));
      const querySnapSecondary = await getDocs(qSecondary);
      if (!querySnapSecondary.empty) {
        for (const docSnap of querySnapSecondary.docs) {
          const data = docSnap.data() as SwapRequest;
          if (data && data.id && data.id.toUpperCase() === normalizedId) {
            return sanitizeSwapRequestForCustomer(data);
          }
        }
      }
    } catch (err) {
      console.warn("[Swap Tracker] Firestore direct query error:", err);
    }
  }

  // 2. Check local storage cache for recently submitted real requests if offline,
  // but strictly match exact ID and never return sample requests
  try {
    const local = getStoredSwapRequests();
    const match = local.find(
      (r) => r && r.id && r.id.toUpperCase() === normalizedId && r.id !== "MIL-SWAP-00421" && r.id !== "MIL-SWAP-00389"
    );
    if (match) {
      return sanitizeSwapRequestForCustomer(match);
    }
  } catch (_) {}

  // ID does not exist in the database -> strictly return null
  return null;
}

/**
 * Fetches all swap requests from Firestore and updates local cache
 */
export async function fetchSwapRequestsFromFirestore(): Promise<SwapRequest[]> {
  try {
    if (!isFirebasePlaceholder && db) {
      const q = query(collection(db, "swap_requests"));
      const snap = await getDocs(q);
      const fsRequests: SwapRequest[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.id) {
          fsRequests.push(data as SwapRequest);
        }
      });

      if (fsRequests.length > 0) {
        // Merge with local storage (prefer newer updatedAt)
        const local = getStoredSwapRequests();
        const map = new Map<string, SwapRequest>();
        
        local.forEach((r) => map.set(r.id, r));
        fsRequests.forEach((r) => map.set(r.id, r));

        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );

        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent("milito_swap_requests_updated", { detail: merged }));
        return merged;
      }
    }
  } catch (err) {
    console.warn("Could not fetch swap requests from Firestore, using local cache:", err);
  }
  return getStoredSwapRequests();
}

/**
 * Saves a new swap request to local persistence and Firestore
 */
export async function saveSwapRequest(request: SwapRequest): Promise<void> {
  try {
    // 1. Immediately update local storage for fast client UI responsiveness
    const existing = getStoredSwapRequests();
    const updated = [request, ...existing.filter(r => r.id !== request.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("milito_swap_requests_updated", { detail: updated }));

    // 2. Persist to Firestore if available
    if (!isFirebasePlaceholder && db) {
      const sanitized = sanitizeForFirestore(request);
      // Save to primary swap_requests collection
      await setDoc(doc(db, "swap_requests", request.id), sanitized, { merge: true });
      // Also save to swapAppraisalRequests collection for schema redundancy
      try {
        await setDoc(doc(db, "swapAppraisalRequests", request.id), sanitized, { merge: true });
      } catch (innerErr) {
        // secondary save is non-blocking
      }
    }
  } catch (e) {
    console.error("Failed to save swap request:", e);
  }
}

/**
 * Updates status or admin notes on an existing swap request in local storage and Firestore
 */
export async function updateSwapRequestStatus(
  id: string,
  newStatus: SwapStatus,
  adminNotes?: string
): Promise<SwapRequest | null> {
  try {
    const existing = getStoredSwapRequests();
    let updatedRequest: SwapRequest | null = null;
    const now = new Date().toISOString();
    const updated = existing.map(r => {
      if (r.id === id) {
        updatedRequest = {
          ...r,
          status: newStatus,
          adminNotes: adminNotes !== undefined ? adminNotes : r.adminNotes,
          updatedAt: now
        };
        return updatedRequest;
      }
      return r;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("milito_swap_requests_updated", { detail: updated }));

    // Update in Firestore
    if (!isFirebasePlaceholder && db && updatedRequest) {
      const updatePayload: Record<string, any> = {
        status: newStatus,
        updatedAt: now
      };
      if (adminNotes !== undefined) {
        updatePayload.adminNotes = adminNotes;
      }
      await setDoc(doc(db, "swap_requests", id), updatePayload, { merge: true });
      try {
        await setDoc(doc(db, "swapAppraisalRequests", id), updatePayload, { merge: true });
      } catch (_) {}
    }

    return updatedRequest;
  } catch (e) {
    console.error("Failed to update swap request status:", e);
    return null;
  }
}

/**
 * Deletes a swap request from local storage and Firestore
 */
export async function deleteSwapRequest(id: string): Promise<void> {
  try {
    const existing = getStoredSwapRequests();
    const updated = existing.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("milito_swap_requests_updated", { detail: updated }));

    if (!isFirebasePlaceholder && db) {
      await deleteDoc(doc(db, "swap_requests", id));
      try {
        await deleteDoc(doc(db, "swapAppraisalRequests", id));
      } catch (_) {}
    }
  } catch (e) {
    console.error("Failed to delete swap request:", e);
  }
}

/**
 * Listens for real-time Firestore updates and window events
 */
export function listenToSwapRequests(callback: (requests: SwapRequest[]) => void): () => void {
  // 1. Initial emit from local storage
  callback(getStoredSwapRequests());

  // 2. Window event listener
  const handleLocalUpdate = (e: Event) => {
    const customEvent = e as CustomEvent<SwapRequest[]>;
    if (customEvent.detail && Array.isArray(customEvent.detail)) {
      callback(customEvent.detail);
    } else {
      callback(getStoredSwapRequests());
    }
  };
  window.addEventListener("milito_swap_requests_updated", handleLocalUpdate);

  // 3. Firestore onSnapshot real-time listener if available
  let unsubscribeFirestore: (() => void) | null = null;
  if (!isFirebasePlaceholder && db) {
    try {
      const q = query(collection(db, "swap_requests"));
      unsubscribeFirestore = onSnapshot(q, (snap) => {
        const fsRequests: SwapRequest[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.id) {
            fsRequests.push(data as SwapRequest);
          }
        });
        if (fsRequests.length > 0) {
          const local = getStoredSwapRequests();
          const map = new Map<string, SwapRequest>();
          local.forEach((r) => map.set(r.id, r));
          fsRequests.forEach((r) => map.set(r.id, r));

          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );

          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          callback(merged);
        }
      }, (err) => {
        console.warn("Firestore swap_requests snapshot listener error:", err);
      });
    } catch (err) {
      console.warn("Failed to attach Firestore snapshot listener:", err);
    }
  }

  return () => {
    window.removeEventListener("milito_swap_requests_updated", handleLocalUpdate);
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
    }
  };
}

export const formatNaira = (amount: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
