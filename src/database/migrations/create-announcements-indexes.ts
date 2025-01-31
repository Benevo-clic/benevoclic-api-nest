import { MongoClient } from 'mongodb';

export async function createAnnouncementsIndexes(client: MongoClient) {
  const db = client.db('benevoclic');
  const collection = db.collection('announcements');

  await collection.createIndexes([
    { key: { associationId: 1 } },
    { key: { status: 1 } },
    { key: { category: 1 } },
    { key: { createdAt: -1 } },
    { key: { startDate: 1 } },
    { key: { location: '2dsphere' } },
  ]);
}
