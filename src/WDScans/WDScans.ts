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

const WDSCANS_DOMAIN = 'https://wdscans.com'

export const WDScansInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'WickedDragon Scans',
    description: 'Extension that pulls manga from wdscans.com',
    author: 'NotMarek',
    authorWebsite: 'http://github.com/notmarek',
    icon: 'icon.png',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: WDSCANS_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class WDScans extends Madara {
    baseUrl: string = WDSCANS_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
    override hasAdvancedSearchPage = true
    override alternativeChapterAjaxEndpoint = true
}
