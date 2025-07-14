import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Like, Repository } from 'typeorm';

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
    for (const jobOffer of jobOffers) {
      const existingJobOffer = await this.jobOfferRepository.findOne({
        where: {
          title: jobOffer.title,
          companyName: jobOffer.companyName,
          location: jobOffer.location,
          postedDate: jobOffer.postedDate,
        },
      });
      if (!existingJobOffer) {
        try {
          await this.jobOfferRepository.save(jobOffer);
          this.logger.log(`Job offer saved: ${jobOffer.title}`);
        } catch (error) {
          this.logger.error(`Failed to save job offer ${jobOffer.title}: ${error.message}`);
        }
      } else {
        this.logger.log(`Job offer already exists: ${jobOffer.title}`);
      }
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

    const {data, total} = await this.jobOfferRepository.findAndCount({
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
  }

}