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

const COMICKIBA_DOMAIN = 'https://comickiba.com'

export const ComicKibaInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'ComicKiba',
    description: 'Extension that pulls manga from comickiba.com',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: COMICKIBA_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class ComicKiba extends Madara {
    baseUrl: string = COMICKIBA_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
    override hasAdvancedSearchPage = true
    override chapterDetailsSelector = 'li.blocks-gallery-item img:nth-child(1), div.reading-content p > img, .read-container .reading-content img'
}
