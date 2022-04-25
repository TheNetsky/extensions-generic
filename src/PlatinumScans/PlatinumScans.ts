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

const PLATINUMSCANS_DOMAIN = 'https://platinumscans.com'

export const PlatinumScansInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'PlatinumScans',
    description: 'Extension that pulls manga from platinumscans.com',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: PLATINUMSCANS_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class PlatinumScans extends Madara {
    baseUrl: string = PLATINUMSCANS_DOMAIN
    override languageCode: LanguageCode = LanguageCode.ENGLISH
    override alternativeChapterAjaxEndpoint = false
}
