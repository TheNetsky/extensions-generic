"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComicKiba = exports.ComicKibaInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const Madara_1 = require("../Madara");
const COMICKIBA_DOMAIN = 'https://comickiba.com';
exports.ComicKibaInfo = {
    version: '1.1.2',
    name: 'ComicKiba',
    description: 'Extension that pulls manga from comickiba.com',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: paperback_extensions_common_1.ContentRating.EVERYONE,
    websiteBaseURL: COMICKIBA_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ]
};
class ComicKiba extends Madara_1.Madara {
    constructor() {
        super(...arguments);
        this.baseUrl = COMICKIBA_DOMAIN;
        this.languageCode = paperback_extensions_common_1.LanguageCode.ENGLISH;
        this.hasAdvancedSearchPage = true;
        this.chapterDetailsSelector = 'li.blocks-gallery-item img:nth-child(1), div.reading-content p > img, .read-container .reading-content img';
    }
}
exports.ComicKiba = ComicKiba;
