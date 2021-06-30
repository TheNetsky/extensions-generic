import {
    ContentRating,
    LanguageCode,
    SourceInfo,
    TagType
} from 'paperback-extensions-common'
import {Madara} from '../Madara'

const WEBTOON_DOMAIN = 'https://www.webtoon.xyz'

export const WebtoonXYZInfo: SourceInfo = {
    version: '1.1.2',
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
    override userAgentRandomizer = ''
}
