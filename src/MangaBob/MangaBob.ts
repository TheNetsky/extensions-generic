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

const DOMAIN = 'https://mangabob.com'

export const MangaBobInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'MangaBob',
    description: `Extension that pulls manga from ${DOMAIN}`,
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
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

export class MangaBob extends Madara {

    baseUrl: string = DOMAIN

    languageCode: LanguageCode = LanguageCode.ENGLISH

    override hasAdvancedSearchPage = true
}
