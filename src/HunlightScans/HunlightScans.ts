import {
    ContentRating,
    LanguageCode,
    SourceInfo,
    TagType
} from 'paperback-extensions-common'
import {
    Genkan,
    getExportVersion
} from '../Genkan'

const HUNLIGHTSCANS_DOMAIN = 'https://hunlight-scans.info'

export const HunlightScansInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'Hunlight Scans',
    description: 'Extension that pulls manga from hunlight-scans.info',
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
    icon: 'icon.png',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: HUNLIGHTSCANS_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class HunlightScans extends Genkan {
    baseUrl: string = HUNLIGHTSCANS_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH

}