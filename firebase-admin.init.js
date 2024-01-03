import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import serviceAccountKey from "./firebaseAdminConfig.json";

const alreadyCreatedApps = getApps();

//check if already initialized
const app =
  alreadyCreatedApps.length === 0
    ? initializeApp(serviceAccountKey)
    : alreadyCreatedApps[0];

const auth = getAuth(app);
export default auth;
