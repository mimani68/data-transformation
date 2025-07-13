import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { JobOffersController } from './controllers/job-offers.controller';
import { JobOffersService } from './services/job-offers.service';
import { JobOfferEntity } from './entities/job-offer';
import { JobOffersCronjob } from './cronjob/job-offers.cron';
import { TransformerHandler } from './transformers/transformer';

@Module({
    imports: [TypeOrmModule.forFeature([JobOfferEntity]), ScheduleModule.forRoot()],
    controllers: [JobOffersController],
    providers: [JobOffersService, JobOffersCronjob, TransformerHandler],
})
export class JobOffersModule { }