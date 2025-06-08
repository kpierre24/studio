
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Enhanced logging for environment variables
if (process.env.NODE_ENV === 'development') {
  console.log('--- Firebase Environment Variables Read by Next.js ---');
  console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
  console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
  console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID);
  console.log('NEXT_PUBLIC_FIREBASE_APP_ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID);
  console.log('----------------------------------------------------');
}

const requiredEnvVars: Array<keyof FirebaseOptions | string> = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

const missingEnvVars = requiredEnvVars.filter(varName => {
  const value = process.env[varName as keyof NodeJS.ProcessEnv];
  return !value || value.trim() === '';
});

if (missingEnvVars.length > 0 && process.env.NODE_ENV === 'development') {
  const errorMessage = `FIREBASE_INIT_ERROR: The following Firebase environment variables are missing or undefined: ${missingEnvVars.join(', ')}. 
Please ensure your .env.local file is in the project root, correctly formatted with NEXT_PUBLIC_ prefixes, and contains valid values for these variables. 
You MUST RESTART your development server after any changes to .env.local.`;
  console.error(errorMessage);
  // It might be useful to throw an error here to prevent the app from partially running with invalid config
  // throw new Error(errorMessage); 
}

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// For debugging purposes during development
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase Config Object being passed to initializeApp:', firebaseConfig);
  if (!firebaseConfig.apiKey) {
    // This specific check for apiKey can be redundant if the above loop catches it, but good for emphasis.
    console.error('FIREBASE_INIT_ERROR: Firebase API Key in the firebaseConfig object is undefined. This confirms an issue with environment variable loading or the variable itself.');
  }
}

// Initialize Firebase
let app: ReturnType<typeof initializeApp> | undefined;
if (!getApps().length) {
  try {
    // Only attempt to initialize if all required config values seem present (basic check)
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
      app = initializeApp(firebaseConfig);
    } else if (process.env.NODE_ENV === 'development') {
      console.warn("FIREBASE_INIT_SKIPPED: Firebase initialization skipped due to missing critical configuration (apiKey or projectId). Check previous logs for missing environment variables.");
    }
  } catch (error: any) {
    console.error("FIREBASE_INIT_CRITICAL_ERROR: Failed to initialize Firebase app. This is often due to an invalid configuration object. Please check the Firebase config details logged above.", error);
  }
} else {
  app = getApp();
}

// Conditionally get services if app was initialized
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const storage = app ? getStorage(app) : null;

if (process.env.NODE_ENV === 'development' && !app) {
  console.warn("Firebase app object is not available. Firebase services (Auth, Firestore, Storage) will be null. This usually means initialization failed or was skipped due to configuration issues.");
}

// Firebase Emulator setup (uncomment if using emulators)
// Ensure services are not null before trying to connect emulators
// if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
//   console.log('Attempting to connect to Firebase Emulators...');
//   try {
//     if (auth) connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true }); else console.warn("Auth service not available for emulator connection.");
//     if (db) connectFirestoreEmulator(db, 'localhost', 8080); else console.warn("Firestore service not available for emulator connection.");
//     if (storage) connectStorageEmulator(storage, 'localhost', 9199); else console.warn("Storage service not available for emulator connection.");
//     console.log('Emulator connection attempt finished.');
//   } catch (error) {
//     console.error('Error connecting to Firebase Emulators:', error);
//   }
// }

export { app, auth, db, storage };
