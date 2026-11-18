import { VehicleImportRequest, VehicleImportStatus } from "../types";
import { db, isFirebasePlaceholder, handleFirestoreError, OperationType } from "../lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query
} from "firebase/firestore";
import { getApiUrl } from "../lib/api";

const VEHICLE_IMPORT_STORAGE_KEY = "milito_vehicle_import_requests_v1";
const FIRESTORE_IMPORT_COLLECTION = "vehicle_import_requests";

export const NIGERIAN_DELIVERY_STATES: string[] = [
  "Lagos",
  "Abuja (FCT)",
  "Rivers (Port Harcourt)",
  "Oyo (Ibadan)",
  "Delta (Asaba / Warri)",
  "Edo (Benin City)",
  "Enugu",
  "Anambra (Awka / Onitsha)",
  "Ogun (Abeokuta)",
  "Kano",
  "Kaduna",
  "Akwa Ibom (Uyo)",
  "Cross River (Calabar)",
  "Imo (Owerri)",
  "Abia (Umuahia / Aba)",
  "Ondo (Akure)",
  "Osun (Osogbo)",
  "Kwara (Ilorin)",
  "Ekiti (Ado-Ekiti)",
  "Bayelsa (Yenagoa)",
  "Ebonyi (Abakaliki)",
  "Plateau (Jos)",
  "Benue (Makurdi)",
  "Kogi (Lokoja)",
  "Nasarawa (Lafia)",
  "Niger (Minna)",
  "Bauchi",
  "Borno (Maiduguri)",
  "Adamawa (Yola)",
  "Gombe",
  "Jigawa (Dutse)",
  "Katsina",
  "Kebbi (Birnin Kebbi)",
  "Sokoto",
  "Taraba (Jalingo)",
  "Yobe (Damaturu)",
  "Zamfara (Gusau)"
];

/**
 * Generates a unique customer-facing vehicle order reference number.
 * Format: MIL-CAR-XXXXXX
 */
export function generateVehicleImportReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MIL-CAR-${code}`;
}

export function getLocalVehicleImportRequests(): VehicleImportRequest[] {
  try {
    const raw = localStorage.getItem(VEHICLE_IMPORT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Error reading vehicle import requests from localStorage:", e);
    return [];
  }
}

function saveLocalVehicleImportRequests(list: VehicleImportRequest[]): void {
  try {
    localStorage.setItem(VEHICLE_IMPORT_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("Error saving vehicle import requests to localStorage:", e);
  }
}

/**
 * Saves a Vehicle Order to Firebase Firestore, backend API, and local cache.
 */
export async function saveVehicleImportRequest(
  request: VehicleImportRequest
): Promise<VehicleImportRequest> {
  const normalizedRef = request.referenceNumber.trim().toUpperCase();
  const normalizedRequest: VehicleImportRequest = {
    ...request,
    id: normalizedRef,
    referenceNumber: normalizedRef,
    orderId: normalizedRef,
    status: request.status || "Pending",
    createdAt: request.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // 1. Update local cache immediately
  const existing = getLocalVehicleImportRequests();
  const idx = existing.findIndex(
    (r) =>
      r.id.toUpperCase() === normalizedRef ||
      r.referenceNumber.toUpperCase() === normalizedRef
  );
  const updatedList =
    idx >= 0
      ? existing.map((item, i) => (i === idx ? normalizedRequest : item))
      : [normalizedRequest, ...existing];
  saveLocalVehicleImportRequests(updatedList);

  let savedToFirestore = false;

  // 2. Save directly to Firebase Firestore `vehicle_import_requests` & `orders` collection
  if (!isFirebasePlaceholder && db) {
    try {
      const sanitizedPayload = JSON.parse(
        JSON.stringify(normalizedRequest, (_k, v) => (v === undefined ? null : v))
      );
      const docRef = doc(db, FIRESTORE_IMPORT_COLLECTION, normalizedRef);
      await setDoc(docRef, sanitizedPayload, { merge: true });

      // Synchronize directly into Firestore 'orders' collection
      const vehiclePrice = Number(normalizedRequest.vehiclePrice) || 0;
      const vehicleTitle = `${normalizedRequest.vehicleYear ? normalizedRequest.vehicleYear + " " : ""}${normalizedRequest.vehicleBrand} ${normalizedRequest.vehicleName}`.trim();
      const orderPayload = {
        id: `doc_${normalizedRef.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        orderId: normalizedRef,
        orderSource: "automobile_section",
        orderType: "vehicle",
        productType: "vehicle",
        customer: {
          name: normalizedRequest.customerName,
          email: `${normalizedRef.toLowerCase()}@milito.ng`,
          phone: normalizedRequest.customerPhone,
          address: normalizedRequest.deliveryLocation || normalizedRequest.deliveryCity,
          state: normalizedRequest.deliveryState,
          city: normalizedRequest.deliveryCity,
          notes: normalizedRequest.message || ""
        },
        items: [
          {
            productId: normalizedRequest.vehicleId,
            productName: vehicleTitle,
            productImage: normalizedRequest.vehicleImage || "",
            selectedSpecification: {
              condition: normalizedRequest.vehicleCondition,
              specsSummary: `${normalizedRequest.vehicleYear || ""} ${normalizedRequest.vehicleBrand} • ${normalizedRequest.vehicleTransmission || "Automatic"}`
            },
            quantity: 1,
            unitPrice: vehiclePrice,
            totalPrice: vehiclePrice
          }
        ],
        productId: normalizedRequest.vehicleId,
        productName: vehicleTitle,
        productImage: normalizedRequest.vehicleImage || "",
        selectedSpecification: `${normalizedRequest.vehicleCondition}${normalizedRequest.vehicleTransmission ? ` • ${normalizedRequest.vehicleTransmission}` : ""}`,
        quantity: 1,
        unitPrice: vehiclePrice,
        subtotal: vehiclePrice,
        deliveryFee: 0,
        totalAmount: vehiclePrice,
        totalPurchasePrice: vehiclePrice,
        includesShippingClearing: true,
        depositPercentage: normalizedRequest.depositPercentage || 30,
        requiredDepositAmount: normalizedRequest.requiredDepositAmount || Math.round(vehiclePrice * 0.3),
        remainingBalanceAmount: normalizedRequest.remainingBalanceAmount || (vehiclePrice - Math.round(vehiclePrice * 0.3)),
        depositPaymentStatus: normalizedRequest.depositPaymentStatus || "unpaid",
        balancePaymentStatus: normalizedRequest.balancePaymentStatus || "unpaid",
        paymentStatus: "awaiting_availability",
        orderStatus: "awaiting_availability",
        availabilityStatus: "Pending Confirmation",
        availabilityConfirmed: false,
        vehicleDetails: {
          id: normalizedRequest.vehicleId,
          brand: normalizedRequest.vehicleBrand,
          name: normalizedRequest.vehicleName,
          year: normalizedRequest.vehicleYear,
          condition: normalizedRequest.vehicleCondition,
          transmission: normalizedRequest.vehicleTransmission,
          mileage: normalizedRequest.vehicleMileage,
          fuelType: normalizedRequest.vehicleFuelType,
          engine: normalizedRequest.vehicleEngine,
          location: normalizedRequest.deliveryLocation,
          image: normalizedRequest.vehicleImage
        },
        createdAt: normalizedRequest.createdAt,
        updatedAt: normalizedRequest.updatedAt
      };

      const orderRef = doc(db, "orders", normalizedRef);
      await setDoc(orderRef, orderPayload, { merge: true });

      savedToFirestore = true;
    } catch (fsErr) {
      try {
        handleFirestoreError(
          fsErr,
          OperationType.WRITE,
          `${FIRESTORE_IMPORT_COLLECTION}/${normalizedRef}`
        );
      } catch (loggedErr) {
        console.warn("[Firestore] Vehicle import request write warning:", loggedErr);
      }
    }
  }

  // 3. Also sync with Express backend API (`/api/vehicle-imports`)
  try {
    const res = await fetch(getApiUrl("/api/vehicle-imports"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalizedRequest)
    });
    if (res.ok) {
      savedToFirestore = true;
    }
  } catch (apiErr) {
    console.warn("Backend API sync for vehicle import request skipped:", apiErr);
  }

  return normalizedRequest;
}

/**
 * Fetches all Vehicle Import Quote Requests from Firestore + Backend API + Local Storage.
 */
export async function fetchVehicleImportRequests(): Promise<VehicleImportRequest[]> {
  const mergedMap = new Map<string, VehicleImportRequest>();

  // 1. Load local cache
  getLocalVehicleImportRequests().forEach((r) => {
    if (r && (r.referenceNumber || r.id)) {
      const key = (r.referenceNumber || r.id).toUpperCase();
      mergedMap.set(key, r);
    }
  });

  // 2. Fetch from Backend API
  try {
    const res = await fetch(getApiUrl("/api/vehicle-imports"));
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.requests)) {
        data.requests.forEach((r: VehicleImportRequest) => {
          if (r && (r.referenceNumber || r.id)) {
            const key = (r.referenceNumber || r.id).toUpperCase();
            mergedMap.set(key, r);
          }
        });
      }
    }
  } catch (err) {
    // Non-blocking fallback
  }

  // 3. Fetch from Firestore `vehicle_import_requests`
  if (!isFirebasePlaceholder && db) {
    try {
      const snap = await getDocs(collection(db, FIRESTORE_IMPORT_COLLECTION));
      snap.forEach((docSnap) => {
        const data = docSnap.data() as VehicleImportRequest;
        if (data && (data.referenceNumber || data.id || docSnap.id)) {
          const key = (data.referenceNumber || data.id || docSnap.id).toUpperCase();
          mergedMap.set(key, {
            ...data,
            id: key,
            referenceNumber: data.referenceNumber || key
          });
        }
      });
    } catch (fsErr) {
      try {
        handleFirestoreError(fsErr, OperationType.LIST, FIRESTORE_IMPORT_COLLECTION);
      } catch (_) {}
    }
  }

  const finalList = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
  saveLocalVehicleImportRequests(finalList);
  return finalList;
}

/**
 * Real-time listener for Vehicle Import Quote Requests in Firestore.
 */
export function subscribeToVehicleImportRequests(
  onUpdate: (requests: VehicleImportRequest[]) => void
): () => void {
  // Emit current cached/fetched state immediately
  fetchVehicleImportRequests().then(onUpdate).catch(() => {});

  if (isFirebasePlaceholder || !db) {
    return () => {};
  }

  const q = query(collection(db, FIRESTORE_IMPORT_COLLECTION));
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const mergedMap = new Map<string, VehicleImportRequest>();
      getLocalVehicleImportRequests().forEach((r) => {
        if (r && (r.referenceNumber || r.id)) {
          mergedMap.set((r.referenceNumber || r.id).toUpperCase(), r);
        }
      });

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as VehicleImportRequest;
        if (data) {
          const key = (data.referenceNumber || data.id || docSnap.id).toUpperCase();
          mergedMap.set(key, {
            ...data,
            id: key,
            referenceNumber: data.referenceNumber || key
          });
        }
      });

      const list = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      saveLocalVehicleImportRequests(list);
      onUpdate(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, FIRESTORE_IMPORT_COLLECTION);
      } catch (e) {
        console.warn("[Firestore] Real-time vehicle_import_requests listener notice:", e);
      }
    }
  );

  return unsubscribe;
}

/**
 * Updates the status and optional admin notes of a Vehicle Import Request.
 */
export async function updateVehicleImportStatus(
  idOrRef: string,
  status: VehicleImportStatus,
  adminNotes?: string
): Promise<VehicleImportRequest[]> {
  const targetId = idOrRef.trim().toUpperCase();
  const list = getLocalVehicleImportRequests();
  const now = new Date().toISOString();

  let updatedRecord: VehicleImportRequest | null = null;
  const updatedList = list.map((item) => {
    if (
      item.id.toUpperCase() === targetId ||
      item.referenceNumber.toUpperCase() === targetId
    ) {
      updatedRecord = {
        ...item,
        status,
        adminNotes: adminNotes !== undefined ? adminNotes : item.adminNotes,
        updatedAt: now
      };
      return updatedRecord;
    }
    return item;
  });

  saveLocalVehicleImportRequests(updatedList);

  if (!isFirebasePlaceholder && db) {
    try {
      const docRef = doc(db, FIRESTORE_IMPORT_COLLECTION, targetId);
      const payload: Record<string, any> = {
        status,
        updatedAt: now
      };
      if (adminNotes !== undefined) {
        payload.adminNotes = adminNotes;
      }
      await setDoc(docRef, payload, { merge: true });

      // Synchronize with Firestore 'orders' collection
      const orderDocRef = doc(db, "orders", targetId);
      const isConfirmed = status === "Availability Confirmed";
      const orderPayload: Record<string, any> = {
        updatedAt: now
      };
      if (isConfirmed) {
        orderPayload.availabilityConfirmed = true;
        orderPayload.availabilityStatus = "Confirmed Available";
        orderPayload.availabilityConfirmedAt = now;
        orderPayload.orderStatus = "availability_confirmed";
        orderPayload.paymentStatus = "ready_for_payment";
      } else if (status === "Paid") {
        orderPayload.paymentStatus = "paid";
        orderPayload.orderStatus = "protected";
      }
      if (adminNotes !== undefined) {
        orderPayload.adminNotes = adminNotes;
      }
      await setDoc(orderDocRef, orderPayload, { merge: true });
    } catch (fsErr) {
      try {
        handleFirestoreError(
          fsErr,
          OperationType.UPDATE,
          `${FIRESTORE_IMPORT_COLLECTION}/${targetId}`
        );
      } catch (_) {}
    }
  }

  try {
    await fetch(getApiUrl(`/api/vehicle-imports/${encodeURIComponent(targetId)}/status`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNotes })
    });
  } catch (_) {}

  return updatedList;
}

/**
 * Deletes a Vehicle Import Request from Firestore, backend, and local storage.
 */
export async function deleteVehicleImportRequest(idOrRef: string): Promise<VehicleImportRequest[]> {
  const targetId = idOrRef.trim().toUpperCase();
  const updatedList = getLocalVehicleImportRequests().filter(
    (item) =>
      item.id.toUpperCase() !== targetId &&
      item.referenceNumber.toUpperCase() !== targetId
  );
  saveLocalVehicleImportRequests(updatedList);

  if (!isFirebasePlaceholder && db) {
    try {
      await deleteDoc(doc(db, FIRESTORE_IMPORT_COLLECTION, targetId));
    } catch (_) {}
  }

  try {
    await fetch(getApiUrl(`/api/vehicle-imports/${encodeURIComponent(targetId)}`), {
      method: "DELETE"
    });
  } catch (_) {}

  return updatedList;
}
