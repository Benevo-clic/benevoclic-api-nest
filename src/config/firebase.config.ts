import * as firebaseAdmin from 'firebase-admin';

export const initializeFirebase = () => {
  if (firebaseAdmin.apps.length === 0) {
    // Essayer d'abord les variables d'environnement
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  }
};
