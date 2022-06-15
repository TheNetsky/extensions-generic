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

const DOMAIN = 'https://lynxscans.com'

export const LynxScansInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'LynxScans',
    description: `Extension that pulls manga from ${DOMAIN}`,
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
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

export class LynxScans extends Genkan {

    baseUrl: string = DOMAIN

    languageCode: LanguageCode = LanguageCode.ENGLISH

    override DefaultUrlDirectory = 'web/comics'

    override serieslDirectory = 'comics'

}