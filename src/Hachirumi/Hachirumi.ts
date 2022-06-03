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

const DOMAIN = 'https://hachirumi.com'

export const HachirumiInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'Hachirumi',
    description: 'Extension that pulls manga from hachirumi.com',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class Hachirumi extends GuyaBase {

    baseUrl: string = DOMAIN

    languageCode: LanguageCode = LanguageCode.ENGLISH

}