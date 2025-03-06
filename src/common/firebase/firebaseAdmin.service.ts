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

  async getCurrentUser(req: any) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Aucun token fourni');
    }

    const idToken = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      return await this.getUser(decodedToken.uid);
    } catch (error) {
      throw new Error('Token invalide ou expiré');
    }
  }

  getUser(id: string) {
    return firebaseAdmin.auth().getUser(id);
  }

  async getUserByEmail(email: string) {
    try {
      return await firebaseAdmin.auth().getUserByEmail(email);
    } catch (error) {
      return null; // Retourne null si l'utilisateur n'est pas trouvé
    }
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
