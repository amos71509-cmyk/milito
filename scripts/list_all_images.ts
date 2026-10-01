import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app);

async function listAll() {
  const colls = ["product", "products"];
  for (const c of colls) {
    console.log(`=== Collection: ${c} ===`);
    const snap = await getDocs(collection(db, c));
    console.log(`Count: ${snap.size}`);
    snap.forEach((d) => {
      const data = d.data();
      console.log(`\n--- PRODUCT ID: ${d.id} ---`);
      console.log(`Name/Model: ${data.name || data.model}`);
      console.log(`Brand: ${data.brand}`);
      console.log(`thumbnail:`, JSON.stringify(data.thumbnail));
      console.log(`image:`, JSON.stringify(data.image));
      console.log(`imagePublicId:`, JSON.stringify(data.imagePublicId));
      console.log(`public_id:`, JSON.stringify(data.public_id));
      console.log(`secure_url:`, JSON.stringify(data.secure_url));
      console.log(`imageUrl:`, JSON.stringify(data.imageUrl));
      console.log(`gallery:`, JSON.stringify(data.gallery));
      console.log(`galleryPublicIds:`, JSON.stringify(data.galleryPublicIds));
      console.log(`galleryImages:`, JSON.stringify(data.galleryImages));
    });
  }
}

listAll().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
