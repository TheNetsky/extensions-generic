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

const SKSCANS_DOMAIN = 'https://skscans.com'

export const SKScansInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'SKScans',
    description: 'Extension that pulls manga from skscans.com',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: SKSCANS_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class SKScans extends Madara {
    baseUrl: string = SKSCANS_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
}
