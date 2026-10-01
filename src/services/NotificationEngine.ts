import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";
import { db, isFirebasePlaceholder } from "../lib/firebase";
import {
  NotificationJob,
  ProductAlert,
  Customer,
  ProductChangeDetectionParams,
  ProductChangeDetectionResult,
  AlertNotificationType
} from "../types";

const NOTIFICATION_QUEUE_COLLECTION = "notificationQueue";
const PRODUCT_ALERTS_COLLECTION = "productAlerts";
const CUSTOMERS_COLLECTION = "customers";
const LOCAL_QUEUE_KEY = "milito_notification_queue_cache";

/**
 * Format currency in Nigerian Naira (₦)
 */
export function formatNairaAmount(val?: number): string {
  if (typeof val !== "number" || isNaN(val)) return "₦0";
  return `₦${val.toLocaleString("en-NG")}`;
}

/**
 * Checks whether a stock/availability configuration is Out of Stock
 */
export function isStockOutOfStock(quantity?: number, availability?: string): boolean {
  if (availability === "Sold Out" || availability === "Out of stock") return true;
  if (typeof quantity === "number" && quantity <= 0) return true;
  return false;
}

/**
 * Local cache helpers for notification queue
 */
function getLocalQueue(): NotificationJob[] {
  try {
    const raw = localStorage.getItem(LOCAL_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalJob(job: NotificationJob) {
  try {
    const current = getLocalQueue().filter(j => j.id !== job.id);
    current.unshift(job);
    localStorage.setItem(LOCAL_QUEUE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn("Could not save notification job to local storage:", e);
  }
}

function sanitizePayload<T extends Record<string, any>>(obj: T): T {
  const cleaned = { ...obj } as any;
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === undefined) {
      cleaned[key] = null;
    }
  });
  return cleaned;
}

/**
 * Fetches all notification jobs from Firestore or local fallback
 */
export async function getNotificationQueue(limitCount: number = 100): Promise<NotificationJob[]> {
  if (db && !isFirebasePlaceholder) {
    try {
      const queueRef = collection(db, NOTIFICATION_QUEUE_COLLECTION);
      const snap = await getDocs(queueRef);
      const jobs = snap.docs.map(d => ({ id: d.id, ...d.data() } as NotificationJob));
      // Sort newest first
      return jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
      console.warn("Firestore queue fetch error, falling back to local storage:", e);
      return getLocalQueue();
    }
  }
  return getLocalQueue();
}

/**
 * Core Automatic Price & Stock Notification Engine
 * Evaluates product changes, detects PRICE_DROP, PRICE_INCREASE, or RESTOCK,
 * checks for active subscriber alerts, and creates idempotent notification jobs in Firestore.
 */
export async function processProductChange(
  params: ProductChangeDetectionParams
): Promise<ProductChangeDetectionResult> {
  const {
    productId,
    productName,
    oldPrice,
    newPrice,
    oldQuantity,
    newQuantity,
    oldAvailability,
    newAvailability,
    eventId,
    source = "admin_update"
  } = params;

  console.log(`[NotificationEngine] Evaluating change for product: ${productName} (ID: ${productId})`, {
    oldPrice,
    newPrice,
    oldQuantity,
    newQuantity,
    oldAvailability,
    newAvailability,
    source
  });

  const result: ProductChangeDetectionResult = {
    success: true,
    productId: String(productId),
    productName: productName || "MILITO Product",
    priceChange: {
      detected: false,
      eventType: null,
      oldPrice,
      newPrice,
      queuedCount: 0
    },
    stockChange: {
      detected: false,
      isRestock: false,
      oldQuantity,
      newQuantity,
      queuedCount: 0
    },
    totalQueued: 0,
    queuedJobs: [],
    message: "No notification triggers detected."
  };

  if (!productId) {
    result.success = false;
    result.message = "Product ID is required for change detection.";
    return result;
  }

  // 1. EVALUATE PRICE CHANGE
  let priceEventType: "PRICE_DROP" | "PRICE_INCREASE" | null = null;
  if (
    typeof oldPrice === "number" &&
    typeof newPrice === "number" &&
    oldPrice > 0 &&
    newPrice > 0 &&
    oldPrice !== newPrice
  ) {
    priceEventType = newPrice < oldPrice ? "PRICE_DROP" : "PRICE_INCREASE";
    result.priceChange.detected = true;
    result.priceChange.eventType = priceEventType;
  }

  // 2. EVALUATE STOCK RESTOCK (0 -> N or Sold Out -> In Stock)
  let isRestock = false;
  if (oldQuantity !== undefined && newQuantity !== undefined) {
    const wasOutOfStock = isStockOutOfStock(oldQuantity, oldAvailability);
    const isNowOutOfStock = isStockOutOfStock(newQuantity, newAvailability);

    // RESTOCK occurs ONLY when transitioning from out-of-stock (0 or Sold Out) to in-stock (>0)
    if (wasOutOfStock && !isNowOutOfStock) {
      isRestock = true;
      result.stockChange.detected = true;
      result.stockChange.isRestock = true;
    }
  }

  // If neither price nor restock changed, return early
  if (!priceEventType && !isRestock) {
    console.log(`[NotificationEngine] No actionable price drop/increase or restock transition for ${productName}.`);
    result.message = "Product updated. No subscriber alert triggers detected.";
    return result;
  }

  const now = new Date().toISOString();
  const queuedJobs: NotificationJob[] = [];

  try {
    // 3. FETCH ACTIVE SUBSCRIBERS FOR THIS PRODUCT
    let activeAlerts: ProductAlert[] = [];
    let customerMap = new Map<string, Customer>();

    if (db && !isFirebasePlaceholder) {
      try {
        const alertsRef = collection(db, PRODUCT_ALERTS_COLLECTION);
        const q = query(
          alertsRef,
          where("productId", "==", String(productId)),
          where("active", "==", true)
        );
        const alertSnap = await getDocs(q);
        activeAlerts = alertSnap.docs.map(d => ({ id: d.id, ...d.data() } as ProductAlert));

        // Fetch customer info for personalization and logging
        const custSnap = await getDocs(collection(db, CUSTOMERS_COLLECTION));
        custSnap.docs.forEach(d => {
          customerMap.set(d.id, { id: d.id, ...d.data() } as Customer);
        });
      } catch (fsErr) {
        console.warn("[NotificationEngine] Firestore alert query failed, checking local cache:", fsErr);
      }
    }

    // Local cache fallback if Firestore alerts empty or errored
    if (activeAlerts.length === 0) {
      try {
        const rawLocal = localStorage.getItem("milito_product_alerts_cache");
        if (rawLocal) {
          const localList: ProductAlert[] = JSON.parse(rawLocal);
          activeAlerts = localList.filter(
            a => String(a.productId) === String(productId) && a.active !== false
          );
        }
        const rawCust = localStorage.getItem("milito_customers_cache");
        if (rawCust) {
          const localCusts: Customer[] = JSON.parse(rawCust);
          localCusts.forEach(c => customerMap.set(c.id, c));
        }
      } catch (e) {
        // Ignore local parse errors
      }
    }

    console.log(`[NotificationEngine] Found ${activeAlerts.length} total active alerts for product ${productId}`);

    // 4. PROCESS PRICE CHANGE JOBS
    if (priceEventType && oldPrice !== undefined && newPrice !== undefined) {
      const priceAlerts = activeAlerts.filter(a => a.alertType === "PRICE_CHANGE");
      console.log(`[NotificationEngine] Matching PRICE_CHANGE subscribers count: ${priceAlerts.length}`);

      for (const alert of priceAlerts) {
        const customer = customerMap.get(alert.customerId);
        const oldFormatted = formatNairaAmount(oldPrice);
        const newFormatted = formatNairaAmount(newPrice);

        const title = priceEventType === "PRICE_DROP"
          ? `Price Drop Alert: ${productName}`
          : `Price Update: ${productName}`;

        const message = priceEventType === "PRICE_DROP"
          ? `Good news! The ${productName} you were watching has dropped in price from ${oldFormatted} to ${newFormatted}.`
          : `The price of the ${productName} you were watching has changed from ${oldFormatted} to ${newFormatted}.`;

        // Idempotent deterministic job ID
        const jobId = `job_${alert.id}_${priceEventType}_${oldPrice}_${newPrice}`;

        const jobPayload: NotificationJob = sanitizePayload({
          id: jobId,
          customerId: alert.customerId,
          productId: String(productId),
          alertId: alert.id,
          notificationType: priceEventType,
          channel: "WHATSAPP",
          title,
          message,
          status: "PENDING",
          attempts: 0,
          createdAt: now,
          scheduledAt: now,
          sentAt: null,
          error: null,
          eventId: eventId || `evt_price_${productId}_${oldPrice}_${newPrice}`,
          metadata: {
            productName,
            oldPrice,
            newPrice,
            priceDiff: newPrice - oldPrice,
            currency: "NGN",
            customerName: customer?.name || "Customer",
            customerPhone: customer?.phone || "",
            customerEmail: customer?.email || null,
            source
          }
        });

        // Write to Firestore notificationQueue
        if (db && !isFirebasePlaceholder) {
          try {
            await setDoc(doc(db, NOTIFICATION_QUEUE_COLLECTION, jobId), jobPayload, { merge: true });
            console.log(`[NotificationEngine] ✅ Queued job written to Firestore: ${jobId}`);
          } catch (writeErr) {
            console.error(`[NotificationEngine] ❌ Error writing job ${jobId} to Firestore:`, writeErr);
          }
        }

        saveLocalJob(jobPayload);
        queuedJobs.push(jobPayload);
      }

      result.priceChange.queuedCount = priceAlerts.length;
    }

    // 5. PROCESS RESTOCK JOBS
    if (isRestock) {
      const restockAlerts = activeAlerts.filter(a => a.alertType === "RESTOCK");
      console.log(`[NotificationEngine] Matching RESTOCK subscribers count: ${restockAlerts.length}`);

      for (const alert of restockAlerts) {
        const customer = customerMap.get(alert.customerId);
        const title = `Back in Stock: ${productName}`;
        const message = `Great news! The ${productName} you were watching is now back in stock at MILITO TECH HOME.`;

        // Idempotent deterministic job ID for restock
        const jobId = `job_${alert.id}_RESTOCK_${oldQuantity ?? 0}_${newQuantity ?? 1}`;

        const jobPayload: NotificationJob = sanitizePayload({
          id: jobId,
          customerId: alert.customerId,
          productId: String(productId),
          alertId: alert.id,
          notificationType: "RESTOCK",
          channel: "WHATSAPP",
          title,
          message,
          status: "PENDING",
          attempts: 0,
          createdAt: now,
          scheduledAt: now,
          sentAt: null,
          error: null,
          eventId: eventId || `evt_restock_${productId}_${oldQuantity}_${newQuantity}`,
          metadata: {
            productName,
            oldQuantity,
            newQuantity,
            customerName: customer?.name || "Customer",
            customerPhone: customer?.phone || "",
            customerEmail: customer?.email || null,
            source
          }
        });

        // Write to Firestore notificationQueue
        if (db && !isFirebasePlaceholder) {
          try {
            await setDoc(doc(db, NOTIFICATION_QUEUE_COLLECTION, jobId), jobPayload, { merge: true });
            console.log(`[NotificationEngine] ✅ Restock job written to Firestore: ${jobId}`);
          } catch (writeErr) {
            console.error(`[NotificationEngine] ❌ Error writing restock job ${jobId} to Firestore:`, writeErr);
          }
        }

        saveLocalJob(jobPayload);
        queuedJobs.push(jobPayload);
      }

      result.stockChange.queuedCount = restockAlerts.length;
    }

    result.totalQueued = queuedJobs.length;
    result.queuedJobs = queuedJobs;

    if (result.totalQueued > 0) {
      result.message = `Notification Engine created ${result.totalQueued} pending notification ${result.totalQueued === 1 ? "job" : "jobs"} in Firestore.`;
    } else {
      result.message = "Product change detected, but no matching active alert subscribers were registered.";
    }

    console.log(`[NotificationEngine] Completed evaluation: ${result.totalQueued} jobs queued.`);
    return result;
  } catch (err: any) {
    console.error("[NotificationEngine] Execution exception:", err);
    result.success = false;
    result.error = err?.message || String(err);
    result.message = "An error occurred while evaluating product notification triggers.";
    return result;
  }
}
