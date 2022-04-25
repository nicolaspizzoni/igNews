import * as prismic from '@prismicio/client'

const repositoryName = "ignewsni"
const endpoint = prismic.getEndpoint(repositoryName);

export function getPrismicClient(req?: unknown){
    const client = prismic.createClient(
        endpoint,
        {
            accessToken: process.env.PRISMIC_ACESS_TOKEN
        }
    )

    return client;
}