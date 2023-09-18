// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getFirestore } from 'firebase/firestore'; // adgang til firebase databasen
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDU7URfr9ZcDj7uNTi9tQNYnrhvKNGNDUA",
  authDomain: "notesproject-133b0.firebaseapp.com",
  projectId: "notesproject-133b0",
  storageBucket: "notesproject-133b0.appspot.com",
  messagingSenderId: "901694126411",
  appId: "1:901694126411:web:28a59c58ef240af2fc10ce"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// vi gemmer vores database
const database = getFirestore(app)

const storage = getStorage(app);


// Vi eksportere appen og database så den er synlig i andre filer
export { app, database, storage }
