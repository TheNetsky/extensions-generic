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

const WEBTOON_DOMAIN = 'https://www.webtoon.xyz'

export const WebtoonXYZInfo: SourceInfo = {
    version: getExportVersion('0.0.1'),
    name: 'WebtoonXYZ',
    description: 'Extension that pulls manga from Webtoon.XYZ',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: WEBTOON_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
        {
            text: 'Cloudflare',
            type: TagType.RED
        }
    ]
}

export class WebtoonXYZ extends Madara {
    baseUrl: string = WEBTOON_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
    override sourceTraversalPathName = 'read'
    override userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1'
    override alternativeChapterAjaxEndpoint = true
}
