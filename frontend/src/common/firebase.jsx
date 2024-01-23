import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAXvHN_YqjEUGZBBn25mqnk56VcHRehiRw",
  authDomain: "blog-eaa65.firebaseapp.com",
  projectId: "blog-eaa65",
  storageBucket: "blog-eaa65.appspot.com",
  messagingSenderId: "754250388267",
  appId: "1:754250388267:web:8286c483244ab134e8eb6e",
};

const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();
const auth = getAuth();

export const authWithGoogle = async () => {
  let user = null;

  await signInWithPopup(auth, provider)
    .then((result) => {
      user = result.user;
    })
    .catch((err) => {
      console.log(err);
    });
  return user;
};
