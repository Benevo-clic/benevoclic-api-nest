import * as firebaseAdmin from 'firebase-admin';
import { config } from './env.config';

export const initializeFirebase = () => {
  if (firebaseAdmin.apps.length === 0) {
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert({
        projectId: config.firebase.projectId,
        privateKey: config.firebase.privateKey,
        clientEmail: config.firebase.clientEmail,
      }),
    });
  }
};
