import { ApiProperty } from '@nestjs/swagger';

export class AnnouncementDetailsDto {
  @ApiProperty({ description: "ID de l'annonce" })
  id: string;

  @ApiProperty({ description: "Nom de l'événement" })
  nameEvent: string;

  @ApiProperty({ description: "Description de l'événement" })
  description: string;

  @ApiProperty({ description: 'Date de publication' })
  datePublication: string;

  @ApiProperty({ description: "Date de l'événement" })
  dateEvent: string;

  @ApiProperty({ description: "Heure de l'événement" })
  hoursEvent: string;

  @ApiProperty({ description: "Tags/catégories de l'événement" })
  tags: string[];

  @ApiProperty({ description: "Statut de l'annonce" })
  status: string;

  @ApiProperty({ description: 'Nombre de participants actuels' })
  nbParticipants: number;

  @ApiProperty({ description: 'Nombre maximum de participants' })
  maxParticipants: number;

  @ApiProperty({ description: 'Nombre de bénévoles actuels' })
  nbVolunteers: number;

  @ApiProperty({ description: 'Nombre maximum de bénévoles' })
  maxVolunteers: number;

  @ApiProperty({ description: 'Taux de remplissage des participants (%)' })
  participantFillRate: number;

  @ApiProperty({ description: 'Taux de remplissage des bénévoles (%)' })
  volunteerFillRate: number;

  @ApiProperty({ description: 'Taux de remplissage global (%)' })
  overallFillRate: number;

  @ApiProperty({ description: 'Liste des participants' })
  participants: Array<{
    id: string;
    name: string;
    isPresent: boolean;
    dateAdded: string;
  }>;

  @ApiProperty({ description: 'Liste des bénévoles' })
  volunteers: Array<{
    id: string;
    name: string;
    isPresent: boolean;
    dateAdded: string;
  }>;

  @ApiProperty({ description: 'Liste des bénévoles en attente' })
  volunteersWaiting: Array<{
    id: string;
    name: string;
  }>;

  @ApiProperty({ description: "Adresse de l'événement" })
  addressAnnouncement?: string;

  @ApiProperty({ description: "Image de l'annonce" })
  announcementImage?: string;

  @ApiProperty({ description: 'Date de création' })
  createdAt: string;

  @ApiProperty({ description: 'Date de dernière modification' })
  updatedAt: string;
}

export class AnnouncementDetailsResponseDto {
  @ApiProperty({ description: 'Liste des annonces avec détails' })
  announcements: AnnouncementDetailsDto[];

  @ApiProperty({ description: "Nombre total d'annonces" })
  total: number;

  @ApiProperty({ description: 'Page actuelle' })
  page: number;

  @ApiProperty({ description: "Nombre d'éléments par page" })
  limit: number;

  @ApiProperty({ description: 'Nombre total de pages' })
  pages: number;
}
