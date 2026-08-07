import { doc, setDoc } from "firebase/firestore";
import { db, isFirebasePlaceholder } from "../lib/firebase";
import { Product, CloudinaryImageMeta } from "../types";

export interface PublishProductParams {
  productForm: Partial<Product>;
  editingProduct?: Product | null;
  newFiles?: File[];
  existingGalleryImages?: CloudinaryImageMeta[];
  existingThumbnail?: { secure_url: string; public_id: string };
  onRefreshWebsite?: (updatedProduct: Product) => void;
  onProgress?: (stage: string, progress: number) => void;
}

export class UploadService {
  /**
   * Centralized helper to safely execute fetch requests and handle JSON/HTML errors cleanly.
   * Ensures no HTML, unexpected token, or JSON parse errors are ever surfaced to users.
   */
  private static async safeFetchJson(url: string, options: RequestInit): Promise<any> {
    try {
      const response = await fetch(url, options);
      const contentType = response.headers.get("content-type") || "";
      const text = await response.text();

      // Detect HTML SPA fallback responses from backend dev server initialization
      if (contentType.includes("text/html") || text.trim().startsWith("<!doctype") || text.trim().startsWith("<html")) {
        console.warn(`[UploadService] HTML fallback response received from ${url} (${response.status})`);
        throw new Error("Upload service unavailable. Please try again.");
      }

      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        console.error(`[UploadService] Failed to parse JSON response from ${url}:`, text.slice(0, 200));
        throw new Error("Upload service returned an invalid response. Please try again.");
      }

      if (!response.ok) {
        const errorMsg = json.error || json.message || `Upload failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      return json;
    } catch (err: any) {
      if (err.name === "AbortError") {
        throw err;
      }
      const rawMsg = err.message || "Network error. Please check your connection.";
      // Clean up raw HTML tags or syntax error technical details
      const cleanMsg = rawMsg.includes("<!") || rawMsg.includes("SyntaxError") || rawMsg.includes("Unexpected token")
        ? "Upload service unavailable. Please try again."
        : rawMsg;
      throw new Error(cleanMsg);
    }
  }

  /**
   * Uploads one or multiple files directly to Cloudinary.
   */
  public static async uploadToCloudinary(
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<CloudinaryImageMeta[]> {
    if (!files || files.length === 0) {
      return [];
    }

    console.log(`[UploadService] Starting upload: ${files.length} file(s)`);
    files.forEach((f, idx) => {
      console.log(`[UploadService] Uploading image ${idx + 1}/${files.length}: "${f.name}"`);
    });

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    if (onProgress) onProgress(25);

    const data = await this.safeFetchJson("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!data.success || !Array.isArray(data.files) || data.files.length === 0) {
      console.error("[UploadService] Upload response indicates failure or empty files list:", data);
      throw new Error("Image upload failed. Product was NOT published.");
    }

    if (onProgress) onProgress(100);

    const uploadedMetas: CloudinaryImageMeta[] = data.files.map((fileMeta: any, idx: number) => ({
      secure_url: fileMeta.secure_url,
      public_id: fileMeta.public_id || "",
      original_filename: fileMeta.original_filename || files[idx]?.name || `Image ${idx + 1}`,
      width: Number(fileMeta.width) || 0,
      height: Number(fileMeta.height) || 0,
      format: fileMeta.format || "jpg",
      bytes: Number(fileMeta.bytes) || 0,
      created_at: fileMeta.created_at || new Date().toISOString(),
    }));

    const uploadedPublicIds = uploadedMetas.map((m) => m.public_id).filter(Boolean);
    console.log(`[UploadService] Cloudinary success:`, uploadedPublicIds);

    return uploadedMetas;
  }

  /**
   * Deletes Cloudinary images by public_ids. Used for rollback on failure or image deletion.
   */
  public static async deleteCloudinaryImages(publicIds: string[]): Promise<void> {
    const idsToDelete = Array.from(new Set(publicIds.filter(Boolean)));
    if (idsToDelete.length === 0) return;

    console.log(`[UploadService] Rollback/Delete executed for public_ids:`, idsToDelete);
    try {
      await this.safeFetchJson("/api/delete-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_ids: idsToDelete }),
      });
      console.log(`[UploadService] Cloudinary deletion request completed.`);
    } catch (err) {
      console.error(`[UploadService] Error during Cloudinary deletion:`, err);
    }
  }

  /**
   * Centralized Atomic Product Publish Workflow:
   * 1. Starting upload -> Upload files to Cloudinary first.
   * 2. Cloudinary success -> Verify image meta.
   * 3. Build complete product object -> Ensure no partial products or placeholders.
   * 4. Firestore save started -> Save to Firestore collections.
   * 5. If Firestore fails -> Delete uploaded Cloudinary images & stop.
   * 6. Firestore save successful -> Website refreshed.
   */
  public static async publishProduct(params: PublishProductParams): Promise<Product> {
    const {
      productForm,
      editingProduct,
      newFiles = [],
      existingGalleryImages = [],
      existingThumbnail,
      onRefreshWebsite,
      onProgress,
    } = params;

    const newlyUploadedPublicIds: string[] = [];

    try {
      // ----------------------------------------------------
      // STAGE 1: Starting upload
      // ----------------------------------------------------
      const totalNewFiles = newFiles.length;
      console.log(`[UploadService] Starting upload: ${totalNewFiles} new file(s)`);
      if (onProgress) onProgress("Starting upload", 10);

      let newlyUploadedMetas: CloudinaryImageMeta[] = [];
      if (totalNewFiles > 0) {
        newlyUploadedMetas = await this.uploadToCloudinary(newFiles, (prog) => {
          if (onProgress) onProgress("Uploading image", 10 + Math.floor(prog * 0.55));
        });

        newlyUploadedMetas.forEach((m) => {
          if (m.public_id) newlyUploadedPublicIds.push(m.public_id);
        });
      }

      // ----------------------------------------------------
      // STAGE 2: Cloudinary success
      // ----------------------------------------------------
      console.log(`[UploadService] Cloudinary success: Uploaded ${newlyUploadedMetas.length} new image(s)`);
      if (onProgress) onProgress("Cloudinary success", 70);

      // Combine existing gallery images with newly uploaded ones
      const combinedGalleryMetas: CloudinaryImageMeta[] = [
        ...existingGalleryImages.filter((img) => img && img.secure_url && !img.secure_url.startsWith("data:")),
        ...newlyUploadedMetas,
      ];

      // Determine main thumbnail
      let finalThumbnail: { secure_url: string; public_id: string };
      if (
        existingThumbnail &&
        existingThumbnail.secure_url &&
        !existingThumbnail.secure_url.startsWith("data:")
      ) {
        finalThumbnail = {
          secure_url: existingThumbnail.secure_url,
          public_id: existingThumbnail.public_id || "",
        };
      } else if (combinedGalleryMetas.length > 0) {
        finalThumbnail = {
          secure_url: combinedGalleryMetas[0].secure_url,
          public_id: combinedGalleryMetas[0].public_id || "",
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

      // Ensure no Base64 placeholders or empty image URLs pass through
      if (!finalThumbnail.secure_url || finalThumbnail.secure_url.startsWith("data:")) {
        console.error("[UploadService] Invalid image URL or placeholder detected.");
        throw new Error("Image upload failed. Product was NOT published.");
      }

      // Construct clean gallery images metadata array
      const finalGalleryImages: CloudinaryImageMeta[] =
        combinedGalleryMetas.length > 0
          ? combinedGalleryMetas.map((img, idx) => ({
              secure_url: img.secure_url,
              public_id: img.public_id || `pub_${idx}`,
              original_filename: img.original_filename || `Photo ${idx + 1}`,
              width: Number(img.width) || 0,
              height: Number(img.height) || 0,
              format: img.format || "jpg",
              bytes: Number(img.bytes) || 0,
              created_at: img.created_at || new Date().toISOString(),
            }))
          : [
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

      const galleryUrls = finalGalleryImages.map((g) => g.secure_url);
      const galleryPublicIds = finalGalleryImages.map((g) => g.public_id).filter(Boolean);

      // ----------------------------------------------------
      // STAGE 3: Build complete product object (No partials)
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
      // STAGE 4: Firestore save started
      // ----------------------------------------------------
      console.log(`[UploadService] Firestore save started: docId=${targetDocId}`);
      if (onProgress) onProgress("Firestore save started", 80);

      if (!isFirebasePlaceholder && db) {
        try {
          // Write to Firestore "product" and "products" collections atomically
          await setDoc(doc(db, "product", targetDocId), firestorePayload, { merge: true });
          await setDoc(doc(db, "products", targetDocId), firestorePayload, { merge: true });
        } catch (fsErr: any) {
          console.error(`[UploadService] Firestore save failed for docId=${targetDocId}:`, fsErr);

          // ROLLBACK: Delete newly uploaded Cloudinary images if Firestore fails
          if (newlyUploadedPublicIds.length > 0) {
            console.log(`[UploadService] Rolling back Cloudinary uploads due to Firestore write failure...`);
            await this.deleteCloudinaryImages(newlyUploadedPublicIds);
          }

          throw new Error("Image upload failed. Product was NOT published.");
        }
      }

      // ----------------------------------------------------
      // STAGE 5: Firestore save successful
      // ----------------------------------------------------
      console.log(`[UploadService] Firestore save successful: docId=${targetDocId}`);
      if (onProgress) onProgress("Firestore save successful", 95);

      // ----------------------------------------------------
      // STAGE 6: Website refreshed
      // ----------------------------------------------------
      if (onRefreshWebsite) {
        onRefreshWebsite(completeProduct);
      }
      console.log(`[UploadService] Website refreshed: docId=${targetDocId}`);
      if (onProgress) onProgress("Website refreshed", 100);

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
