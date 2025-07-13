import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JobOfferEntity } from '../entities/job-offer';
import { TransformerHandler } from '../transformers/transformer';
import { PROVIDER_ONE, PROVIDER_TWO } from '../constants/provider.const';
import { JobOffersService } from '../services/job-offers.service';

@Injectable()
export class JobOffersCronjob {
  private readonly logger = new Logger(JobOffersCronjob.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(JobOfferEntity)
    private readonly jobOfferRepository: Repository<JobOfferEntity>,
    private readonly jobOffersService: JobOffersService,
    private readonly transformer: TransformerHandler
  ) { }

  private async fetchDataFromApi(apiUrl: string): Promise<any> {
    try {
      if (!apiUrl) {
        throw Error('Destination address is empty');
      }
      const response = await axios.get(apiUrl);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch data from API 1: ${error.message}`);
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.log('Starting cron job to fetch and save job offers...');
    try {
      const apiUrl1 = this.configService.get<string>('API_1_URL');
      const api1Data = await this.fetchDataFromApi(apiUrl1)
      const transformedDataApi1 = this.transformer.transform(api1Data, PROVIDER_ONE)
      if (!transformedDataApi1.error) {
        await this.jobOffersService.saveJobOffers([...transformedDataApi1.result]);
        this.logger.log('Cron job completed successfully.');
      }

      const apiUrl2 = this.configService.get<string>('API_2_URL');
      const api2Data = await this.fetchDataFromApi(apiUrl2)
      const transformedDataApi2 = this.transformer.transform(api2Data, PROVIDER_TWO)
      if (!transformedDataApi2.error) {
        await this.jobOffersService.saveJobOffers([...transformedDataApi2.result]);
        this.logger.log('Cron job completed successfully.');
      }

    } catch (error) {
      this.logger.error(`Cron job failed: ${error.message}`);
    }
  }
}