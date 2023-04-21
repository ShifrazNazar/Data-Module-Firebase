import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBKApBKh68EoLAB00RZbI9GqfNMKlVn5Zw",
    authDomain: "data-modules.firebaseapp.com",
    projectId: "data-modules",
    storageBucket: "data-modules.appspot.com",
    messagingSenderId: "1043803796806",
    appId: "1:1043803796806:web:50b4921012c7f4c644e147",
    measurementId: "G-HC5F2W18LL"
  };

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

export default db;
