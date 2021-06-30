import {
    ContentRating,
    LanguageCode,
    SourceInfo,
    TagType
} from 'paperback-extensions-common'
import {Madara} from '../Madara'

const MANHUAUS_DOMAIN = 'https://manhuaus.com'

export const ManhuausInfo: SourceInfo = {
    version: '1.1.2',
    name: 'Manhuaus',
    description: 'Extension that pulls manga from manhuaus.com',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: MANHUAUS_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class Manhuaus extends Madara {
    baseUrl: string = MANHUAUS_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
    override hasAdvancedSearchPage = true
    override chapterDetailsSelector = 'li.blocks-gallery-item > figure > img'
}
