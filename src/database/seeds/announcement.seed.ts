import { MongoClient, ObjectId } from 'mongodb';
import {
  Announcement,
  AnnouncementStatus,
} from '../../api/announcement/interfaces/announcement.interface';

export async function seedAnnouncements(client: MongoClient) {
  const db = client.db('benevoclic');
  const collection = db.collection<Announcement>('announcements');

  // Vérifier si la collection est vide
  const count = await collection.countDocuments();
  if (count === 0) {
    const sampleAnnouncements: Omit<Announcement, '_id'>[] = [
      {
        title: 'Distribution de repas',
        description: 'Nous recherchons des bénévoles pour distribuer des repas aux sans-abris',
        location: 'Paris 75001',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-02'),
        skills: ['Communication', 'Organisation'],
        category: 'Social',
        status: AnnouncementStatus.ACTIVE,
        associationId: new ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Aide aux devoirs',
        description: 'Soutien scolaire pour les enfants en difficulté',
        location: 'Lyon 69001',
        startDate: new Date('2024-02-05'),
        endDate: new Date('2024-03-30'),
        skills: ['Pédagogie', 'Patience'],
        category: 'Education',
        status: AnnouncementStatus.ACTIVE,
        associationId: new ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await collection.insertMany(sampleAnnouncements);
    console.log('Announcements collection initialized with sample data');
  }
}
