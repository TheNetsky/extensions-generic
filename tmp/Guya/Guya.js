"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Guya = exports.GuyaInfo = void 0;
/* eslint-disable linebreak-style */
const paperback_extensions_common_1 = require("paperback-extensions-common");
const GuyaBase_1 = require("../GuyaBase");
const DOMAIN = 'https://guya.cubari.moe';
exports.GuyaInfo = {
    version: (0, GuyaBase_1.getExportVersion)('0.0.0'),
    name: 'Guya',
    description: 'Extension that pulls manga from guya.moe',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: paperback_extensions_common_1.ContentRating.EVERYONE,
    websiteBaseURL: DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ]
};
class Guya extends GuyaBase_1.GuyaBase {
    constructor() {
        super(...arguments);
        this.baseUrl = DOMAIN;
        this.languageCode = paperback_extensions_common_1.LanguageCode.ENGLISH;
    }
}
exports.Guya = Guya;
