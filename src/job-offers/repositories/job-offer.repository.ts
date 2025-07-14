import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, FindManyOptions } from 'typeorm';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { JobOfferEntity } from 'src/job-offers/entities/job-offer';

export class JobOfferRepository extends BaseRepository<JobOfferEntity> {
  constructor(
    @InjectRepository(JobOfferEntity)
    private readonly jobOfferRepository: Repository<JobOfferEntity>,
  ) {
    super(jobOfferRepository);
  }

  async findOne(where: FindOneOptions<JobOfferEntity>): Promise<JobOfferEntity> {
    return this.jobOfferRepository.findOne(where);
  }

  async findAndCount(options?: FindManyOptions<JobOfferEntity>): 
    Promise<{ total: number; data: JobOfferEntity[] }> {
    const [data, total] = await this.jobOfferRepository.findAndCount(options);
    return { total, data };
  }
}
