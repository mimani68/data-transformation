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
  ): Promise<{ data: JobOfferEntity[]; total: number; page: number; limit: number }> {
    // Validate input parameters
    if (page < 1) {
      throw new HttpBadRequestException('Page number must be at least 1');
    }
    if (limit < 1 || limit > 100) {
      throw new HttpBadRequestException('Limit must be between 1 and 100');
    }
    if (minSalary && maxSalary && minSalary > maxSalary) {
      throw new HttpBadRequestException('Minimum salary cannot be greater than maximum salary');
    }

    const skip = (page - 1) * limit;
    const whereConditions: any = {};

    try {
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

      const { data, total } = await this.jobOfferRepository.findAndCount({
        where: whereConditions,
        skip,
        take: limit,
        order: { postedDate: 'DESC' },
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
        // Handle specific PostgreSQL query errors
        if (error.message.includes('invalid input syntax')) {
          throw new HttpBadRequestException('Invalid search parameters');
        }
      }
      throw new HttpInternalException('Failed to retrieve job offers');
    }
  }
}