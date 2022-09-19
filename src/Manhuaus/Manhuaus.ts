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

const DOMAIN = 'https://manhuaus.com'

export const ManhuausInfo: SourceInfo = {
    version: getExportVersion('0.0.3'),
    name: 'Manhuaus',
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

export class Manhuaus extends Madara {

    baseUrl: string = DOMAIN

    languageCode: LanguageCode = LanguageCode.ENGLISH

    override hasAdvancedSearchPage = true

    override chapterDetailsSelector = 'li.blocks-gallery-item > figure > img, div.page-break > img, div#chapter-video-frame > p > img, div.text-left > figure.wp-block-gallery > figure.wp-block-image > img, div.text-left > p > img''
    
    override alternativeChapterAjaxEndpoint = true
}
