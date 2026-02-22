import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { Announcement } from '../entities/announcement.entity';
import { AnnouncementStatus } from '../interfaces/announcement.interface';
import { FilterAnnouncementDto } from '../dto/filter-announcement.dto';
import { DateTime } from 'luxon';
import { FilterAssociationAnnouncementDto } from '../dto/filter-association-announcement.dto';

export interface FilterAnnouncementResponse {
  annonces: Announcement[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable()
export class AnnouncementRepository {
  constructor(
    @InjectRepository(Announcement)
    private readonly repository: Repository<Announcement>,
  ) {}

  async findAll(): Promise<Announcement[]> {
    return await this.repository.find();
  }

  async findById(id: string): Promise<Announcement | null> {
    return await this.repository.findOneBy({ id });
  }

  async findByAssociationId(associationId: string): Promise<Announcement[]> {
    return await this.repository.findBy({ associationId });
  }

  async filterAssociationAnnouncements(
    filter: FilterAssociationAnnouncementDto,
  ): Promise<FilterAnnouncementResponse> {
    const {
      associationId,
      nameEvent,
      description,
      status,
      stateEvent,
      hoursEventFrom,
      hoursEventTo,
      dateEventFrom,
      dateEventTo,
      publicationInterval,
      datePublicationFrom,
      datePublicationTo,
      tags,
      sort,
      page = 1,
      limit = 9,
    } = filter;

    const qb = this.repository.createQueryBuilder('announcement');
    qb.where('announcement.associationId = :associationId', { associationId });

    const nowParis = DateTime.now().setZone('Europe/Paris');
    const todayIso = nowParis.toISODate();

    if (stateEvent) {
      switch (stateEvent) {
        case 'PAST':
          qb.andWhere('announcement.dateEvent < :todayIso', { todayIso });
          break;
        case 'UPCOMING':
          qb.andWhere('announcement.dateEvent > :todayIso', { todayIso });
          break;
        case 'NOW':
          qb.andWhere('announcement.dateEvent = :todayIso', { todayIso });
          break;
      }
    }

    if (nameEvent || description) {
      qb.andWhere(
        new Brackets(qb => {
          if (nameEvent) {
            qb.where('announcement.nameEvent ILIKE :nameEvent', { nameEvent: `%${nameEvent}%` });
          }
          if (description) {
            qb.orWhere('announcement.description ILIKE :description', {
              description: `%${description}%`,
            });
          }
        }),
      );
    }

    if (status) {
      qb.andWhere('announcement.status = :status', { status });
    }

    if (hoursEventFrom) {
      qb.andWhere('announcement.hoursEvent >= :hoursEventFrom', { hoursEventFrom });
    }
    if (hoursEventTo) {
      qb.andWhere('announcement.hoursEvent <= :hoursEventTo', { hoursEventTo });
    }

    if (dateEventFrom) {
      qb.andWhere('announcement.dateEvent >= :dateEventFrom', { dateEventFrom });
    }
    if (dateEventTo) {
      qb.andWhere('announcement.dateEvent <= :dateEventTo', { dateEventTo });
    }

    if (publicationInterval) {
      const now = new Date();
      let threshold: Date;
      switch (publicationInterval) {
        case '1h':
          threshold = new Date(now.getTime() - 1 * 60 * 60 * 1000);
          break;
        case '5h':
          threshold = new Date(now.getTime() - 5 * 60 * 60 * 1000);
          break;
        case '1d':
          threshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '1w':
          threshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '1M':
          threshold = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          throw new BadRequestException('Intervalle de publication invalide');
      }
      qb.andWhere('announcement.datePublication >= :threshold', {
        threshold: threshold.toISOString(),
      });
    } else {
      if (datePublicationFrom) {
        qb.andWhere('announcement.datePublication >= :datePublicationFrom', {
          datePublicationFrom,
        });
      }
      if (datePublicationTo) {
        qb.andWhere('announcement.datePublication <= :datePublicationTo', { datePublicationTo });
      }
    }

    if (tags?.length) {
      qb.andWhere('announcement.tags && :tags', { tags });
    }

    if (sort) {
      switch (sort) {
        case 'dateEvent_asc':
          qb.orderBy('announcement.dateEvent', 'ASC');
          break;
        case 'dateEvent_desc':
          qb.orderBy('announcement.dateEvent', 'DESC');
          break;
        case 'datePublication_desc':
        default:
          qb.orderBy('announcement.datePublication', 'DESC');
          break;
      }
    } else {
      qb.orderBy('announcement.datePublication', 'DESC');
    }

    const total = await qb.getCount();
    const docs = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      annonces: docs,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async create(announcement: Announcement): Promise<string> {
    const created = this.repository.create(announcement);
    const saved = await this.repository.save(created);
    return saved.id;
  }

  async updateVolunteer(
    id: string,
    announcement: Partial<Announcement>,
  ): Promise<Partial<Announcement>> {
    await this.repository.update({ id }, announcement);
    return announcement;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete({ id });
    return result.affected === 1;
  }

  async deleteByAssociationId(associationId: string): Promise<boolean> {
    const result = await this.repository.delete({ associationId });
    return result.affected > 0;
  }

  async removeVolunteerWaiting(id: string, volunteerId: string) {
    const announcement = await this.findById(id);
    if (announcement && announcement.volunteersWaiting) {
      announcement.volunteersWaiting = announcement.volunteersWaiting.filter(
        v => v.id !== volunteerId,
      );
      await this.repository.save(announcement);
    }
  }

  async removeVolunteer(id: string, volunteerId: string, nbVolunteers: number) {
    const announcement = await this.findById(id);
    if (announcement && announcement.volunteers) {
      announcement.volunteers = announcement.volunteers.filter(v => v.id !== volunteerId);
      announcement.nbVolunteers = nbVolunteers;
      await this.repository.save(announcement);
    }
  }

  async removeParticipant(id: string, participantId: string, nbParticipants: number) {
    const announcement = await this.findById(id);
    if (announcement && announcement.participants) {
      announcement.participants = announcement.participants.filter(p => p.id !== participantId);
      announcement.nbParticipants = nbParticipants;
      await this.repository.save(announcement);
    }
  }

  async updateStatus(id: string, status: AnnouncementStatus) {
    await this.repository.update({ id }, { status });
    return this.findById(id);
  }

  async update(id: string, updateData: Partial<Announcement>): Promise<void> {
    await this.repository.update(
      { id },
      {
        ...updateData,
        // updatedAt: new Date(), // Entity doesn't have updatedAt currently?
      },
    );
  }

  async updateAssociationNameByAssociationId(
    associationId: string,
    associationName: string,
  ): Promise<void> {
    await this.repository.update({ associationId }, { associationName });
  }

  async findVolunteerInAnnouncementByVolunteerId(volunteerId: string): Promise<Announcement[]> {
    const nowParis = DateTime.now().setZone('Europe/Paris');
    const todayIso = nowParis.toISODate();
    const currentTime = nowParis.toFormat('HH:mm');

    return this.repository
      .createQueryBuilder('announcement')
      .where(
        new Brackets(qb => {
          qb.where('announcement.volunteers @> :volunteer', {
            volunteer: JSON.stringify([{ id: volunteerId }]),
          }).orWhere('announcement.volunteersWaiting @> :volunteer', {
            volunteer: JSON.stringify([{ id: volunteerId }]),
          });
        }),
      )
      .andWhere(
        new Brackets(qb => {
          qb.where('announcement.dateEvent > :todayIso', { todayIso }).orWhere(
            new Brackets(subQb => {
              subQb
                .where('announcement.dateEvent = :todayIso', { todayIso })
                .andWhere('announcement.hoursEvent >= :currentTime', { currentTime });
            }),
          );
        }),
      )
      .andWhere('announcement.isHidden != :isHidden', { isHidden: true })
      .andWhere('announcement.status != :status', { status: AnnouncementStatus.INACTIVE })
      .getMany();
  }

  async findPastAnnouncementsByParticipantId(participantId: string): Promise<Announcement[]> {
    const nowParis = DateTime.now().setZone('Europe/Paris');
    const todayIso = nowParis.toISODate();
    const currentTime = nowParis.toFormat('HH:mm');

    return this.repository
      .createQueryBuilder('announcement')
      .where(
        new Brackets(qb => {
          qb.where('announcement.participants @> :participant', {
            participant: JSON.stringify([{ id: participantId }]),
          }).orWhere('announcement.volunteers @> :participant', {
            participant: JSON.stringify([{ id: participantId }]),
          });
        }),
      )
      .andWhere(
        new Brackets(qb => {
          qb.where('announcement.dateEvent < :todayIso', { todayIso }).orWhere(
            new Brackets(subQb => {
              subQb
                .where('announcement.dateEvent = :todayIso', { todayIso })
                .andWhere('announcement.hoursEvent <= :currentTime', { currentTime });
            }),
          );
        }),
      )
      .andWhere('announcement.isHidden != :isHidden', { isHidden: true })
      .andWhere('announcement.status != :status', { status: AnnouncementStatus.INACTIVE })
      .getMany();
  }

  async findParticipantInParticipantsByParticipantId(
    participantId: string,
  ): Promise<Announcement[]> {
    const nowParis = DateTime.now().setZone('Europe/Paris');
    const todayIso = nowParis.toISODate();
    const currentTime = nowParis.toFormat('HH:mm');

    return this.repository
      .createQueryBuilder('announcement')
      .where('announcement.participants @> :participant', {
        participant: JSON.stringify([{ id: participantId }]),
      })
      .andWhere(
        new Brackets(qb => {
          qb.where('announcement.dateEvent > :todayIso', { todayIso }).orWhere(
            new Brackets(subQb => {
              subQb
                .where('announcement.dateEvent = :todayIso', { todayIso })
                .andWhere('announcement.hoursEvent >= :currentTime', { currentTime });
            }),
          );
        }),
      )
      .andWhere('announcement.isHidden != :isHidden', { isHidden: true })
      .andWhere('announcement.status != :status', { status: AnnouncementStatus.INACTIVE })
      .getMany();
  }

  async removeVolunteerEverywhere(volunteerId: string): Promise<number> {
    const announcements = await this.repository
      .createQueryBuilder('announcement')
      .where('announcement.volunteers @> :volunteer', {
        volunteer: JSON.stringify([{ id: volunteerId }]),
      })
      .orWhere('announcement.volunteersWaiting @> :volunteer', {
        volunteer: JSON.stringify([{ id: volunteerId }]),
      })
      .getMany();

    let modifiedCount = 0;
    for (const announcement of announcements) {
      let changed = false;
      if (announcement.volunteers) {
        const initialLen = announcement.volunteers.length;
        announcement.volunteers = announcement.volunteers.filter(v => v.id !== volunteerId);
        if (announcement.volunteers.length !== initialLen) {
          announcement.nbVolunteers = (announcement.nbVolunteers || 0) - 1;
          changed = true;
        }
      }
      if (announcement.volunteersWaiting) {
        const initialLen = announcement.volunteersWaiting.length;
        announcement.volunteersWaiting = announcement.volunteersWaiting.filter(
          v => v.id !== volunteerId,
        );
        if (announcement.volunteersWaiting.length !== initialLen) changed = true;
      }
      if (changed) {
        await this.repository.save(announcement);
        modifiedCount++;
      }
    }
    return modifiedCount;
  }

  async removeParticipantEverywhere(participantId: string): Promise<number> {
    const announcements = await this.repository
      .createQueryBuilder('announcement')
      .where('announcement.participants @> :participant', {
        participant: JSON.stringify([{ id: participantId }]),
      })
      .getMany();

    let modifiedCount = 0;
    for (const announcement of announcements) {
      if (announcement.participants) {
        const initialLen = announcement.participants.length;
        announcement.participants = announcement.participants.filter(p => p.id !== participantId);
        if (announcement.participants.length !== initialLen) {
          announcement.nbParticipants = (announcement.nbParticipants || 0) - 1;
          await this.repository.save(announcement);
          modifiedCount++;
        }
      }
    }
    return modifiedCount;
  }

  async findWithAggregation(dto: FilterAnnouncementDto): Promise<FilterAnnouncementResponse> {
    const {
      nameEvent,
      description,
      status,
      hoursEventFrom,
      hoursEventTo,
      dateEventFrom,
      dateEventTo,
      publicationInterval,
      datePublicationFrom,
      datePublicationTo,
      tags,
      associationName,
      latitude,
      longitude,
      radius,
      sort,
      page = 1,
      limit = 9,
    } = dto;

    const qb = this.repository.createQueryBuilder('announcement');

    if (latitude !== undefined && longitude !== undefined && radius) {
      const earthRadius = 6371; // km
      const radiusKm = radius / 1000;

      qb.andWhere(
        `(:earthRadius * acos(
          cos(radians(:latitude)) * 
          cos(radians((announcement."locationAnnouncement"->'coordinates'->>1)::float)) * 
          cos(radians((announcement."locationAnnouncement"->'coordinates'->>0)::float) - radians(:longitude)) + 
          sin(radians(:latitude)) * 
          sin(radians((announcement."locationAnnouncement"->'coordinates'->>1)::float))
        )) <= :radiusKm`,
        { latitude, longitude, radiusKm, earthRadius },
      );
    }

    qb.andWhere('announcement.isHidden != :isHidden', { isHidden: true });
    qb.andWhere('announcement.status != :status', { status: AnnouncementStatus.INACTIVE });

    const nowParis = DateTime.now().setZone('Europe/Paris');
    const todayIso = nowParis.toISODate();
    const currentTime = nowParis.toFormat('HH:mm');

    qb.andWhere(
      new Brackets(qb => {
        qb.where('announcement.dateEvent > :todayIso', { todayIso }).orWhere(
          new Brackets(subQb => {
            subQb
              .where('announcement.dateEvent = :todayIso', { todayIso })
              .andWhere('announcement.hoursEvent >= :currentTime', { currentTime });
          }),
        );
      }),
    );

    if (nameEvent || description || associationName) {
      qb.andWhere(
        new Brackets(qb => {
          if (nameEvent) {
            qb.where('announcement.nameEvent ILIKE :nameEvent', { nameEvent: `%${nameEvent}%` });
          }
          if (description) {
            qb.orWhere('announcement.description ILIKE :description', {
              description: `%${description}%`,
            });
          }
          if (associationName) {
            qb.orWhere('announcement.associationName ILIKE :associationName', {
              associationName: `%${associationName}%`,
            });
          }
        }),
      );
    }

    if (status) {
      qb.andWhere('announcement.status = :status', { status });
    }

    if (tags?.length) {
      qb.andWhere('announcement.tags && :tags', { tags });
    }

    if (hoursEventFrom) {
      qb.andWhere('announcement.hoursEvent >= :hoursEventFrom', { hoursEventFrom });
    }
    if (hoursEventTo) {
      qb.andWhere('announcement.hoursEvent <= :hoursEventTo', { hoursEventTo });
    }

    if (dateEventFrom) {
      qb.andWhere('announcement.dateEvent >= :dateEventFrom', { dateEventFrom });
    }
    if (dateEventTo) {
      qb.andWhere('announcement.dateEvent <= :dateEventTo', { dateEventTo });
    }

    if (publicationInterval) {
      const now = new Date();
      let threshold: Date;
      switch (publicationInterval) {
        case '1h':
          threshold = new Date(now.getTime() - 1 * 60 * 60 * 1000);
          break;
        case '5h':
          threshold = new Date(now.getTime() - 5 * 60 * 60 * 1000);
          break;
        case '1d':
          threshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '1w':
          threshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '1M':
          threshold = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          throw new BadRequestException('Intervalle de publication invalide');
      }
      qb.andWhere('announcement.datePublication >= :threshold', {
        threshold: threshold.toISOString(),
      });
    } else {
      if (datePublicationFrom) {
        qb.andWhere('announcement.datePublication >= :datePublicationFrom', {
          datePublicationFrom,
        });
      }
      if (datePublicationTo) {
        qb.andWhere('announcement.datePublication <= :datePublicationTo', { datePublicationTo });
      }
    }

    if (sort) {
      switch (sort) {
        case 'dateEvent_asc':
          qb.orderBy('announcement.dateEvent', 'ASC');
          break;
        case 'dateEvent_desc':
          qb.orderBy('announcement.dateEvent', 'DESC');
          break;
        case 'datePublication_desc':
        default:
          qb.orderBy('announcement.datePublication', 'DESC');
          break;
      }
    } else {
      qb.orderBy('announcement.datePublication', 'DESC');
    }

    const total = await qb.getCount();
    const docs = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      annonces: docs,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async initMockData() {
    // Optional: implement if needed for tests
  }
  async updateAssociationVisibilityByAssociationId(
    associationId: string,
    visibility: boolean,
  ): Promise<number> {
    const result = await this.repository.update({ associationId }, { isHidden: visibility });
    return result.affected || 0;
  }
}
