import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { createServer as createViteServer } from "vite";

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
    const ext = path.extname(file.originalname || "").toLowerCase();
    
    // Accept standard image mime types or octet-stream with valid extension
    const isImageMime = mime.startsWith("image/") || mime === "application/octet-stream";
    const allowedExtensions = [
      ".jpg", ".jpeg", ".png", ".webp", ".gif", 
      ".heic", ".heif", ".avif", ".bmp", ".tiff", ".svg"
    ];
    const isAllowedExt = allowedExtensions.includes(ext);

    if (isImageMime || isAllowedExt) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported image format '${file.mimetype || ext}'. Allowed formats: JPG, PNG, WEBP, HEIC, AVIF, GIF, BMP, SVG, TIFF.`));
    }
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON and URL-encoded body parsers
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Middleware: Enforce CORS & JSON Content-Type for all API endpoints to prevent HTML fallbacks
  app.use("/api", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Content-Type", "application/json");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    next();
  });

  // API Route: Health Check to verify server status
  app.get(["/api/health", "/api/health/"], (req, res) => {
    res.json({ status: "ok", message: "Express server is running and healthy!" });
  });

  // Handle GET /api/upload or GET /api/upload/ cleanly with 405 Method Not Allowed JSON
  app.get(["/api/upload", "/api/upload/"], (req, res) => {
    res.setHeader("Content-Type", "application/json");
    return res.status(405).json({
      success: false,
      error: "Method GET not allowed. Send a POST request with image files to upload."
    });
  });

  // API Route: Secure Cloudinary Image Upload (supports /api/upload and /api/upload/)
  app.post(["/api/upload", "/api/upload/"], (req, res, next) => {
    console.log(`[Server Telemetry] Upload Request Received -> Method: ${req.method} | URL: ${req.originalUrl}`);
    res.setHeader("Content-Type", "application/json");

    // Use upload.any() to handle any field name (images, file, logo, etc.)
    upload.any()(req, res, (err) => {
      if (err) {
        console.error(`[Server Upload Error] Multer processing failed for URL ${req.originalUrl}:`, err.message);
        console.log(`[Server Response Log] HTTP 400 Bad Request sent for URL ${req.originalUrl}`);
        return res.status(400).json({
          success: false,
          error: err.message || "Upload service unavailable."
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
        const errBody = { success: false, error: "No image files were provided in the request." };
        console.log(`[Server Response Log] HTTP 400 Sent -> URL: ${req.originalUrl} | Body:`, JSON.stringify(errBody));
        return res.status(400).json(errBody);
      }

      console.log(`[Server Telemetry] Processing batch upload of ${files.length} file(s):`);
      files.forEach((file, index) => {
        console.log(`  File #${index + 1}: Name="${file.originalname}" | Size=${file.size} bytes (${(file.size / (1024 * 1024)).toFixed(2)} MB) | MIME="${file.mimetype}"`);
      });

      // Check Cloudinary Credentials (Lazy Initialization Validation)
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      console.log("[Server Telemetry] Checking Cloudinary Environment Credentials:");
      console.log("  - CLOUDINARY_CLOUD_NAME:", cloudName ? `"${cloudName}"` : "MISSING");
      console.log("  - CLOUDINARY_API_KEY:", apiKey ? "CONFIGURED" : "MISSING");
      console.log("  - CLOUDINARY_API_SECRET:", apiSecret ? "CONFIGURED" : "MISSING");

      if (!cloudName || !apiKey || !apiSecret) {
        const errMsg = "Cloudinary credentials missing. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in AI Studio Secrets panel.";
        console.error("[Server Telemetry] Error:", errMsg);
        const errBody = { success: false, error: errMsg };
        console.log(`[Server Response Log] HTTP 500 Sent -> URL: ${req.originalUrl} | Body:`, JSON.stringify(errBody));
        return res.status(500).json(errBody);
      }

      // Configure Cloudinary SDK
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true
      });

      const uploadPromises = files.map(async (file) => {
        console.log(`[Server Telemetry] Initiating Cloudinary API upload for file "${file.originalname}" (${file.size} bytes, type: "${file.mimetype}")`);
        
        // Convert memory buffer to Data URI
        const base64Data = file.buffer.toString("base64");
        const dataUri = `data:${file.mimetype || "image/jpeg"};base64,${base64Data}`;
        
        try {
          const result = await cloudinary.uploader.upload(dataUri, {
            folder: "milito_tech_products",
            resource_type: "auto"
          });

          console.log(`[Server Telemetry] Cloudinary API success response received for "${file.originalname}":`, {
            public_id: result.public_id,
            secure_url: result.secure_url,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            created_at: result.created_at
          });

          return {
            original_filename: result.original_filename || file.originalname,
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width || 0,
            height: result.height || 0,
            format: result.format || (file.mimetype ? file.mimetype.split("/")[1] : "jpeg"),
            bytes: result.bytes || file.size,
            created_at: result.created_at || new Date().toISOString()
          };
        } catch (cloudinaryErr: any) {
          console.error(`[Server Telemetry] Cloudinary upload API error for "${file.originalname}":`, cloudinaryErr);
          throw new Error(cloudinaryErr.message || (cloudinaryErr.error && cloudinaryErr.error.message) || "Cloudinary upload failed");
        }
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const successBody = {
        success: true,
        message: "Images successfully uploaded to Cloudinary",
        files: uploadedFiles
      };

      console.log(`[Server Response Log] HTTP 200 OK Sent -> URL: ${req.originalUrl} | Uploaded Count: ${uploadedFiles.length}`);
      return res.status(200).json(successBody);
    } catch (error: any) {
      console.error("[Server Telemetry] Exception in /api/upload handler:", error);
      const errorMsg = error.message || "An error occurred during Cloudinary upload.";
      const errBody = {
        success: false,
        error: errorMsg
      };
      console.log(`[Server Response Log] HTTP 500 Internal Server Error Sent -> URL: ${req.originalUrl} | Error:`, errorMsg);
      return res.status(500).json(errBody);
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
  let websiteBrandingCache = {
    logoUrl: "",
    logoPublicId: "",
    logoMeta: null as any,
    updatedAt: ""
  };

  const brandingFilePath = path.join(process.cwd(), "branding.json");
  try {
    if (fs.existsSync(brandingFilePath)) {
      const fileContent = fs.readFileSync(brandingFilePath, "utf-8");
      websiteBrandingCache = JSON.parse(fileContent);
      console.log("[Server] Loaded existing branding.json logoUrl:", websiteBrandingCache.logoUrl);
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
      const { logoUrl, logoPublicId, logoMeta, updatedAt } = req.body || {};
      websiteBrandingCache = {
        logoUrl: logoUrl || "",
        logoPublicId: logoPublicId || "",
        logoMeta: logoMeta || null,
        updatedAt: updatedAt || new Date().toISOString()
      };
      fs.writeFileSync(brandingFilePath, JSON.stringify(websiteBrandingCache, null, 2));
      console.log("[Server] Website branding updated & saved to branding.json:", websiteBrandingCache.logoUrl);
      return res.json({ success: true, branding: websiteBrandingCache });
    } catch (err: any) {
      console.error("[Server] Error writing branding.json:", err);
      return res.status(500).json({ success: false, error: err.message });
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});
