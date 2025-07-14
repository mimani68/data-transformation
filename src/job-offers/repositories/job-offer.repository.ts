import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { JobOfferEntity } from 'src/job-offers/entities/job-offer';

export class JobOfferRepository extends BaseRepository<JobOfferEntity> {
  constructor(
    @InjectRepository(JobOfferEntity)
    private readonly jobOfferRepository: Repository<JobOfferEntity>,
  ) {
    super(jobOfferRepository);
  }

  async findOne(where: any): Promise<JobOfferEntity> {
    return null
  }

  async findAndCount(query: any): Promise<{total: number, data: JobOfferEntity[]}> {
    return null
  }
}
