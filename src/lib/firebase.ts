import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  getDocFromServer,
  increment
} from 'firebase/firestore';
import { PromptItem, AdminUser, SiteSettings, HubCategory } from '../types';

export const firebaseConfig = {
  apiKey: "AIzaSyB0ZlVVUr54sdoWlJM-5zIWqEHVttEyBGw",
  authDomain: "promet-b9327.firebaseapp.com",
  projectId: "promet-b9327",
  storageBucket: "promet-b9327.firebasestorage.app",
  messagingSenderId: "758616201477",
  appId: "1:758616201477:web:38694e733d26460795bf6c",
  measurementId: "G-TS0LYXTR9V"
};

// Initialize Firebase safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

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
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
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
  console.warn('Firestore Warning/Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Connection test helper
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase client appears offline or connecting.");
      return false;
    }
    // Any response from server confirms server reachable
    return true;
  }
}

// ==========================================
// Firestore Realtime Data Operations
// ==========================================

// Prompts synchronization
export function subscribeToPrompts(
  onData: (prompts: PromptItem[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, 'prompts');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: PromptItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'prompts');
      onError?.(error);
    }
  );
}

export async function savePromptToFirestore(prompt: PromptItem): Promise<void> {
  try {
    const docRef = doc(db, 'prompts', prompt.id);
    await setDoc(docRef, prompt, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `prompts/${prompt.id}`);
    throw error;
  }
}

export async function recordPromptCopy(promptId: string): Promise<void> {
  try {
    const docRef = doc(db, 'prompts', promptId);
    await updateDoc(docRef, {
      copyCount: increment(1)
    });
  } catch (error) {
    try {
      const docRef = doc(db, 'prompts', promptId);
      await setDoc(docRef, { copyCount: increment(1) }, { merge: true });
    } catch (e) {
      console.warn('Record copy error:', e);
    }
  }
}

export async function updatePromptInFirestore(promptId: string, partial: Partial<PromptItem>): Promise<void> {
  try {
    const docRef = doc(db, 'prompts', promptId);
    await updateDoc(docRef, partial as any);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `prompts/${promptId}`);
    throw error;
  }
}

export async function deletePromptFromFirestore(promptId: string): Promise<void> {
  try {
    const docRef = doc(db, 'prompts', promptId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `prompts/${promptId}`);
    throw error;
  }
}

// Users synchronization
export function subscribeToUsers(
  onData: (users: AdminUser[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, 'users');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: AdminUser[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
      onError?.(error);
    }
  );
}

export async function saveUserToFirestore(user: AdminUser): Promise<void> {
  try {
    const docRef = doc(db, 'users', user.id);
    await setDoc(docRef, user, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
    throw error;
  }
}

export async function deleteUserFromFirestore(userId: string): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
    throw error;
  }
}

// Site Settings synchronization
export function subscribeToSiteSettings(
  onData: (settings: SiteSettings) => void,
  onError?: (err: any) => void
) {
  const docRef = doc(db, 'settings', 'site');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as SiteSettings);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/site');
      onError?.(error);
    }
  );
}

export async function saveSiteSettingsToFirestore(settings: SiteSettings): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'site');
    await setDoc(docRef, settings, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/site');
    throw error;
  }
}

// Categories synchronization
export function subscribeToCategories(
  onData: (categories: HubCategory[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, 'categories');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: HubCategory[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      if (items.length > 0) {
        onData(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'categories');
      onError?.(error);
    }
  );
}

export async function saveCategoryToFirestore(category: HubCategory): Promise<void> {
  try {
    const docRef = doc(db, 'categories', category.id);
    await setDoc(docRef, category, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `categories/${category.id}`);
    throw error;
  }
}

export async function deleteCategoryFromFirestore(categoryId: string): Promise<void> {
  try {
    const docRef = doc(db, 'categories', categoryId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `categories/${categoryId}`);
    throw error;
  }
}

export async function saveCategoriesToFirestore(categories: HubCategory[]): Promise<void> {
  try {
    for (const cat of categories) {
      await saveCategoryToFirestore(cat);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'categories');
    throw error;
  }
}

// Purge any mock/dummy seeded items from Firestore
export async function purgeMockDataFromFirestore(): Promise<void> {
  try {
    const promptsSnap = await getDocs(collection(db, 'prompts'));
    for (const docSnap of promptsSnap.docs) {
      const id = docSnap.id;
      const data = docSnap.data();
      // Detect dummy/mock prompts
      if (
        id.startsWith('p-') ||
        id.startsWith('p1') ||
        id.startsWith('p2') ||
        id.startsWith('p3') ||
        id === 'p-1' ||
        data?.creator?.handle === '@laith_ai' ||
        data?.creator?.handle === '@ahmed_uiux' ||
        data?.creator?.handle === '@sara_cyber' ||
        data?.creator?.handle === '@omar_flux' ||
        data?.creator?.handle === '@dr_yasmin_ai' ||
        data?.creator?.handle === '@khalid_animator' ||
        data?.creator?.handle === '@reem_photo' ||
        data?.creator?.handle === '@zayd_3d' ||
        data?.creator?.handle === '@mira_game'
      ) {
        await deleteDoc(doc(db, 'prompts', id));
      }
    }

    const usersSnap = await getDocs(collection(db, 'users'));
    for (const docSnap of usersSnap.docs) {
      const id = docSnap.id;
      if (id.startsWith('u-')) {
        await deleteDoc(doc(db, 'users', id));
      }
    }
  } catch (e) {
    console.warn('Purge mock note:', e);
  }
}

// Batch Seed helper ONLY for categories and site settings
export async function seedInitialDataIfEmpty(
  initialCategories: HubCategory[],
  initialSettings: SiteSettings
) {
  try {
    const categoriesSnap = await getDocs(collection(db, 'categories'));
    if (categoriesSnap.empty) {
      for (const cat of initialCategories) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
    }

    const settingsSnap = await getDoc(doc(db, 'settings', 'site'));
    if (!settingsSnap.exists()) {
      await setDoc(doc(db, 'settings', 'site'), initialSettings);
    }
  } catch (e) {
    console.warn('Initial seeding skipped or encountered permissions:', e);
  }
}

// ==========================================
// Firebase Auth Services
// ==========================================

export async function loginWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    if (fbUser) {
      const userProfile: AdminUser = {
        id: fbUser.uid,
        name: fbUser.displayName || 'Google User',
        username: fbUser.email ? fbUser.email.split('@')[0] : 'user',
        email: fbUser.email || '',
        avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
        role: fbUser.email === 'laieth772@gmail.com' ? 'admin' : 'member',
        status: 'active',
        promptsCount: 0,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      await saveUserToFirestore(userProfile).catch(() => {});
    }
    return result.user;
  } catch (error: any) {
    if (error?.code === 'auth/unauthorized-domain') {
      console.warn(
        `[Firebase Auth] Domain not authorized: "${typeof window !== 'undefined' ? window.location.hostname : ''}". ` +
        `Please add this domain in Firebase Console -> Authentication -> Settings -> Authorized domains.`
      );
    } else if (error?.code !== 'auth/popup-closed-by-user') {
      console.error('Google Sign-In failed:', error);
    }
    throw error;
  }
}

export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

export async function registerWithEmail(email: string, pass: string, displayName?: string): Promise<FirebaseUser> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && result.user) {
    await updateProfile(result.user, { displayName });
  }
  const fbUser = result.user;
  if (fbUser) {
    const userProfile: AdminUser = {
      id: fbUser.uid,
      name: displayName || fbUser.email?.split('@')[0] || 'Member',
      username: fbUser.email ? fbUser.email.split('@')[0] : 'member',
      email: fbUser.email || '',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
      role: fbUser.email === 'laieth772@gmail.com' ? 'admin' : 'member',
      status: 'active',
      promptsCount: 0,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    await saveUserToFirestore(userProfile).catch(() => {});
  }
  return result.user;
}

export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

export { onAuthStateChanged, type FirebaseUser };
