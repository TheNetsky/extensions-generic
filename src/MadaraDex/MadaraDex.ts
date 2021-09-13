import {
    ContentRating,
    LanguageCode,
    SourceInfo,
    TagType
} from 'paperback-extensions-common'
import {
    getExportVersion,
    Madara
} from '../Madara'

const MADARADEX_DOMAIN = 'https://madaradex.org'

export const MadaraDexInfo: SourceInfo = {
    version: getExportVersion('0.0.1'),
    name: 'MadaraDex',
    description: 'Extension that pulls from the best site known as madaradex.org',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: MADARADEX_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
        {
            text: '18+',
            type: TagType.YELLOW
        },
    ]
}

export class MadaraDex extends Madara {
    baseUrl: string = MADARADEX_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
    override hasAdvancedSearchPage = true
    override userAgentRandomizer = ''
    override sourceTraversalPathName = 'title'
    override searchMangaSelector = 'div.c-tabs-item > div.row'
    override requestManager = createRequestManager({
        requestsPerSecond: 5,
        requestTimeout: 25000,
    })
}
