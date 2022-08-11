/* eslint-disable linebreak-style */
import {
    Chapter,
    ContentRating,
    SourceInfo,
    TagType
} from 'paperback-extensions-common'
import {
    getExportVersion,
    Madara
} from '../Madara'
import { 
    AzoraWorldParser
} from './AzoraWorldParser'

const DOMAIN = 'https://azoraworld.com'

export const AzoraWorldInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'AzoraWorld',
    description: `Extension that pulls manga from ${DOMAIN}`,
    author: 'Ali Mohamed',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
        {
            text: 'Arabic',
            type: TagType.GREY
        }
    ]
}

export class AzoraWorld extends Madara {
    baseUrl: string = DOMAIN
    languageCode: string = 'Arabic'
    override sourceTraversalPathName = 'series'
    override readonly parser: AzoraWorldParser = new AzoraWorldParser();
    override async getChapters(mangaId: string): Promise<Chapter[]> {
       
        const request = createRequestObject({
            url: `${this.baseUrl}/${this.sourceTraversalPathName}/${mangaId}/`,
            method: 'GET'
        })

        const data = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(data.status)
        const $ = this.cheerio.load(data.data)

        return this.parser.parseChapterList($, mangaId, this)
    }

}