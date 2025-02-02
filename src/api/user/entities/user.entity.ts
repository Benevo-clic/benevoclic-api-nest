import { UserRole } from '../../../common/enums/roles.enum';
import { Location, ProfileImage } from '../../../common/type/usersInfo.type';

export class User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
  isOnline: boolean;
  disabled: boolean;
  isVerified: boolean;
  location?: Location;
  imageProfile?: ProfileImage;
  lastConnection: string;
  createdAt: string;
  updatedAt: Date;
}
