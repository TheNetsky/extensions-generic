import {
    ContentRating,
    LanguageCode,
    SourceInfo,
    TagType
} from 'paperback-extensions-common'
import {
    getExportVersion,
    Madara
} from '../Madara'

import { ReaperScansParser } from './ReaperScansParser'

const REAPERSCANS_DOMAIN = 'https://reaperscans.com'

export const ReaperScansInfo: SourceInfo = {
    version: getExportVersion('0.0.1'),
    name: 'ReaperScans',
    description: 'Extension that pulls manga from reaperscans.com',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: REAPERSCANS_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class ReaperScans extends Madara {
    baseUrl: string = REAPERSCANS_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
    override hasAdvancedSearchPage = true
    override alternativeChapterAjaxEndpoint = true
    override sourceTraversalPathName = 'series'

    override readonly parser: ReaperScansParser = new ReaperScansParser();

}
