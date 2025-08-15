import { ApiProperty } from '@nestjs/swagger';

export class AnnouncementStatsDto {
  @ApiProperty({ description: "Nombre total d'annonces" })
  totalAnnouncements: number;

  @ApiProperty({ description: "Nombre d'annonces actives" })
  activeAnnouncements: number;

  @ApiProperty({ description: "Nombre d'annonces terminées" })
  completedAnnouncements: number;

  @ApiProperty({ description: "Nombre d'annonces annulées" })
  cancelledAnnouncements: number;

  @ApiProperty({ description: 'Taux de complétion des annonces (%)' })
  completionRate: number;

  @ApiProperty({ description: 'Moyenne des participants par annonce' })
  averageParticipantsPerAnnouncement: number;

  @ApiProperty({ description: 'Moyenne des bénévoles par annonce' })
  averageVolunteersPerAnnouncement: number;
}

export class ParticipantStatsDto {
  @ApiProperty({ description: 'Nombre total de participants uniques' })
  totalUniqueParticipants: number;

  @ApiProperty({ description: 'Nombre total de participations' })
  totalParticipations: number;

  @ApiProperty({ description: 'Nombre de nouveaux participants ce mois' })
  newParticipantsThisMonth: number;

  @ApiProperty({ description: 'Taux de rétention des participants (%)' })
  retentionRate: number;

  @ApiProperty({ description: 'Participant le plus actif' })
  mostActiveParticipant: {
    id: string;
    name: string;
    participations: number;
  };
}

export class VolunteerStatsDto {
  @ApiProperty({ description: 'Nombre total de bénévoles uniques' })
  totalUniqueVolunteers: number;

  @ApiProperty({ description: 'Nombre total de participations bénévoles' })
  totalVolunteerParticipations: number;

  @ApiProperty({ description: 'Nombre de nouveaux bénévoles ce mois' })
  newVolunteersThisMonth: number;

  @ApiProperty({ description: 'Taux de rétention des bénévoles (%)' })
  retentionRate: number;

  @ApiProperty({ description: 'Bénévole le plus actif' })
  mostActiveVolunteer: {
    id: string;
    name: string;
    participations: number;
  };

  @ApiProperty({ description: "Nombre de bénévoles en liste d'attente" })
  volunteersInWaitingList: number;
}

export class EngagementStatsDto {
  @ApiProperty({ description: "Taux d'engagement global (%)" })
  overallEngagementRate: number;

  @ApiProperty({ description: 'Taux de remplissage moyen des événements (%)' })
  averageEventFillRate: number;

  @ApiProperty({ description: 'Événement le plus populaire' })
  mostPopularEvent: {
    id: string;
    name: string;
    participants: number;
    volunteers: number;
  };

  @ApiProperty({ description: 'Événement avec le meilleur taux de remplissage' })
  bestFillRateEvent: {
    id: string;
    name: string;
    fillRate: number;
  };
}

export class TimeSeriesDataDto {
  @ApiProperty({ description: 'Date' })
  date: string;

  @ApiProperty({ description: "Nombre d'annonces publiées" })
  announcements: number;

  @ApiProperty({ description: 'Nombre de participants' })
  participants: number;

  @ApiProperty({ description: 'Nombre de bénévoles' })
  volunteers: number;

  @ApiProperty({ description: "Taux d'engagement" })
  engagementRate: number;
}

export class EventTypeStatsDto {
  @ApiProperty({ description: "Type d'événement" })
  eventType: string;

  @ApiProperty({ description: "Nombre d'événements" })
  count: number;

  @ApiProperty({ description: 'Taux de complétion (%)' })
  completionRate: number;

  @ApiProperty({ description: 'Moyenne des participants' })
  averageParticipants: number;
}

export class AssociationDashboardResponseDto {
  @ApiProperty({ description: 'Statistiques des annonces' })
  announcementStats: AnnouncementStatsDto;

  @ApiProperty({ description: 'Statistiques des participants' })
  participantStats: ParticipantStatsDto;

  @ApiProperty({ description: 'Statistiques des bénévoles' })
  volunteerStats: VolunteerStatsDto;

  @ApiProperty({ description: "Statistiques d'engagement" })
  engagementStats: EngagementStatsDto;

  @ApiProperty({ description: 'Données temporelles', type: [TimeSeriesDataDto] })
  timeSeriesData: TimeSeriesDataDto[];

  @ApiProperty({ description: "Statistiques par type d'événement", type: [EventTypeStatsDto] })
  eventTypeStats: EventTypeStatsDto[];

  @ApiProperty({ description: 'Période analysée' })
  period: {
    startDate: string;
    endDate: string;
  };
}
