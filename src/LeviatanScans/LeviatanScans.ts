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

const LEVIATANSCANS_DOMAIN = 'https://leviatanscans.com'

export const LeviatanScansInfo: SourceInfo = {
    version: getExportVersion('0.0.1'),
    name: 'LeviatanScans',
    description: 'Extension that pulls manga from leviatanscans.com',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: LEVIATANSCANS_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class LeviatanScans extends Madara {
    baseUrl: string = LEVIATANSCANS_DOMAIN
    override languageCode: LanguageCode = LanguageCode.ENGLISH
    override sourceTraversalPathName = 'am/manga'
    override alternativeChapterAjaxEndpoint = true
}
