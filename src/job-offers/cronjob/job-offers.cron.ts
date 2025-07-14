import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';

import { TransformerHandler } from '../transformers/transformer';
import { PROVIDER_ONE, PROVIDER_TWO } from '../providers';
import { JobOffersService } from '../services/job-offers.service';

let CRON = process.env.JOB_RETRIEVAL_CRON_STRING || CronExpression.EVERY_30_SECONDS

@Injectable()
export class JobOffersCronjob {
  private readonly logger = new Logger(JobOffersCronjob.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jobOffersService: JobOffersService,
    private readonly transformer: TransformerHandler
  ) {
    if ( this.configService.get<string>('JOB_RETRIEVAL_CRON_STRING') ) {
      CRON = this.configService.get<string>('JOB_RETRIEVAL_CRON_STRING')
    }
  }

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

  @Cron(CRON)
  async handleCron() {
    this.logger.log('Starting cron job to fetch and save job offers...');
    try {
      let providers = [PROVIDER_ONE, PROVIDER_TWO]
      for (let p of providers) {
        const response = await this.fetchDataFromApi(p.url)
        let {result, error, missedKeys, completeIds, defectedIds } = this.transformer.transform(response, p.transformerFunction)
        this.logger.debug({ id: p.providerId, url: p.url, result, error, missedKeys, completeIds, defectedIds })
        if (!error) {
          await this.jobOffersService.saveJobOffers([...result]);
        }
      }
      this.logger.log('Cron job completed successfully.');
    } catch (error) {
      this.logger.error(`Cron job failed: ${error.message}`);
    }
  }
}