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

const XUNSCANS_DOMAIN = 'https://xunscans.xyz'

export const XuNScansInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
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
