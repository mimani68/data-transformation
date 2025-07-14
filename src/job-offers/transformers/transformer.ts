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
            let { result, error, missedKeys, completeIds, defectedIds } = transformerFunction(data)
            if (error == null) {
                return { error: false, result, missedKeys, completeIds, defectedIds }
            } else {
                return { error, missedKeys, completeIds, defectedIds }
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

    static parseSalary(range: string): { min: number; max: number; currency: string } | undefined {
        const parts = range.split(/\s*-\s*/);

        let min = null;
        let max = null;
        const currency = "USD";

        if (parts[0]) {
            const minMatch = parts[0].match(/\$(\d+(?:,\d{3})*(?:\.\d+)?)k?/i);
            if (minMatch) {
                min = parseFloat(minMatch[1].replace(/,/g, '')) * 1000;
            }
        }

        if (parts[1]) {
            const maxMatch = parts[1].match(/\$(\d+(?:,\d{3})*(?:\.\d+)?)k?/i);
            if (maxMatch) {
                max = parseFloat(maxMatch[1].replace(/,/g, '')) * 1000;
            }
        }
        else if (min !== null) {
            max = min;
        }

        return { min: min, max: max, currency: currency };
    }

}