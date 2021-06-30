import {
    ContentRating,
    LanguageCode,
    SourceInfo,
    TagType
} from 'paperback-extensions-common'
import {Madara} from '../Madara'

const LEVIATANSCANS_DOMAIN = 'https://leviatanscans.com'

export const LeviatanScansInfo: SourceInfo = {
    version: '1.1.2',
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
    override sourceTraversalPathName = 'comicss/manga'
}
