"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XuNScans = exports.XuNScansInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const Madara_1 = require("../Madara");
const XUNSCANS_DOMAIN = 'https://reader.xunscans.xyz';
exports.XuNScansInfo = {
    version: '1.1.2',
    name: 'XuNScans',
    description: 'Extension that pulls manga from xunscans.xyz',
    author: 'Nuno Costa',
    authorWebsite: 'http://github.com/nuno99costa',
    icon: 'icon.png',
    contentRating: paperback_extensions_common_1.ContentRating.MATURE,
    websiteBaseURL: XUNSCANS_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ]
};
class XuNScans extends Madara_1.Madara {
    constructor() {
        super(...arguments);
        this.baseUrl = XUNSCANS_DOMAIN;
        this.languageCode = paperback_extensions_common_1.LanguageCode.ENGLISH;
        this.hasAdvancedSearchPage = true;
        this.userAgentRandomizer = '';
    }
}
exports.XuNScans = XuNScans;
