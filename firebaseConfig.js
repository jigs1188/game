// firebaseConfig.js
import { Platform } from "react-native";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCtZYo_fDzltyzia2OudNT2nREHaivzWZM",
  authDomain: "shortestpathgame.firebaseapp.com",
  projectId: "shortestpathgame",
  storageBucket: "shortestpathgame.appspot.com",
  messagingSenderId: "790039352621",
  appId: "1:790039352621:web:a12e6c30623511c5472fa4",
  measurementId: "G-2JDX4FSPR6",
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

let auth;
if (Platform.OS === "web") {
  // On web, import from the standard Firebase Auth module.
  const { getAuth } = require("firebase/auth");
  auth = getAuth(app);
} else {
  // On Android (or other native platforms), import from the react-native-specific module.
  const { initializeAuth, getReactNativePersistence } = require("firebase/auth");
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
}

export { auth, firestore };
