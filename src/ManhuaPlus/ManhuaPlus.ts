import {
    ContentRating,
    LanguageCode,
    SourceInfo,
    TagType
} from 'paperback-extensions-common'
import {Madara} from '../Madara'

const MANHUAPLUS_DOMAIN = 'https://manhuaplus.com'

export const ManhuaPlusInfo: SourceInfo = {
    version: '1.1.2',
    name: 'ManhuaPlus',
    description: 'Extension that pulls manga from manhuaplus.com',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: MANHUAPLUS_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class ManhuaPlus extends Madara {
    baseUrl: string = MANHUAPLUS_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
    override hasAdvancedSearchPage = true
    override chapterDetailsSelector = 'li.blocks-gallery-item > figure > img, div.page-break > img'
}
