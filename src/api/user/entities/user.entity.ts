import { UserRole } from '../../../common/enums/roles.enum';
import { Location, Image } from '../../../common/type/usersInfo.type';

export class User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
  isOnline: boolean;
  disabled: boolean;
  isVerified: boolean;
  location?: Location;
  imageProfile?: Image;
  lastConnection: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}
