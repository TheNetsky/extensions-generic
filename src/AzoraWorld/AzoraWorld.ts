/* eslint-disable linebreak-style */
import {
    ContentRating,
    SourceInfo,
    TagType
} from 'paperback-extensions-common'
import { 
    getExportVersion,
    Madara 
} from '../Madara'
import { AzoraWorldParser } from './AzoraWorldParser'

const DOMAIN = 'https://azoraworld.com'

export const AzoraWorldInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'AzoraWorld',
    description: `Extension that pulls manga from ${DOMAIN}`,
    author: 'Ali Mohamed',
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
        },
    ]
}

export class AzoraWorld extends Madara {
    baseUrl: string = DOMAIN
    languageCode: string = 'Arabic'
    override sourceTraversalPathName = 'series'
    override hasAdvancedSearchPage = true
    override alternativeChapterAjaxEndpoint = true
    override readonly parser: AzoraWorldParser = new AzoraWorldParser()
}
