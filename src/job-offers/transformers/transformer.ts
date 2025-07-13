import { Injectable, Logger } from '@nestjs/common';
import { PROVIDER_ONE, PROVIDER_TWO } from '../constants/provider.const';
import { JobOfferType } from '../enums/job-offer-type.enum';

const transformObject = [
    {
        "providerId": PROVIDER_ONE,
        "transformerFunction": (data: any) => {
            return data.jobs.map((job) => ({
                title: job.title,
                companyName: job.company.name,
                industry: job.company.industry,
                location: job.details.location,
                type: TransformerHandler.mapJobType(job.details.type),
                salaryRange: TransformerHandler.parseSalaryRange(job.details.salaryRange),
                skills: job.skills,
                postedDate: new Date(job.postedDate),
            }))
        }
    },
    {
        "providerId": PROVIDER_TWO,
        "transformerFunction": (data: any) => {
            return Object.values(data.data['jobsList']).map((job: any) => ({
                id: job.id,
                title: job.position,
                industry: job.industry,
                companyName: job.employer.companyName,
                location: `${job.location.city}, ${job.location.state}`,
                type: job.location.remote ? JobOfferType.REMOTE : TransformerHandler.mapJobType('full_time'),
                salaryRange: {
                    min: job.compensation.min,
                    max: job.compensation.max,
                    currency: job.compensation.currency,
                },
                skills: job.requirements.technologies,
                postedDate: new Date(job.datePosted),
                createdAt: new Date(job.createdAt),
                updatedAt: new Date(job.updatedAt),
            }))
        }
    }]

@Injectable()
export class TransformerHandler {

    private readonly logger = new Logger(TransformerHandler.name);

    transform(data: any, providerId: string) {
        let transform = transformObject.filter(el => el.providerId == providerId)
        if (!transform || transform.length == 0) {
            return { error: true }
        }
        let { result, error, missedItem, doneItem } = transform[0].transformerFunction(data)
        if (error == null) {
            // this.logger.debug()
            return { error: false, result }
        } else {
            return { error, missedItem, doneItem }
        }
    }

    static mapJobType(type: string): JobOfferType {
        const lowerCaseType = type.toLowerCase();
        switch (lowerCaseType) {
            case 'full time':
                return JobOfferType.FULL_TIME;
            case 'part time':
                return JobOfferType.PART_TIME;
            case 'contract':
                return JobOfferType.CONTRACT;
            case 'internship':
                return JobOfferType.INTERNSHIP;
            default:
                return JobOfferType.FULL_TIME;
        }
    }

    static parseSalaryRange(range: string): { min: number; max: number; currency: string } | undefined {
        if (!range) return undefined;
        const regex = /([$€£])(\d+)-(\d+)/;
        const match = range.match(regex);
        if (!match) return undefined;
        const currency = match[1];
        const min = parseInt(match[2], 10);
        const max = parseInt(match[3], 10);
        return { min, max, currency };
    }

}