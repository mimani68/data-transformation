import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios, { AxiosError } from 'axios';

import { TransformerHandler } from '../transformers/transformer';
import { PROVIDER_ONE, PROVIDER_TWO } from '../providers';
import { JobOffersService } from '../services/job-offers.service';

let CRON = process.env.JOB_RETRIEVAL_CRON_STRING || CronExpression.EVERY_30_SECONDS

@Injectable()
export class JobOffersCronjob {
  
  private readonly logger = new Logger(JobOffersCronjob.name);
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;
  private readonly REQUEST_TIMEOUT = 10000;

  constructor(
    private readonly configService: ConfigService,
    private readonly jobOffersService: JobOffersService,
    private readonly transformer: TransformerHandler
  ) {
    if (this.configService.get<string>('JOB_RETRIEVAL_CRON_STRING')) {
      CRON = this.configService.get<string>('JOB_RETRIEVAL_CRON_STRING')
    }
  }

  @Cron(CRON)
  async handleCron() {
    this.logger.log('Starting cron job to fetch and save job offers...');
    const startTime = Date.now();
    const providers = [PROVIDER_ONE, PROVIDER_TWO];

    try {
      for (const provider of providers) {
        const providerStart = Date.now();
        try {
          await this.processProvider(provider);
          this.logger.log(`Processed provider ${provider.providerId} in ${Date.now() - providerStart}ms`);
        } catch (error) {
          this.logger.error(`Provider ${provider.providerId} failed: ${error.message}`, error.stack);
        }
      }
      this.logger.log(`Cron job completed in ${Date.now() - startTime}ms`);
    } catch (error) {
      this.logger.error(`Cron job failed: ${error.message}`, error.stack);
    }
  }

  private async fetchWithRetry(apiUrl: string): Promise<any> {
    if (!apiUrl) {
      throw new Error('Destination address is empty');
    }

    let attempt = 1;
    while (attempt <= this.MAX_RETRIES) {
      try {
        const response = await axios.get(apiUrl, {
          timeout: this.REQUEST_TIMEOUT,
        });
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;
        const isTransient = this.isTransientError(axiosError);

        if (attempt >= this.MAX_RETRIES || !isTransient) {
          throw new Error(`Failed after ${attempt} attempts: ${axiosError.message}`);
        }

        this.logger.warn(`Attempt ${attempt} failed. Retrying in ${this.RETRY_DELAY}ms: ${axiosError.message}`);
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
        attempt++;
      }
    }
    throw new Error('Unreachable code');
  }

  private isTransientError(error: AxiosError): boolean {
    return (
      !error.response ||
      (error.response.status >= 500 && error.response.status < 600) ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT'
    );
  }

  private async processProvider(provider: any) {
    this.logger.debug(`Processing provider: ${provider.providerId}`);

    try {
      const response = await this.fetchWithRetry(provider.url);
      const { result, error, missedKeys, completeIds, defectedIds } =
        this.transformer.transform(response, provider.transformerFunction);

      this.logger.debug({
        providerId: provider.providerId,
        resultCount: result.length,
        error,
        missedKeys,
        completeIds,
        defectedIds
      });

      if (error) {
        this.logger.warn(`Transformation error for provider ${provider.providerId}: ${error}`);
        return;
      }

      const offersWithProvider = result.map(offer => ({
        ...offer,
        provider: provider.providerId
      }));

      try {
        const saveResult = await this.jobOffersService.saveJobOffers(offersWithProvider);
        this.logger.log(`Saved ${offersWithProvider?.length} offers from ${provider.providerId}`);
      } catch (dbError) {
        this.logger.error(`Database save failed for ${provider.providerId}: ${dbError.message}`, dbError.stack);
      }
    } catch (fetchError) {
      this.logger.error(`Provider ${provider.providerId} fetch failed: ${fetchError.message}`, fetchError.stack);
      throw fetchError;
    }
  }
}
