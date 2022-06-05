import {
    ContentRating,
    LanguageCode,
    SourceInfo,
    TagType
} from 'paperback-extensions-common'

import {
    Bentai,
    getExportVersion
} from '../Bentai'


const DOMAIN = 'https://hentaiera.com'

export const HentaiEraInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'HentaiEra',
    description: `Extension that pulls items from ${DOMAIN}`,
    author: 'Netsky',
    authorWebsite: 'https://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: DOMAIN,
    language: LanguageCode.ENGLISH,
    sourceTags: [
        {
            text: '18+',
            type: TagType.YELLOW
        }
    ]
}


export class HentaiEra extends Bentai {

    baseUrl: string = DOMAIN

    languageCode: LanguageCode = LanguageCode.ENGLISH

    override imageCDN = 'https://m6.hentaiera.com'

}