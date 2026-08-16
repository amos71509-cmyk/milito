import express from "express";
import path from "path";
import fs from "fs";
import { Readable } from "stream";
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

/**
 * Streams binary buffer directly into Cloudinary without any intermediate Base64 encoding.
 * Prevents memory spikes and timeout crashes on Render containers.
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
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result) {
          return reject(new Error("Cloudinary returned an empty response"));
        }
        resolve({
          original_filename: result.original_filename || fileInfo.originalname,
          secure_url: result.secure_url,
          public_id: result.public_id,
          width: result.width || 0,
          height: result.height || 0,
          format: result.format || fileInfo.mimetype?.split("/")[1] || "jpeg",
          bytes: result.bytes || buffer.length,
          created_at: result.created_at || new Date().toISOString()
        });
      }
    );

    uploadStream.on("error", (err) => {
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

      // Process uploaded files with memory-efficient streaming (NO Base64 in RAM)
      const uploadedFiles: Array<{
        original_filename: string;
        secure_url: string;
        public_id: string;
        width: number;
        height: number;
        format: string;
        bytes: number;
        created_at: string;
      }> = [];

      for (let idx = 0; idx < files.length; idx++) {
        const file = files[idx];
        const mimeType = file.mimetype || "image/jpeg";

        if (hasCloudinary) {
          try {
            const streamResult = await uploadBufferToCloudinary(file.buffer, {
              originalname: file.originalname,
              mimetype: file.mimetype
            });

            console.log(`[Server Telemetry] Cloudinary upload stream success for "${file.originalname}": ${streamResult.public_id}`);
            uploadedFiles.push(streamResult);
          } catch (cloudinaryErr: any) {
            console.error(`[Server Telemetry] Cloudinary stream error for "${file.originalname}":`, cloudinaryErr);
            throw new Error(`Cloudinary rejected "${file.originalname}": ${cloudinaryErr.message || "Upload failed"}`);
          }
        } else {
          // Local fallback placeholder (when Cloudinary secrets not in dev environment)
          const base64Fallback = file.buffer.toString("base64");
          const dataUri = `data:${mimeType};base64,${base64Fallback}`;
          uploadedFiles.push({
            original_filename: file.originalname,
            secure_url: dataUri,
            public_id: `local_${Date.now()}_${idx}`,
            width: 800,
            height: 800,
            format: mimeType.split("/")[1] || "jpeg",
            bytes: file.size,
            created_at: new Date().toISOString()
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: "Images successfully uploaded",
        files: uploadedFiles
      });
    } catch (error: any) {
      console.error("[Server Telemetry] Error in /api/upload handler:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "An error occurred during image processing."
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
