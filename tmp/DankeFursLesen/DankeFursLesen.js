"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DankeFursLesen = exports.DankeFursLesenInfo = void 0;
/* eslint-disable linebreak-style */
const paperback_extensions_common_1 = require("paperback-extensions-common");
const GuyaBase_1 = require("../GuyaBase");
const DOMAIN = 'https://danke.moe';
exports.DankeFursLesenInfo = {
    version: (0, GuyaBase_1.getExportVersion)('0.0.0'),
    name: 'DankeFursLesen',
    description: 'Extension that pulls manga from danke.moe',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: paperback_extensions_common_1.ContentRating.ADULT,
    websiteBaseURL: DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: paperback_extensions_common_1.TagType.GREEN
        },
        {
            text: '18+',
            type: paperback_extensions_common_1.TagType.YELLOW
        }
    ]
};
class DankeFursLesen extends GuyaBase_1.GuyaBase {
    constructor() {
        super(...arguments);
        this.baseUrl = DOMAIN;
        this.languageCode = paperback_extensions_common_1.LanguageCode.ENGLISH;
    }
}
exports.DankeFursLesen = DankeFursLesen;
