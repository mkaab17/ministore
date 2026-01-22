import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration (provided by user)
const firebaseConfig = {
    apiKey: "AIzaSyA19clt5dSgNFiku34ME1BMAVuJowKJoTs",
    authDomain: "ministore-becac.firebaseapp.com",
    projectId: "ministore-becac",
    storageBucket: "ministore-becac.firebasestorage.app",
    messagingSenderId: "848180057265",
    appId: "1:848180057265:web:ec5fafb90dcc4db5f67e90"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and Export Services (Crucial for the app to function)
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
