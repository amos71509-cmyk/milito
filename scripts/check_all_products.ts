import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app);

async function checkAllProducts() {
  const snap = await getDocs(collection(db, "product"));
  console.log(`Checking ${snap.size} products from Firestore...\n`);

  for (let i = 0; i < snap.docs.length; i++) {
    const doc = snap.docs[i];
    const data = doc.data();
    const id = doc.id;
    const name = data.name || data.model;
    const brand = data.brand;

    // Check available image fields
    const thumbnailObj = typeof data.thumbnail === "object" ? data.thumbnail : null;
    const thumbnailStr = typeof data.thumbnail === "string" ? data.thumbnail : null;
    const imageField = data.image;
    const imagePublicId = data.imagePublicId;
    const publicId = data.public_id;
    const gallery = data.gallery;
    const galleryImages = data.galleryImages;
    const galleryPublicIds = data.galleryPublicIds;

    let candidateUrl = "";
    let sourceField = "";

    if (thumbnailObj?.secure_url) {
      candidateUrl = thumbnailObj.secure_url;
      sourceField = "thumbnail.secure_url";
    } else if (thumbnailObj?.url) {
      candidateUrl = thumbnailObj.url;
      sourceField = "thumbnail.url";
    } else if (thumbnailStr) {
      candidateUrl = thumbnailStr;
      sourceField = "thumbnail (string)";
    } else if (typeof imageField === "string" && imageField) {
      candidateUrl = imageField;
      sourceField = "image";
    } else if (typeof imageField === "object" && imageField?.secure_url) {
      candidateUrl = imageField.secure_url;
      sourceField = "image.secure_url";
    } else if (Array.isArray(galleryImages) && galleryImages[0]?.secure_url) {
      candidateUrl = galleryImages[0].secure_url;
      sourceField = "galleryImages[0].secure_url";
    } else if (Array.isArray(gallery) && gallery[0]) {
      candidateUrl = typeof gallery[0] === "object" ? gallery[0]?.secure_url : String(gallery[0]);
      sourceField = "gallery[0]";
    } else if (imagePublicId) {
      candidateUrl = `https://res.cloudinary.com/militotech/image/upload/${imagePublicId}`;
      sourceField = "reconstructed from imagePublicId";
    } else if (publicId) {
      candidateUrl = `https://res.cloudinary.com/militotech/image/upload/${publicId}`;
      sourceField = "reconstructed from public_id";
    }

    let httpStatus = 0;
    let errorMsg = "";
    if (candidateUrl && candidateUrl.startsWith("http")) {
      try {
        const res = await fetch(candidateUrl);
        httpStatus = res.status;
      } catch (e: any) {
        errorMsg = e.message;
      }
    }

    console.log(`[Product ${i + 1}] ID: ${id}`);
    console.log(`  Name: "${name}" (${brand})`);
    console.log(`  Source Field Used: ${sourceField}`);
    console.log(`  Resolved URL: ${candidateUrl}`);
    console.log(`  HTTP Status: ${httpStatus} ${errorMsg ? '(' + errorMsg + ')' : ''}`);
    console.log(`  imagePublicId: ${imagePublicId || 'none'}`);
    console.log(`  gallery length: ${Array.isArray(gallery) ? gallery.length : 0}, galleryImages length: ${Array.isArray(galleryImages) ? galleryImages.length : 0}`);
    console.log('----------------------------------------------------');
  }
}

checkAllProducts().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
