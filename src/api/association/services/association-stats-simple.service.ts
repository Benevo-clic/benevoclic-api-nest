import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Announcement } from '../../announcement/entities/announcement.entity';
import { AnnouncementStatus } from '../../announcement/interfaces/announcement.interface';
import { DateTime } from 'luxon';
import {
  AnnouncementStatsDto,
  AssociationDashboardResponseDto,
  EngagementStatsDto,
  EventTypeStatsDto,
  ParticipantStatsDto,
  TimeSeriesDataDto,
  VolunteerStatsDto,
} from '../dto/association-dashboard.dto';
import { AssociationStatsFilterDto } from '../dto/association-stats.dto';

@Injectable()
export class AssociationStatsSimpleService {
  private readonly logger = new Logger(AssociationStatsSimpleService.name);
  private readonly nowParis = DateTime.now().setZone('Europe/Paris');

  async getAssociationDashboard(
    associationId: string,
    filter: AssociationStatsFilterDto,
    announcements: Announcement[],
  ): Promise<AssociationDashboardResponseDto> {
    try {
      this.logger.log(`=== STATS SERVICE DEBUG ===`);
      this.logger.log(`Association ID: ${associationId}`);
      this.logger.log(`Nombre d'annonces reçues: ${announcements.length}`);
      this.logger.log(`Filtres:`, JSON.stringify(filter, null, 2));

      // Définir la période d'analyse
      const startDate = filter.startDate
        ? DateTime.fromISO(filter.startDate).startOf('day')
        : this.nowParis.minus({ months: 12 }).startOf('day'); // 12 mois au lieu de 6

      const endDate = filter.endDate
        ? DateTime.fromISO(filter.endDate).endOf('day')
        : this.nowParis.plus({ months: 6 }).endOf('day'); // +6 mois pour inclure 2025

      this.logger.log(`Période d'analyse: ${startDate.toISO()} à ${endDate.toISO()}`);

      // Filtrer les annonces par période
      let filteredAnnouncements = announcements.filter(a => {
        const pubDate = DateTime.fromJSDate(new Date(a.datePublication));
        return pubDate >= startDate && pubDate <= endDate;
      });

      this.logger.log(`Annonces après filtrage par période: ${filteredAnnouncements.length}`);

      // Appliquer les filtres supplémentaires
      if (filter.eventType) {
        filteredAnnouncements = filteredAnnouncements.filter(a =>
          a.tags?.includes(filter.eventType!),
        );
      }

      if (filter.status) {
        filteredAnnouncements = filteredAnnouncements.filter(a => a.status === filter.status);
      }

      // Calculer les statistiques
      this.logger.log(`Calcul des statistiques des annonces...`);
      const announcementStats = this.calculateAnnouncementStats(filteredAnnouncements);

      this.logger.log(`Calcul des statistiques des participants...`);
      const participantStats = this.calculateParticipantStats(filteredAnnouncements, startDate);

      this.logger.log(`Calcul des statistiques des bénévoles...`);
      const volunteerStats = this.calculateVolunteerStats(filteredAnnouncements, startDate);

      this.logger.log(`Calcul des statistiques d'engagement...`);
      const engagementStats = this.calculateEngagementStats(filteredAnnouncements);

      this.logger.log(`Calcul des données de série temporelle...`);
      const timeSeriesData = this.calculateTimeSeriesData(
        filteredAnnouncements,
        startDate,
        endDate,
      );

      this.logger.log(`Calcul des statistiques par type d'événement...`);
      const eventTypeStats = this.calculateEventTypeStats(filteredAnnouncements);

      const result = {
        announcementStats,
        participantStats,
        volunteerStats,
        engagementStats,
        timeSeriesData,
        eventTypeStats,
        period: {
          startDate: startDate.toISO(),
          endDate: endDate.toISO(),
        },
      };

      this.logger.log(`Résultats finaux:`, {
        totalAnnouncements: result.announcementStats.totalAnnouncements,
        totalParticipants: result.participantStats.totalUniqueParticipants,
        totalVolunteers: result.volunteerStats.totalUniqueVolunteers,
        engagementRate: result.engagementStats.overallEngagementRate,
      });

      this.logger.log(`=== FIN STATS SERVICE DEBUG ===`);
      return result;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération du dashboard pour l'association: ${associationId}`,
        error.stack,
      );
      throw new InternalServerErrorException('Erreur lors de la récupération du dashboard');
    }
  }

  private calculateAnnouncementStats(announcements: Announcement[]): AnnouncementStatsDto {
    const totalAnnouncements = announcements.length;
    const activeAnnouncements = announcements.filter(
      a => a.status === AnnouncementStatus.ACTIVE,
    ).length;
    const completedAnnouncements = announcements.filter(
      a => a.status === AnnouncementStatus.COMPLETED,
    ).length;
    const cancelledAnnouncements = announcements.filter(
      a => a.status === AnnouncementStatus.INACTIVE,
    ).length;

    const completionRate =
      totalAnnouncements > 0 ? Math.round((completedAnnouncements / totalAnnouncements) * 100) : 0;

    const totalParticipants = announcements.reduce((sum, a) => sum + (a.nbParticipants || 0), 0);
    const totalVolunteers = announcements.reduce((sum, a) => sum + (a.nbVolunteers || 0), 0);

    const averageParticipantsPerAnnouncement =
      totalAnnouncements > 0 ? Math.round((totalParticipants / totalAnnouncements) * 10) / 10 : 0;

    const averageVolunteersPerAnnouncement =
      totalAnnouncements > 0 ? Math.round((totalVolunteers / totalAnnouncements) * 10) / 10 : 0;

    return {
      totalAnnouncements,
      activeAnnouncements,
      completedAnnouncements,
      cancelledAnnouncements,
      completionRate,
      averageParticipantsPerAnnouncement,
      averageVolunteersPerAnnouncement,
    };
  }

  private calculateParticipantStats(
    announcements: Announcement[],
    startDate: DateTime,
  ): ParticipantStatsDto {
    // Collecter tous les participants uniques
    const allParticipants = new Map<string, { id: string; name: string; participations: number }>();

    announcements.forEach(announcement => {
      announcement.participants?.forEach(participant => {
        const existing = allParticipants.get(participant.id);
        if (existing) {
          existing.participations++;
        } else {
          allParticipants.set(participant.id, {
            id: participant.id,
            name: participant.name,
            participations: 1,
          });
        }
      });
    });

    const totalUniqueParticipants = allParticipants.size;
    const totalParticipations = Array.from(allParticipants.values()).reduce(
      (sum, p) => sum + p.participations,
      0,
    );

    // Calculer les nouveaux participants ce mois
    const newParticipantsThisMonth = Array.from(allParticipants.values()).length; // Simplifié

    // Calculer le taux de rétention
    const multiEventParticipants = Array.from(allParticipants.values()).filter(
      p => p.participations > 1,
    ).length;

    const retentionRate =
      totalUniqueParticipants > 0
        ? Math.round((multiEventParticipants / totalUniqueParticipants) * 100)
        : 0;

    // Trouver le participant le plus actif
    const mostActiveParticipant = Array.from(allParticipants.values()).sort(
      (a, b) => b.participations - a.participations,
    )[0] || {
      id: '',
      name: 'Aucun',
      participations: 0,
    };

    return {
      totalUniqueParticipants,
      totalParticipations,
      newParticipantsThisMonth,
      retentionRate,
      mostActiveParticipant,
    };
  }

  private calculateVolunteerStats(
    announcements: Announcement[],
    startDate: DateTime,
  ): VolunteerStatsDto {
    // Collecter tous les bénévoles uniques
    const allVolunteers = new Map<string, { id: string; name: string; participations: number }>();

    announcements.forEach(announcement => {
      announcement.volunteers?.forEach(volunteer => {
        const existing = allVolunteers.get(volunteer.id);
        if (existing) {
          existing.participations++;
        } else {
          allVolunteers.set(volunteer.id, {
            id: volunteer.id,
            name: volunteer.name,
            participations: 1,
          });
        }
      });
    });

    const totalUniqueVolunteers = allVolunteers.size;
    const totalVolunteerParticipations = Array.from(allVolunteers.values()).reduce(
      (sum, v) => sum + v.participations,
      0,
    );

    const newVolunteersThisMonth = Array.from(allVolunteers.values()).length;

    const multiEventVolunteers = Array.from(allVolunteers.values()).filter(
      v => v.participations > 1,
    ).length;

    const retentionRate =
      totalUniqueVolunteers > 0
        ? Math.round((multiEventVolunteers / totalUniqueVolunteers) * 100)
        : 0;

    const mostActiveVolunteer = Array.from(allVolunteers.values()).sort(
      (a, b) => b.participations - a.participations,
    )[0] || {
      id: '',
      name: 'Aucun',
      participations: 0,
    };

    const volunteersInWaitingList = announcements.reduce(
      (sum, a) => sum + (a.volunteersWaiting?.length || 0),
      0,
    );

    return {
      totalUniqueVolunteers,
      totalVolunteerParticipations,
      newVolunteersThisMonth,
      retentionRate,
      mostActiveVolunteer,
      volunteersInWaitingList,
    };
  }

  private calculateEngagementStats(announcements: Announcement[]): EngagementStatsDto {
    if (announcements.length === 0) {
      return {
        overallEngagementRate: 0,
        averageEventFillRate: 0,
        mostPopularEvent: { id: '', name: 'Aucun', participants: 0, volunteers: 0 },
        bestFillRateEvent: { id: '', name: 'Aucun', fillRate: 0 },
      };
    }

    const totalParticipants = announcements.reduce((sum, a) => sum + (a.nbParticipants || 0), 0);
    const totalVolunteers = announcements.reduce((sum, a) => sum + (a.nbVolunteers || 0), 0);
    const totalEngagement = totalParticipants + totalVolunteers;
    const totalEvents = announcements.length;

    const overallEngagementRate =
      totalEvents > 0 ? Math.round((totalEngagement / totalEvents) * 10) / 10 : 0;

    const fillRates = announcements.map(a => {
      const maxCapacity = Math.max(a.maxParticipants || 0, a.maxVolunteers || 0);
      if (maxCapacity === 0) return 0;
      const actualParticipants = (a.nbParticipants || 0) + (a.nbVolunteers || 0);
      return (actualParticipants / maxCapacity) * 100;
    });

    const averageEventFillRate =
      fillRates.length > 0
        ? Math.round(fillRates.reduce((sum, rate) => sum + rate, 0) / fillRates.length)
        : 0;

    const mostPopularEvent = announcements
      .map(a => ({
        id: a.id || '',
        name: a.nameEvent,
        participants: a.nbParticipants || 0,
        volunteers: a.nbVolunteers || 0,
        total: (a.nbParticipants || 0) + (a.nbVolunteers || 0),
      }))
      .sort((a, b) => b.total - a.total)[0];

    const bestFillRateEvent = announcements
      .map(a => {
        const maxCapacity = Math.max(a.maxParticipants || 0, a.maxVolunteers || 0);
        const actualParticipants = (a.nbParticipants || 0) + (a.nbVolunteers || 0);
        const fillRate = maxCapacity > 0 ? (actualParticipants / maxCapacity) * 100 : 0;
        return {
          id: a.id || '',
          name: a.nameEvent,
          fillRate: Math.round(fillRate),
        };
      })
      .sort((a, b) => b.fillRate - a.fillRate)[0];

    return {
      overallEngagementRate,
      averageEventFillRate,
      mostPopularEvent: {
        id: mostPopularEvent.id,
        name: mostPopularEvent.name,
        participants: mostPopularEvent.participants,
        volunteers: mostPopularEvent.volunteers,
      },
      bestFillRateEvent,
    };
  }

  private calculateTimeSeriesData(
    announcements: Announcement[],
    startDate: DateTime,
    endDate: DateTime,
  ): TimeSeriesDataDto[] {
    const timeSeriesData: TimeSeriesDataDto[] = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      const dayStart = currentDate.startOf('day');
      const dayEnd = currentDate.endOf('day');

      const dayAnnouncements = announcements.filter(a => {
        const pubDate = DateTime.fromJSDate(new Date(a.datePublication));
        return pubDate >= dayStart && pubDate <= dayEnd;
      });

      const dayParticipants = dayAnnouncements.reduce((sum, a) => sum + (a.nbParticipants || 0), 0);
      const dayVolunteers = dayAnnouncements.reduce((sum, a) => sum + (a.nbVolunteers || 0), 0);
      const dayEngagement =
        dayAnnouncements.length > 0
          ? Math.round(((dayParticipants + dayVolunteers) / dayAnnouncements.length) * 10) / 10
          : 0;

      timeSeriesData.push({
        date: currentDate.toISODate(),
        announcements: dayAnnouncements.length,
        participants: dayParticipants,
        volunteers: dayVolunteers,
        engagementRate: dayEngagement,
      });

      currentDate = currentDate.plus({ days: 1 });
    }

    return timeSeriesData;
  }

  private calculateEventTypeStats(announcements: Announcement[]): EventTypeStatsDto[] {
    const eventTypeMap = new Map<
      string,
      { count: number; completed: number; totalParticipants: number }
    >();

    announcements.forEach(announcement => {
      const eventTypes = announcement.tags || ['autre'];

      eventTypes.forEach(type => {
        const existing = eventTypeMap.get(type);
        if (existing) {
          existing.count++;
          if (announcement.status === AnnouncementStatus.COMPLETED) {
            existing.completed++;
          }
          existing.totalParticipants += announcement.nbParticipants || 0;
        } else {
          eventTypeMap.set(type, {
            count: 1,
            completed: announcement.status === AnnouncementStatus.COMPLETED ? 1 : 0,
            totalParticipants: announcement.nbParticipants || 0,
          });
        }
      });
    });

    return Array.from(eventTypeMap.entries()).map(([eventType, stats]) => ({
      eventType,
      count: stats.count,
      completionRate: stats.count > 0 ? Math.round((stats.completed / stats.count) * 100) : 0,
      averageParticipants: stats.count > 0 ? Math.round(stats.totalParticipants / stats.count) : 0,
    }));
  }
}
