import { v2 as cloudinary } from "cloudinary";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app);

const FIXES = [
  {
    id: "38KoJt6cZURjLBrkdWpH",
    name: "iPhone 16",
    primarySource: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=85"
  },
  {
    id: "UBBt5KfSbw6RqPB61IxM",
    name: "Galaxy S24 Ultra",
    primarySource: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=85"
  },
  {
    id: "YdkXYHEZH7w2LCXzWd89",
    name: "iPhone 13",
    primarySource: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=1200&q=85"
  }
];

async function main() {
  console.log("Starting image upload to Cloudinary and Firestore repair...");

  for (const item of FIXES) {
    console.log(`\nProcessing ${item.name} (${item.id})...`);

    // Upload primary image to Cloudinary
    const uploadRes = await cloudinary.uploader.upload(item.primarySource, {
      folder: "milito_tech_products",
      resource_type: "image"
    });
    console.log(`  Uploaded to Cloudinary: ${uploadRes.public_id} -> ${uploadRes.secure_url}`);

    const metaItem = {
      public_id: uploadRes.public_id,
      secure_url: uploadRes.secure_url,
      width: uploadRes.width,
      height: uploadRes.height,
      format: uploadRes.format,
      bytes: uploadRes.bytes,
      original_filename: `${item.name.replace(/\s+/g, "_")}.jpg`,
      created_at: new Date().toISOString()
    };

    const updatePayload = {
      image: uploadRes.secure_url,
      imageUrl: uploadRes.secure_url,
      imagePublicId: uploadRes.public_id,
      thumbnail: {
        public_id: uploadRes.public_id,
        secure_url: uploadRes.secure_url
      },
      gallery: [uploadRes.secure_url],
      galleryPublicIds: [uploadRes.public_id],
      galleryImages: [metaItem],
      updatedAt: new Date().toISOString()
    };

    // Update both 'products' and 'product' collections
    for (const colName of ["products", "product"]) {
      try {
        const docRef = doc(db, colName, item.id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          await updateDoc(docRef, updatePayload);
          console.log(`  Successfully updated ${colName}/${item.id}`);
        } else {
          console.log(`  Doc not found in ${colName}/${item.id}`);
        }
      } catch (err: any) {
        console.error(`  Error updating ${colName}/${item.id}:`, err.message);
      }
    }
  }

  console.log("\nAll target products repaired in Cloudinary and Firestore!");
}

main().then(() => process.exit(0)).catch(e => {
  console.error("Fatal:", e);
  process.exit(1);
});
