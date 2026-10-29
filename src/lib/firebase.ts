import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Check if configuration is still using placeholders
export const isFirebasePlaceholder = 
  !firebaseConfig || 
  firebaseConfig.apiKey === "YOUR_API_KEY" || 
  firebaseConfig.projectId === "YOUR_PROJECT_ID" ||
  firebaseConfig.apiKey === "";

let app: any = null;
let db: any = null;
let auth: any = null;

const databaseId = (firebaseConfig as any)?.firestoreDatabaseId;

if (!isFirebasePlaceholder) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    try {
      auth = getAuth(app);
    } catch (authErr) {
      console.warn("Firebase auth initialization skipped or failed:", authErr);
    }

    // Initialize Firestore with specific databaseId (CRITICAL: Required for non-default database instances in AI Studio)
    try {
      db = databaseId
        ? initializeFirestore(
            app,
            {
              localCache: persistentLocalCache({
                tabManager: persistentMultipleTabManager(),
              }),
              experimentalForceLongPolling: true,
            },
            databaseId
          )
        : initializeFirestore(app, {
            localCache: persistentLocalCache({
              tabManager: persistentMultipleTabManager(),
            }),
            experimentalForceLongPolling: true,
          });
    } catch (cacheError) {
      console.warn("Firestore initialization with persistent cache failed, falling back to simple long polling:", cacheError);
      try {
        db = databaseId
          ? initializeFirestore(
              app,
              {
                experimentalForceLongPolling: true,
              },
              databaseId
            )
          : initializeFirestore(app, {
              experimentalForceLongPolling: true,
            });
      } catch (innerError) {
        db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
      }
    }
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    try {
      db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
    } catch (fallbackError) {
      console.error("Firebase standard getFirestore fallback failed:", fallbackError);
    }
  }
}

export { db, auth };

// ERROR HANDLERS COMPLIANCE
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
