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


const DOMAIN = 'https://imhentai.xxx'

export const IMHentaiInfo: SourceInfo = {
    version: getExportVersion('0.0.1'),
    name: 'IMHentai',
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


export class IMHentai extends Bentai {

    baseUrl: string = DOMAIN

    languageCode: LanguageCode = LanguageCode.ENGLISH

    override directorySubtitleSelector = 'a.thumb_cat'
}