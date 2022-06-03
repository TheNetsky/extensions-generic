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

const DOMAIN = 'https://danke.moe'

export const DankeFursLesenInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'DankeFursLesen',
    description: 'Extension that pulls manga from danke.moe',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
        {
            text: '18+',
            type: TagType.YELLOW
        }
    ]
}

export class DankeFursLesen extends GuyaBase {

    baseUrl: string = DOMAIN

    languageCode: LanguageCode = LanguageCode.ENGLISH

}