import { UserRole } from '../../../common/enums/roles.enum';

export class User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
  isOnline: boolean;
  disabled: boolean;
  lastConnection: string;
  createdAt: string;
  updatedAt: Date;
}
