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

const DOMAIN = 'https://mahoushoujobu.com'

export const MagicalTranslatorsInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'Magical Translators',
    description: `Extension that pulls manga from ${DOMAIN}`,
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

export class MagicalTranslators extends GuyaBase {

    baseUrl: string = DOMAIN

    languageCode: LanguageCode = LanguageCode.ENGLISH

}