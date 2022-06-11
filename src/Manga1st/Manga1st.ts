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


const DOMAIN = 'https://manga1st.online'

export const Manga1stInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'Manga1st',
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
        }
    ]
}

export class Manga1st extends Madara {

    baseUrl: string = DOMAIN

    languageCode: LanguageCode = LanguageCode.ENGLISH

    override alternativeChapterAjaxEndpoint = true
    
    override hasAdvancedSearchPage = true
}