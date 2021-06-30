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

const ALOALIVN_DOMAIN = 'https://aloalivn.com'

export const AloalivnInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'Aloalivn',
    description: 'Extension that pulls manga from aloalivn.com',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: ALOALIVN_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class Aloalivn extends Madara {
    baseUrl: string = ALOALIVN_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
    override hasAdvancedSearchPage = true
    override chapterDetailsSelector = 'li.blocks-gallery-item > figure > img'
}
