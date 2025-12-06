import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Announcement } from '../api/announcement/entities/announcement.entity';
import { Association } from '../api/association/entities/association.entity';
import { AnnouncementStatus } from '../api/announcement/interfaces/announcement.interface';
import { DateTime } from 'luxon';

const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'benevoclic',
    entities: [Announcement, Association],
    synchronize: false, // We assume schema is already created by the app
});

async function seed() {
    try {
        await AppDataSource.initialize();
        console.log('Data Source has been initialized!');

        const associationRepository = AppDataSource.getRepository(Association);
        const announcementRepository = AppDataSource.getRepository(Announcement);

        // Create a dummy association
        const association = new Association();
        association.associationId = faker.string.uuid();
        association.associationName = faker.company.name();
        association.phone = faker.phone.number();
        association.bio = faker.lorem.paragraph();
        association.city = faker.location.city();
        association.type = 'Non-Profit';
        association.postalCode = faker.location.zipCode();
        association.country = faker.location.country();

        await associationRepository.save(association);
        console.log(`Created association: ${association.associationName}`);

        // Generate fixed known events for testing
        const fixedAnnouncements = [
            {
                nameEvent: 'Nettoyage de printemps Douai',
                description: 'Grand nettoyage de printemps au parc Fenain.',
                dateEvent: DateTime.now().plus({ days: 2 }).toISODate(),
                hoursEvent: '14:00',
                tags: ['Environnement', 'Bénévolat'],
                status: AnnouncementStatus.ACTIVE,
                locationAnnouncement: {
                    type: 'Point' as const,
                    coordinates: [3.0667, 50.3667], // Douai
                },
                addressAnnouncement: {
                    city: 'Douai',
                    address: 'Parc Fenain',
                    country: 'France',
                    postalCode: '59500',
                },
                maxParticipants: 50,
                maxVolunteers: 15,
            },
            {
                nameEvent: 'Atelier Cuisine Paris',
                description: 'Atelier cuisine solidaire.',
                dateEvent: DateTime.now().plus({ days: 5 }).toISODate(),
                hoursEvent: '10:00',
                tags: ['Solidarité', 'Cuisine'],
                status: AnnouncementStatus.ACTIVE,
                locationAnnouncement: {
                    type: 'Point' as const,
                    coordinates: [2.3522, 48.8566], // Paris (far from Douai)
                },
                addressAnnouncement: {
                    city: 'Paris',
                    address: '10 Rue de Rivoli',
                    country: 'France',
                    postalCode: '75001',
                },
                maxParticipants: 30,
                maxVolunteers: 10,
            },
            {
                nameEvent: 'Kansas Bug Event',
                description: 'Event that should not appear in Douai search.',
                dateEvent: DateTime.now().plus({ days: 10 }).toISODate(),
                hoursEvent: '12:00',
                tags: ['Bug', 'Test'],
                status: AnnouncementStatus.ACTIVE,
                locationAnnouncement: {
                    type: 'Point' as const,
                    coordinates: [-101.8267, 37.1044], // Longitude first (-101.8), Latitude second (37.1)
                },
                addressAnnouncement: {
                    city: 'Kansas City',
                    address: 'Main St',
                    country: 'USA',
                    postalCode: '66101',
                },
                maxParticipants: 100,
                maxVolunteers: 50,
            }
        ];

        for (const data of fixedAnnouncements) {
            const announcement = announcementRepository.create({
                ...data,
                id: faker.string.uuid(),
                datePublication: new Date().toISOString(),
                associationId: association.associationId,
                associationName: association.associationName,
            });
            await announcementRepository.save(announcement);
            console.log(`Saved fixed announcement: ${data.nameEvent}`);
        }

        const announcements: Announcement[] = [];
        for (let i = 0; i < 15; i++) { // Changed from 100 to 15
            const announcement = new Announcement();
            announcement.description = faker.lorem.paragraph();
            announcement.datePublication = new Date().toISOString();

            // Event date within the next 10 days
            const dateEvent = faker.date.soon({ days: 10 });
            announcement.dateEvent = dateEvent.toISOString();
            announcement.hoursEvent = '10:00'; // Simplified

            announcement.nameEvent = faker.lorem.sentence(3);
            const realTags = ['Urgent', 'Bénévolat', 'Formation', 'Événement', 'Collecte', 'Sensibilisation', 'Humanitaire', 'Environnement', 'Sport', 'Culture', 'Éducation', 'Santé'];
            announcement.tags = faker.helpers.arrayElements(realTags, { min: 1, max: 3 });
            announcement.associationId = association.associationId;
            announcement.associationName = association.associationName;
            announcement.maxParticipants = faker.number.int({ min: 10, max: 50 });
            announcement.status = faker.helpers.arrayElement(Object.values(AnnouncementStatus));
            announcement.maxVolunteers = faker.number.int({ min: 5, max: 20 });
            announcement.locationAnnouncement = {
                type: 'Point',
                coordinates: [faker.location.longitude(), faker.location.latitude()],
            };
            announcement.addressAnnouncement = {
                city: faker.location.city(),
                postalCode: faker.location.zipCode(),
                address: faker.location.streetAddress(),
                country: faker.location.country(),
            };

            announcements.push(announcement);
        }

        await announcementRepository.save(announcements);
        console.log(`Seeded ${announcements.length} announcements.`);

        await AppDataSource.destroy();
        console.log('Data Source has been destroyed!');
    } catch (err) {
        console.error('Error during Data Source initialization', err);
        process.exit(1);
    }
}

seed();
