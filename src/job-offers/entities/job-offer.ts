import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

import { JobOfferType } from '../enums/job-offer-type.enum';

@Entity({
    name: 'jobOffers'
})
export class JobOfferEntity {
    @PrimaryGeneratedColumn()
    @ApiProperty({ description: 'Primary key for the job offer', format: 'number' })
    id: number;

    @Column({ type: 'varchar' })
    @ApiProperty({ description: 'External ID', nullable: false })
    externalId: string;

    @Column({ type: 'varchar' })
    @ApiProperty({ description: 'Job title', nullable: false })
    title: string;

    @Column({ type: 'varchar', nullable: true })
    @ApiProperty({ description: 'Job description' })
    experience: string

    @Column({ type: 'varchar', nullable: true })
    @ApiProperty({ type: 'string', description: 'Job description', required: false })
    description?: string;

    @Column({ type: 'varchar' })
    @ApiProperty({ type: 'string', description: 'Company name' })
    companyName: string;

    @Column({ type: 'varchar' })
    @ApiProperty({ type: 'string', description: 'Industry' })
    industry: string;

    @Column({ type: 'varchar' })
    @ApiProperty({ type: 'string', description: 'Location' })
    location: string;

    @Column({ type: 'enum', enum: JobOfferType })
    @ApiProperty({ description: 'Job type', enum: JobOfferType })
    type: JobOfferType;

    @Column({ type: 'jsonb', nullable: true })
    @ApiProperty({ description: 'Salary range', required: false })
    salaryRange?: { min: number; max: number; currency: string };

    @Column({ type: 'jsonb', nullable: true })
    @ApiProperty({ description: 'Skills', required: false })
    skills?: string[];

    @Column({ type: 'timestamptz' })
    @ApiProperty({ description: 'Date posted', format: 'date-time' })
    postedDate: Date;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}