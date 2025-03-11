// authFunctions.js
import { auth, firestore } from './firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp, Timestamp } from "firebase/firestore";


// const db = getFirestore();

export const signUpWithEmail = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(userCredential.user);
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    email,
    verified: false,
    level: 0, // First level
  });
};

export const signInWithEmail = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const sendOTP = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save OTP to Firestore with a timestamp
  await setDoc(doc(firestore, "otps", email), {
    otp,
    timestamp: serverTimestamp(),
  });

  // Send OTP via email (you need a Firebase Cloud Function for this)
  await sendPasswordResetEmail(auth, email);
};


export const verifyOTP = async (email, otp) => {
  const otpDoc = await getDoc(doc(firestore, "otps", email));

  if (!otpDoc.exists()) {
    throw new Error("OTP not found");
  }

  const { otp: storedOtp, timestamp } = otpDoc.data();
  const currentTime = Timestamp.now();
  const otpAge = currentTime.seconds - timestamp.seconds;

  if (otpAge > 300) {
    throw new Error("OTP expired");
  }

  if (storedOtp !== otp) {
    throw new Error("Invalid OTP");
  }

  await deleteDoc(doc(firestore, "otps", email));
  return true;
};



export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};
