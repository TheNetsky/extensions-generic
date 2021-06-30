import {
    ContentRating,
    LanguageCode,
    SourceInfo,
    TagType
} from 'paperback-extensions-common'
import {Madara} from '../Madara'

const MANGABOB_DOMAIN = 'https://mangabob.com'

export const MangaBobInfo: SourceInfo = {
    version: '1.1.2',
    name: 'MangaBob',
    description: 'Extension that pulls manga from mangabob.com',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: MANGABOB_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class MangaBob extends Madara {
    baseUrl: string = MANGABOB_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
    override hasAdvancedSearchPage = true
}
