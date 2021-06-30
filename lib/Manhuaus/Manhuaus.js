"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Manhuaus = exports.ManhuausInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const Madara_1 = require("../Madara");
const MANHUAUS_DOMAIN = 'https://manhuaus.com';
exports.ManhuausInfo = {
    version: '1.1.2',
    name: 'Manhuaus',
    description: 'Extension that pulls manga from manhuaus.com',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: paperback_extensions_common_1.ContentRating.EVERYONE,
    websiteBaseURL: MANHUAUS_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ]
};
class Manhuaus extends Madara_1.Madara {
    constructor() {
        super(...arguments);
        this.baseUrl = MANHUAUS_DOMAIN;
        this.languageCode = paperback_extensions_common_1.LanguageCode.ENGLISH;
        this.hasAdvancedSearchPage = true;
        this.chapterDetailsSelector = 'li.blocks-gallery-item > figure > img';
    }
}
exports.Manhuaus = Manhuaus;
