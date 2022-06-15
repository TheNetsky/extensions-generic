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

const DOMAIN = 'https://mangahatachi.com'

export const MangaHatachiInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'MangaHatachi',
    description: `Extension that pulls manga from ${DOMAIN}`,
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
        {
            text: '18+',
            type: TagType.YELLOW
        },
        {
            text: 'Japanese',
            type: TagType.GREY
        }
    ]
}

export class MangaHatachi extends Madara {

    baseUrl: string = DOMAIN

    languageCode: LanguageCode = LanguageCode.JAPANESE

    override hasAdvancedSearchPage = true

    override alternativeChapterAjaxEndpoint = true
}
