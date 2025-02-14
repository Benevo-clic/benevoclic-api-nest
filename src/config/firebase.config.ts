import * as firebaseAdmin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

export const initializeFirebase = () => {
  if (firebaseAdmin.apps.length === 0) {
    // Essayer d'abord les variables d'environnement
    if (process.env.FIREBASE_PRIVATE_KEY) {
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    } else {
      // Utiliser le fichier serviceAccountKey.json
      const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount),
      });
    }
  }
};
