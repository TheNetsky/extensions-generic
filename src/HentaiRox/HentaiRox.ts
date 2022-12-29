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


const DOMAIN = 'https://hentairox.com'

export const HentaiRoxInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'HentaiRox',
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


export class HentaiRox extends Bentai {

    baseUrl: string = DOMAIN

    languageCode: LanguageCode = LanguageCode.ENGLISH

    override directorySubtitleSelector = 'a.thumb_cat'

}