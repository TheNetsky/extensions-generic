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

import {SourceTemplateParser} from "./SourceTemplateParser";
const DOMAIN = 'https://thewebsite.com'

export const SourceTemplateInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'SourceTemplate',
    description: `Extension that pulls manga from ${DOMAIN}`,
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    // Remember to change the icon in the include folder
    icon: 'icon.png',
    // The content rating (Everyone, Mature or Adult)
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class SourceTemplate extends Madara {
    baseUrl: string = DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
    override readonly parser: SourceTemplateParser = new SourceTemplateParser();

    override hasAdvancedSearchPage = true
    override alternativeChapterAjaxEndpoint = true
    override sourceTraversalPathName = 'page'
}
