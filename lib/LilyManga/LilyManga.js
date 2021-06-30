"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LilyManga = exports.LilyMangaInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const Madara_1 = require("../Madara");
const LILYMANGA_DOMAIN = 'https://lilymanga.com';
exports.LilyMangaInfo = {
    version: '1.0.1',
    name: 'LilyManga',
    description: 'Extension that pulls manga from LilyManga',
    author: 'PythonCoderAS',
    authorWebsite: 'https://github.com/PythonCoderAS',
    icon: 'icon.png',
    contentRating: paperback_extensions_common_1.ContentRating.ADULT,
    websiteBaseURL: LILYMANGA_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: paperback_extensions_common_1.TagType.GREEN
        },
        {
            text: 'Cloudflare',
            type: paperback_extensions_common_1.TagType.RED
        }
    ]
};
class LilyManga extends Madara_1.Madara {
    constructor() {
        super(...arguments);
        this.baseUrl = LILYMANGA_DOMAIN;
        this.languageCode = paperback_extensions_common_1.LanguageCode.ENGLISH;
        this.hasAdvancedSearchPage = true;
        this.sourceTraversalPathName = 'ys';
        this.userAgentRandomizer = '';
    }
}
exports.LilyManga = LilyManga;
