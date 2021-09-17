import {
    ContentRating,
    LanguageCode,
    SourceInfo,
    TagType,
    Chapter
} from 'paperback-extensions-common'
import {
    getExportVersion,
    Madara
} from '../Madara'

const TOONILY_DOMAIN = 'https://toonily.com'

export const ToonilyInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'Toonily',
    description: 'Extension that pulls manga from toonily.com',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: TOONILY_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
        {
            text: '18+',
            type: TagType.YELLOW
        },
        {
            text: 'Cloudflare',
            type: TagType.RED
        }
    ]
}

export class Toonily extends Madara {
    baseUrl: string = TOONILY_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
    override hasAdvancedSearchPage = true
    override sourceTraversalPathName = 'webtoon'
    override userAgentRandomizer = ''

    override async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${this.baseUrl}/${this.sourceTraversalPathName}/${mangaId}/ajax/chapters`,
            method: 'POST',
            headers: this.constructHeaders({
                'content-type': 'application/x-www-form-urlencoded'
            }),
            data: {
                'action': 'manga_get_chapters',
                'manga': await this.getNumericId(mangaId)
            }
        })

        const data = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(data.status)
        const $ = this.cheerio.load(data.data)

        return this.parser.parseChapterList($, mangaId, this)
    }
}
