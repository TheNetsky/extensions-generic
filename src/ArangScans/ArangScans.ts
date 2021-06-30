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

const ARANGSCANS_DOMAIN = 'https://arangscans.com'

export const ArangScansInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'ArangScans',
    description: 'Extension that pulls manga from arangscans.com',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: ARANGSCANS_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class ArangScans extends Madara {
    baseUrl: string = ARANGSCANS_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
    override userAgentRandomizer = ''
    override chapterDetailsParam = '?style=list'
}
