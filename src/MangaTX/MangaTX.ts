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

const MANGATX_DOMAIN = 'https://mangatx.com'

export const MangaTXInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'MangaTX',
    description: 'Extension that pulls manga from mangatx.com',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: MANGATX_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class MangaTX extends Madara {
    baseUrl: string = MANGATX_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
    override hasAdvancedSearchPage = true
}
