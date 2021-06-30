"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SKScans = exports.SKScansInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const Madara_1 = require("../Madara");
const SKSCANS_DOMAIN = 'https://skscans.com';
exports.SKScansInfo = {
    version: '1.1.2',
    name: 'SKScans',
    description: 'Extension that pulls manga from skscans.com',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: paperback_extensions_common_1.ContentRating.EVERYONE,
    websiteBaseURL: SKSCANS_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ]
};
class SKScans extends Madara_1.Madara {
    constructor() {
        super(...arguments);
        this.baseUrl = SKSCANS_DOMAIN;
        this.languageCode = paperback_extensions_common_1.LanguageCode.ENGLISH;
    }
}
exports.SKScans = SKScans;
