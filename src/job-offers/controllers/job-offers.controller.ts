import { Controller, Get, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';

import { JobOffersService } from '../services/job-offers.service';
import { JobOfferEntity } from '../entities/job-offer';

@ApiTags('job-offers')
@Controller('job-offers')
export class JobOffersController {
    constructor(private readonly jobOffersService: JobOffersService) { }

    @Get()
    @ApiQuery({ name: 'title', required: false, type: String, description: 'Filter by job title' })
    @ApiQuery({ name: 'location', required: false, type: String, description: 'Filter by location' })
    @ApiQuery({ name: 'minSalary', required: false, type: Number, description: 'Filter by minimum salary' })
    @ApiQuery({ name: 'maxSalary', required: false, type: Number, description: 'Filter by maximum salary' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
    async getJobOffers(
        @Query('title') title?: string,
        @Query('location') location?: string,
        @Query('minSalary') minSalary?: number,
        @Query('maxSalary') maxSalary?: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    ): Promise<{ data: JobOfferEntity[]; total: number; page: number; limit: number }> {
        return this.jobOffersService.getJobOffers(title, location, minSalary, maxSalary, page, limit);
    }
}