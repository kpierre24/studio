
import { initializeApp, getApps, getApp, type FirebaseOptions, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage';

// Log environment variables during development for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('--- Firebase Environment Variables Read by Next.js (src/lib/firebase.ts) ---');
  console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET' : 'MISSING/EMPTY');
  console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'SET' : 'MISSING/EMPTY');
  console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'SET' : 'MISSING/EMPTY');
  console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'SET' : 'MISSING/EMPTY');
  console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'SET' : 'MISSING/EMPTY');
  console.log('NEXT_PUBLIC_FIREBASE_APP_ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'SET' : 'MISSING/EMPTY');
  console.log('----------------------------------------------------------------------');
}

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check for missing environment variables
const requiredEnvVars: Array<keyof FirebaseOptions> = [
  'apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'
];
const missingEnvVars = requiredEnvVars.filter(key => !firebaseConfig[key]);

if (missingEnvVars.length > 0 && process.env.NODE_ENV === 'development') {
  const errorMessage = `FIREBASE_INIT_ERROR: The following Firebase environment variables are missing or undefined in firebaseConfig: ${missingEnvVars.join(', ')}. 
This means process.env.NEXT_PUBLIC_... variables were not found.
Please ensure your .env.local file is in the project root, correctly formatted with NEXT_PUBLIC_ prefixes, and contains valid values. 
You MUST RESTART your development server after any changes to .env.local.`;
  console.error(errorMessage);
}


let appSingleton: FirebaseApp | undefined = undefined;
let authSingleton: Auth | null = null;
let dbSingleton: Firestore | null = null;
let storageSingleton: FirebaseStorage | null = null;

function getFirebaseAppInstance(): FirebaseApp | undefined {
  if (appSingleton) {
    return appSingleton;
  }

  if (getApps().length === 0) {
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
      try {
        console.log('[Firebase] Initializing new Firebase app...');
        appSingleton = initializeApp(firebaseConfig);
        console.log('[Firebase] App initialized successfully.');
      } catch (error) {
        console.error('[Firebase] CRITICAL ERROR initializing app:', error);
        appSingleton = undefined;
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Firebase] Initialization SKIPPED: API Key or Project ID is missing in config. Ensure .env.local is correct and server restarted.');
      }
      appSingleton = undefined;
    }
  } else {
    console.log('[Firebase] Getting existing Firebase app instance...');
    appSingleton = getApp();
  }
  return appSingleton;
}

const getFirebaseAuth = (): Auth | null => {
  if (authSingleton) return authSingleton;
  const app = getFirebaseAppInstance();
  if (app) {
    authSingleton = getAuth(app);
    // Firebase Emulator setup (uncomment if using emulators and ensure this runs client-side only if needed)
    // if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    //   try {
    //     connectAuthEmulator(authSingleton, 'http://localhost:9099', { disableWarnings: true });
    //     console.log('[Firebase] Auth Emulator connected.');
    //   } catch (e) { console.warn('[Firebase] Auth Emulator connection failed.', e); }
    // }
    return authSingleton;
  }
  console.warn('[Firebase] Auth service NOT available because app instance is missing.');
  return null;
};

const getFirebaseDb = (): Firestore | null => {
  if (dbSingleton) return dbSingleton;
  const app = getFirebaseAppInstance();
  if (app) {
    dbSingleton = getFirestore(app);
    // if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    //   try {
    //     connectFirestoreEmulator(dbSingleton, 'localhost', 8080);
    //     console.log('[Firebase] Firestore Emulator connected.');
    //   } catch (e) { console.warn('[Firebase] Firestore Emulator connection failed.', e); }
    // }
    return dbSingleton;
  }
  console.warn('[Firebase] Firestore service NOT available because app instance is missing.');
  return null;
};

const getFirebaseStorage = (): FirebaseStorage | null => {
  if (storageSingleton) return storageSingleton;
  const app = getFirebaseAppInstance();
  if (app) {
    storageSingleton = getStorage(app);
    // if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    //   try {
    //     connectStorageEmulator(storageSingleton, 'localhost', 9199);
    //     console.log('[Firebase] Storage Emulator connected.');
    //   } catch (e) { console.warn('[Firebase] Storage Emulator connection failed.', e); }
    // }
    return storageSingleton;
  }
  console.warn('[Firebase] Storage service NOT available because app instance is missing.');
  return null;
};

// Exporting the app instance getter might be useful for some advanced scenarios, but typically service getters are sufficient.
export { getFirebaseAppInstance as app, getFirebaseAuth, getFirebaseDb, getFirebaseStorage };
