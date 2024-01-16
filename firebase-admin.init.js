var admin = require("firebase-admin");
var serviceAccountKey = require("./firebaseAdminConfig.json");

//check if already initialized
!admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccountKey),
    })
  : admin.app();

module.exports = admin;
