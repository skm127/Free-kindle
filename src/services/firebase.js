import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCcBI8QYuPtCDru5DIuU34bip8zPQtY5eg',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'free-kindle-bae2f.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'free-kindle-bae2f',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'free-kindle-bae2f.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '193695543739',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:193695543739:web:1508a4818588f4fb31549e',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-Y6PCWPEX0H'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const microsoftProvider = new OAuthProvider('microsoft.com');
microsoftProvider.setCustomParameters({ prompt: 'select_account' });

const formatFirebaseUser = (firebaseUser) => {
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Reader',
    photoURL: firebaseUser.photoURL || null,
    provider: firebaseUser.providerData?.[0]?.providerId || 'password'
  };
};

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return formatFirebaseUser(result.user);
};

export const signInWithMicrosoft = async () => {
  const result = await signInWithPopup(auth, microsoftProvider);
  return formatFirebaseUser(result.user);
};

export const registerWithEmail = async (email, password, displayName) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(result.user, { displayName });
  }
  return formatFirebaseUser({ ...result.user, displayName });
};

export const loginWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return formatFirebaseUser(result.user);
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const resetUserPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(formatFirebaseUser(user));
  });
};
