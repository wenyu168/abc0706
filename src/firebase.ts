import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBtSCOOhY4X_QSb2jTcZ3tcZsDhx6fh-zY",
  authDomain: "abc-61ac7.firebaseapp.com",
  projectId: "abc-61ac7",
  storageBucket: "abc-61ac7.firebasestorage.app",
  messagingSenderId: "326550948681",
  appId: "1:326550948681:web:258bdfcfc330d7f3792898"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
