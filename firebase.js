// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import{getFirestore} from 'firebase/firestore'
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyALoPPE1M3OJdKPg4MXvgnO7fKqH_OPnjU",
  authDomain: "flashcardsaas-df046.firebaseapp.com",
  projectId: "flashcardsaas-df046",
  storageBucket: "flashcardsaas-df046.appspot.com",
  messagingSenderId: "934213712179",
  appId: "1:934213712179:web:130d75ce5bc4d66164e646",
  measurementId: "G-Y3W0PXMMB8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app)

export {db}