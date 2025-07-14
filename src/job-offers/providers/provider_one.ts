import { TransformerHandler } from "../transformers/transformer"

export const PROVIDER_ONE = {
    "providerId": "PROVIDER-ONE",
    "url": "https://assignment.devotel.io/api/provider1/jobs",
    "transformerFunction": (data: any) => {
        try {
            let missedItem = new Set()
            let doneItem = new Set()
            let defectedIds = new Set()
            let result = data.jobs.map((job) => ({
                id: job?.jobId || '-N/A-',
                title: job?.title || '-N/A-',
                companyName: job?.company?.name || '-N/A-',
                description: '',
                industry: job?.company?.industry || '-N/A-',
                location: job?.details?.location || '-N/A-',
                type: job?.details?.type ? TransformerHandler.mapJobType(job?.details?.type) : '-N/A-',
                salaryRange: job?.details?.salaryRange ? TransformerHandler.parseSalaryRange(job?.details?.salaryRange) : '-N/A-',
                skills: job?.skills || '-N/A-',
                postedDate: job?.postedDate ? new Date(job?.postedDate) : '-N/A-'
            }))
            result.forEach(element => {
                for (let index in element) {
                    if (element[index] === '-N/A-') {
                        missedItem.add(index)
                        defectedIds.add(element?.id)
                    } else {
                        doneItem.add(index)
                    }
                } 
            });
            return { result, error: null, missedItem, doneItem, defectedIds }
        } catch (error) {
            return { result: null, error, missedItem: null, doneItem: null }
        }


    }
}