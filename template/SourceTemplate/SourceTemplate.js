"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceTemplate = exports.SourceTemplateInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const Madara_1 = require("../Madara");
const SourceTemplateParser_1 = require("./SourceTemplateParser");
const DOMAIN = 'https://thewebsite.com';
exports.SourceTemplateInfo = {
    version: (0, Madara_1.getExportVersion)('0.0.0'),
    name: 'SourceTemplate',
    description: `Extension that pulls manga from ${DOMAIN}`,
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    // Remember to change the icon in the include folder
    icon: 'icon.png',
    // The content rating (Everyone, Mature or Adult)
    contentRating: paperback_extensions_common_1.ContentRating.EVERYONE,
    websiteBaseURL: DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ]
};
class SourceTemplate extends Madara_1.Madara {
    constructor() {
        super(...arguments);
        this.baseUrl = DOMAIN;
        this.languageCode = paperback_extensions_common_1.LanguageCode.ENGLISH;
        this.parser = new SourceTemplateParser_1.SourceTemplateParser();
        this.hasAdvancedSearchPage = true;
        this.alternativeChapterAjaxEndpoint = true;
        this.sourceTraversalPathName = 'page';
    }
}
exports.SourceTemplate = SourceTemplate;
