import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class AnnouncementCacheSubscriber {
  private readonly logger = new Logger(AnnouncementCacheSubscriber.name);
  private readonly CACHE_KEYS = {
    ALL_ANNOUNCEMENTS: 'allAnnouncements',
    ANNOUNCEMENT_BY_ID: (id: string) => `announcement:${id}`,
    ANNOUNCEMENTS_BY_ASSOCIATION: (associationId: string) =>
      `announcements:association:${associationId}`,
  };

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @OnEvent('announcement.created')
  async handleAnnouncementCreated(payload: { id: string; associationId: string }) {
    this.logger.log(`Invalidating cache after announcement creation: ${payload.id}`);
    await this.invalidateCache(payload.id, payload.associationId);
  }

  @OnEvent('announcement.updated')
  async handleAnnouncementUpdated(payload: { id: string; associationId: string }) {
    this.logger.log(`Invalidating cache after announcement update: ${payload.id}`);
    await this.invalidateCache(payload.id, payload.associationId);
  }

  @OnEvent('announcement.deleted')
  async handleAnnouncementDeleted(payload: { id: string; associationId: string }) {
    this.logger.log(`Invalidating cache after announcement deletion: ${payload.id}`);
    await this.invalidateCache(payload.id, payload.associationId);
  }

  @OnEvent('announcement.volunteer.added')
  async handleVolunteerAdded(payload: { id: string; associationId: string }) {
    this.logger.log(`Invalidating cache after volunteer addition: ${payload.id}`);
    await this.invalidateCache(payload.id, payload.associationId);
  }

  @OnEvent('announcement.volunteer.removed')
  async handleVolunteerRemoved(payload: { id: string; associationId: string }) {
    this.logger.log(`Invalidating cache after volunteer removal: ${payload.id}`);
    await this.invalidateCache(payload.id, payload.associationId);
  }

  @OnEvent('announcement.participant.added')
  async handleParticipantAdded(payload: { id: string; associationId: string }) {
    this.logger.log(`Invalidating cache after participant addition: ${payload.id}`);
    await this.invalidateCache(payload.id, payload.associationId);
  }

  @OnEvent('announcement.participant.removed')
  async handleParticipantRemoved(payload: { id: string; associationId: string }) {
    this.logger.log(`Invalidating cache after participant removal: ${payload.id}`);
    await this.invalidateCache(payload.id, payload.associationId);
  }

  private async invalidateCache(id?: string, associationId?: string) {
    try {
      if (id) {
        await this.cacheManager.del(this.CACHE_KEYS.ANNOUNCEMENT_BY_ID(id));
      }
      if (associationId) {
        await this.cacheManager.del(this.CACHE_KEYS.ANNOUNCEMENTS_BY_ASSOCIATION(associationId));
      }
      await this.cacheManager.del(this.CACHE_KEYS.ALL_ANNOUNCEMENTS);

      this.logger.log('Cache invalidation completed successfully');
    } catch (error) {
      this.logger.error('Error during cache invalidation', error.stack);
    }
  }
}
