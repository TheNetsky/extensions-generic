"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManhuaPlus = exports.ManhuaPlusInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const Madara_1 = require("../Madara");
const MANHUAPLUS_DOMAIN = 'https://manhuaplus.com';
exports.ManhuaPlusInfo = {
    version: '1.1.2',
    name: 'ManhuaPlus',
    description: 'Extension that pulls manga from manhuaplus.com',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: paperback_extensions_common_1.ContentRating.EVERYONE,
    websiteBaseURL: MANHUAPLUS_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ]
};
class ManhuaPlus extends Madara_1.Madara {
    constructor() {
        super(...arguments);
        this.baseUrl = MANHUAPLUS_DOMAIN;
        this.languageCode = paperback_extensions_common_1.LanguageCode.ENGLISH;
        this.hasAdvancedSearchPage = true;
        this.chapterDetailsSelector = 'li.blocks-gallery-item > figure > img, div.page-break > img';
    }
}
exports.ManhuaPlus = ManhuaPlus;
