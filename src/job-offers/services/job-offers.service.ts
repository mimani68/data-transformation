import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Like, QueryFailedError } from 'typeorm';

import { HttpBadRequestException, HttpConflictException, HttpInternalException, HttpNotFoundException } from 'src/common/errors'
import { JobOfferEntity } from '../entities/job-offer';
import { JobOfferRepository } from '../repositories/job-offer.repository';

@Injectable()
export class JobOffersService {
  private readonly logger = new Logger(JobOffersService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jobOfferRepository: JobOfferRepository
  ) { }

  async saveJobOffers(jobOffers: JobOfferEntity[]): Promise<void> {
    if (!jobOffers || !Array.isArray(jobOffers)) {
      throw new HttpBadRequestException('Invalid job offers data');
    }

    try {
      for (const jobOffer of jobOffers) {
        if (!jobOffer || typeof jobOffer !== 'object') {
          this.logger.warn('Invalid job offer entry skipped');
          continue;
        }

        try {
          const existingJobOffer = await this.jobOfferRepository.findOne({
            where: {
              title: jobOffer.title,
              companyName: jobOffer.companyName,
              location: jobOffer.location,
              postedDate: jobOffer.postedDate,
            },
          });

          if (!existingJobOffer) {
            await this.jobOfferRepository.save(jobOffer);
            this.logger.log(`Job offer saved: ${jobOffer.title}`);
          } else {
            this.logger.log(`Job offer already exists: ${jobOffer.title}`);
          }
        } catch (error) {
          if (error instanceof QueryFailedError) {
            // Handle specific PostgreSQL errors
            if (error.message.includes('duplicate key value')) {
              this.logger.warn(`Duplicate job offer detected: ${jobOffer.title}`);
              continue;
            }
            if (error.message.includes('violates not-null constraint')) {
              this.logger.error(`Missing required fields for job offer: ${jobOffer.title}`);
              continue;
            }
          }
          this.logger.error(`Failed to process job offer ${jobOffer.title}: ${error.message}`);
          throw new HttpInternalException('Failed to process job offers');
        }
      }
    } catch (error) {
      this.logger.error(`Critical error in saveJobOffers: ${error.message}`);
      if (error instanceof HttpInternalException) {
        throw error;
      }
      throw new HttpInternalException('Failed to save job offers');
    }
  }

  async getJobOffers(
    title?: string,
    location?: string,
    minSalary?: number,
    maxSalary?: number,
    page: number = 1,
    limit: number = 10,
    sortBy?: string,
    sortDirection: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{ data: JobOfferEntity[]; total: number; page: number; limit: number }> {
    if (page < 1) {
      throw new HttpBadRequestException('Page number must be at least 1');
    }
    if (limit < 1 || limit > 100) {
      throw new HttpBadRequestException('Limit must be between 1 and 100');
    }
    if (minSalary && maxSalary && minSalary > maxSalary) {
      throw new HttpBadRequestException('Minimum salary cannot be greater than maximum salary');
    }

    const validSortFields = ['title', 'companyName', 'location', 'postedDate', 'salaryRange.min', 'salaryRange.max'];
    if (sortBy && !validSortFields.includes(sortBy)) {
      throw new HttpBadRequestException(`Invalid sort field. Must be one of: ${validSortFields.join(', ')}`);
    }

    const skip = (page - 1) * limit;
    const whereConditions: any = {};

    if (title) {
      whereConditions.title = Like(`%${title}%`);
    }
    if (location) {
      whereConditions.location = Like(`%${location}%`);
    }
    if (minSalary) {
      whereConditions.salaryRange = { min: minSalary };
    }
    if (maxSalary) {
      whereConditions.salaryRange = { max: maxSalary };
    }

    let order = {};
    if (sortBy) {
      if (sortBy.includes('salaryRange.')) {
        const [parent, field] = sortBy.split('.');
        order = { [parent]: { [field]: sortDirection } };
      } else {
        order = { [sortBy]: sortDirection };
      }
    } else {
      order = { postedDate: sortDirection };
    }

    try {
      const {data, total} = await this.jobOfferRepository.findAndCount({
        where: whereConditions,
        skip,
        take: limit,
        order,
      });

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve job offers: ${error.message}`);
      if (error instanceof QueryFailedError) {
        if (error.message.includes('invalid input syntax')) {
          throw new HttpBadRequestException('Invalid search parameters');
        }
        if (error.message.includes('column "') && error.message.includes(' does not exist')) {
          throw new HttpBadRequestException('Invalid sort field');
        }
      }
      throw new HttpInternalException('Failed to retrieve job offers');
    }
  }
}