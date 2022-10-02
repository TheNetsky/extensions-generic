/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    ContentRating,
    SourceInfo,
    TagType
} from 'paperback-extensions-common'
import {
    getExportVersion,
    Madara
} from '../Madara'

import { MangaLekParser } from './MangaLekParser'

const DOMAIN = 'https://mangalek.com'
let globalUA: string | null

export const MangaLekInfo: SourceInfo = {
    version: getExportVersion('0.0.1'),
    name: 'MangaLek',
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
        },
        {
            text: 'Arabic',
            type: TagType.GREY
        }
    ]
}

export class MangaLek extends Madara {

    baseUrl: string = DOMAIN

    languageCode: string = 'Arabic'

    override hasAdvancedSearchPage = true

    override alternativeChapterAjaxEndpoint = true

    override sourceTraversalPathName = 'manga'

    override readonly parser: MangaLekParser = new MangaLekParser();

    override getCloudflareBypassRequest() {
        return createRequestObject({
            url: `${this.baseUrl}/?s=&post_type=wp-manga`,
            method: 'GET',
            headers: {
                ...(globalUA && { 'user-agent': globalUA }),
            }
        })
    }

}
