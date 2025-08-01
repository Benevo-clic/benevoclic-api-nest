import { UserRole } from '../../../common/enums/roles.enum';
import { Location, Image } from '../../../common/type/usersInfo.type';

export class User {
  userId: string;
  email: string;
  role: UserRole;
  isOnline: boolean;
  disabled: boolean;
  isVerified: boolean;
  isCompleted?: boolean;
  location?: Location;
  imageProfile?: Image;
  avatarFileKey?: string;
  lastConnection: string;
  createdAt: string;
  updatedAt: Date;
}
