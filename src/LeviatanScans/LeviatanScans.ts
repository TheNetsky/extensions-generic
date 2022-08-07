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

const DOMAIN = 'https://leviatanscans.com'

export const LeviatanScansInfo: SourceInfo = {
    version: getExportVersion('0.0.3'),
    name: 'LeviatanScans',
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

export class LeviatanScans extends Madara {

    baseUrl: string = DOMAIN

    override languageCode: LanguageCode = LanguageCode.ENGLISH

    override sourceTraversalPathName = 'hy/manga'

    override alternativeChapterAjaxEndpoint = true
}
