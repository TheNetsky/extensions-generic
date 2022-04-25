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

const MANHUAPRO_DOMAIN = 'https://manhuapro.com'

export const ManhuaProInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'ManhuaPro',
    description: 'Extension that pulls manga from manhuapro.com',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: MANHUAPRO_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class ManhuaPro extends Madara {
    baseUrl: string = MANHUAPRO_DOMAIN
    override languageCode: LanguageCode = LanguageCode.ENGLISH
    override alternativeChapterAjaxEndpoint = false
}
