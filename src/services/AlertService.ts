import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  updateDoc
} from "firebase/firestore";
import { db, isFirebasePlaceholder, handleFirestoreError, OperationType } from "../lib/firebase";
import { 
  Customer, 
  ProductAlert, 
  ProductAlertType, 
  SubscribeAlertParams, 
  SubscribeAlertResult,
  ProductAlertStats,
  NotificationJob
} from "../types";

const CUSTOMERS_COLLECTION = "customers";
const PRODUCT_ALERTS_COLLECTION = "productAlerts";
const NOTIFICATION_QUEUE_COLLECTION = "notificationQueue";

// Local storage fallback keys for offline / sandboxed demo resilience
const LOCAL_CUSTOMERS_KEY = "milito_customers_cache";
const LOCAL_ALERTS_KEY = "milito_product_alerts_cache";

/**
 * Normalizes phone numbers to standard format (e.g. +2348162017129)
 */
export function normalizePhoneNumber(raw: string): string {
  if (!raw) return "";
  // Strip all whitespace, dashes, dots, brackets
  let cleaned = raw.replace(/[\s\-\(\)\.]/g, "").trim();

  // If starts with 0 and has 11 digits (Nigerian standard, e.g. 08162017129)
  if (/^0\d{10}$/.test(cleaned)) {
    return `+234${cleaned.substring(1)}`;
  }

  // If starts with 234 without +
  if (/^234\d{10}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  // If already starts with +
  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  // If 10 digits without leading 0 (e.g. 8162017129)
  if (/^\d{10}$/.test(cleaned)) {
    return `+234${cleaned}`;
  }

  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
}

/**
 * Validates phone number format
 */
export function validatePhoneNumber(raw: string): { isValid: boolean; normalized: string; error?: string } {
  if (!raw || !raw.trim()) {
    return { isValid: false, normalized: "", error: "WhatsApp phone number is required" };
  }

  const normalized = normalizePhoneNumber(raw);
  // Match digits with leading +: min 10 digits, max 16 digits
  const digitCount = normalized.replace(/\D/g, "").length;
  
  if (digitCount < 10 || digitCount > 15) {
    return { 
      isValid: false, 
      normalized, 
      error: "Please enter a valid phone number (e.g. 08012345678 or +2348012345678)" 
    };
  }

  return { isValid: true, normalized };
}

/**
 * Validates email format (optional field)
 */
export function validateEmail(email?: string): { isValid: boolean; error?: string } {
  if (!email || !email.trim()) {
    return { isValid: true }; // Email is optional
  }
  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid email address (or leave it blank)" };
  }
  return { isValid: true };
}

/**
 * Masks phone number for safe development logging
 */
export function maskPhone(phone: string): string {
  if (!phone) return "";
  if (phone.length <= 6) return "***";
  return phone.slice(0, 4) + "****" + phone.slice(-3);
}

/**
 * Sanitizes object payload so no undefined fields are passed to Firestore setDoc
 */
function sanitizePayload<T extends Record<string, any>>(obj: T): T {
  const cleaned = { ...obj } as any;
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === undefined) {
      cleaned[key] = null;
    }
  });
  return cleaned;
}

// Local cache helpers
function getLocalCustomers(): Customer[] {
  try {
    const raw = localStorage.getItem(LOCAL_CUSTOMERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCustomer(customer: Customer) {
  try {
    const current = getLocalCustomers().filter(c => c.phone !== customer.phone);
    current.push(customer);
    localStorage.setItem(LOCAL_CUSTOMERS_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn("Could not save customer to local storage:", e);
  }
}

function getLocalAlerts(): ProductAlert[] {
  try {
    const raw = localStorage.getItem(LOCAL_ALERTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalAlert(alert: ProductAlert) {
  try {
    const current = getLocalAlerts().filter(a => a.id !== alert.id);
    current.push(alert);
    localStorage.setItem(LOCAL_ALERTS_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn("Could not save alert to local storage:", e);
  }
}

/**
 * Finds an existing customer by normalized phone number or creates a new customer.
 * Prevents creating duplicate customer records.
 */
export async function findOrCreateCustomer(
  name: string,
  rawPhone: string,
  email?: string
): Promise<{ customer: Customer; isNew: boolean }> {
  const phoneValidation = validatePhoneNumber(rawPhone);
  if (!phoneValidation.isValid) {
    throw new Error(phoneValidation.error || "Invalid phone number");
  }

  const normalizedPhone = phoneValidation.normalized;
  const trimmedName = (name || "").trim();
  const trimmedEmail = email && email.trim() ? email.trim() : null;
  const now = new Date().toISOString();

  console.log(`[Notify Me] 2. Customer lookup started for phone: ${maskPhone(normalizedPhone)}`);

  // 1. Try Firestore lookup & write
  if (db && !isFirebasePlaceholder) {
    try {
      const customersRef = collection(db, CUSTOMERS_COLLECTION);
      const q = query(customersRef, where("phone", "==", normalizedPhone));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        // Reuse existing customer
        const docSnap = querySnap.docs[0];
        const existingData = docSnap.data() as Customer;
        const customerId = docSnap.id;

        const updatedCustomer: Customer = sanitizePayload({
          ...existingData,
          id: customerId,
          name: trimmedName || existingData.name || "Customer",
          email: trimmedEmail !== null ? trimmedEmail : (existingData.email || null),
          phone: normalizedPhone,
          updatedAt: now
        });

        // Update customer profile with latest name / email and timestamp in Firestore
        await setDoc(doc(db, CUSTOMERS_COLLECTION, customerId), updatedCustomer, { merge: true });
        saveLocalCustomer(updatedCustomer);

        console.log(`[Notify Me] 3. Existing customer found with ID: ${customerId}`);
        return { customer: updatedCustomer, isNew: false };
      } else {
        // Create new customer document in Firestore
        const newCustomerRef = doc(collection(db, CUSTOMERS_COLLECTION));
        const newCustomer: Customer = sanitizePayload({
          id: newCustomerRef.id,
          name: trimmedName || "Customer",
          phone: normalizedPhone,
          email: trimmedEmail,
          createdAt: now,
          updatedAt: now
        });

        await setDoc(newCustomerRef, newCustomer);
        saveLocalCustomer(newCustomer);

        console.log(`[Notify Me] 3. Customer created with ID: ${newCustomer.id}`);
        return { customer: newCustomer, isNew: true };
      }
    } catch (error: any) {
      console.error("[Notify Me] ❌ Firestore customer lookup/write error:", error?.message || error);
    }
  }

  // 2. Resilient local fallback if Firestore was unreachable
  console.warn("[Notify Me] Using local storage fallback for customer record.");
  const localCustomers = getLocalCustomers();
  const existingLocal = localCustomers.find(c => c.phone === normalizedPhone);

  if (existingLocal) {
    const updated: Customer = {
      ...existingLocal,
      name: trimmedName || existingLocal.name,
      email: trimmedEmail !== null ? trimmedEmail : existingLocal.email,
      updatedAt: now
    };
    saveLocalCustomer(updated);
    console.log(`[Notify Me] 3. Local existing customer found with ID: ${updated.id}`);
    return { customer: updated, isNew: false };
  }

  const fallbackId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const newCustomer: Customer = {
    id: fallbackId,
    name: trimmedName || "Customer",
    phone: normalizedPhone,
    email: trimmedEmail,
    createdAt: now,
    updatedAt: now
  };
  saveLocalCustomer(newCustomer);
  console.log(`[Notify Me] 3. Local customer created with ID: ${newCustomer.id}`);
  return { customer: newCustomer, isNew: true };
}

/**
 * Subscribes a customer to a product alert (RESTOCK or PRICE_CHANGE).
 * STRICT DUPLICATE PREVENTION:
 * Checks if the customer already has an active alert for the same product and alert type.
 * If yes, returns isExisting: true without creating duplicates.
 */
export async function subscribeProductAlert(
  params: SubscribeAlertParams
): Promise<SubscribeAlertResult> {
  const { productId, productName, customerName, phone, email, alertType } = params;

  console.log("[Notify Me] 1. Notify Me submission started", {
    productName,
    productId,
    alertType,
    customerName,
    phone: maskPhone(phone)
  });

  // Basic validation
  if (!customerName || !customerName.trim()) {
    return { success: false, isExisting: false, message: "Please enter your name.", error: "Name is required" };
  }

  const phoneCheck = validatePhoneNumber(phone);
  if (!phoneCheck.isValid) {
    return { success: false, isExisting: false, message: phoneCheck.error || "Invalid phone number", error: phoneCheck.error };
  }

  const emailCheck = validateEmail(email);
  if (!emailCheck.isValid) {
    return { success: false, isExisting: false, message: emailCheck.error || "Invalid email", error: emailCheck.error };
  }

  if (!productId) {
    return { success: false, isExisting: false, message: "Product reference is missing", error: "Missing product ID" };
  }

  const now = new Date().toISOString();

  try {
    // 1. Get or create the unique customer record
    const { customer } = await findOrCreateCustomer(customerName, phone, email);

    // 2. Check for duplicate active alert and write to Firestore
    if (db && !isFirebasePlaceholder) {
      try {
        console.log(`[Notify Me] 4. Product alert write started for customer ID: ${customer.id}`);
        const alertsRef = collection(db, PRODUCT_ALERTS_COLLECTION);
        const q = query(
          alertsRef,
          where("customerId", "==", customer.id)
        );

        const existingSnap = await getDocs(q);
        const matchingDoc = existingSnap.docs.find(d => {
          const data = d.data() as ProductAlert;
          return String(data.productId) === String(productId) &&
                 data.alertType === alertType &&
                 data.active !== false;
        });

        if (matchingDoc) {
          // DUPLICATE DETECTED: Customer already on the list for this product & alert type
          const existingAlert = matchingDoc.data() as ProductAlert;
          console.log(`[Notify Me] 5. Duplicate alert detected. Customer already subscribed with alert ID: ${matchingDoc.id}`);
          return {
            success: true,
            isExisting: true,
            message: "You're already on the list ✓",
            alertId: matchingDoc.id || existingAlert.id,
            customerId: customer.id
          };
        }

        // CREATE NEW PRODUCT ALERT IN FIRESTORE
        const newAlertRef = doc(collection(db, PRODUCT_ALERTS_COLLECTION));
        const newAlert: ProductAlert = sanitizePayload({
          id: newAlertRef.id,
          customerId: customer.id,
          productId: String(productId),
          productName: productName || "Verified MILITO Device",
          alertType: alertType || "RESTOCK",
          active: true,
          createdAt: now,
          updatedAt: now
        });

        await setDoc(newAlertRef, newAlert);
        saveLocalAlert(newAlert);

        console.log(`[Notify Me] 5. Product alert write succeeded! Alert ID: ${newAlert.id}, written to Firestore collection 'productAlerts'`);

        return {
          success: true,
          isExisting: false,
          message: "You're on the list 🔔",
          alertId: newAlert.id,
          customerId: customer.id
        };
      } catch (firestoreErr: any) {
        console.error("[Notify Me] ❌ Firestore alert write error:", firestoreErr?.message || firestoreErr);
      }
    }

    // 3. Fallback Local storage duplicate check if Firestore was unavailable
    console.warn("[Notify Me] Using local storage fallback for product alert.");
    const localAlerts = getLocalAlerts();
    const existingLocalAlert = localAlerts.find(
      a => a.customerId === customer.id && 
           String(a.productId) === String(productId) && 
           a.alertType === alertType && 
           a.active === true
    );

    if (existingLocalAlert) {
      console.log(`[Notify Me] 5. Local duplicate alert found. ID: ${existingLocalAlert.id}`);
      return {
        success: true,
        isExisting: true,
        message: "You're already on the list ✓",
        alertId: existingLocalAlert.id,
        customerId: customer.id
      };
    }

    const fallbackAlertId = `alert_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const newLocalAlert: ProductAlert = {
      id: fallbackAlertId,
      customerId: customer.id,
      productId: String(productId),
      productName: productName || "Verified MILITO Device",
      alertType: alertType || "RESTOCK",
      active: true,
      createdAt: now,
      updatedAt: now
    };

    saveLocalAlert(newLocalAlert);
    console.log(`[Notify Me] 5. Local product alert write saved. ID: ${fallbackAlertId}`);

    return {
      success: true,
      isExisting: false,
      message: "You're on the list 🔔",
      alertId: fallbackAlertId,
      customerId: customer.id
    };

  } catch (error: any) {
    console.error("[Notify Me] ❌ Alert subscription exception:", error);
    return {
      success: false,
      isExisting: false,
      message: "Unable to complete subscription at this moment. Please try again.",
      error: error?.message || String(error)
    };
  }
}

/**
 * Aggregates product alert statistics for Admin Dashboard.
 * Returns grouped list by product and alert type with subscriber count.
 */
export async function getProductAlertStats(): Promise<ProductAlertStats[]> {
  let alerts: ProductAlert[] = [];
  let customers: Customer[] = [];

  if (db && !isFirebasePlaceholder) {
    try {
      const [alertsSnap, customersSnap] = await Promise.all([
        getDocs(collection(db, PRODUCT_ALERTS_COLLECTION)),
        getDocs(collection(db, CUSTOMERS_COLLECTION))
      ]);

      alerts = alertsSnap.docs.map(d => ({ id: d.id, ...d.data() } as ProductAlert));
      customers = customersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Customer));
    } catch (e) {
      console.warn("Could not fetch alerts from Firestore, reading local cache:", e);
      alerts = getLocalAlerts();
      customers = getLocalCustomers();
    }
  } else {
    alerts = getLocalAlerts();
    customers = getLocalCustomers();
  }

  const customerMap = new Map<string, Customer>();
  customers.forEach(c => customerMap.set(c.id, c));

  // Filter only active alerts
  const activeAlerts = alerts.filter(a => a.active !== false);

  // Group by productId + alertType
  const grouped = new Map<string, ProductAlertStats>();

  for (const alert of activeAlerts) {
    const key = `${alert.productId}_${alert.alertType}`;
    const cust = customerMap.get(alert.customerId);

    if (!grouped.has(key)) {
      grouped.set(key, {
        productId: alert.productId,
        productName: alert.productName,
        alertType: alert.alertType,
        count: 0,
        subscribers: []
      });
    }

    const stat = grouped.get(key)!;
    stat.count += 1;
    if (cust) {
      stat.subscribers.push({
        customerName: cust.name,
        phone: cust.phone,
        email: cust.email,
        createdAt: alert.createdAt
      });
    } else {
      stat.subscribers.push({
        customerName: "Subscriber",
        phone: "Verified Customer",
        email: null,
        createdAt: alert.createdAt
      });
    }
  }

  // Sort by count descending
  return Array.from(grouped.values()).sort((a, b) => b.count - a.count);
}

// Re-export NotificationEngine methods for streamlined consumption
export {
  processProductChange,
  getNotificationQueue,
  formatNairaAmount,
  isStockOutOfStock
} from "./NotificationEngine";

