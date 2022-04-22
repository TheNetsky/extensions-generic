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

import { TeenManhuaParser } from './TeenManhuaParser'

const TEENMANHUA_DOMAIN = 'https://teenmanhua.com'

export const TeenManhuaInfo: SourceInfo = {
    version: getExportVersion('0.0.1'),
    name: 'TeenManhua',
    description: 'Extension that pulls manga from teenmanhua.com',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: TEENMANHUA_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class TeenManhua extends Madara {
    baseUrl: string = TEENMANHUA_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
    override hasAdvancedSearchPage = true
    override alternativeChapterAjaxEndpoint = true

    override readonly parser: TeenManhuaParser = new TeenManhuaParser();
}
