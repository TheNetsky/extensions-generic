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


const DOMAIN = 'https://hentaifox.com'

export const HentaiFoxInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'HentaiFox',
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


export class HentaiFox extends Bentai {

    baseUrl: string = DOMAIN

    languageCode: LanguageCode = LanguageCode.ENGLISH

    override imageCDN = 'https://i2.hentaifox.com'

    override directoryGallerySelector = 'div.lc_galleries'

    override directoryPageParam = 'pag/'

    override directorySubtitleSelector = 'a.t_cat'

    override directorySkipFirst = true

    override directorySearchParam = '?q='

    override tagBoxSelector = 'div.list_tags'

}