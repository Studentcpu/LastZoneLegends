import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCxMe5lLdpihBo3fwTzAUcsN88Xh9mrGTQ",
  authDomain: "last-zone-legend-f05f2.firebaseapp.com",
  projectId: "last-zone-legend-f05f2",
  storageBucket: "last-zone-legend-f05f2.firebasestorage.app",
  messagingSenderId: "1092329294175",
  appId: "1:1092329294175:web:d01e890a29e9a8976e0eea",
  measurementId: "G-XY8RZZXSQE"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

