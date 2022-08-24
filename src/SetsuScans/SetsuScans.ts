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

const DOMAIN = 'https://setsuscans.com'

export const SetsuScansInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'SetsuScans',
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
        }
    ]
}

export class SetsuScans extends Madara {

    baseUrl: string = DOMAIN

    override languageCode: LanguageCode = LanguageCode.ENGLISH

    override hasAdvancedSearchPage = true
    
    override alternativeChapterAjaxEndpoint = true
}
