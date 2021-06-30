import {
    ContentRating,
    LanguageCode,
    SourceInfo,
    TagType
} from 'paperback-extensions-common'
import {Madara} from '../Madara'

const HIPERDEX_DOMAIN = 'https://hiperdex.com'

export const HiperDexInfo: SourceInfo = {
    version: '1.1.2',
    name: 'HiperDex',
    description: 'Extension that pulls manga from hiperdex.com',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: HIPERDEX_DOMAIN,
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

export class HiperDex extends Madara {
    baseUrl: string = HIPERDEX_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
    override hasAdvancedSearchPage = true
    override userAgentRandomizer = ''
}
