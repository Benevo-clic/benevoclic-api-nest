import * as firebaseAdmin from 'firebase-admin';
import { config } from './env.config';

export const initializeFirebase = () => {
  if (firebaseAdmin.apps.length === 0) {
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert({
        projectId: config.firebase.projectId,
        privateKey: config.firebase.privateKey.replace(/\\n/g, '\n'), // Replace escaped newlines
        clientEmail: config.firebase.clientEmail,
      }),
    });
  }
};
