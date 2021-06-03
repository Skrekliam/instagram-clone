import firebase from "firebase";

const firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyBovb62GEaz24BoxIelrRioRSToURNtQdU",
  authDomain: "skrekliam-instagram-clone.firebaseapp.com",
  databaseURL:
    "https://skrekliam-instagram-clone-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "skrekliam-instagram-clone",
  storageBucket: "skrekliam-instagram-clone.appspot.com",
  messagingSenderId: "1018423187125",
  appId: "1:1018423187125:web:1d81fbefd01d1889cf50fc",
  measurementId: "G-K1KHB1KJ31",
});

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export { db, auth, storage };
