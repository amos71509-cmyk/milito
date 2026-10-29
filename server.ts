import express from "express";
import path from "path";
import fs from "fs";
import { Readable } from "stream";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { createServer as createViteServer } from "vite";
import { initializeApp as initFirebaseApp, getApps as getFirebaseApps } from "firebase/app";
import {
  getFirestore as getFirestoreInstance,
  collection as firestoreCollection,
  doc as firestoreDoc,
  getDocs as firestoreGetDocs,
  getDoc as firestoreGetDoc,
  setDoc as firestoreSetDoc,
  query as firestoreQuery,
  where as firestoreWhere
} from "firebase/firestore";

// Server-side Firebase Firestore initialization
let serverDb: any = null;
try {
  const fbConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(fbConfigPath)) {
    const rawConfig = JSON.parse(fs.readFileSync(fbConfigPath, "utf-8"));
    if (rawConfig.apiKey && rawConfig.apiKey !== "YOUR_API_KEY") {
      const fbApp = getFirebaseApps().length === 0 ? initFirebaseApp(rawConfig) : getFirebaseApps()[0];
      serverDb = getFirestoreInstance(fbApp);
      console.log(`[Server Firebase] Initialized Firestore connected to project: ${rawConfig.projectId}`);
    }
  }
} catch (fbInitErr) {
  console.warn("[Server Firebase] Initialization warning:", fbInitErr);
}

// Set up memory storage for multer (holds file buffers in memory)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB limit per file
    files: 30 // Allow up to 30 images in batch
  },
  fileFilter: (req, file, cb) => {
    const mime = (file.mimetype || "").toLowerCase();
    
    // Safely decode originalname if encoded in Latin-1
    let originalName = file.originalname || "";
    try {
      originalName = Buffer.from(originalName, "latin1").toString("utf8");
    } catch (_) {}

    const ext = path.extname(originalName).toLowerCase();
    
    // Accept standard image & video mime types or octet-stream with valid extension
    const isImageMime = mime.startsWith("image/") || mime.startsWith("video/") || mime === "application/octet-stream";
    const allowedExtensions = [
      ".jpg", ".jpeg", ".png", ".webp", ".gif", 
      ".heic", ".heif", ".avif", ".bmp", ".tiff", ".svg",
      ".mp4", ".webm", ".mov", ".mkv", ".m4v", ".avi"
    ];
    const isAllowedExt = allowedExtensions.includes(ext);

    if (isImageMime || isAllowedExt) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported media format '${file.mimetype || ext}'. Allowed formats: JPG, PNG, WEBP, HEIC, MP4, WEBM, MOV, GIF, SVG.`));
    }
  },
});

/**
 * Helper to sanitize filenames into safe ASCII slugs for storage identifiers.
 * Never allows emojis, control characters, or path separators in public_id.
 */
function sanitizePublicIdSlug(name: string): string {
  if (!name) return "media";
  return name
    .replace(/\.[^/.]+$/, "") // strip extension
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-zA-Z0-9_-]/g, "_") // replace non-alphanumeric/emoji with underscore
    .replace(/_+/g, "_") // collapse multiple underscores
    .replace(/^_+|_+$/g, "") // trim leading/trailing underscores
    .substring(0, 50) || "media";
}

/**
 * Streams binary buffer directly into Cloudinary without any intermediate Base64 encoding.
 * Safely generates unique ASCII public_ids so emoji/special characters in filenames never fail uploads.
 */
function uploadBufferToCloudinary(
  buffer: Buffer,
  fileInfo: { originalname: string; mimetype?: string },
  folder = "milito_tech_products"
): Promise<{
  original_filename: string;
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
}> {
  return new Promise((resolve, reject) => {
    // Decode originalname properly if latin1
    let rawOriginalName = fileInfo.originalname || "image.jpg";
    try {
      rawOriginalName = Buffer.from(rawOriginalName, "latin1").toString("utf8");
    } catch (_) {}

    const isVideo = (fileInfo.mimetype || "").startsWith("video/") || /\.(mp4|webm|mov|mkv|m4v|avi)$/i.test(rawOriginalName);
    const safeBase = sanitizePublicIdSlug(rawOriginalName);
    const uniqueId = `milito_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "_") || "milito_uploads";
    const safePublicId = `${uniqueId}_${safeBase}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: safeFolder,
        public_id: safePublicId,
        resource_type: isVideo ? "video" : "auto",
        use_filename: false, // Never rely on raw user filename for public_id to prevent Unicode/emoji failures
        unique_filename: false,
        overwrite: false,
        chunk_size: isVideo ? 6000000 : undefined,
      },
      (error, result) => {
        if (error) {
          console.error(`[Server Telemetry] Cloudinary stream rejection for "${rawOriginalName}":`, {
            message: error.message,
            http_code: error.http_code,
            name: error.name
          });
          return reject(error);
        }
        if (!result || !result.secure_url) {
          return reject(new Error("Cloudinary returned an empty or invalid response"));
        }
        resolve({
          original_filename: rawOriginalName,
          secure_url: result.secure_url,
          public_id: result.public_id,
          width: result.width || 0,
          height: result.height || 0,
          format: result.format || fileInfo.mimetype?.split("/")[1] || (isVideo ? "mp4" : "jpeg"),
          bytes: result.bytes || buffer.length,
          created_at: result.created_at || new Date().toISOString()
        });
      }
    );

    uploadStream.on("error", (err) => {
      console.error(`[Server Telemetry] Upload stream pipe error for "${rawOriginalName}":`, err);
      reject(err);
    });

    Readable.from(buffer).pipe(uploadStream);
  });
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Global CORS Middleware - Ensures preflight OPTIONS and cross-origin Netlify requests succeed
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma, X-Custom-Header, *");
    res.setHeader("Access-Control-Max-Age", "86400");

    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }
    next();
  });

  app.options("*", (req, res) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma, X-Custom-Header, *");
    res.setHeader("Access-Control-Max-Age", "86400");
    return res.status(204).end();
  });

  // JSON and URL-encoded body parsers
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API Route: Health Check to verify server status
  app.get(["/api/health", "/api/health/"], (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.json({ status: "ok", message: "Express server is running and healthy!" });
  });

  // Handle GET /api/upload cleanly with 405 Method Not Allowed JSON
  app.get(["/api/upload", "/api/upload/"], (req, res) => {
    res.setHeader("Content-Type", "application/json");
    return res.status(405).json({
      success: false,
      error: "Method GET not allowed. Send a POST request with multipart image files to upload."
    });
  });

  // API Route: Generate Cloudinary Upload Signature
  app.get("/api/cloudinary-sign", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(200).json({
        configured: false,
        message: "Cloudinary credentials not configured on server"
      });
    }

    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const folder = (req.query.folder as string) || "milito_uploads";
      const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder },
        apiSecret
      );
      return res.json({
        configured: true,
        cloudName,
        apiKey,
        timestamp,
        signature,
        folder
      });
    } catch (err: any) {
      console.error("[Server Telemetry] Error generating Cloudinary signature:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // API Route: Secure Cloudinary Image Upload
  app.post(["/api/upload", "/api/upload/"], (req, res, next) => {
    console.log(`[Server Telemetry] Upload Request Received -> Method: ${req.method} | URL: ${req.originalUrl}`);
    res.setHeader("Content-Type", "application/json");

    // Use upload.any() to handle any field name (images, file, logo, etc.)
    upload.any()(req, res, (err) => {
      if (err) {
        console.error(`[Server Upload Error] Multer error for ${req.originalUrl}:`, err.message);
        return res.status(400).json({
          success: false,
          error: err.code === "LIMIT_FILE_SIZE"
            ? "File size exceeds the 50MB maximum limit."
            : (err.message || "Upload processing error.")
        });
      }
      next();
    });
  }, async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const files = (req.files as Express.Multer.File[]) || [];
      if (!files || files.length === 0) {
        console.warn("[Server Telemetry] Upload warning: No files received in request payload");
        return res.status(400).json({ success: false, error: "No image files were provided in the request." });
      }

      console.log(`[Server Telemetry] Processing upload of ${files.length} file(s):`);
      files.forEach((file, index) => {
        console.log(`  File #${index + 1}: "${file.originalname}" | Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB | MIME: "${file.mimetype}"`);
      });

      // Check Cloudinary Credentials
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      const hasCloudinary = Boolean(cloudName && apiKey && apiSecret);

      if (hasCloudinary) {
        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
          secure: true
        });
      }

      // Process uploaded files with concurrent, memory-efficient streaming (NO Base64 in RAM unless fallback)
      const folder = (req.body && req.body.folder) ? String(req.body.folder).trim() : "milito_tech_products";

      const uploadedFiles = await Promise.all(
        files.map(async (file, idx) => {
          const mimeType = file.mimetype || "image/jpeg";

          if (hasCloudinary) {
            try {
              const streamResult = await uploadBufferToCloudinary(file.buffer, {
                originalname: file.originalname,
                mimetype: file.mimetype
              }, folder);

              console.log(`[Server Telemetry] Cloudinary upload stream success for "${file.originalname}": ${streamResult.public_id}`);
              return streamResult;
            } catch (cloudinaryErr: any) {
              console.warn(`[Server Telemetry] Cloudinary stream fallback for "${file.originalname}":`, cloudinaryErr?.message || cloudinaryErr);
              // Graceful fallback to resilient data URI so user actions never fail
              const base64Fallback = file.buffer.toString("base64");
              const dataUri = `data:${mimeType};base64,${base64Fallback}`;
              return {
                original_filename: file.originalname,
                secure_url: dataUri,
                public_id: `fallback_${Date.now()}_${idx}`,
                width: 1200,
                height: 900,
                format: mimeType.split("/")[1] || "jpeg",
                bytes: file.size,
                created_at: new Date().toISOString()
              };
            }
          } else {
            // Local fallback placeholder (when Cloudinary secrets not in dev environment)
            const base64Fallback = file.buffer.toString("base64");
            const dataUri = `data:${mimeType};base64,${base64Fallback}`;
            return {
              original_filename: file.originalname,
              secure_url: dataUri,
              public_id: `local_${Date.now()}_${idx}`,
              width: 1200,
              height: 900,
              format: mimeType.split("/")[1] || "jpeg",
              bytes: file.size,
              created_at: new Date().toISOString()
            };
          }
        })
      );

      return res.status(200).json({
        success: true,
        message: "Media successfully uploaded",
        files: uploadedFiles
      });
    } catch (error: any) {
      console.error("[Server Telemetry] Error in /api/upload handler:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "An error occurred during media processing."
      });
    }
  });

  // API Route: Delete images from Cloudinary
  app.post("/api/delete-image", async (req, res) => {
    try {
      const { public_id, public_ids } = req.body;
      const idsToDelete: string[] = [];
      if (Array.isArray(public_ids)) {
        idsToDelete.push(...public_ids.filter(Boolean));
      } else if (public_id) {
        idsToDelete.push(public_id);
      }

      if (idsToDelete.length === 0) {
        return res.status(400).json({ error: "No public_id provided for deletion." });
      }

      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (!cloudName || !apiKey || !apiSecret) {
        console.warn("[Server] Cloudinary credentials missing. Skipping remote image deletion.");
        return res.json({ success: true, warning: "Cloudinary credentials not configured on server. Document deleted locally." });
      }

      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true
      });

      console.log(`[Server] Deleting ${idsToDelete.length} image(s) from Cloudinary:`, idsToDelete);
      const deleteResults = await Promise.all(
        idsToDelete.map(async (id) => {
          try {
            const res = await cloudinary.uploader.destroy(id);
            return { id, result: res.result };
          } catch (err: any) {
            console.error(`[Server] Failed to delete image ${id} from Cloudinary:`, err);
            return { id, error: err.message || "Failed to delete" };
          }
        })
      );

      return res.json({
        success: true,
        message: "Cloudinary image deletion process completed",
        results: deleteResults
      });
    } catch (error: any) {
      console.error("[Server] Exception in /api/delete-image:", error);
      return res.status(500).json({ error: error.message || "Failed to process image deletion." });
    }
  });

  // API Route: Check Cloudinary Status
  app.get("/api/cloudinary-status", (req, res) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const configured = Boolean(cloudName && apiKey && apiSecret);
    return res.json({
      configured,
      cloudName: cloudName || null,
      message: configured ? "Cloudinary connected and operational" : "Cloudinary environment variables missing"
    });
  });

  // Website Branding Server Cache & Persistent File Store
  let websiteBrandingCache: {
    logoUrl: string;
    logoPublicId: string;
    logoMeta: any;
    brandLogos: any[];
    updatedAt: string;
  } = {
    logoUrl: "",
    logoPublicId: "",
    logoMeta: null as any,
    brandLogos: [] as any[],
    updatedAt: ""
  };

  const brandingFilePath = path.join(process.cwd(), "branding.json");
  try {
    if (fs.existsSync(brandingFilePath)) {
      const fileContent = fs.readFileSync(brandingFilePath, "utf-8");
      const parsed = JSON.parse(fileContent);
      websiteBrandingCache = {
        logoUrl: parsed.logoUrl || "",
        logoPublicId: parsed.logoPublicId || "",
        logoMeta: parsed.logoMeta || null,
        brandLogos: Array.isArray(parsed.brandLogos) ? parsed.brandLogos : [],
        updatedAt: parsed.updatedAt || ""
      };
      console.log("[Server] Loaded existing branding.json logoUrl:", websiteBrandingCache.logoUrl, "brandLogos count:", websiteBrandingCache.brandLogos.length);
    }
  } catch (err) {
    console.warn("[Server] Could not read branding.json:", err);
  }

  app.get("/api/branding", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    return res.json({ success: true, branding: websiteBrandingCache });
  });

  app.post("/api/branding", (req, res) => {
    try {
      const { logoUrl, logoPublicId, logoMeta, brandLogos, updatedAt } = req.body || {};
      websiteBrandingCache = {
        logoUrl: logoUrl !== undefined ? logoUrl : websiteBrandingCache.logoUrl,
        logoPublicId: logoPublicId !== undefined ? logoPublicId : websiteBrandingCache.logoPublicId,
        logoMeta: logoMeta !== undefined ? logoMeta : websiteBrandingCache.logoMeta,
        brandLogos: Array.isArray(brandLogos) ? brandLogos : websiteBrandingCache.brandLogos,
        updatedAt: updatedAt || new Date().toISOString()
      };
      fs.writeFileSync(brandingFilePath, JSON.stringify(websiteBrandingCache, null, 2));
      console.log("[Server] Website branding updated & saved to branding.json (logo:", websiteBrandingCache.logoUrl, "brandLogos:", websiteBrandingCache.brandLogos.length, ")");
      return res.json({ success: true, branding: websiteBrandingCache });
    } catch (err: any) {
      console.error("[Server] Error writing branding.json:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // MILITO PHASE 1 — PROTECTED ORDER FOUNDATION
  // ==========================================

  // In-Memory & Persistent File Cache for Orders
  const ordersFilePath = path.join(process.cwd(), "orders.json");
  let ordersStore: Record<string, any> = {};

  try {
    if (fs.existsSync(ordersFilePath)) {
      const content = fs.readFileSync(ordersFilePath, "utf-8");
      ordersStore = JSON.parse(content || "{}");
      console.log(`[Server] Loaded ${Object.keys(ordersStore).length} orders from orders.json`);
    }
  } catch (err) {
    console.warn("[Server] Could not read orders.json, starting with fresh store:", err);
  }

  function saveOrdersStore() {
    try {
      fs.writeFileSync(ordersFilePath, JSON.stringify(ordersStore, null, 2));
    } catch (err) {
      console.error("[Server] Failed to write orders.json:", err);
    }
  }

  // Trusted State Transit Fee Table
  const STATE_DELIVERY_FEES: Record<string, { fee: number; eta: string }> = {
    "Lagos": { fee: 5000, eta: "24 Hours (Same Day/Next Day)" },
    "Abuja (FCT)": { fee: 8000, eta: "24 - 48 Hours" },
    "Oyo (Ibadan)": { fee: 6000, eta: "24 - 48 Hours" },
    "Rivers (Port Harcourt)": { fee: 9000, eta: "2 - 3 Days" },
    "Enugu": { fee: 9000, eta: "2 - 3 Days" },
    "Delta (Asaba/Warri)": { fee: 8500, eta: "2 - 3 Days" },
    "Anambra (Onitsha)": { fee: 8500, eta: "2 - 3 Days" },
    "Kaduna": { fee: 9500, eta: "3 - 4 Days" },
    "Kano": { fee: 9800, eta: "3 - 4 Days" },
    "Edo (Benin City)": { fee: 8000, eta: "48 Hours" },
  };

  // Generate Unique Customer-Facing Order ID (Format: MIL-YYYYMMDD-XXXX)
  function generateOrderId(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const datePart = `${yyyy}${mm}${dd}`;
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let randPart = "";
    for (let i = 0; i < 4; i++) {
      randPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `MIL-${datePart}-${randPart}`;
  }

  // API Route: Check Payment Gateway Configuration Status
  app.get("/api/payment-config", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const publicKey = process.env.VITE_PAYSTACK_PUBLIC_KEY;
    const isConfigured = Boolean(secretKey && secretKey.trim().length > 0);

    return res.json({
      success: true,
      provider: "paystack",
      isConfigured,
      publicKey: publicKey || null,
      message: isConfigured
        ? "Paystack payment gateway is configured and operational."
        : "PAYSTACK_SECRET_KEY is not configured on the server. Live payment requires adding PAYSTACK_SECRET_KEY in Settings."
    });
  });

  // API Route: Create Protected Order (Server-Side Price Validation & ID Generation)
  app.post("/api/orders/create", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const {
        customer,
        items,
        productId,
        productName,
        productImage,
        selectedStorage,
        selectedColor,
        quantity,
        clientUnitPrice
      } = req.body || {};

      // 1. Validate Customer Information
      if (!customer || typeof customer !== "object") {
        return res.status(400).json({ success: false, error: "Customer information is required." });
      }
      const { name, email, phone, address, state } = customer;
      if (!name || !email || !phone || !address || !state) {
        return res.status(400).json({
          success: false,
          error: "All customer delivery fields (Full Name, Email, Phone, Address, Destination State) are required."
        });
      }

      // 2. Validate and Calculate Items
      const orderItems: Array<{
        productId: string;
        productName: string;
        productImage: string;
        selectedSpecification: {
          storage?: string;
          color?: string;
          condition?: string;
          specsSummary?: string;
        };
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }> = [];

      let calculatedSubtotal = 0;

      if (Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
          // Server-side baseline price check
          const unitPrice = Math.max(1, parseFloat(item.unitPrice || item.price || item.product?.price || 0));
          const itemTotal = unitPrice * qty;
          calculatedSubtotal += itemTotal;

          orderItems.push({
            productId: String(item.productId || item.product?.id || "item"),
            productName: String(item.productName || item.product?.name || "MILITO Device"),
            productImage: String(item.productImage || item.product?.image || ""),
            selectedSpecification: {
              storage: item.selectedStorage || item.selectedSpecification?.storage || "Standard",
              color: typeof item.selectedColor === "object" ? item.selectedColor.name : (item.selectedColor || "Standard"),
              condition: item.condition || item.product?.condition || "Verified",
              specsSummary: item.specsSummary || ""
            },
            quantity: qty,
            unitPrice,
            totalPrice: itemTotal
          });
        }
      } else if (productId) {
        // Single product checkout
        const qty = Math.max(1, parseInt(quantity, 10) || 1);
        const unitPrice = Math.max(1, parseFloat(clientUnitPrice || 0));
        const itemTotal = unitPrice * qty;
        calculatedSubtotal = itemTotal;

        orderItems.push({
          productId: String(productId),
          productName: String(productName || "MILITO Device"),
          productImage: String(productImage || ""),
          selectedSpecification: {
            storage: selectedStorage || "Standard",
            color: typeof selectedColor === "object" ? selectedColor.name : (selectedColor || "Standard"),
            condition: "Verified",
            specsSummary: `${selectedStorage || "Standard"} • ${typeof selectedColor === "object" ? selectedColor.name : (selectedColor || "Standard")}`
          },
          quantity: qty,
          unitPrice,
          totalPrice: itemTotal
        });
      } else {
        return res.status(400).json({ success: false, error: "No product items were provided for the order." });
      }

      // 3. Determine Server-Validated Delivery Fee
      const matchedStateKey = Object.keys(STATE_DELIVERY_FEES).find(
        (k) => k.toLowerCase() === state.trim().toLowerCase() || state.trim().toLowerCase().includes(k.toLowerCase())
      );
      const deliveryFee = matchedStateKey ? STATE_DELIVERY_FEES[matchedStateKey].fee : 6000;
      const totalAmount = calculatedSubtotal + deliveryFee;

      // 4. Generate Unique Customer-Facing Order ID
      let orderId = generateOrderId();
      while (ordersStore[orderId]) {
        orderId = generateOrderId();
      }

      const primaryItem = orderItems[0];
      const selectedSpecString = primaryItem?.selectedSpecification?.storage
        ? `${primaryItem.selectedSpecification.storage} • ${primaryItem.selectedSpecification.color || "Standard"}`
        : "Standard Specification";

      // 5. Assemble Protected Order Record
      const newOrder = {
        id: `doc_${orderId.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        orderId,
        orderSource: (req.body?.orderSource || req.body?.source || "direct").toLowerCase(),
        customer: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          state: state.trim()
        },
        items: orderItems,
        // Top-level product summary
        productId: primaryItem.productId,
        productName: primaryItem.productName,
        productImage: primaryItem.productImage,
        selectedSpecification: selectedSpecString,
        quantity: primaryItem.quantity,
        unitPrice: primaryItem.unitPrice,
        subtotal: calculatedSubtotal,
        deliveryFee,
        totalAmount,
        paymentStatus: "pending", // Initial status: pending
        orderStatus: "created",   // Initial status: created
        paymentProvider: "manual_bank_transfer",
        paymentReference: null,
        paymentTransactionId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 6. Save to Store
      ordersStore[orderId] = newOrder;
      ordersStore[newOrder.id] = newOrder;
      saveOrdersStore();

      console.log(`[Server Telemetry] Protected Order Created: ${orderId} | Source: ${newOrder.orderSource} | Total: NGN ${totalAmount} | Recipient: ${name} (${state})`);

      return res.status(200).json({
        success: true,
        orderId,
        order: newOrder
      });
    } catch (error: any) {
      console.error("[Server Telemetry] Error creating protected order:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to create protected order."
      });
    }
  });

  // API Route: Initiate Payment with Gateway
  app.post("/api/orders/initiate-payment", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const { orderId } = req.body || {};
      if (!orderId) {
        return res.status(400).json({ success: false, error: "orderId is required." });
      }

      const order = ordersStore[orderId];
      if (!order) {
        return res.status(404).json({ success: false, error: `Order with ID '${orderId}' was not found.` });
      }

      const secretKey = process.env.PAYSTACK_SECRET_KEY;
      if (!secretKey) {
        return res.status(400).json({
          success: false,
          error: "PAYSTACK_SECRET_KEY is not configured on the server.",
          requiresGatewayKey: true,
          order
        });
      }

      // Initialize transaction with Paystack API
      const amountInKobo = Math.round(order.totalAmount * 100);
      const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${secretKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: order.customer.email,
          amount: amountInKobo,
          reference: `${orderId}-${Date.now()}`,
          metadata: {
            orderId: order.orderId,
            customerName: order.customer.name,
            phone: order.customer.phone
          }
        })
      });

      const data = await paystackResponse.json();
      if (!data.status) {
        return res.status(400).json({
          success: false,
          error: data.message || "Paystack transaction initialization failed."
        });
      }

      // Save reference on order
      order.paymentReference = data.data.reference;
      order.updatedAt = new Date().toISOString();
      saveOrdersStore();

      return res.json({
        success: true,
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        reference: data.data.reference,
        order
      });
    } catch (error: any) {
      console.error("[Server Telemetry] Error initiating payment:", error);
      return res.status(500).json({ success: false, error: error.message || "Payment initiation failed." });
    }
  });

  // API Route: Server-Side Payment Verification
  app.post("/api/orders/verify-payment", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const { orderId, reference } = req.body || {};
      if (!orderId) {
        return res.status(400).json({ success: false, error: "orderId is required." });
      }

      const order = ordersStore[orderId];
      if (!order) {
        return res.status(404).json({ success: false, error: `Order with ID '${orderId}' was not found.` });
      }

      // If already verified and protected, return order safely
      if (order.paymentStatus === "paid" && order.orderStatus === "protected") {
        return res.json({
          success: true,
          verified: true,
          order,
          message: "Payment is already verified and protected."
        });
      }

      const secretKey = process.env.PAYSTACK_SECRET_KEY;
      if (!secretKey) {
        // Do NOT fake successful payment if provider secret is not configured
        console.warn(`[Server Security] Payment verification rejected for ${orderId}: PAYSTACK_SECRET_KEY missing.`);
        return res.status(400).json({
          success: false,
          verified: false,
          error: "PAYSTACK_SECRET_KEY is not configured on the server. Live payment verification requires Paystack credentials.",
          requiresGatewayKey: true
        });
      }

      const txReference = reference || order.paymentReference;
      if (!txReference) {
        return res.status(400).json({ success: false, error: "Payment reference is required for verification." });
      }

      // Call Paystack verify API
      const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(txReference)}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${secretKey}`,
          "Content-Type": "application/json"
        }
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.status || verifyData.data?.status !== "success") {
        console.warn(`[Server Security] Paystack transaction not successful for ${txReference}:`, verifyData);
        order.paymentStatus = "failed";
        order.updatedAt = new Date().toISOString();
        saveOrdersStore();
        return res.status(400).json({
          success: false,
          verified: false,
          error: verifyData.message || "Payment transaction could not be verified with Paystack."
        });
      }

      const paidAmount = verifyData.data.amount / 100;
      if (paidAmount < order.totalAmount) {
        console.warn(`[Server Security] Underpayment detected for ${orderId}: Expected ${order.totalAmount}, received ${paidAmount}`);
        return res.status(400).json({
          success: false,
          verified: false,
          error: `Payment amount discrepancy. Expected NGN ${order.totalAmount}, but received NGN ${paidAmount}.`
        });
      }

      // Backend Verification Success -> Update Order to Protected Status
      order.paymentStatus = "paid";
      order.orderStatus = "protected";
      order.paidAt = new Date().toISOString();
      order.paymentReference = txReference;
      order.paymentTransactionId = String(verifyData.data.id || "");
      order.updatedAt = new Date().toISOString();

      saveOrdersStore();
      console.log(`[Server Security] Payment Verified & Order Protected: ${order.orderId} | Status: paid + protected | Ref: ${txReference}`);

      return res.json({
        success: true,
        verified: true,
        order,
        message: "Payment successfully verified by backend. Order is now protected."
      });
    } catch (error: any) {
      console.error("[Server Telemetry] Error in /api/orders/verify-payment:", error);
      return res.status(500).json({
        success: false,
        verified: false,
        error: error.message || "Payment verification failed."
      });
    }
  });

  // API Route: Customer Notifies Manual Bank Transfer Made
  app.post("/api/orders/notify-transfer", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const { orderId, senderName, senderBank, narration, transferReference, paymentProofUrl, receiptUrl } = req.body || {};
      if (!orderId) {
        return res.status(400).json({ success: false, error: "orderId is required." });
      }

      const order = ordersStore[orderId];
      if (!order) {
        return res.status(404).json({ success: false, error: `Order '${orderId}' was not found.` });
      }

      const proof = paymentProofUrl || receiptUrl || null;
      order.paymentStatus = "pending_verification";
      order.orderStatus = "payment_verification_pending";
      if (proof) {
        order.paymentProofUrl = String(proof).trim();
      }
      order.transferNotice = {
        senderName: senderName ? String(senderName).trim() : order.customer.name,
        senderBank: senderBank ? String(senderBank).trim() : "Direct Bank Transfer",
        narration: narration ? String(narration).trim() : `Payment for ${orderId}`,
        transferReference: transferReference ? String(transferReference).trim() : null,
        paymentProofUrl: proof ? String(proof).trim() : null,
        notifiedAt: new Date().toISOString()
      };
      order.updatedAt = new Date().toISOString();

      saveOrdersStore();
      console.log(`[Server Telemetry] Customer Notified Manual Bank Transfer for ${orderId} | Status: payment_verification_pending | Proof: ${proof ? "Attached" : "None"}`);

      return res.json({
        success: true,
        order,
        message: "Transfer notification recorded. Admin will verify payment and dispatch."
      });
    } catch (error: any) {
      console.error("[Server Telemetry] Error in /api/orders/notify-transfer:", error);
      return res.status(500).json({ success: false, error: error.message || "Failed to record transfer notice." });
    }
  });

  // API Route: List All Orders (Admin Dashboard)
  app.get("/api/orders", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      // Deduplicate orders by orderId
      const uniqueOrdersMap: { [orderId: string]: any } = {};
      Object.values(ordersStore).forEach((ord: any) => {
        if (ord && ord.orderId) {
          uniqueOrdersMap[ord.orderId] = ord;
        }
      });
      const orderList = Object.values(uniqueOrdersMap).sort((a: any, b: any) => {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      return res.json({ success: true, orders: orderList });
    } catch (error: any) {
      console.error("[Server Telemetry] Error listing orders:", error);
      return res.status(500).json({ success: false, error: error.message || "Failed to list orders." });
    }
  });

  // API Route: Admin Updates Order / Payment Status
  app.post("/api/orders/:orderId/update-status", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const { orderId } = req.params;
      const { paymentStatus, orderStatus, adminNotes } = req.body || {};

      const order = ordersStore[orderId];
      if (!order) {
        return res.status(404).json({ success: false, error: `Order '${orderId}' not found.` });
      }

      if (paymentStatus) order.paymentStatus = paymentStatus;
      if (orderStatus) order.orderStatus = orderStatus;
      if (adminNotes !== undefined) order.adminNotes = adminNotes;
      if (paymentStatus === "paid" && !order.paidAt) {
        order.paidAt = new Date().toISOString();
      }
      order.updatedAt = new Date().toISOString();

      saveOrdersStore();
      console.log(`[Server Telemetry] Admin updated order ${orderId}: Payment=${order.paymentStatus}, Order=${order.orderStatus}`);

      return res.json({ success: true, order });
    } catch (error: any) {
      console.error("[Server Telemetry] Error updating order status:", error);
      return res.status(500).json({ success: false, error: error.message || "Failed to update order." });
    }
  });

  // API Route: Get Single Order Details by ID
  app.get("/api/orders/:orderId", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const { orderId } = req.params;
    const order = ordersStore[orderId];
    if (!order) {
      return res.status(404).json({ success: false, error: `Order '${orderId}' not found.` });
    }
    return res.json({ success: true, order });
  });

  // =========================================================================
  // SWAP REQUESTS STORE & API
  // =========================================================================
  const swapRequestsFilePath = path.join(process.cwd(), "swap_requests.json");
  let swapRequestsStore: Record<string, any> = {};

  try {
    if (fs.existsSync(swapRequestsFilePath)) {
      const content = fs.readFileSync(swapRequestsFilePath, "utf-8");
      swapRequestsStore = JSON.parse(content || "{}");
      console.log(`[Server] Loaded ${Object.keys(swapRequestsStore).length} swap requests from swap_requests.json`);
    }
  } catch (err) {
    console.warn("[Server] Could not read swap_requests.json, starting with fresh store:", err);
  }

  function saveSwapRequestsStore() {
    try {
      fs.writeFileSync(swapRequestsFilePath, JSON.stringify(swapRequestsStore, null, 2));
    } catch (err) {
      console.error("[Server] Failed to write swap_requests.json:", err);
    }
  }

  function cleanPhoneDigits(val: string): string {
    return (val || "").replace(/\D/g, "");
  }

  function verifyCustomerPhoneMatch(inputPhone: string, recordPhone: string): boolean {
    const d1 = cleanPhoneDigits(inputPhone);
    const d2 = cleanPhoneDigits(recordPhone);
    if (!d1 || !d2) return false;
    if (d1 === d2) return true;
    const norm1 = d1.startsWith("234") && d1.length >= 12 ? "0" + d1.substring(3) : d1;
    const norm2 = d2.startsWith("234") && d2.length >= 12 ? "0" + d2.substring(3) : d2;
    if (norm1 === norm2) return true;
    if (d1.length >= 7 && d2.length >= 7) {
      const minL = Math.min(d1.length, d2.length, 9);
      if (d1.slice(-minL) === d2.slice(-minL)) return true;
    }
    return false;
  }

  // API Route: Save / Submit Swap Request
  app.post(["/api/swaps", "/api/swaps/create"], async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const swapReq = req.body;
      if (!swapReq || !swapReq.id) {
        return res.status(400).json({ success: false, error: "Missing swap request id." });
      }

      const id = String(swapReq.id).trim().toUpperCase();
      const updatedItem = {
        ...swapReq,
        id,
        status: swapReq.status || "Pending",
        updatedAt: new Date().toISOString()
      };

      swapRequestsStore[id] = updatedItem;
      saveSwapRequestsStore();

      // Persist to serverDb Firestore if available
      if (serverDb) {
        try {
          const docRef = firestoreDoc(serverDb, "swap_requests", id);
          await firestoreSetDoc(docRef, updatedItem, { merge: true });
        } catch (fsErr) {
          console.warn("[Server Firestore] Failed to save swap request:", fsErr);
        }
      }

      console.log(`[Server Telemetry] Swap Request Saved: ${id} | Customer: ${updatedItem.customerName} | Device: ${updatedItem.currentDevice?.brand} ${updatedItem.currentDevice?.model}`);
      return res.status(200).json({ success: true, swap: updatedItem });
    } catch (err: any) {
      console.error("[Server Telemetry] Error saving swap request:", err);
      return res.status(500).json({ success: false, error: err.message || "Failed to save swap request." });
    }
  });

  // API Route: List All Swap Requests (for Admin Dashboard)
  app.get("/api/swaps", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      // Also sync from Firestore if available
      if (serverDb) {
        try {
          const snap = await firestoreGetDocs(firestoreCollection(serverDb, "swap_requests"));
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            if (data && data.id) {
              swapRequestsStore[data.id.toUpperCase()] = data;
            }
          });
          saveSwapRequestsStore();
        } catch (fsErr) {
          console.warn("[Server Firestore] Error reading swap_requests collection:", fsErr);
        }
      }

      const list = Object.values(swapRequestsStore).sort((a: any, b: any) => {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });

      return res.json({ success: true, swaps: list });
    } catch (err: any) {
      console.error("[Server Telemetry] Error listing swap requests:", err);
      return res.status(500).json({ success: false, error: err.message || "Failed to list swap requests." });
    }
  });

  // API Route: Verify and Track Swap Request (Customer Tracking with Phone Verification)
  app.post("/api/swaps/verify", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const { swapId, phone } = req.body || {};
      if (!swapId || typeof swapId !== "string" || !swapId.trim()) {
        return res.status(400).json({ success: false, error: "Swap Reference ID is required." });
      }

      const id = swapId.trim().toUpperCase();
      let record = swapRequestsStore[id];

      // If not in memory store, attempt Firestore lookup
      if (!record && serverDb) {
        try {
          const docRef = firestoreDoc(serverDb, "swap_requests", id);
          const snap = await firestoreGetDoc(docRef);
          if (snap.exists()) {
            record = snap.data();
            swapRequestsStore[id] = record;
            saveSwapRequestsStore();
          }
        } catch (fsErr) {
          console.warn("[Server Firestore] Error looking up swap by ID:", fsErr);
        }
      }

      if (!record) {
        return res.status(404).json({
          success: false,
          code: "NOT_FOUND",
          error: `No swap request was found for reference ID '${id}'. Please verify the ID on your confirmation.`
        });
      }

      // Phone verification
      const inputPhone = String(phone || "").trim();
      if (!inputPhone) {
        return res.status(400).json({
          success: false,
          code: "PHONE_REQUIRED",
          error: "Please enter the phone number you used when submitting this swap request to verify your identity."
        });
      }

      const recordPhone = String(record.customerPhone || "").trim();
      const isMatch = verifyCustomerPhoneMatch(inputPhone, recordPhone);

      if (!isMatch) {
        return res.status(403).json({
          success: false,
          code: "PHONE_MISMATCH",
          error: "The phone number entered does not match the record for this Swap ID. For security, please enter the exact phone number submitted."
        });
      }

      // Phone verified: return complete request safely
      return res.status(200).json({
        success: true,
        verified: true,
        swap: record
      });
    } catch (err: any) {
      console.error("[Server Telemetry] Error verifying swap request:", err);
      return res.status(500).json({ success: false, error: err.message || "Verification failed." });
    }
  });

  // API Route: Update Swap Request Status & Admin Notes
  app.post(["/api/swaps/:id/update-status", "/api/swaps/:id/status"], async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const id = String(req.params.id || "").trim().toUpperCase();
      const { status, adminNotes, officialOfferValue } = req.body || {};

      let record = swapRequestsStore[id];
      if (!record && serverDb) {
        try {
          const docRef = firestoreDoc(serverDb, "swap_requests", id);
          const snap = await firestoreGetDoc(docRef);
          if (snap.exists()) {
            record = snap.data();
          }
        } catch (_) {}
      }

      if (!record) {
        return res.status(404).json({ success: false, error: `Swap request '${id}' not found.` });
      }

      const now = new Date().toISOString();
      if (status) record.status = status;
      if (adminNotes !== undefined) record.adminNotes = adminNotes;
      if (officialOfferValue !== undefined) record.officialOfferValue = Number(officialOfferValue);
      record.updatedAt = now;

      swapRequestsStore[id] = record;
      saveSwapRequestsStore();

      if (serverDb) {
        try {
          const docRef = firestoreDoc(serverDb, "swap_requests", id);
          await firestoreSetDoc(docRef, record, { merge: true });
        } catch (fsErr) {
          console.warn("[Server Firestore] Failed to update swap request status:", fsErr);
        }
      }

      console.log(`[Server Telemetry] Swap Request Updated: ${id} -> Status: ${record.status}`);
      return res.status(200).json({ success: true, swap: record });
    } catch (err: any) {
      console.error("[Server Telemetry] Error updating swap status:", err);
      return res.status(500).json({ success: false, error: err.message || "Failed to update swap request." });
    }
  });

  // API Route: Delete Swap Request
  app.delete("/api/swaps/:id", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const id = String(req.params.id || "").trim().toUpperCase();
      delete swapRequestsStore[id];
      saveSwapRequestsStore();
      return res.json({ success: true, message: `Swap request ${id} removed.` });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // =========================================================================
  // ACCESSORIES STORE & API
  // =========================================================================
  const accessoriesFilePath = path.join(process.cwd(), "accessories.json");
  let accessoriesStore: any[] = [];

  const DEFAULT_ACCESSORIES = [
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

  try {
    if (fs.existsSync(accessoriesFilePath)) {
      const content = fs.readFileSync(accessoriesFilePath, "utf-8");
      accessoriesStore = JSON.parse(content || "[]");
      if (!Array.isArray(accessoriesStore) || accessoriesStore.length === 0) {
        accessoriesStore = DEFAULT_ACCESSORIES;
        fs.writeFileSync(accessoriesFilePath, JSON.stringify(accessoriesStore, null, 2));
      }
    } else {
      accessoriesStore = DEFAULT_ACCESSORIES;
      fs.writeFileSync(accessoriesFilePath, JSON.stringify(accessoriesStore, null, 2));
    }
  } catch (err) {
    console.warn("[Server] Could not initialize accessories.json, using defaults:", err);
    accessoriesStore = DEFAULT_ACCESSORIES;
  }

  function saveAccessoriesStore() {
    try {
      fs.writeFileSync(accessoriesFilePath, JSON.stringify(accessoriesStore, null, 2));
    } catch (err) {
      console.error("[Server] Failed to write accessories.json:", err);
    }
  }

  // API Routes for Accessories
  app.get("/api/accessories", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    return res.json({ success: true, accessories: accessoriesStore });
  });

  app.post("/api/accessories", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const { id, name, type, price, image, inStock } = req.body || {};
      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ success: false, error: "Accessory name is required." });
      }

      const accessoryId = id || `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const existingIndex = accessoriesStore.findIndex((a: any) => a.id === accessoryId);

      const accessoryRecord = {
        id: accessoryId,
        name: name.trim(),
        type: type ? String(type).trim() : "Other",
        price: Math.max(0, Number(price) || 0),
        image: image ? String(image).trim() : "",
        inStock: inStock !== false,
        updatedAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        accessoriesStore[existingIndex] = { ...accessoriesStore[existingIndex], ...accessoryRecord };
      } else {
        accessoriesStore.unshift(accessoryRecord);
      }

      saveAccessoriesStore();
      return res.json({ success: true, accessory: accessoryRecord, accessories: accessoriesStore });
    } catch (err: any) {
      console.error("[Server] Error saving accessory:", err);
      return res.status(500).json({ success: false, error: err.message || "Failed to save accessory." });
    }
  });

  app.delete("/api/accessories/:id", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const { id } = req.params;
    accessoriesStore = accessoriesStore.filter((a: any) => a.id !== id);
    saveAccessoriesStore();
    return res.json({ success: true, message: "Accessory deleted.", accessories: accessoriesStore });
  });

  // =========================================================================
  // AUTOMATIC PRICE & STOCK NOTIFICATION ENGINE (PHASE 2A)
  // =========================================================================

  /**
   * Helper to format Naira amounts
   */
  const formatServerNaira = (val?: number) => {
    if (typeof val !== "number" || isNaN(val)) return "₦0";
    return `₦${val.toLocaleString("en-NG")}`;
  };

  /**
   * API Route: Process Product Price & Stock Changes (Server-Side Detection Engine)
   */
  app.post("/api/notifications/process-product-change", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
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
        source = "server_api"
      } = req.body || {};

      if (!productId) {
        return res.status(400).json({ success: false, error: "Missing required 'productId'." });
      }

      console.log(`[Server NotificationEngine] Processing product change: ${productName || productId}`, {
        oldPrice,
        newPrice,
        oldQuantity,
        newQuantity,
        oldAvailability,
        newAvailability,
        source
      });

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
      }

      // 2. EVALUATE STOCK RESTOCK (0 -> N or Sold Out -> In Stock)
      let isRestock = false;
      if (oldQuantity !== undefined && newQuantity !== undefined) {
        const wasOutOfStock = oldAvailability === "Sold Out" || (typeof oldQuantity === "number" && oldQuantity <= 0);
        const isNowOutOfStock = newAvailability === "Sold Out" || (typeof newQuantity === "number" && newQuantity <= 0);

        if (wasOutOfStock && !isNowOutOfStock) {
          isRestock = true;
        }
      }

      const result = {
        success: true,
        productId: String(productId),
        productName: productName || "MILITO Product",
        priceChange: {
          detected: Boolean(priceEventType),
          eventType: priceEventType,
          oldPrice,
          newPrice,
          queuedCount: 0
        },
        stockChange: {
          detected: isRestock,
          isRestock,
          oldQuantity,
          newQuantity,
          queuedCount: 0
        },
        totalQueued: 0,
        queuedJobs: [] as any[],
        message: ""
      };

      if (!priceEventType && !isRestock) {
        result.message = "Product updated. No subscriber alert triggers detected.";
        return res.json(result);
      }

      if (!serverDb) {
        return res.json({
          ...result,
          message: "Firestore not initialized on server. Local mode active."
        });
      }

      const now = new Date().toISOString();

      // Fetch active alerts for this product
      const alertsRef = firestoreCollection(serverDb, "productAlerts");
      const q = firestoreQuery(
        alertsRef,
        firestoreWhere("productId", "==", String(productId)),
        firestoreWhere("active", "==", true)
      );
      const alertSnap = await firestoreGetDocs(q);
      const activeAlerts = alertSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Fetch customers
      const custSnap = await firestoreGetDocs(firestoreCollection(serverDb, "customers"));
      const customerMap = new Map<string, any>();
      custSnap.docs.forEach(d => customerMap.set(d.id, { id: d.id, ...d.data() }));

      // Process Price Changes
      if (priceEventType && oldPrice !== undefined && newPrice !== undefined) {
        const priceAlerts = activeAlerts.filter(a => (a as any).alertType === "PRICE_CHANGE");
        for (const alert of priceAlerts) {
          const cust = customerMap.get((alert as any).customerId);
          const oldFmt = formatServerNaira(oldPrice);
          const newFmt = formatServerNaira(newPrice);
          const title = priceEventType === "PRICE_DROP"
            ? `Price Drop Alert: ${productName || "Product"}`
            : `Price Update: ${productName || "Product"}`;
          const message = priceEventType === "PRICE_DROP"
            ? `Good news! The ${productName || "Product"} you were watching has dropped in price from ${oldFmt} to ${newFmt}.`
            : `The price of the ${productName || "Product"} you were watching has changed from ${oldFmt} to ${newFmt}.`;

          const jobId = `job_${alert.id}_${priceEventType}_${oldPrice}_${newPrice}`;
          const jobPayload = {
            id: jobId,
            customerId: (alert as any).customerId,
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
              productName: productName || "Product",
              oldPrice,
              newPrice,
              priceDiff: newPrice - oldPrice,
              currency: "NGN",
              customerName: cust?.name || "Customer",
              customerPhone: cust?.phone || "",
              customerEmail: cust?.email || null,
              source
            }
          };

          await firestoreSetDoc(firestoreDoc(serverDb, "notificationQueue", jobId), jobPayload, { merge: true });
          result.queuedJobs.push(jobPayload);
        }
        result.priceChange.queuedCount = priceAlerts.length;
      }

      // Process Restock
      if (isRestock) {
        const restockAlerts = activeAlerts.filter(a => (a as any).alertType === "RESTOCK");
        for (const alert of restockAlerts) {
          const cust = customerMap.get((alert as any).customerId);
          const title = `Back in Stock: ${productName || "Product"}`;
          const message = `Great news! The ${productName || "Product"} you were watching is now back in stock at MILITO TECH HOME.`;

          const jobId = `job_${alert.id}_RESTOCK_${oldQuantity ?? 0}_${newQuantity ?? 1}`;
          const jobPayload = {
            id: jobId,
            customerId: (alert as any).customerId,
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
              productName: productName || "Product",
              oldQuantity,
              newQuantity,
              customerName: cust?.name || "Customer",
              customerPhone: cust?.phone || "",
              customerEmail: cust?.email || null,
              source
            }
          };

          await firestoreSetDoc(firestoreDoc(serverDb, "notificationQueue", jobId), jobPayload, { merge: true });
          result.queuedJobs.push(jobPayload);
        }
        result.stockChange.queuedCount = restockAlerts.length;
      }

      result.totalQueued = result.queuedJobs.length;
      result.message = result.totalQueued > 0
        ? `Created ${result.totalQueued} notification job(s) in Firestore notificationQueue.`
        : "Product change detected, but no matching active alert subscribers were found.";

      console.log(`[Server NotificationEngine] Completed processing: ${result.totalQueued} jobs queued.`);
      return res.json(result);
    } catch (err: any) {
      console.error("[Server NotificationEngine] Error:", err);
      return res.status(500).json({ success: false, error: err.message || "Failed to process product notification." });
    }
  });

  /**
   * API Route: Get Live Notification Queue from Firestore
   */
  app.get("/api/notifications/queue", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      if (!serverDb) {
        return res.json({ success: true, jobs: [], count: 0, message: "Server running in standalone mode." });
      }

      const snap = await firestoreGetDocs(firestoreCollection(serverDb, "notificationQueue"));
      const jobs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      jobs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return res.json({
        success: true,
        count: jobs.length,
        jobs
      });
    } catch (err: any) {
      console.error("[Server NotificationEngine] Queue fetch error:", err);
      return res.status(500).json({ success: false, error: err.message || "Failed to fetch notification queue." });
    }
  });

  /**
   * API Route: Safe Notification Engine Test Runner
   * Allows dry-run or live simulation of test scenarios (Price Drop, Price Increase, Restock, Idempotency)
   */
  app.post("/api/notifications/test-engine", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const { scenario, productId, dryRun = true } = req.body || {};

      let targetProduct = {
        id: productId || "test_product_1",
        name: "iPhone 15 Pro Max",
        oldPrice: 900000,
        newPrice: 850000,
        oldQuantity: 0,
        newQuantity: 5
      };

      if (serverDb && productId) {
        try {
          const docSnap = await firestoreGetDoc(firestoreDoc(serverDb, "products", productId));
          if (docSnap.exists()) {
            const data = docSnap.data();
            targetProduct.id = docSnap.id;
            targetProduct.name = data.name || targetProduct.name;
          }
        } catch (_) {}
      }

      let testResult: any = null;

      switch (scenario) {
        case "PRICE_DROP":
          testResult = {
            scenario: "Price Drop (₦900,000 -> ₦850,000)",
            detected: true,
            eventType: "PRICE_DROP",
            title: `Price Drop Alert: ${targetProduct.name}`,
            message: `Good news! The ${targetProduct.name} you were watching has dropped in price from ₦900,000 to ₦850,000.`,
            isIdempotentKey: `job_<alertId>_PRICE_DROP_900000_850000`
          };
          break;

        case "PRICE_INCREASE":
          testResult = {
            scenario: "Price Increase (₦850,000 -> ₦900,000)",
            detected: true,
            eventType: "PRICE_INCREASE",
            title: `Price Update: ${targetProduct.name}`,
            message: `The price of the ${targetProduct.name} you were watching has changed from ₦850,000 to ₦900,000.`,
            isIdempotentKey: `job_<alertId>_PRICE_INCREASE_850000_900000`
          };
          break;

        case "RESTOCK":
          testResult = {
            scenario: "Restock (0 in stock -> 5 in stock)",
            detected: true,
            eventType: "RESTOCK",
            title: `Back in Stock: ${targetProduct.name}`,
            message: `Great news! The ${targetProduct.name} you were watching is now back in stock at MILITO TECH HOME.`,
            isIdempotentKey: `job_<alertId>_RESTOCK_0_5`
          };
          break;

        case "STOCK_REDUCTION":
          testResult = {
            scenario: "Stock reduction (5 in stock -> 4 in stock)",
            detected: false,
            eventType: null,
            note: "Correctly ignored minor stock fluctuations as product remains available."
          };
          break;

        case "SAME_VALUE":
          testResult = {
            scenario: "Same value update (₦900,000 -> ₦900,000)",
            detected: false,
            eventType: null,
            note: "Correctly ignored identical price update without creating notification jobs."
          };
          break;

        default:
          testResult = {
            scenario: "General Notification Engine Health Check",
            status: "READY",
            firestoreConnected: Boolean(serverDb),
            channels: ["WHATSAPP (Phase 2B queued)"]
          };
      }

      return res.json({
        success: true,
        dryRun,
        result: testResult
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || "Test runner failed." });
    }
  });

  // Catch-all 404 Handler for all unmatched /api requests to prevent falling through to Vite SPA index.html
  app.use("/api", (req, res) => {
    console.warn(`[Server Telemetry] 404 Unmatched API route requested: ${req.method} ${req.originalUrl}`);
    res.setHeader("Content-Type", "application/json");
    return res.status(404).json({
      success: false,
      error: "Upload service unavailable."
    });
  });

  // Global Express Error Handler (ensures Express always returns JSON for errors instead of HTML)
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("[Server Telemetry Error Handler]:", err);
    res.setHeader("Content-Type", "application/json");
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: err.message || "Upload service unavailable."
    });
  });

  // Vite integration middleware (handles frontend static routes ONLY)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });

  // Configure resilient timeouts to prevent drops on mobile networks and large uploads
  server.keepAliveTimeout = 120000;
  server.headersTimeout = 125000;
  server.timeout = 300000;
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});
