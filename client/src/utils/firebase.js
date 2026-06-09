import { initializeApp } from "firebase/app";
import {getAuth , GoogleAuthProvider} from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
    authDomain: "qualify-ai-ad0d2.firebaseapp.com",
    projectId: "qualify-ai-ad0d2",
    storageBucket: "qualify-ai-ad0d2.firebasestorage.app",
    messagingSenderId: "878000112761",
    appId: "1:878000112761:web:fdbf995ecc28c220ee40a8",
    measurementId: "G-M9Y073B0LT"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider()

export {auth, provider}

