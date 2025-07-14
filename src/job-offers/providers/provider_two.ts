import { JobOfferType } from "../enums/job-offer-type.enum"
import { TransformerHandler } from "../transformers/transformer"

export const PROVIDER_TWO = {
    "providerId": "PROVIDER-TWO",
    "url": "https://assignment.devotel.io/api/provider2/jobs",
    "transformerFunction": (data: any) => {
        try {
            let jobs = data.data['jobsList']
            let missedKeys = new Set()
            let completeIds = new Set()
            let defectedIds = new Set()
            let result = new Set()

            for (let index in jobs) {
                let tmp = {
                    id: index || '-N/A-',
                    title: jobs[index]?.position || '-N/A-',
                    experience: jobs[index]?.requirements?.experience || '-N/A-',
                    industry: '',
                    description: '',
                    companyName: jobs[index]?.employer?.companyName || '-N/A-',
                    location: jobs[index]?.location?.city ? `${jobs[index]?.location?.city}, ${jobs[index]?.location?.state}` : '-N/A-',
                    type: jobs[index]?.location?.remote ? JobOfferType.REMOTE : TransformerHandler.mapJobType('full_time'),
                    salaryRange: {
                        min: jobs[index]?.compensation?.min || '-N/A-',
                        max: jobs[index]?.compensation?.max || '-N/A-',
                        currency: jobs[index]?.compensation?.currency || '-N/A-',
                    },
                    skills: jobs[index]?.requirements?.technologies || '-N/A-',
                    postedDate: new Date(jobs[index]?.datePosted),
                    createdAt: new Date(jobs[index]?.createdAt),
                    updatedAt: new Date(jobs[index]?.updatedAt)
                }
                result.add(tmp)
                completeIds.add(tmp?.id)
                for (let key in tmp) {
                    if (tmp[key] === '-N/A-') {
                        missedKeys.add(key)
                        defectedIds.add(tmp?.id)
                        completeIds.delete(tmp?.id)
                    }
                }
            }
            return { result: result.values(), error: null, missedKeys, completeIds, defectedIds }
        } catch (error) {
            return { result: null, error, missedKeys: null, completeIds: null, defectedIds: null }
        }
    }
}