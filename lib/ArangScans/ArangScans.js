"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArangScans = exports.ArangScansInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const Madara_1 = require("../Madara");
const ARANGSCANS_DOMAIN = 'https://arangscans.com';
exports.ArangScansInfo = {
    version: '1.1.3',
    name: 'ArangScans',
    description: 'Extension that pulls manga from arangscans.com',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: paperback_extensions_common_1.ContentRating.EVERYONE,
    websiteBaseURL: ARANGSCANS_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ]
};
class ArangScans extends Madara_1.Madara {
    constructor() {
        super(...arguments);
        this.baseUrl = ARANGSCANS_DOMAIN;
        this.languageCode = paperback_extensions_common_1.LanguageCode.ENGLISH;
        this.userAgentRandomizer = '';
        this.chapterDetailsParam = '?style=list';
    }
}
exports.ArangScans = ArangScans;
