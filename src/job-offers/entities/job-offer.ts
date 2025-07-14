import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { JobOfferType } from '../enums/job-offer-type.enum';

@Entity()
export class JobOfferEntity {
    @PrimaryGeneratedColumn()
    @ApiProperty({ description: 'Primary key for the job offer', format: 'number' })
    id: number;

    @Column()
    @ApiProperty({ description: 'Job title' })
    title: string;

    @Column({ nullable: true })
    @ApiProperty({ description: 'Job description', required: false })
    description?: string;

    @Column()
    @ApiProperty({ description: 'Company name' })
    companyName: string;

    @Column()
    @ApiProperty({ description: 'Industry' })
    industry: string;

    @Column()
    @ApiProperty({ description: 'Location' })
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