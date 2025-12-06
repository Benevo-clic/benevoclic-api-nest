import { Entity, PrimaryColumn } from 'typeorm';

@Entity('favorites_announcements')
export class FavoritesAnnouncement {
  @PrimaryColumn()
  volunteerId: string;

  @PrimaryColumn()
  announcementId: string;
}
