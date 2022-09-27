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


const DOMAIN = 'https://reset-scans.com'

export const ResetScansInfo: SourceInfo = {
    version: getExportVersion('0.0.1'),
    name: 'ResetScans',
    description: `Extension that pulls manga from ${DOMAIN}`,
    author: 'darkdemon',
    authorWebsite: 'http://github.com/daarkdemon',
    icon: 'icon.png',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class ResetScans extends Madara {

    baseUrl: string = DOMAIN

    languageCode: LanguageCode = LanguageCode.ENGLISH

    override alternativeChapterAjaxEndpoint = true
    
    override hasAdvancedSearchPage = true

    override sourceTraversalPathName = 'devmax'
}
