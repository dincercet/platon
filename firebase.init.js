import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import firebaseClientConfig from "./firebaseClientConfig";

// Initialize Firebase
const app = initializeApp(firebaseClientConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
export default auth;
