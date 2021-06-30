"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeviatanScans = exports.LeviatanScansInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const Madara_1 = require("../Madara");
const LEVIATANSCANS_DOMAIN = 'https://leviatanscans.com';
exports.LeviatanScansInfo = {
    version: '1.1.2',
    name: 'LeviatanScans',
    description: 'Extension that pulls manga from leviatanscans.com',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: paperback_extensions_common_1.ContentRating.EVERYONE,
    websiteBaseURL: LEVIATANSCANS_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ]
};
class LeviatanScans extends Madara_1.Madara {
    constructor() {
        super(...arguments);
        this.baseUrl = LEVIATANSCANS_DOMAIN;
        this.languageCode = paperback_extensions_common_1.LanguageCode.ENGLISH;
        this.sourceTraversalPathName = 'comicss/manga';
    }
}
exports.LeviatanScans = LeviatanScans;
