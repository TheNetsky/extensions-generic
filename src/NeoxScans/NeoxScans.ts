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

const DOMAIN = 'https://neoxscans.net'

export const NeoxScansInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'NeoxScans',
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
            text: 'Portuguese',
            type: TagType.GREY
        }
    ]
}

export class NeoxScans extends Madara {

    baseUrl: string = DOMAIN

    override languageCode: LanguageCode = LanguageCode.PORTUGUESE

    override hasAdvancedSearchPage = true

    override alternativeChapterAjaxEndpoint = true
}
