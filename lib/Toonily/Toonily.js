"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Toonily = exports.ToonilyInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const Madara_1 = require("../Madara");
const TOONILY_DOMAIN = 'https://toonily.com';
exports.ToonilyInfo = {
    version: '1.1.2',
    name: 'Toonily',
    description: 'Extension that pulls manga from toonily.com',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: paperback_extensions_common_1.ContentRating.ADULT,
    websiteBaseURL: TOONILY_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: paperback_extensions_common_1.TagType.GREEN
        },
        {
            text: '18+',
            type: paperback_extensions_common_1.TagType.YELLOW
        },
        {
            text: 'Cloudflare',
            type: paperback_extensions_common_1.TagType.RED
        }
    ]
};
class Toonily extends Madara_1.Madara {
    constructor() {
        super(...arguments);
        this.baseUrl = TOONILY_DOMAIN;
        this.languageCode = paperback_extensions_common_1.LanguageCode.ENGLISH;
        this.hasAdvancedSearchPage = true;
        this.sourceTraversalPathName = 'webtoon';
        this.userAgentRandomizer = '';
    }
}
exports.Toonily = Toonily;
