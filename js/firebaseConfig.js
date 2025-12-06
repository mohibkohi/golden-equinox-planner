// Firebase Configuration
// TODO: Replace the 'YOUR_...' placeholders with your actual config from the Firebase Console

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "golden-equinox-planner.firebaseapp.com",
    projectId: "golden-equinox-planner",
    storageBucket: "golden-equinox-planner.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
// We check if firebase is defined to avoid errors if the script tags failed to load
let app, db, auth;

if (typeof firebase !== 'undefined') {
    try {
        app = firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        auth = firebase.auth();
        console.log("Firebase initialized");
    } catch (e) {
        console.error("Firebase initialization failed:", e);
        // Fallback or alert user
        alert("Firebase Config Missing! Please update js/firebaseConfig.js with your keys.");
    }
} else {
    console.error("Firebase SDK not loaded");
}

export { app, db, auth };
