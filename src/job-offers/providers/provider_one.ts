import { TransformerHandler } from "../transformers/transformer"

export const PROVIDER_ONE = {
    "providerId": "PROVIDER-ONE",
    "url": "https://assignment.devotel.io/api/provider1/jobs",
    "transformerFunction": (data: any) => {
        try {
            let jobs = data.jobs
            let missedKeys = new Set()
            let completeIds = new Set()
            let defectedIds = new Set()
            let result = new Set()

            jobs.forEach(job => {
                let tmp = {
                    externalId: job?.jobId || '-N/A-',
                    title: job?.title || '-N/A-',
                    experience: '',
                    companyName: job?.company?.name || '-N/A-',
                    description: '',
                    industry: job?.company?.industry || '-N/A-',
                    location: job?.details?.location || '-N/A-',
                    type: job?.details?.type ? TransformerHandler.mapJobType(job?.details?.type) : '-N/A-',
                    salaryRange: job?.details?.salaryRange ? TransformerHandler.parseSalaryRange(job?.details?.salaryRange) : '-N/A-',
                    skills: job?.skills || '-N/A-',
                    postedDate: job?.postedDate ? new Date(job?.postedDate) : '-N/A-'
                }
                completeIds.add(tmp?.externalId)
                result.add(tmp)
                for (let index in tmp) {
                    if (tmp[index] === '-N/A-') {
                        missedKeys.add(index)
                        defectedIds.add(tmp?.externalId)
                        completeIds.delete(tmp?.externalId)
                    }
                }
            });
            return { result: [...result], error: null, missedKeys, completeIds, defectedIds }
        } catch (error) {
            return { result: null, error, missedKeys: null, doneItem: null }
        }


    }
}