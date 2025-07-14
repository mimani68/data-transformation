import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Like, QueryFailedError } from 'typeorm';
import { HttpBadRequestException, HttpInternalException } from 'src/common/errors';
import { JobOffersService } from './job-offers.service';
import { JobOfferRepository } from '../repositories/job-offer.repository';
import { JobOfferEntity } from '../entities/job-offer';
import { JobOfferType } from '../enums/job-offer-type.enum';

describe('JobOffersService', () => {
  let service: JobOffersService;
  let jobOfferRepository: jest.Mocked<JobOfferRepository>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobOffersService,
        {
          provide: JobOfferRepository,
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<JobOffersService>(JobOffersService);
    jobOfferRepository = module.get(JobOfferRepository);
    configService = module.get(ConfigService);
  });

  describe('saveJobOffers', () => {
    const mockJobOffer: JobOfferEntity = {
      id: 1,
      title: 'Software Engineer',
      companyName: 'Tech Corp',
      location: 'Remote',
      postedDate: new Date(),
      salaryRange: { min: 50000, max: 80000, currency: 'USD' },
      externalId: '',
      experience: '',
      provider: '',
      industry: '',
      type: JobOfferType.FULL_TIME,
      createdAt: undefined,
      updatedAt: undefined
    };

    it('should throw HttpBadRequestException if jobOffers is not an array', async () => {
      await expect(service.saveJobOffers(null)).rejects.toThrow(HttpBadRequestException);
      await expect(service.saveJobOffers('invalid' as any)).rejects.toThrow(HttpBadRequestException);
    });

    it('should skip invalid job offer entries', async () => {
      const invalidOffers = [null, undefined, 'invalid', 123];
      await service.saveJobOffers(invalidOffers as any);
      expect(jobOfferRepository.findOne).not.toHaveBeenCalled();
    });

    it('should save new job offers', async () => {
      jobOfferRepository.findOne.mockResolvedValue(null);
      await service.saveJobOffers([mockJobOffer]);
      expect(jobOfferRepository.save).toHaveBeenCalledWith(mockJobOffer);
    });

    it('should skip existing job offers', async () => {
      jobOfferRepository.findOne.mockResolvedValue(mockJobOffer);
      await service.saveJobOffers([mockJobOffer]);
      expect(jobOfferRepository.save).not.toHaveBeenCalled();
    });

    it('should handle duplicate key errors', async () => {
      jobOfferRepository.findOne.mockResolvedValue(null);
      jobOfferRepository.save.mockRejectedValue(
        new QueryFailedError('', [], new Error('duplicate key value violates unique constraint'))
      );
      await service.saveJobOffers([mockJobOffer]);
      expect(jobOfferRepository.save).toHaveBeenCalled();
    });

    it('should handle null constraint errors', async () => {
      jobOfferRepository.findOne.mockResolvedValue(null);
      jobOfferRepository.save.mockRejectedValue(
        new QueryFailedError('', [], new Error('violates not-null constraint'))
      );
      await service.saveJobOffers([mockJobOffer]);
      expect(jobOfferRepository.save).toHaveBeenCalled();
    });

    it('should throw HttpInternalException for other errors', async () => {
      jobOfferRepository.findOne.mockRejectedValue(new Error('DB error'));
      await expect(service.saveJobOffers([mockJobOffer])).rejects.toThrow(HttpInternalException);
    });
  });

  describe('getJobOffers', () => {
    const mockJobOffers: JobOfferEntity[] = [
      {
        id: 1,
        title: 'Software Engineer',
        companyName: 'Tech Corp',
        location: 'Remote',
        postedDate: new Date(),
        salaryRange: { min: 50000, max: 80000, currency: 'USD' },
        externalId: '',
        experience: '',
        provider: '',
        industry: '',
        type: JobOfferType.FULL_TIME,
        createdAt: undefined,
        updatedAt: undefined
      },
      {
        id: 2,
        title: 'Product Manager',
        companyName: 'Tech Corp',
        location: 'Office',
        postedDate: new Date(),
        salaryRange: { min: 70000, max: 100000, currency: 'USD' },
        externalId: '',
        experience: '',
        provider: '',
        industry: '',
        type: JobOfferType.FULL_TIME,
        createdAt: undefined,
        updatedAt: undefined
      },
    ];

    beforeEach(() => {
      jobOfferRepository.findAndCount.mockResolvedValue({data: mockJobOffers, total: mockJobOffers.length});
    });

    it('should throw HttpBadRequestException for invalid page', async () => {
      await expect(service.getJobOffers(undefined, undefined, undefined, undefined, 0)).rejects.toThrow(HttpBadRequestException);
    });

    it('should throw HttpBadRequestException for invalid limit', async () => {
      await expect(service.getJobOffers(undefined, undefined, undefined, undefined, 1, 0)).rejects.toThrow(HttpBadRequestException);
      await expect(service.getJobOffers(undefined, undefined, undefined, undefined, 1, 101)).rejects.toThrow(HttpBadRequestException);
    });

    it('should throw HttpBadRequestException for invalid salary range', async () => {
      await expect(service.getJobOffers(undefined, undefined, 80000, 50000)).rejects.toThrow(HttpBadRequestException);
    });

    it('should throw HttpBadRequestException for invalid sort field', async () => {
      await expect(service.getJobOffers(undefined, undefined, undefined, undefined, 1, 10, 'invalidField')).rejects.toThrow(HttpBadRequestException);
    });

    it('should return job offers with default pagination and sorting', async () => {
      const result = await service.getJobOffers();
      expect(result).toEqual({
        data: mockJobOffers,
        total: mockJobOffers.length,
        page: 1,
        limit: 10,
      });
      expect(jobOfferRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        order: { postedDate: 'DESC' },
      });
    });

    it('should filter by title', async () => {
      await service.getJobOffers('Engineer');
      expect(jobOfferRepository.findAndCount).toHaveBeenCalledWith({
        where: { title: Like('%Engineer%') },
        skip: 0,
        take: 10,
        order: { postedDate: 'DESC' },
      });
    });

    it('should filter by location', async () => {
      await service.getJobOffers(undefined, 'Remote');
      expect(jobOfferRepository.findAndCount).toHaveBeenCalledWith({
        where: { location: Like('%Remote%') },
        skip: 0,
        take: 10,
        order: { postedDate: 'DESC' },
      });
    });

    it('should filter by min salary', async () => {
      await service.getJobOffers(undefined, undefined, 60000);
      expect(jobOfferRepository.findAndCount).toHaveBeenCalledWith({
        where: { salaryRange: { min: 60000 } },
        skip: 0,
        take: 10,
        order: { postedDate: 'DESC' },
      });
    });

    it('should filter by max salary', async () => {
      await service.getJobOffers(undefined, undefined, undefined, 90000);
      expect(jobOfferRepository.findAndCount).toHaveBeenCalledWith({
        where: { salaryRange: { max: 90000 } },
        skip: 0,
        take: 10,
        order: { postedDate: 'DESC' },
      });
    });

    it('should handle custom sorting', async () => {
      await service.getJobOffers(undefined, undefined, undefined, undefined, 1, 10, 'title', 'ASC');
      expect(jobOfferRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        order: { title: 'ASC' },
      });
    });

    it('should handle nested sorting (salaryRange.min)', async () => {
      await service.getJobOffers(undefined, undefined, undefined, undefined, 1, 10, 'salaryRange.min', 'ASC');
      expect(jobOfferRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        order: { salaryRange: { min: 'ASC' } },
      });
    });

    it('should handle database errors', async () => {
      jobOfferRepository.findAndCount.mockRejectedValue(new QueryFailedError('', [], new Error('invalid input syntax')));
      await expect(service.getJobOffers()).rejects.toThrow(HttpBadRequestException);
    });

    it('should throw HttpInternalException for unexpected errors', async () => {
      jobOfferRepository.findAndCount.mockRejectedValue(new Error('Unexpected error'));
      await expect(service.getJobOffers()).rejects.toThrow(HttpInternalException);
    });
  });
});