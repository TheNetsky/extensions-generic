"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaTX = exports.MangaTXInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const Madara_1 = require("../Madara");
const MANGATX_DOMAIN = 'https://mangatx.com';
exports.MangaTXInfo = {
    version: '1.1.2',
    name: 'MangaTX',
    description: 'Extension that pulls manga from mangatx.com',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: paperback_extensions_common_1.ContentRating.MATURE,
    websiteBaseURL: MANGATX_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ]
};
class MangaTX extends Madara_1.Madara {
    constructor() {
        super(...arguments);
        this.baseUrl = MANGATX_DOMAIN;
        this.languageCode = paperback_extensions_common_1.LanguageCode.ENGLISH;
        this.hasAdvancedSearchPage = true;
    }
}
exports.MangaTX = MangaTX;
