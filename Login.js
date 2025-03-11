// login.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { auth, firestore } from './firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { sendOTP, verifyOTP } from './authFunctions';

const Login = ({ mode, onAuthSuccess }) => {
  const [isNewUser, setIsNewUser] = useState(true);
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [className, setClassName] = useState('');
  const [teacherID, setTeacherID] = useState('');
  const [message, setMessage] = useState('');

  // const handleSignUp = async () => {
  //   try {
  //     await sendOTP(email);
  //     await createUserWithEmailAndPassword(auth, email, password);
  //     const userDetails = {
  //       name,
  //       email,
  //       ...(mode === 'student' ? { rollNumber, className } : { teacherID }),
  //     };
  //     await setDoc(doc(firestore, mode === 'student' ? 'students' : 'teachers', email), userDetails);
  //     setIsNewUser(false);
  //     setMessage('OTP sent to your email.');
  //   } catch (error) {
  //     console.error(error);
  //     setMessage('Sign up failed. Please try again.');
  //   }
  // };

  // const handleOTPVerification = async () => {
  //   try {
  //     await verifyOTP(email, otp);
  //     setIsOTPVerified(true);
  //     const userDetails = {
  //       name,
  //       email,
  //       ...(mode === 'student' ? { rollNumber, className } : { teacherID }),
  //     };
  //     await setDoc(doc(firestore, mode === 'student' ? 'students' : 'teachers', email), userDetails);
  //     onAuthSuccess();
  //   } catch (error) {
  //     console.error(error);
  //     setMessage('OTP verification failed. Please try again.');
  //   }
  // };

  // login.js - Updated handleSignUp
const handleSignUp = async () => {
  try {
    await sendOTP(email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid; // Get UID
    const userDetails = {
      name,
      email,
      ...(mode === 'student' ? { rollNumber, className } : { teacherID }),
    };
    // Use UID as document ID
    await setDoc(doc(firestore, mode === 'student' ? 'students' : 'teachers', uid), userDetails);
    setIsNewUser(false);
    setMessage('OTP sent to your email.');
  } catch (error) {
    console.error(error);
    setMessage('Sign up failed. Please try again.');
  }
};

// Update handleOTPVerification to use UID if needed
const handleOTPVerification = async () => {
  try {
    await verifyOTP(email, otp);
    setIsOTPVerified(true);
    // Ensure user is logged in and get UID
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");
    const uid = user.uid;
    const userDetails = {
      name,
      email,
      ...(mode === 'student' ? { rollNumber, className } : { teacherID }),
    };
    // Use UID here as well
    await setDoc(doc(firestore, mode === 'student' ? 'students' : 'teachers', uid), userDetails);
    onAuthSuccess();
  } catch (error) {
    console.error(error);
    setMessage('OTP verification failed. Please try again.');
  }
};  

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onAuthSuccess();
    } catch (error) {
      console.error(error);
      setMessage('Login failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {isNewUser ? (
        !isOTPVerified ? (
          <View style={styles.authContainer}>
            <Text style={styles.titleText}>Sign Up</Text>
            <TextInput
              style={styles.inputBox}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            {mode === 'student' && (
              <>
                <TextInput
                  style={styles.inputBox}
                  placeholder="Roll Number"
                  value={rollNumber}
                  onChangeText={setRollNumber}
                />
                <TextInput
                  style={styles.inputBox}
                  placeholder="Class"
                  value={className}
                  onChangeText={setClassName}
                />
              </>
            )}
            {mode === 'teacher' && (
              <TextInput
                style={styles.inputBox}
                placeholder="Teacher ID"
                value={teacherID}
                onChangeText={setTeacherID}
              />
            )}
            <TextInput
              style={styles.inputBox}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.inputBox}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <Button title="Sign Up" onPress={handleSignUp} />
            <Text>{message}</Text>
          </View>
        ) : (
          <View style={styles.authContainer}>
            <TextInput
              style={styles.inputBox}
              placeholder="OTP"
              value={otp}
              onChangeText={setOtp}
            />
            <Button title="Verify OTP" onPress={handleOTPVerification} />
            <Text>{message}</Text>
          </View>
        )
      ) : (
        <View style={styles.authContainer}>
          <TextInput
            style={styles.inputBox}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.inputBox}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button title="Login" onPress={handleLogin} />
          <Text>{message}</Text>
        </View>
      )}
    </View>
  );
};

export default Login;

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeContainer: {
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonSpacing: {
    marginVertical: 10,
  },
  inputBox: {
    height: 40,
    width: 300,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
};
