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

const MANGACULTIVATOR_DOMAIN = 'https://mangacultivator.com'

export const MangaCultivatorInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'MangaCultivator',
    description: 'Extension that pulls manga from mangacultivator.com',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: MANGACULTIVATOR_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class MangaCultivator extends Madara {
    baseUrl: string = MANGACULTIVATOR_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
    override hasAdvancedSearchPage = true
    override alternativeChapterAjaxEndpoint = true
}
