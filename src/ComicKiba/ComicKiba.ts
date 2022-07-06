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

const DOMAIN = 'https://comickiba.com'

export const ComicKibaInfo: SourceInfo = {
    version: getExportVersion('0.0.1'),
    name: 'ComicKiba',
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

export class ComicKiba extends Madara {

    baseUrl: string = DOMAIN

    languageCode: LanguageCode = LanguageCode.ENGLISH

    override hasAdvancedSearchPage = true

    override chapterDetailsSelector = 'li.blocks-gallery-item img:nth-child(1), div.reading-content p > img, .read-container .reading-content img'
    
    override alternativeChapterAjaxEndpoint = true
}
