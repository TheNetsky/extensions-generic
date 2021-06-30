"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HiperDex = exports.HiperDexInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const Madara_1 = require("../Madara");
const HIPERDEX_DOMAIN = 'https://hiperdex.com';
exports.HiperDexInfo = {
    version: '1.1.2',
    name: 'HiperDex',
    description: 'Extension that pulls manga from hiperdex.com',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: paperback_extensions_common_1.ContentRating.ADULT,
    websiteBaseURL: HIPERDEX_DOMAIN,
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
class HiperDex extends Madara_1.Madara {
    constructor() {
        super(...arguments);
        this.baseUrl = HIPERDEX_DOMAIN;
        this.languageCode = paperback_extensions_common_1.LanguageCode.ENGLISH;
        this.hasAdvancedSearchPage = true;
        this.userAgentRandomizer = '';
    }
}
exports.HiperDex = HiperDex;
