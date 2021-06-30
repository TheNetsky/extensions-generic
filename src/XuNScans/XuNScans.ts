import {
    ContentRating,
    LanguageCode,
    SourceInfo,
    TagType
} from 'paperback-extensions-common'
import {Madara} from '../Madara'

const XUNSCANS_DOMAIN = 'https://reader.xunscans.xyz'

export const XuNScansInfo: SourceInfo = {
    version: '1.1.2',
    name: 'XuNScans',
    description: 'Extension that pulls manga from xunscans.xyz',
    author: 'Nuno Costa',
    authorWebsite: 'http://github.com/nuno99costa',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: XUNSCANS_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class XuNScans extends Madara {
    baseUrl: string = XUNSCANS_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
    override hasAdvancedSearchPage = true
    override userAgentRandomizer = ''
}
