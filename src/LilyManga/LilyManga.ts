import {
    ContentRating,
    LanguageCode,
    SourceInfo,
    TagType
} from 'paperback-extensions-common'
import {Madara} from '../Madara'

const LILYMANGA_DOMAIN = 'https://lilymanga.com'

export const LilyMangaInfo: SourceInfo = {
    version: '1.0.1',
    name: 'LilyManga',
    description: 'Extension that pulls manga from LilyManga',
    author: 'PythonCoderAS',
    authorWebsite: 'https://github.com/PythonCoderAS',
    icon: 'icon.png',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: LILYMANGA_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
        {
            text: 'Cloudflare',
            type: TagType.RED
        }
    ]
}

export class LilyManga extends Madara {
    baseUrl: string = LILYMANGA_DOMAIN;
    languageCode: LanguageCode = LanguageCode.ENGLISH;
    override hasAdvancedSearchPage = true
    override sourceTraversalPathName = 'ys';
    override userAgentRandomizer = '';
}
