import { initializeApp, getApps, getApp } from "firebase/app";
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

let app;
let db: any = null;

if (!isFirebasePlaceholder) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    // Use initializeFirestore with persistent local cache and experimentalForceLongPolling: true
    // to ensure reliable connection behind sandboxed environments and handle offline states.
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
        experimentalForceLongPolling: true,
      });
    } catch (cacheError) {
      console.warn("Firestore initialization with cache failed, falling back to simple long polling:", cacheError);
      try {
        db = initializeFirestore(app, {
          experimentalForceLongPolling: true,
        });
      } catch (innerError) {
        db = getFirestore(app);
      }
    }
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    try {
      db = getFirestore(app);
    } catch (fallbackError) {
      console.error("Firebase standard getFirestore fallback failed:", fallbackError);
    }
  }
}

export { db };

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
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
