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

const DOMAIN = 'https://doki1001.com'

export const Doki1001Info: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'Doki1001',
    description: `Extension that pulls manga from ${DOMAIN}`,
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
        {
            text: 'Japanese',
            type: TagType.GREY
        }
    ]
}

export class Doki1001 extends Madara {

    baseUrl: string = DOMAIN

    languageCode: LanguageCode = LanguageCode.JAPANESE

    override hasAdvancedSearchPage = true

    override alternativeChapterAjaxEndpoint = true
}
