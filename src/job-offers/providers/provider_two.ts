import { JobOfferType } from "../enums/job-offer-type.enum"
import { TransformerHandler } from "../transformers/transformer"

export const PROVIDER_TWO = {
    "providerId": "PROVIDER-TWO",
    "url": "https://assignment.devotel.io/api/provider2/jobs",
    "transformerFunction": (data: any) => {
        try {
            let jobs = data.data['jobsList']
            let missedItem = new Set()
            let doneItem = new Set()
            let defectedIds = new Set()
            let result = new Set()

            for (let index in jobs) {
                result.add({
                    id: index || '-N/A-',
                    title: jobs[index]?.position || '-N/A-',
                    industry: jobs[index]?.industry || '-N/A-',
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
                })
                if (jobs[index] === '-N/A-') {
                    missedItem.add(index)
                    defectedIds.add(jobs?.id)
                } else {
                    doneItem.add(index)
                }
            }
            return { result: result.values(), error: null, missedItem, doneItem, defectedIds }
        } catch (error) {
            return { result: null, error, missedItem: null, doneItem: null }
        }
    }
}