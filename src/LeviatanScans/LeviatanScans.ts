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

const LEVIATANSCANS_DOMAIN = 'https://leviatanscans.com'

export const LeviatanScansInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'LeviatanScans',
    description: 'Extension that pulls manga from leviatanscans.com',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: LEVIATANSCANS_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class LeviatanScans extends Madara {
    baseUrl: string = LEVIATANSCANS_DOMAIN
    override languageCode: LanguageCode = LanguageCode.ENGLISH
    override sourceTraversalPathName = 'alli/manga'

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
