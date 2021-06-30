"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Aloalivn = exports.AloalivnInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const Madara_1 = require("../Madara");
const ALOALIVN_DOMAIN = 'https://aloalivn.com';
exports.AloalivnInfo = {
    version: '1.1.2',
    name: 'Aloalivn',
    description: 'Extension that pulls manga from aloalivn.com',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: paperback_extensions_common_1.ContentRating.EVERYONE,
    websiteBaseURL: ALOALIVN_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ]
};
class Aloalivn extends Madara_1.Madara {
    constructor() {
        super(...arguments);
        this.baseUrl = ALOALIVN_DOMAIN;
        this.languageCode = paperback_extensions_common_1.LanguageCode.ENGLISH;
        this.hasAdvancedSearchPage = true;
        this.chapterDetailsSelector = 'li.blocks-gallery-item > figure > img';
    }
}
exports.Aloalivn = Aloalivn;
