import { Injectable, Logger } from '@nestjs/common';
import { JobOfferType } from '../enums/job-offer-type.enum';

@Injectable()
export class TransformerHandler {

    private readonly logger = new Logger(TransformerHandler.name);

    transform(data: any, transformerFunction: Function) {
        if (!data)
            return { error: true }
        if (!transformerFunction)
            return { error: true }
        try {
            let { result, error, missedItem, doneItem, defectedIds } = transformerFunction(data)
            if (error == null) {
                // this.logger.debug()
                return { error: false, result }
            } else {
                return { error, missedItem, doneItem, defectedIds }
            }
        } catch (error) {
            return { error: true }
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