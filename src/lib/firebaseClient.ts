import {initializeApp, getApps} from 'firebase/app';
import { getAuth,  GoogleAuthProvider, signInWithPopup} from 'firebase/auth';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log("Firebase Config:", firebaseConfig)

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider()

export const messaging: Messaging|null = null;
typeof window !== 'undefined' ? getMessaging(app) : null;

// request FCM token
export const requestForToken = async (setTokenFound: (found: boolean) => void) => {
  try {
    if (!messaging) return;
    const currentToken = await getToken(messaging, {vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY});
    console.log('current token for client: ', currentToken);
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
    return null;
  }
};

// in app notifications
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    })
  });

export default app;