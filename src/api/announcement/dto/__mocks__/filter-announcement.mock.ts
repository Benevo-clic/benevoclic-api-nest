import { FilterAnnouncementDto } from '../filter-announcement.dto';

export const basicFilterDto: FilterAnnouncementDto = {
  nameEvent: 'Event',
  page: 1,
  limit: 2,
};

export const geoFilterDto: FilterAnnouncementDto = {
  latitude: 48.85,
  longitude: 2.35,
  radius: 100000,
  page: 1,
  limit: 2,
};

export const tagFilterDto: FilterAnnouncementDto = {
  tags: ['solidarity'],
  page: 1,
  limit: 2,
};

export const dateFilterDto: FilterAnnouncementDto = {
  dateEventFrom: '2024-01-09T00:00:00Z',
  dateEventTo: '2024-01-13T23:59:59Z',
  page: 1,
  limit: 2,
};

export const statusFilterDto: FilterAnnouncementDto = {
  status: 'ACTIVE',
  page: 1,
  limit: 2,
};

export const associationNameFilterDto: FilterAnnouncementDto = {
  associationName: 'Solidarity Org',
  page: 1,
  limit: 2,
};

export const hoursEventFilterDto: FilterAnnouncementDto = {
  hoursEventFrom: '13:00',
  hoursEventTo: '19:00',
  page: 1,
  limit: 2,
};

export const publicationIntervalFilterDto: FilterAnnouncementDto = {
  publicationInterval: '1w',
  page: 1,
  limit: 2,
};
