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


const RESETSCANS_DOMAIN = 'https://reset-scans.com'

export const ResetScansInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'ResetScans',
    description: 'Extension that pulls manga from reset-scans.com',
    author: 'darkdemon',
    authorWebsite: 'http://github.com/daarkdemon',
    icon: 'icon.png',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: RESETSCANS_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class ResetScans extends Madara {
    baseUrl: string = RESETSCANS_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
    override alternativeChapterAjaxEndpoint = true
    override hasAdvancedSearchPage = true
}