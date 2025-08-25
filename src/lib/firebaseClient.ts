import {initializeApp} from 'firebase/app';
import { getAuth,  GoogleAuthProvider, signInWithPopup} from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCi8UJab8VMn3j66fy1zsrRTJxw4dEM7Js",
  authDomain: "asva-drive.firebaseapp.com",
  projectId: "asva-drive",
  storageBucket: "asva-drive.firebasestorage.app",
  messagingSenderId: "611614337335",
  appId: "1:611614337335:web:a93f1900f737a1e7c892b2",
  measurementId: "G-ZHX8MRSPGP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider()
const analytics = getAnalytics(app);

export default auth; provider;