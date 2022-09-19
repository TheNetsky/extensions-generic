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

const DOMAIN = 'https://manhwa18.cc'

export const Manhwa18Info: SourceInfo = {
    version: getExportVersion('0.0.1'),
    name: 'Manhwa18',
    description: `Extension that pulls manga from ${DOMAIN}`,
    author: 'IvanMatthew',
    authorWebsite: 'http://github.com/Ivanmatthew',
    icon: 'icon.png',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class Manhwa18 extends Madara {

    baseUrl: string = DOMAIN

    languageCode: LanguageCode = LanguageCode.ENGLISH

    override hasAdvancedSearchPage = true

    override chapterDetailsSelector = 'div.read-content > img'
    
    override alternativeChapterAjaxEndpoint = true
}
