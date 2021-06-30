"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeviatanScansES = exports.LeviatanScansESInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const Madara_1 = require("../Madara");
const LEVIATANSCANSES_DOMAIN = 'https://es.leviatanscans.com';
exports.LeviatanScansESInfo = {
    version: '1.1.2',
    name: 'LeviatanScansES',
    description: 'Extension that pulls manga from es.leviatanscans.com',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: paperback_extensions_common_1.ContentRating.EVERYONE,
    websiteBaseURL: LEVIATANSCANSES_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ]
};
class LeviatanScansES extends Madara_1.Madara {
    constructor() {
        super(...arguments);
        this.baseUrl = LEVIATANSCANSES_DOMAIN;
        this.languageCode = paperback_extensions_common_1.LanguageCode.ENGLISH;
        this.sourceTraversalPathName = 'comics/manga';
    }
}
exports.LeviatanScansES = LeviatanScansES;
