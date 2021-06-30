"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebtoonXYZ = exports.WebtoonXYZInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const Madara_1 = require("../Madara");
const WEBTOON_DOMAIN = 'https://www.webtoon.xyz';
exports.WebtoonXYZInfo = {
    version: '1.1.2',
    name: 'WebtoonXYZ',
    description: 'Extension that pulls manga from Webtoon.XYZ',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: paperback_extensions_common_1.ContentRating.ADULT,
    websiteBaseURL: WEBTOON_DOMAIN,
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
class WebtoonXYZ extends Madara_1.Madara {
    constructor() {
        super(...arguments);
        this.baseUrl = WEBTOON_DOMAIN;
        this.languageCode = paperback_extensions_common_1.LanguageCode.ENGLISH;
        this.sourceTraversalPathName = 'read';
        this.userAgentRandomizer = '';
    }
}
exports.WebtoonXYZ = WebtoonXYZ;
