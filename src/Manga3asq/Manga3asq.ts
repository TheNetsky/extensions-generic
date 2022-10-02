import {
    ContentRating,
    SourceInfo,
    TagType
} from 'paperback-extensions-common'
import {
    getExportVersion,
    Madara
} from '../Madara'

import { Manga3asqParser } from './Manga3asqParser'

const DOMAIN = 'https://3asq.org'

export const Manga3asqInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: '3asq Manga',
    description: `Extension that pulls manga from ${DOMAIN}`,
    author: 'xOnlyFadi',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
        {
            text: 'Arabic',
            type: TagType.GREY
        }
    ]
}

export class Manga3asq extends Madara {

    baseUrl: string = DOMAIN

    languageCode: string = 'Arabic'

    override hasAdvancedSearchPage = true

    override alternativeChapterAjaxEndpoint = true

    override sourceTraversalPathName = 'manga'

    override readonly parser: Manga3asqParser = new Manga3asqParser();

}
