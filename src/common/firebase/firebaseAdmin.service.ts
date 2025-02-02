import * as firebaseAdmin from 'firebase-admin';
import { UserRole } from '../enums/roles.enum';

export class FirebaseAdminService {
  static instance: FirebaseAdminService;

  private constructor() {
    // constructor
  }

  static getInstance() {
    if (!FirebaseAdminService.instance) {
      FirebaseAdminService.instance = new FirebaseAdminService();
    }
    return FirebaseAdminService.instance;
  }

  createUser(user: any) {
    return firebaseAdmin.auth().createUser(user);
  }

  deleteUser(id: string) {
    return firebaseAdmin.auth().deleteUser(id);
  }

  getUser(id: string) {
    return firebaseAdmin.auth().getUser(id);
  }

  getUserByEmail(email: string) {
    return firebaseAdmin.auth().getUserByEmail(email);
  }

  listUsers() {
    return firebaseAdmin.auth().listUsers();
  }

  updateUser(id: string, user: any) {
    return firebaseAdmin.auth().updateUser(id, user);
  }

  async setCustomUserClaims(uid: string, param2: { role: UserRole }) {
    return firebaseAdmin.auth().setCustomUserClaims(uid, param2);
  }
}
