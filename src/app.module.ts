import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import ormconfig from '../ormconfig';
import { JobOffersModule } from './job-offers/job-offers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(ormconfig),
    JobOffersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}