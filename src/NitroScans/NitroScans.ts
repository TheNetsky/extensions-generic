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

const DOMAIN = 'https://nitroscans.com'

export const NitroScansInfo: SourceInfo = {
    version: getExportVersion('0.0.1'),
    name: 'NitroScans',
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

export class NitroScans extends Madara {

    baseUrl: string = DOMAIN

    override languageCode: LanguageCode = LanguageCode.ENGLISH

    override hasAdvancedSearchPage = true
    
    override alternativeChapterAjaxEndpoint = true
}
