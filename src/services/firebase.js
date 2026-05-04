import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  increment,
} from 'firebase/firestore';

// ─── Firebase Config ────────────────────────────────────────────────────────
// Replace these with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ecoreward-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ecoreward-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ─── Mock Mode For Demo ────────────────────────────────────────────────────────
const isMock = firebaseConfig.apiKey === "demo-api-key";

let mockUser = {
  uid: "mock-user-123",
  email: "student@univ.edu",
  displayName: "Étudiant Démo",
};

let mockListeners = [];

const notifyMockListeners = (user) => {
  mockListeners.forEach(cb => cb(user));
};

// ─── Auth Services ───────────────────────────────────────────────────────────

export const registerUser = async ({ studentId, fullName, email, password }) => {
  if (isMock) {
    mockUser = { uid: "mock-user-123", email, displayName: fullName };
    notifyMockListeners(mockUser);
    return mockUser;
  }
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;
  await setDoc(doc(db, 'users', uid), {
    uid, studentId, fullName, email, points: 0, totalRecycled: 0,
    createdAt: serverTimestamp(), notificationsEnabled: true, language: 'fr',
    avatar: fullName.charAt(0).toUpperCase(),
  });
  return credential.user;
};

export const loginUser = async (email, password) => {
  if (isMock) {
    notifyMockListeners(mockUser);
    return mockUser;
  }
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
  if (isMock) {
    notifyMockListeners(null);
    return;
  }
  return signOut(auth);
};

export const onAuthChange = (callback) => {
  if (isMock) {
    mockListeners.push(callback);
    // Initial state
    setTimeout(() => callback(null), 100);
    return () => { mockListeners = mockListeners.filter(cb => cb !== callback); };
  }
  return onAuthStateChanged(auth, callback);
};

// ─── User Services ───────────────────────────────────────────────────────────

export const getUserData = async (uid) => {
  if (isMock) {
    return {
      uid,
      studentId: "12345",
      fullName: "Étudiant Démo",
      email: "student@univ.edu",
      points: 1500,
      totalRecycled: 15,
      notificationsEnabled: true,
      language: 'fr',
      avatar: "É"
    };
  }
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

export const subscribeUserData = (uid, callback) => {
  if (isMock) {
    callback({
      uid,
      studentId: "12345",
      fullName: "Étudiant Démo",
      email: "student@univ.edu",
      points: 1500,
      totalRecycled: 15,
      notificationsEnabled: true,
      language: 'fr',
      avatar: "É"
    });
    return () => {};
  }
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    if (snap.exists()) callback(snap.data());
  });
};

export const updateUserProfile = async (uid, data) => {
  if (isMock) return;
  return updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
};

// ─── Rewards Services ────────────────────────────────────────────────────────

export const getRewards = async () => {
  if (isMock) {
    return [
      { id: "1", title: "Café Gratuit", cost: 100, description: "Un café offert à la cafétéria" },
      { id: "2", title: "Repas RU", cost: 500, description: "Un repas complet au Resto U" },
      { id: "3", title: "Bon d'achat 10€", cost: 1000, description: "Bon pour la librairie" },
    ];
  }
  const snap = await getDocs(collection(db, 'rewards'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const redeemReward = async (uid, reward, currentPoints) => {
  if (currentPoints < reward.cost) throw new Error('Points insuffisants');
  if (isMock) return; // Fake success

  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { points: increment(-reward.cost) });
  await addDoc(collection(db, 'history'), {
    uid, type: 'redeem', rewardId: reward.id, rewardTitle: reward.title,
    pointsUsed: reward.cost, createdAt: serverTimestamp(),
  });
};

// ─── History Services ────────────────────────────────────────────────────────

export const getUserHistory = async (uid, limitCount = 10) => {
  if (isMock) {
    return [
      { id: "h1", type: "recycle", points: 50, createdAt: { toDate: () => new Date() } },
      { id: "h2", type: "redeem", rewardTitle: "Café Gratuit", pointsUsed: 100, createdAt: { toDate: () => new Date(Date.now() - 86400000) } }
    ];
  }
  const q = query(
    collection(db, 'history'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
