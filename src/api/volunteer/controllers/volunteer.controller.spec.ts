import { VolunteerController } from './volunteer.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { VolunteerService } from '../services/volunteer.service';
import { CreateVolunteerDto } from '../dto/create-volunteer.dto';
import { UpdateVolunteerDto } from '../dto/update-volunteer.dto';

jest.mock('../../../common/firebase/firebaseAdmin.service', () => ({
  FirebaseAdminService: {
    getInstance: jest.fn().mockReturnValue({
      getUserByEmail: jest.fn().mockResolvedValue({
        uid: 'mockFirebaseUid123',
        email: 'siriki@gmail.com',
      }),
    }),
  },
}));

describe('VolunteerController', () => {
  let volunteerController: VolunteerController;
  let volunteerService: VolunteerService;

  const mockVolunteerService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VolunteerController],
      providers: [
        {
          provide: VolunteerService,
          useValue: mockVolunteerService,
        },
      ],
    }).compile();

    volunteerController = module.get<VolunteerController>(VolunteerController);
    volunteerService = module.get<VolunteerService>(VolunteerService);
  });

  it('should be defined', () => {
    expect(volunteerController).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all volunteers', async () => {
      const result = [{ volunteerId: '1', firstName: 'Test' }];
      mockVolunteerService.findAll.mockResolvedValue(result);

      expect(await volunteerController.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a volunteer by ID', async () => {
      const result = { volunteerId: '1', firstName: 'Test' };
      mockVolunteerService.findOne.mockResolvedValue(result);

      expect(await volunteerController.findOne('1')).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a volunteer', async () => {
      const dto: CreateVolunteerDto = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        phone: '1234567890',
        bio: 'Bio',
        city: 'City',
      };
      const result = { volunteerId: '1', ...dto };
      mockVolunteerService.create.mockResolvedValue(result);

      expect(await volunteerController.create(dto)).toBe(result);
    });
  });

  describe('update', () => {
    it('should update a volunteer', async () => {
      const dto: UpdateVolunteerDto = { bio: 'Updated Bio' };
      const result = { volunteerId: '1', bio: 'Updated Bio' };
      mockVolunteerService.update.mockResolvedValue(result);

      expect(await volunteerController.update('1', dto)).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove a volunteer', async () => {
      const result = { volunteerId: '1' };
      mockVolunteerService.remove.mockResolvedValue(result);

      expect(await volunteerController.remove('1')).toBe(result);
    });
  });
});
