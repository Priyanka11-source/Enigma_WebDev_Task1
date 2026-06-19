import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if Firebase config has placeholder values
const isInvalidConfig = Object.values(firebaseConfig).some(val => 
  typeof val === 'string' && (val.includes('test_') || val.includes('YOUR_') || val.includes('replace_with'))
);

let app, auth, db;

if (isInvalidConfig) {
  console.warn('⚠️  Firebase credentials are using test/placeholder values. Please configure valid credentials in .env.local');
  console.warn('   See SECURITY_SETUP.md for instructions on setting up Firebase credentials.');
  
  // Create dummy/mock objects for development
  app = { config: firebaseConfig };
  auth = { currentUser: null };
  db = { projectId: firebaseConfig.projectId };
} else {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app, "ai-studio-7ae13ecc-07ff-4eb7-accc-4e1d8cbbe44b");
  } catch (error) {
    console.error('🔴 Firebase initialization failed:', error.message);
    console.error('   Please verify your Firebase credentials in .env.local are correct.');
    
    // Fallback mock objects
    app = { config: firebaseConfig };
    auth = { currentUser: null };
    db = { projectId: firebaseConfig.projectId };
  }
}

export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

export function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export { app, auth, db };
