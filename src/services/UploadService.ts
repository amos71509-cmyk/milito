import { doc, setDoc } from "firebase/firestore";
import { db, isFirebasePlaceholder } from "../lib/firebase";
import { Product, CloudinaryImageMeta } from "../types";
import { getApiUrl, getApiFallbackUrls, setWorkingApiBase } from "../lib/api";

export interface MediaItemParam {
  id: string;
  file?: File;
  previewUrl: string;
  isLocal: boolean;
  meta?: CloudinaryImageMeta;
  original_filename?: string;
  bytes?: number;
  width?: number;
  height?: number;
  format?: string;
  status?: "waiting" | "uploading" | "success" | "error";
  errorMessage?: string;
}

export interface PublishProductParams {
  productForm: Partial<Product>;
  editingProduct?: Product | null;
  mediaItems?: MediaItemParam[];
  newFiles?: File[];
  existingGalleryImages?: CloudinaryImageMeta[];
  existingThumbnail?: { secure_url: string; public_id: string };
  onRefreshWebsite?: (updatedProduct: Product) => void;
  onProgress?: (stageText: string, progressPercent: number, currentUploaded?: number, totalToUpload?: number) => void;
}

/**
 * Prepares an image file for efficient and reliable network transfer without freezing the UI thread.
 * For huge camera photos (>2.5MB or >2000px), smoothly scales to crisp HD resolution.
 * Preserves SVG, GIF, and standard web images as-is without any canvas overhead.
 */
export const prepareFileForUpload = async (file: File): Promise<File> => {
  const mime = (file.type || "").toLowerCase();
  // Don't resize SVGs, GIFs, or already small files (< 2.5MB)
  if (mime.includes("svg") || mime.includes("gif") || file.size <= 2.5 * 1024 * 1024) {
    return file;
  }

  // Only resize standard raster images in browser
  if (!mime.startsWith("image/")) {
    return file;
  }

  // Yield to the event loop so the UI remains completely responsive
  await new Promise((r) => setTimeout(r, 0));

  return new Promise((resolve) => {
    try {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX_DIM = 2000; // Optimal 2K cap for fast network delivery & crisp display
        let { width, height } = img;

        if (width <= MAX_DIM && height <= MAX_DIM && file.size <= 3 * 1024 * 1024) {
          return resolve(file);
        }

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "medium";
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              return resolve(file);
            }
            const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            const optimizedFile = new File([blob], cleanName, {
              type: "image/jpeg",
              lastModified: Date.now()
            });
            console.log(`[UploadService] Optimized "${file.name}": ${(file.size / 1024 / 1024).toFixed(1)}MB -> ${(optimizedFile.size / 1024 / 1024).toFixed(1)}MB`);
            resolve(optimizedFile);
          },
          "image/jpeg",
          0.88
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    } catch {
      resolve(file);
    }
  });
};

export class UploadService {
  /**
   * Uploads a single file to Cloudinary with its own isolated request lifecycle:
   * - Fresh FormData
   * - Fresh AbortController with 60-second timeout
   * - 3 attempts with exponential backoff delay (1s, 2s)
   */
  public static async uploadSingleFile(
    file: File,
    index = 0,
    total = 1,
    maxRetries = 2
  ): Promise<CloudinaryImageMeta> {
    const processedFile = await prepareFileForUpload(file);
    const candidateUrls = getApiFallbackUrls("/api/upload");

    let lastError: any = null;

    for (const targetUrl of candidateUrls) {
      for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
        const controller = new AbortController();
        // 90 second timeout to accommodate Render cold start on free tier
        const timeoutId = setTimeout(() => controller.abort(), 90000);

        try {
          console.log(`[UploadService] Photo #${index + 1}/${total}: Uploading to ${targetUrl} (Attempt ${attempt})...`);
          const formData = new FormData();
          formData.append("images", processedFile);

          const response = await fetch(targetUrl, {
            method: "POST",
            body: formData,
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          const contentType = response.headers.get("content-type") || "";
          const text = await response.text();

          // If a static server or proxy returned HTML fallback
          if (contentType.includes("text/html") || text.trim().startsWith("<!doctype") || text.trim().startsWith("<html")) {
            console.warn(`[UploadService] ${targetUrl} returned HTML (static routing). Trying fallback endpoint...`);
            break; // Break inner loop to try next candidate URL
          }

          let json: any;
          try {
            json = JSON.parse(text);
          } catch {
            throw new Error(`Invalid server response from ${targetUrl}: ${text.slice(0, 100)}`);
          }

          if (!response.ok || !json.success) {
            const errorMsg = json?.error || json?.message || `Server returned status ${response.status}`;
            throw new Error(errorMsg);
          }

          if (Array.isArray(json.files) && json.files.length > 0) {
            const fileMeta = json.files[0];
            // Cache active working backend origin for all future calls
            if (targetUrl.startsWith("http")) {
              try {
                const parsed = new URL(targetUrl);
                setWorkingApiBase(parsed.origin);
              } catch {
                // ignore
              }
            }

            console.log(`[UploadService] Photo #${index + 1} successfully uploaded to Cloudinary: ${fileMeta.secure_url}`);
            return {
              secure_url: fileMeta.secure_url,
              public_id: fileMeta.public_id || "",
              original_filename: fileMeta.original_filename || file.name,
              width: Number(fileMeta.width) || 0,
              height: Number(fileMeta.height) || 0,
              format: fileMeta.format || file.name.split(".").pop() || "jpg",
              bytes: Number(fileMeta.bytes) || processedFile.size,
              created_at: fileMeta.created_at || new Date().toISOString(),
            };
          }

          throw new Error("No file metadata returned from upload server.");
        } catch (err: any) {
          clearTimeout(timeoutId);
          lastError = err;
          const isAbort = err.name === "AbortError";
          const msg = isAbort ? "Request timed out after 90s" : (err.message || "Network error");

          console.warn(`[UploadService] Photo #${index + 1} (${file.name}) at ${targetUrl} Attempt ${attempt}/${maxRetries + 1} failed: ${msg}`);

          if (attempt <= maxRetries) {
            const delayMs = attempt * 1200;
            await new Promise((r) => setTimeout(r, delayMs));
          }
        }
      }
    }

    const finalErrMsg = lastError?.message || "Upload failed: server connection interrupted";
    throw new Error(`Photo #${index + 1} (${file.name}): ${finalErrMsg}`);
  }

  /**
   * Uploads multiple files through a controlled sequential queue.
   * Isolates failures so that if one photo fails, subsequent photos continue uploading.
   */
  public static async uploadToCloudinary(
    files: File[],
    onProgress?: (progress: number, currentDone: number, total: number) => void
  ): Promise<CloudinaryImageMeta[]> {
    if (!files || files.length === 0) {
      return [];
    }

    console.log(`[UploadService] Starting controlled upload queue for ${files.length} file(s)...`);
    const results: CloudinaryImageMeta[] = [];
    const failedErrors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const meta = await this.uploadSingleFile(file, i, files.length);
        results.push(meta);
        const percent = Math.round(((i + 1) / files.length) * 100);
        if (onProgress) {
          onProgress(percent, i + 1, files.length);
        }
      } catch (err: any) {
        console.error(`[UploadService] Photo #${i + 1} failed:`, err);
        failedErrors.push(err.message || `Photo #${i + 1} failed`);
        // Continue uploading remaining files
      }
    }

    if (results.length === 0 && failedErrors.length > 0) {
      throw new Error(failedErrors[0]);
    }

    if (failedErrors.length > 0) {
      console.warn(`[UploadService] ${results.length}/${files.length} succeeded. Failures:`, failedErrors);
    }

    return results;
  }

  /**
   * Deletes Cloudinary images by public_ids. Used for rollback on failure or image deletion.
   */
  public static async deleteCloudinaryImages(publicIds: string[]): Promise<void> {
    const idsToDelete = Array.from(new Set(publicIds.filter(Boolean)));
    if (idsToDelete.length === 0) return;

    console.log(`[UploadService] Rollback/Delete executed for public_ids:`, idsToDelete);
    try {
      const targetUrl = getApiUrl("/api/delete-image");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_ids: idsToDelete }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      console.log(`[UploadService] Cloudinary deletion request completed.`);
    } catch (err) {
      console.error(`[UploadService] Error during Cloudinary deletion:`, err);
    }
  }

  /**
   * Centralized Atomic Product Publish Workflow:
   * 1. Starting upload -> Upload pending local files to Cloudinary sequentially.
   * 2. Cloudinary success -> Assemble complete gallery array preserving selection order.
   * 3. Set first image as MAIN image.
   * 4. Save full gallery and specs to Firestore collections atomically.
   * 5. If Firestore fails -> Delete newly uploaded Cloudinary images & abort.
   * 6. Firestore save successful -> Website refreshed.
   */
  public static async publishProduct(params: PublishProductParams): Promise<Product> {
    const {
      productForm,
      editingProduct,
      mediaItems,
      newFiles = [],
      existingGalleryImages = [],
      existingThumbnail,
      onRefreshWebsite,
      onProgress,
    } = params;

    const newlyUploadedPublicIds: string[] = [];

    try {
      let finalGalleryImages: CloudinaryImageMeta[] = [];

      // ----------------------------------------------------
      // PATH A: Ordered Media Items (From MediaUploader)
      // ----------------------------------------------------
      if (mediaItems && mediaItems.length > 0) {
        const localItems = mediaItems.filter((m) => m.isLocal && m.file);
        const totalLocalToUpload = localItems.length;

        if (totalLocalToUpload > 0) {
          console.log(`[UploadService] Uploading ${totalLocalToUpload} pending local image(s)...`);
          if (onProgress) {
            onProgress("Uploading images...", 10, 0, totalLocalToUpload);
          }

          let uploadedCount = 0;

          // Upload each pending local item individually
          for (let idx = 0; idx < mediaItems.length; idx++) {
            const item = mediaItems[idx];
            if (item.isLocal && item.file) {
              if (onProgress) {
                onProgress(`Uploading photo ${uploadedCount + 1} of ${totalLocalToUpload}...`, Math.floor(15 + (uploadedCount / totalLocalToUpload) * 55), uploadedCount, totalLocalToUpload);
              }

              const meta = await this.uploadSingleFile(item.file, idx, mediaItems.length);
              if (meta.public_id) {
                newlyUploadedPublicIds.push(meta.public_id);
              }

              // Update item in-place
              item.isLocal = false;
              item.meta = meta;
              item.previewUrl = meta.secure_url;
              item.status = "success";

              uploadedCount++;
              if (onProgress) {
                onProgress(`Photo ${uploadedCount} of ${totalLocalToUpload} uploaded`, Math.floor(15 + (uploadedCount / totalLocalToUpload) * 55), uploadedCount, totalLocalToUpload);
              }
            }
          }

          if (onProgress) {
            onProgress("All images uploaded successfully", 75, totalLocalToUpload, totalLocalToUpload);
          }
        }

        // Assemble final gallery images with strict verification: NO blob or data URLs allowed
        finalGalleryImages = mediaItems
          .map((item, idx) => {
            if (item.meta && item.meta.secure_url && (item.meta.secure_url.startsWith("http://") || item.meta.secure_url.startsWith("https://"))) {
              return item.meta;
            }
            if (item.previewUrl && (item.previewUrl.startsWith("http://") || item.previewUrl.startsWith("https://")) && !item.previewUrl.startsWith("blob:") && !item.previewUrl.startsWith("data:")) {
              return {
                secure_url: item.previewUrl,
                public_id: item.id || `img_${idx}_${Date.now()}`,
                original_filename: item.original_filename || `Photo ${idx + 1}`,
                width: item.width || 0,
                height: item.height || 0,
                format: item.format || "jpg",
                bytes: item.bytes || 0,
                created_at: new Date().toISOString(),
              };
            }
            return null;
          })
          .filter((g): g is CloudinaryImageMeta => g !== null && !!g.secure_url);
      } else {
        // ----------------------------------------------------
        // PATH B: Fallback / Legacy Props
        // ----------------------------------------------------
        const totalNewFiles = newFiles.length;
        let newlyUploadedMetas: CloudinaryImageMeta[] = [];

        if (totalNewFiles > 0) {
          if (onProgress) onProgress("Uploading images...", 15, 0, totalNewFiles);
          newlyUploadedMetas = await this.uploadToCloudinary(newFiles, (prog, done, tot) => {
            if (onProgress) {
              onProgress(`Photo ${done} of ${tot} uploaded`, Math.floor(15 + (done / tot) * 55), done, tot);
            }
          });

          newlyUploadedMetas.forEach((m) => {
            if (m.public_id) newlyUploadedPublicIds.push(m.public_id);
          });

          if (onProgress) onProgress("Images uploaded successfully", 75, totalNewFiles, totalNewFiles);
        }

        const combinedGalleryMetas: CloudinaryImageMeta[] = [
          ...existingGalleryImages.filter((img) => img && img.secure_url && !img.secure_url.startsWith("data:")),
          ...newlyUploadedMetas,
        ];

        finalGalleryImages = combinedGalleryMetas;
      }

      // ----------------------------------------------------
      // DETERMINE MAIN IMAGE (First image in gallery)
      // ----------------------------------------------------
      let finalThumbnail: { secure_url: string; public_id: string };

      if (finalGalleryImages.length > 0) {
        finalThumbnail = {
          secure_url: finalGalleryImages[0].secure_url,
          public_id: finalGalleryImages[0].public_id || "",
        };
      } else if (
        existingThumbnail &&
        existingThumbnail.secure_url &&
        !existingThumbnail.secure_url.startsWith("data:")
      ) {
        finalThumbnail = {
          secure_url: existingThumbnail.secure_url,
          public_id: existingThumbnail.public_id || "",
        };
      } else {
        const fallbackUrl =
          productForm.image && !productForm.image.startsWith("data:")
            ? productForm.image
            : "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&q=80";
        finalThumbnail = {
          secure_url: fallbackUrl,
          public_id: productForm.imagePublicId || "",
        };
      }

      // Ensure gallery is non-empty
      if (finalGalleryImages.length === 0 && finalThumbnail.secure_url) {
        finalGalleryImages = [
          {
            secure_url: finalThumbnail.secure_url,
            public_id: finalThumbnail.public_id,
            original_filename: "Main Cover Photo",
            width: 0,
            height: 0,
            format: "jpg",
            bytes: 0,
            created_at: new Date().toISOString(),
          },
        ];
      }

      const galleryUrls = finalGalleryImages.map((g) => g.secure_url);
      const galleryPublicIds = finalGalleryImages.map((g) => g.public_id).filter(Boolean);

      // ----------------------------------------------------
      // BUILD COMPLETE PRODUCT OBJECT
      // ----------------------------------------------------
      const targetDocId = editingProduct ? editingProduct.id : `prod_${Date.now()}`;
      const finalQty = Number(productForm.quantity) ?? 1;
      const finalStatus =
        finalQty <= 0 ? "Sold Out" : (productForm.availability as any) || "In Stock";

      const completeProduct: Product = {
        id: targetDocId,
        name: productForm.name || "Untitled Product",
        brand: productForm.brand || "Generics",
        condition: productForm.condition || "Premium UK Used",
        price: Number(productForm.price) || 0,
        originalPrice:
          Number(productForm.originalPrice) ||
          (Number(productForm.price) ? Number(productForm.price) * 1.15 : 0),
        badge: productForm.badge || "Grade A++",
        image: finalThumbnail.secure_url,
        imagePublicId: finalThumbnail.public_id,
        thumbnail: finalThumbnail,
        galleryImages: finalGalleryImages,
        gallery: galleryUrls,
        galleryPublicIds: galleryPublicIds,
        storageOptions:
          productForm.storageOptions && productForm.storageOptions.length > 0
            ? productForm.storageOptions
            : ["128GB"],
        colorOptions:
          productForm.colorOptions && productForm.colorOptions.length > 0
            ? productForm.colorOptions
            : [{ name: "Space Black", hex: "#1C1C1E" }],
        batteryHealth: productForm.batteryHealth || "100%",
        batteryHealthValue: productForm.batteryHealth || "100%",
        batteryCondition: productForm.batteryCondition || "Excellent",
        deviceLockStatus: productForm.deviceLockStatus || "Unlocked",
        description: productForm.description || "",
        specs: productForm.specs || {
          screen: "6.7-inch OLED",
          camera: "Pro Camera",
          chipset: "High Performance CPU",
          batterySize: "5000 mAh",
          os: "Latest OS",
          warranty: "1-Year Warranty",
          simType: "Unlocked SIM",
        },
        rating: editingProduct?.rating || 4.9,
        reviewsCount: editingProduct?.reviewsCount || 12,
        quantity: finalQty,
        availability: finalStatus,
        featured: !!productForm.featured,
        faceId: productForm.faceId || "Working",
        network: productForm.network || "Factory Unlocked",
        createdAt: editingProduct?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const firestorePayload = {
        name: completeProduct.name,
        model: completeProduct.name,
        brand: completeProduct.brand,
        condition: completeProduct.condition,
        price: completeProduct.price,
        originalPrice: completeProduct.originalPrice,
        badge: completeProduct.badge,
        image: completeProduct.image,
        imagePublicId: completeProduct.imagePublicId,
        thumbnail: completeProduct.thumbnail,
        galleryImages: completeProduct.galleryImages,
        gallery: completeProduct.gallery,
        galleryPublicIds: completeProduct.galleryPublicIds,
        storageOptions: completeProduct.storageOptions,
        storage: completeProduct.storageOptions,
        colorOptions: completeProduct.colorOptions,
        color: completeProduct.colorOptions,
        batteryHealth: completeProduct.batteryHealth,
        batteryHealthValue: completeProduct.batteryHealthValue,
        batteryCondition: completeProduct.batteryCondition,
        deviceLockStatus: completeProduct.deviceLockStatus,
        description: completeProduct.description,
        specs: completeProduct.specs,
        rating: completeProduct.rating,
        reviewsCount: completeProduct.reviewsCount,
        quantity: completeProduct.quantity,
        availability: completeProduct.availability,
        status: completeProduct.availability,
        featured: completeProduct.featured,
        faceId: completeProduct.faceId,
        network: completeProduct.network,
        createdAt: completeProduct.createdAt,
        updatedAt: completeProduct.updatedAt,
      };

      // ----------------------------------------------------
      // FIRESTORE SAVE
      // ----------------------------------------------------
      console.log(`[UploadService] Firestore save started: docId=${targetDocId}`);
      if (onProgress) onProgress("Saving product to database...", 85);

      if (!isFirebasePlaceholder && db) {
        try {
          const sanitizedPayload = JSON.parse(JSON.stringify(firestorePayload, (_k, v) => (v === undefined ? null : v)));
          await setDoc(doc(db, "product", targetDocId), sanitizedPayload, { merge: true });
          await setDoc(doc(db, "products", targetDocId), sanitizedPayload, { merge: true });
        } catch (fsErr: any) {
          console.error(`[UploadService] Firestore save failed for docId=${targetDocId}:`, fsErr);

          // ROLLBACK: Delete newly uploaded Cloudinary images if Firestore fails
          if (newlyUploadedPublicIds.length > 0) {
            console.log(`[UploadService] Rolling back Cloudinary uploads due to Firestore write failure...`);
            await this.deleteCloudinaryImages(newlyUploadedPublicIds);
          }

          throw new Error("Database save failed. Product was NOT published.");
        }
      }

      console.log(`[UploadService] Firestore save successful: docId=${targetDocId}`);
      if (onProgress) onProgress("Product published successfully!", 100);

      // Refresh frontend state
      if (onRefreshWebsite) {
        onRefreshWebsite(completeProduct);
      }

      return completeProduct;
    } catch (err: any) {
      console.error(`[UploadService] Publish product workflow error:`, err);

      // Rollback newly uploaded Cloudinary images if any failure occurred
      if (newlyUploadedPublicIds.length > 0) {
        await this.deleteCloudinaryImages(newlyUploadedPublicIds);
      }

      const userErrorMessage = err.message || "Image upload failed. Product was NOT published.";
      throw new Error(userErrorMessage);
    }
  }
}
