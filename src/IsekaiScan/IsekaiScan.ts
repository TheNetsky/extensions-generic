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


const ISEKAISCAN_DOMAIN = 'https://isekaiscan.com'

export const IsekaiScanInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'IsekaiScan',
    description: 'Extension that pulls manga from isekaiscan.com',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: ISEKAISCAN_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class IsekaiScan extends Madara {
    baseUrl: string = ISEKAISCAN_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
    override alternativeChapterAjaxEndpoint = true
    override hasAdvancedSearchPage = true
}