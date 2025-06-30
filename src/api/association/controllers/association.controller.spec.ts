import { Test, TestingModule } from '@nestjs/testing';
import { AssociationController } from './association.controller';
import { AssociationService } from '../services/association.service';
import { AssociationRepository } from '../repository/association.repository';
import { DatabaseModule } from '../../../database/database.module';
import { MongoClient, ObjectId } from 'mongodb';
import { MONGODB_CONNECTION } from '../../../database/mongodb.provider';
import * as mockData from '../../../../test/testFiles/association.data.json';
import { DatabaseCollection } from '../../../common/enums/database.collection';

// Mock FirebaseAdminService
jest.mock('../../../common/firebase/firebaseAdmin.service', () => ({
  FirebaseAdminService: {
    getInstance: jest.fn().mockReturnValue({
      getUserByEmail: jest.fn().mockResolvedValue({
        uid: 'mockFirebaseUid123',
        email: 'abou@gmail.com',
      }),
    }),
  },
}));

describe('AssociationController (Integration)', () => {
  let controller: AssociationController;
  let mongoClient: MongoClient;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [AssociationController],
      providers: [AssociationService, AssociationRepository],
    }).compile();

    controller = module.get<AssociationController>(AssociationController);
    mongoClient = module.get<MongoClient>(MONGODB_CONNECTION);

    // Convertir les string IDs en ObjectId
    const associations = mockData.associations.map(assoc => ({
      ...assoc,
      _id: new ObjectId(),
    }));

    const db = mongoClient.db();
    await db.collection(DatabaseCollection.ASSOCIATION).deleteMany({});
    await db.collection(DatabaseCollection.ASSOCIATION).insertMany(associations);
  });

  afterAll(async () => {
    // Nettoyer la base de données après les tests
    const db = mongoClient.db();
    await db.collection(DatabaseCollection.ASSOCIATION).deleteMany({});
    await module.close();
  });

  describe('findAll', () => {
    it('should return all associations', async () => {
      const associations = await controller.findAll();
      expect(associations).toBeDefined();
      expect(Array.isArray(associations)).toBe(true);
      expect(associations.length).toBe(mockData.associations.length);
      expect(associations[0]?.associationName).toBe(mockData.associations[0].associationName);
    });
  });

  describe('findOne', () => {
    it('should return a single association', async () => {
      const found = await controller.findOne(mockData.associations[0].associationId);

      expect(found).toBeDefined();
      expect(found).not.toBeNull();
      expect(found.associationName).toBe(mockData.associations[0].associationName);
    });

    it('should return null for non-existent association', async () => {
      const association = await controller.findOne('5f9d1a7b4f3c4b001f3f7b9d');
      expect(association).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new association', async () => {
      const newAssociation = {
        email: 'abou@gmail.com',
        phone: '0756124578',
        associationName: 'Médecins Sans Frontières',
        bio: 'Organisation médicale humanitaire internationale',
        city: 'Paris',
        type: 'Santé',
        postalCode: '75002',
        country: 'France',
      };

      const expectedResult = {
        associationId: 'mockFirebaseUid123',
        associationName: 'Médecins Sans Frontières',
        bio: 'Organisation médicale humanitaire internationale',
        city: 'Paris',
        type: 'Santé',
        postalCode: '75002',
        country: 'France',
        volunteers: [],
        volunteersWaiting: [],
      };

      const created = await controller.create(newAssociation);
      expect(created).toBeDefined();
      expect(created).toMatchObject(expectedResult);

      // Vérifier que l'association est bien dans la base
      const found = await controller.findOne(created.associationId);
      expect(found).toBeDefined();
      expect(found).toMatchObject(expectedResult);
    });

    it('should throw error if email already exists', async () => {
      const existingAssociation = {
        email: 'abou@gmail.com',
        phone: '0756124578',
        associationName: 'Test Association',
        bio: 'Test Bio',
        city: 'Paris',
        type: 'Test',
        postalCode: '75002',
        country: 'France',
      };

      await expect(controller.create(existingAssociation)).rejects.toThrow('Email already exist');
    });
  });

  describe('update', () => {
    it('should update an existing association', async () => {
      const updateDto = {
        bio: 'Nouvelle description',
      };

      const updated = await controller.update(mockData.associations[0].associationId, updateDto);
      expect(updated).toBeDefined();
      expect(updated.bio).toBe(updateDto.bio);
    });
  });

  describe('addVolunteer', () => {
    it('should add a volunteer to an association', async () => {
      const associationId = mockData.associations[1].associationId;
      const volunteer = {
        id: 'mockVolunteerId123',
        name: 'John Doe',
      };

      // D'abord, ajouter le bénévole à la liste d'attente
      await controller.addAssociationVolunteersWaiting(associationId, volunteer);

      // Vérifier qu'il est bien dans la liste d'attente
      let association = await controller.findOne(associationId);
      expect(association.volunteersWaiting).toContainEqual(
        expect.objectContaining({ id: volunteer.id, name: volunteer.name }),
      );

      // Vérifier qu'il n'est pas encore dans la liste des bénévoles actifs
      expect(association.volunteers).not.toContainEqual(
        expect.objectContaining({ id: volunteer.id }),
      );

      // Maintenant, l'ajouter comme bénévole actif (ce qui le transfère de la liste d'attente)
      const updated = await controller.addAssociationVolunteers(associationId, volunteer);

      expect(updated).toBeDefined();
      expect(updated).toMatchObject(volunteer);

      // Vérifier qu'il a bien été transféré : supprimé de la liste d'attente et ajouté aux bénévoles actifs
      association = await controller.findOne(associationId);
      expect(association.volunteersWaiting).not.toContainEqual(
        expect.objectContaining({ id: volunteer.id }),
      );
      expect(association.volunteers).toContainEqual(
        expect.objectContaining({ id: volunteer.id, name: volunteer.name }),
      );
    });
  });

  describe('getAssociationWaitingByVolunteer', () => {
    it('should return associations waiting for a volunteer', async () => {
      const volunteerId = 'mockVolunteerId123';
      const associations = await controller.getAssociationWaiting(volunteerId);

      expect(associations).toBeDefined();
      expect(Array.isArray(associations)).toBe(true);
      expect(associations.length).toBeGreaterThan(0);
      expect(associations[0].associationId).toBe(mockData.associations[0].associationId);
      expect(associations[0].associationName).toBe(mockData.associations[0].associationName);
      expect(associations[1].associationId).toBe(mockData.associations[2].associationId);
    });
  });

  describe('getAssociationByVolunteer', () => {
    it('should return associations for a volunteer', async () => {
      const volunteerId = 'mockVolunteerId123';
      const associations = await controller.getAssociation(volunteerId);

      expect(associations).toBeDefined();
      expect(Array.isArray(associations)).toBe(true);
      expect(associations.length).toBeGreaterThan(0);
      expect(associations[0].associationId).toBe(mockData.associations[1].associationId);
      expect(associations[0].associationName).toBe(mockData.associations[1].associationName);
    });

    describe('removeVolunteerWaiting', () => {
      it('should remove a volunteer from the waiting list of an association', async () => {
        const associationId = mockData.associations[0].associationId;
        const volunteerId = mockData.associations[0].volunteersWaiting[0].id;

        await controller.removeAssociationVolunteersWaiting(associationId, volunteerId);

        // Vérifier que le bénévole a bien été supprimé
        const association = await controller.findOne(associationId);
        expect(association.volunteersWaiting).not.toContainEqual(
          expect.objectContaining({ id: volunteerId }),
        );
      });
    });

    describe('removeVolunteer', () => {
      it('should remove a volunteer from an association', async () => {
        const associationId = mockData.associations[1].associationId;
        const volunteerId = mockData.associations[1].volunteers[0].id;

        const updated = await controller.removeAssociationVolunteers(associationId, volunteerId);
        expect(updated).toBeDefined();
        expect(updated).toBe(volunteerId);

        // Vérifier que le bénévole a bien été supprimé
        const association = await controller.findOne(associationId);
        expect(association.volunteers).not.toContainEqual(
          expect.objectContaining({ id: volunteerId }),
        );
      });
    });

    describe('addVolunteerWaiting', () => {
      it('should add a volunteer to the waiting list of an association', async () => {
        const associationId = mockData.associations[2].associationId;
        const volunteer = {
          id: 'mockVolunteerId1234',
          name: 'John Doe',
        };

        await controller.addAssociationVolunteersWaiting(associationId, volunteer);

        const association = await controller.findOne(associationId);
        expect(association.volunteersWaiting).toContainEqual(expect.objectContaining(volunteer));
      });
    });

    describe('remove', () => {
      it('should remove an association', async () => {
        await controller.remove(mockData.associations[0].associationId);
        const found = await controller.findOne(mockData.associations[0].associationId);
        expect(found).toBeNull();
      });
    });

    it('should return empty array for non-existent volunteer', async () => {
      const associations = await controller.getAssociation('nonExistentVolunteerId');
      expect(associations).toBeDefined();
      expect(Array.isArray(associations)).toBe(true);
      expect(associations.length).toBe(0);
    });
  });
});
