/* eslint-disable linebreak-style */
import {
    LanguageCode,
    SourceInfo,
    TagType,
    ContentRating
} from 'paperback-extensions-common'

import {
    GuyaBase,
    getExportVersion
} from '../GuyaBase'

const DOMAIN = 'https://guya.cubari.moe'

export const GuyaInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'Guya',
    description: `Extension that pulls manga from ${DOMAIN}`,
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
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

export class Guya extends GuyaBase {

    baseUrl: string = DOMAIN

    languageCode: LanguageCode = LanguageCode.ENGLISH

}