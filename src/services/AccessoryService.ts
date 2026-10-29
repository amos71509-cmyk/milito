import { ProductAccessory } from "../types";

const LOCAL_STORAGE_KEY = "milito_global_accessories";

export const DEFAULT_ACCESSORIES: ProductAccessory[] = [
  {
    id: "acc_charger_apple_20w",
    name: "Apple 20W USB-C Power Adapter",
    type: "Charger",
    price: 18500,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80",
    inStock: true
  },
  {
    id: "acc_charger_samsung_45w",
    name: "Samsung 45W Super Fast Power Adapter",
    type: "Charger",
    price: 24000,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80",
    inStock: true
  },
  {
    id: "acc_airpods_pro_2",
    name: "Apple AirPods Pro 2 with MagSafe Case",
    type: "AirPods/Earpods",
    price: 245000,
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=400&q=80",
    inStock: true
  },
  {
    id: "acc_earpods_type_c",
    name: "Original USB-C Stereo EarPods with Mic",
    type: "AirPods/Earpods",
    price: 12000,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
    inStock: true
  },
  {
    id: "acc_power_bank_20k",
    name: "Oraimo 20,000mAh PD Fast Charge Power Bank",
    type: "Power Bank",
    price: 28000,
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=400&q=80",
    inStock: true
  },
  {
    id: "acc_screen_guard_9d",
    name: "9D Full Cover Armor Tempered Glass Screen Guard",
    type: "Screen Guard",
    price: 3500,
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=400&q=80",
    inStock: true
  },
  {
    id: "acc_camera_guard_sapphire",
    name: "Sapphire Crystal Individual Camera Lens Guard",
    type: "Camera Guard",
    price: 3000,
    image: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=400&q=80",
    inStock: true
  },
  {
    id: "acc_pouch_clear_magsafe",
    name: "Shockproof Clear MagSafe Protective Silicone Case",
    type: "Pouch/Case",
    price: 6500,
    image: "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=400&q=80",
    inStock: true
  },
  {
    id: "acc_headset_wireless_anc",
    name: "Over-Ear Wireless Noise-Cancelling Bluetooth Headset",
    type: "Headset",
    price: 42000,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=80",
    inStock: true
  }
];

type Listener = (accessories: ProductAccessory[]) => void;
const listeners: Set<Listener> = new Set();

function notifyListeners(items: ProductAccessory[]) {
  listeners.forEach((listener) => {
    try {
      listener(items);
    } catch (e) {
      console.error("[AccessoryService] Listener error:", e);
    }
  });
}

export const AccessoryService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getStoredLocal(): ProductAccessory[] {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("[AccessoryService] Local read failed:", e);
    }
    return DEFAULT_ACCESSORIES;
  },

  setStoredLocal(items: ProductAccessory[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("[AccessoryService] Local write failed:", e);
    }
    notifyListeners(items);
  },

  async fetchAll(): Promise<ProductAccessory[]> {
    try {
      const res = await fetch("/api/accessories");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.accessories) && data.accessories.length > 0) {
          this.setStoredLocal(data.accessories);
          return data.accessories;
        }
      }
    } catch (err) {
      console.warn("[AccessoryService] API fetch failed, using fallback:", err);
    }
    return this.getStoredLocal();
  },

  async saveAccessory(accessory: ProductAccessory): Promise<ProductAccessory[]> {
    try {
      const res = await fetch("/api/accessories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accessory)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.accessories)) {
          this.setStoredLocal(data.accessories);
          return data.accessories;
        }
      }
    } catch (err) {
      console.warn("[AccessoryService] API save failed, saving locally:", err);
    }

    // Local fallback
    const current = this.getStoredLocal();
    const index = current.findIndex((a) => a.id === accessory.id);
    let updated: ProductAccessory[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = accessory;
    } else {
      updated = [accessory, ...current];
    }
    this.setStoredLocal(updated);
    return updated;
  },

  async deleteAccessory(id: string): Promise<ProductAccessory[]> {
    try {
      const res = await fetch(`/api/accessories/${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.accessories)) {
          this.setStoredLocal(data.accessories);
          return data.accessories;
        }
      }
    } catch (err) {
      console.warn("[AccessoryService] API delete failed, deleting locally:", err);
    }

    const current = this.getStoredLocal();
    const updated = current.filter((a) => a.id !== id);
    this.setStoredLocal(updated);
    return updated;
  }
};
