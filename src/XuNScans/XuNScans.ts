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

const DOMAIN = 'https://xunscans.xyz'

export const XuNScansInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'XuNScans',
    description: `Extension that pulls manga from ${DOMAIN}`,
    author: 'Nuno Costa',
    authorWebsite: 'http://github.com/nuno99costa',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class XuNScans extends Madara {

    baseUrl: string = DOMAIN

    languageCode: LanguageCode = LanguageCode.ENGLISH

    override hasAdvancedSearchPage = true
}
