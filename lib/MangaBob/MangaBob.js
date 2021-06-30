"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaBob = exports.MangaBobInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const Madara_1 = require("../Madara");
const MANGABOB_DOMAIN = 'https://mangabob.com';
exports.MangaBobInfo = {
    version: '1.1.2',
    name: 'MangaBob',
    description: 'Extension that pulls manga from mangabob.com',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: paperback_extensions_common_1.ContentRating.EVERYONE,
    websiteBaseURL: MANGABOB_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ]
};
class MangaBob extends Madara_1.Madara {
    constructor() {
        super(...arguments);
        this.baseUrl = MANGABOB_DOMAIN;
        this.languageCode = paperback_extensions_common_1.LanguageCode.ENGLISH;
        this.hasAdvancedSearchPage = true;
    }
}
exports.MangaBob = MangaBob;
