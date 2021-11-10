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

const MACBOLD_DOMAIN = 'https://macbold.com'

export const MacBoldInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'MacBold',
    description: 'Extension that pulls manga from macbold.com',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: MACBOLD_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class MacBold extends Madara {
    baseUrl: string = MACBOLD_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
    override hasAdvancedSearchPage = true
    override userAgentRandomizer = ''
    override alternativeChapterAjaxEndpoint = true
}
