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

const COLOREDMANGA_DOMAIN = 'https://coloredmanga.com'

export const ColoredMangaInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'ColoredManga',
    description: 'Extension that pulls manga from coloredmanga.com',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: COLOREDMANGA_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class ColoredManga extends Madara {
    baseUrl: string = COLOREDMANGA_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
    override hasAdvancedSearchPage = true
    override alternativeChapterAjaxEndpoint = true
}
