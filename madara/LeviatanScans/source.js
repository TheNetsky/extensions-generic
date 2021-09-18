(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
"use strict";
/**
 * Request objects hold information for a particular source (see sources for example)
 * This allows us to to use a generic api to make the calls against any source
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlEncodeObject = exports.convertTime = exports.Source = void 0;
class Source {
    constructor(cheerio) {
        this.cheerio = cheerio;
    }
    /**
     * @deprecated use {@link Source.getSearchResults getSearchResults} instead
     */
    searchRequest(query, metadata) {
        return this.getSearchResults(query, metadata);
    }
    /**
     * @deprecated use {@link Source.getSearchTags} instead
     */
    getTags() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            return (_a = this.getSearchTags) === null || _a === void 0 ? void 0 : _a.call(this);
        });
    }
}
exports.Source = Source;
// Many sites use '[x] time ago' - Figured it would be good to handle these cases in general
function convertTime(timeAgo) {
    var _a;
    let time;
    let trimmed = Number(((_a = /\d*/.exec(timeAgo)) !== null && _a !== void 0 ? _a : [])[0]);
    trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed;
    if (timeAgo.includes('minutes')) {
        time = new Date(Date.now() - trimmed * 60000);
    }
    else if (timeAgo.includes('hours')) {
        time = new Date(Date.now() - trimmed * 3600000);
    }
    else if (timeAgo.includes('days')) {
        time = new Date(Date.now() - trimmed * 86400000);
    }
    else if (timeAgo.includes('year') || timeAgo.includes('years')) {
        time = new Date(Date.now() - trimmed * 31556952000);
    }
    else {
        time = new Date(Date.now());
    }
    return time;
}
exports.convertTime = convertTime;
/**
 * When a function requires a POST body, it always should be defined as a JsonObject
 * and then passed through this function to ensure that it's encoded properly.
 * @param obj
 */
function urlEncodeObject(obj) {
    let ret = {};
    for (const entry of Object.entries(obj)) {
        ret[encodeURIComponent(entry[0])] = encodeURIComponent(entry[1]);
    }
    return ret;
}
exports.urlEncodeObject = urlEncodeObject;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tracker = void 0;
class Tracker {
    constructor(cheerio) {
        this.cheerio = cheerio;
    }
}
exports.Tracker = Tracker;

},{}],4:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Source"), exports);
__exportStar(require("./Tracker"), exports);

},{"./Source":2,"./Tracker":3}],5:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./base"), exports);
__exportStar(require("./models"), exports);
__exportStar(require("./APIWrapper"), exports);

},{"./APIWrapper":1,"./base":4,"./models":47}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],7:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],8:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],9:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],10:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],11:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],12:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],13:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],14:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],15:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],16:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],17:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],18:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],19:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],20:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],21:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],22:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],23:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],24:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Button"), exports);
__exportStar(require("./Form"), exports);
__exportStar(require("./Header"), exports);
__exportStar(require("./InputField"), exports);
__exportStar(require("./Label"), exports);
__exportStar(require("./Link"), exports);
__exportStar(require("./MultilineLabel"), exports);
__exportStar(require("./NavigationButton"), exports);
__exportStar(require("./OAuthButton"), exports);
__exportStar(require("./Section"), exports);
__exportStar(require("./Select"), exports);
__exportStar(require("./Switch"), exports);
__exportStar(require("./WebViewButton"), exports);
__exportStar(require("./FormRow"), exports);
__exportStar(require("./Stepper"), exports);

},{"./Button":9,"./Form":10,"./FormRow":11,"./Header":12,"./InputField":13,"./Label":14,"./Link":15,"./MultilineLabel":16,"./NavigationButton":17,"./OAuthButton":18,"./Section":19,"./Select":20,"./Stepper":21,"./Switch":22,"./WebViewButton":23}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeSectionType = void 0;
var HomeSectionType;
(function (HomeSectionType) {
    HomeSectionType["singleRowNormal"] = "singleRowNormal";
    HomeSectionType["singleRowLarge"] = "singleRowLarge";
    HomeSectionType["doubleRow"] = "doubleRow";
    HomeSectionType["featured"] = "featured";
})(HomeSectionType = exports.HomeSectionType || (exports.HomeSectionType = {}));

},{}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageCode = void 0;
var LanguageCode;
(function (LanguageCode) {
    LanguageCode["UNKNOWN"] = "_unknown";
    LanguageCode["BENGALI"] = "bd";
    LanguageCode["BULGARIAN"] = "bg";
    LanguageCode["BRAZILIAN"] = "br";
    LanguageCode["CHINEESE"] = "cn";
    LanguageCode["CZECH"] = "cz";
    LanguageCode["GERMAN"] = "de";
    LanguageCode["DANISH"] = "dk";
    LanguageCode["ENGLISH"] = "gb";
    LanguageCode["SPANISH"] = "es";
    LanguageCode["FINNISH"] = "fi";
    LanguageCode["FRENCH"] = "fr";
    LanguageCode["WELSH"] = "gb";
    LanguageCode["GREEK"] = "gr";
    LanguageCode["CHINEESE_HONGKONG"] = "hk";
    LanguageCode["HUNGARIAN"] = "hu";
    LanguageCode["INDONESIAN"] = "id";
    LanguageCode["ISRELI"] = "il";
    LanguageCode["INDIAN"] = "in";
    LanguageCode["IRAN"] = "ir";
    LanguageCode["ITALIAN"] = "it";
    LanguageCode["JAPANESE"] = "jp";
    LanguageCode["KOREAN"] = "kr";
    LanguageCode["LITHUANIAN"] = "lt";
    LanguageCode["MONGOLIAN"] = "mn";
    LanguageCode["MEXIAN"] = "mx";
    LanguageCode["MALAY"] = "my";
    LanguageCode["DUTCH"] = "nl";
    LanguageCode["NORWEGIAN"] = "no";
    LanguageCode["PHILIPPINE"] = "ph";
    LanguageCode["POLISH"] = "pl";
    LanguageCode["PORTUGUESE"] = "pt";
    LanguageCode["ROMANIAN"] = "ro";
    LanguageCode["RUSSIAN"] = "ru";
    LanguageCode["SANSKRIT"] = "sa";
    LanguageCode["SAMI"] = "si";
    LanguageCode["THAI"] = "th";
    LanguageCode["TURKISH"] = "tr";
    LanguageCode["UKRAINIAN"] = "ua";
    LanguageCode["VIETNAMESE"] = "vn";
})(LanguageCode = exports.LanguageCode || (exports.LanguageCode = {}));

},{}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaStatus = void 0;
var MangaStatus;
(function (MangaStatus) {
    MangaStatus[MangaStatus["ONGOING"] = 1] = "ONGOING";
    MangaStatus[MangaStatus["COMPLETED"] = 0] = "COMPLETED";
    MangaStatus[MangaStatus["UNKNOWN"] = 2] = "UNKNOWN";
    MangaStatus[MangaStatus["ABANDONED"] = 3] = "ABANDONED";
    MangaStatus[MangaStatus["HIATUS"] = 4] = "HIATUS";
})(MangaStatus = exports.MangaStatus || (exports.MangaStatus = {}));

},{}],28:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],29:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],30:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],31:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],32:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],33:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],34:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],35:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],36:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],37:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchOperator = void 0;
var SearchOperator;
(function (SearchOperator) {
    SearchOperator["AND"] = "AND";
    SearchOperator["OR"] = "OR";
})(SearchOperator = exports.SearchOperator || (exports.SearchOperator = {}));

},{}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentRating = void 0;
/**
 * A content rating to be attributed to each source.
 */
var ContentRating;
(function (ContentRating) {
    ContentRating["EVERYONE"] = "EVERYONE";
    ContentRating["MATURE"] = "MATURE";
    ContentRating["ADULT"] = "ADULT";
})(ContentRating = exports.ContentRating || (exports.ContentRating = {}));

},{}],40:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],41:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagType = void 0;
/**
 * An enumerator which {@link SourceTags} uses to define the color of the tag rendered on the website.
 * Five types are available: blue, green, grey, yellow and red, the default one is blue.
 * Common colors are red for (Broken), yellow for (+18), grey for (Country-Proof)
 */
var TagType;
(function (TagType) {
    TagType["BLUE"] = "default";
    TagType["GREEN"] = "success";
    TagType["GREY"] = "info";
    TagType["YELLOW"] = "warning";
    TagType["RED"] = "danger";
})(TagType = exports.TagType || (exports.TagType = {}));

},{}],43:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],44:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],45:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],46:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],47:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Chapter"), exports);
__exportStar(require("./ChapterDetails"), exports);
__exportStar(require("./HomeSection"), exports);
__exportStar(require("./Manga"), exports);
__exportStar(require("./MangaTile"), exports);
__exportStar(require("./RequestObject"), exports);
__exportStar(require("./SearchRequest"), exports);
__exportStar(require("./TagSection"), exports);
__exportStar(require("./SourceTag"), exports);
__exportStar(require("./Languages"), exports);
__exportStar(require("./Constants"), exports);
__exportStar(require("./MangaUpdate"), exports);
__exportStar(require("./PagedResults"), exports);
__exportStar(require("./ResponseObject"), exports);
__exportStar(require("./RequestManager"), exports);
__exportStar(require("./RequestHeaders"), exports);
__exportStar(require("./SourceInfo"), exports);
__exportStar(require("./SourceStateManager"), exports);
__exportStar(require("./RequestInterceptor"), exports);
__exportStar(require("./DynamicUI"), exports);
__exportStar(require("./TrackedManga"), exports);
__exportStar(require("./SourceManga"), exports);
__exportStar(require("./TrackedMangaChapterReadAction"), exports);
__exportStar(require("./TrackerActionQueue"), exports);
__exportStar(require("./SearchField"), exports);
__exportStar(require("./RawData"), exports);

},{"./Chapter":6,"./ChapterDetails":7,"./Constants":8,"./DynamicUI":24,"./HomeSection":25,"./Languages":26,"./Manga":27,"./MangaTile":28,"./MangaUpdate":29,"./PagedResults":30,"./RawData":31,"./RequestHeaders":32,"./RequestInterceptor":33,"./RequestManager":34,"./RequestObject":35,"./ResponseObject":36,"./SearchField":37,"./SearchRequest":38,"./SourceInfo":39,"./SourceManga":40,"./SourceStateManager":41,"./SourceTag":42,"./TagSection":43,"./TrackedManga":44,"./TrackedMangaChapterReadAction":45,"./TrackerActionQueue":46}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeviatanScans = exports.LeviatanScansInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const Madara_1 = require("../Madara");
const LEVIATANSCANS_DOMAIN = 'https://leviatanscans.com';
exports.LeviatanScansInfo = {
    version: Madara_1.getExportVersion('0.0.0'),
    name: 'LeviatanScans',
    description: 'Extension that pulls manga from leviatanscans.com',
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: paperback_extensions_common_1.ContentRating.EVERYONE,
    websiteBaseURL: LEVIATANSCANS_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ]
};
class LeviatanScans extends Madara_1.Madara {
    constructor() {
        super(...arguments);
        this.baseUrl = LEVIATANSCANS_DOMAIN;
        this.languageCode = paperback_extensions_common_1.LanguageCode.ENGLISH;
        this.sourceTraversalPathName = 'alli/manga';
        this.alternativeChapterAjaxEndpoint = true;
    }
}
exports.LeviatanScans = LeviatanScans;

},{"../Madara":49,"paperback-extensions-common":5}],49:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Madara = exports.getExportVersion = void 0;
/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
const paperback_extensions_common_1 = require("paperback-extensions-common");
const MadaraParser_1 = require("./MadaraParser");
const MadaraHelper_1 = require("./MadaraHelper");
const BASE_VERSION = '2.0.2';
const getExportVersion = (EXTENSION_VERSION) => {
    return BASE_VERSION.split('.').map((x, index) => Number(x) + Number(EXTENSION_VERSION.split('.')[index])).join('.');
};
exports.getExportVersion = getExportVersion;
class Madara extends paperback_extensions_common_1.Source {
    constructor() {
        super(...arguments);
        this.requestManager = createRequestManager({
            requestsPerSecond: 3
        });
        /**
         * The path that precedes a manga page not including the Madara URL.
         * Eg. for https://www.webtoon.xyz/read/limit-breaker/ it would be 'read'.
         * Used in all functions.
         */
        this.sourceTraversalPathName = 'manga';
        /**
         * Different Madara sources might have a slightly different selector which is required to parse out
         * each manga object while on a search result page. This is the selector
         * which is looped over. This may be overridden if required.
         */
        this.searchMangaSelector = 'div.c-tabs-item__content';
        /**
         * Set to true if your source has advanced search functionality built in.
         */
        this.hasAdvancedSearchPage = false;
        /**
         * The path used for search pagination. Used in search function.
         * Eg. for https://mangabob.com/page/2/?s&post_type=wp-manga it would be 'page'
         */
        this.searchPagePathName = 'page';
        /**
         * Some sites use the alternate URL for getting chapters through ajax
         */
        this.alternativeChapterAjaxEndpoint = false;
        /**
         * Different Madara sources might require a extra param in order for the images to be parsed.
         * Eg. for https://arangscans.com/manga/tesla-note/chapter-3/?style=list "?style=list" would be the param
         * added to the end of the URL. This will set the page in list style and is needed in order for the
         * images to be parsed. Params can be addded if required.
         */
        this.chapterDetailsParam = '';
        /**
         * Different Madara sources might have a slightly different selector which is required to parse out
         * each page while on a chapter page. This is the selector
         * which is looped over. This may be overridden if required.
         */
        this.chapterDetailsSelector = 'div.page-break > img';
        /**
         * Set to false if your source has individual buttons for each page as opposed to a 'LOAD MORE' button
         */
        this.loadMoreSearchManga = true;
        /**
        * Helps with CloudFlare for some sources, makes it worse for others; override with empty string if the latter is true
        */
        this.userAgentRandomizer = `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/78.0${Math.floor(Math.random() * 100000)}`;
        this.parser = new MadaraParser_1.Parser();
    }
    getMangaDetails(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${this.baseUrl}/${this.sourceTraversalPathName}/${mangaId}/`,
                method: 'GET',
                headers: this.constructHeaders({})
            });
            const data = yield this.requestManager.schedule(request, 1);
            this.CloudFlareError(data.status);
            const $ = this.cheerio.load(data.data);
            return this.parser.parseMangaDetails($, mangaId);
        });
    }
    getChapters(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: !this.alternativeChapterAjaxEndpoint ? `${this.baseUrl}/wp-admin/admin-ajax.php` : `${this.baseUrl}/${this.sourceTraversalPathName}/${mangaId}/ajax/chapters`,
                method: 'POST',
                headers: this.constructHeaders({
                    'content-type': 'application/x-www-form-urlencoded'
                }),
                data: {
                    'action': 'manga_get_chapters',
                    'manga': yield this.getNumericId(mangaId)
                }
            });
            const data = yield this.requestManager.schedule(request, 1);
            this.CloudFlareError(data.status);
            const $ = this.cheerio.load(data.data);
            return this.parser.parseChapterList($, mangaId, this);
        });
    }
    getChapterDetails(mangaId, chapterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${this.baseUrl}/${this.sourceTraversalPathName}/${chapterId}/`,
                method: 'GET',
                headers: this.constructHeaders(),
                cookies: [createCookie({ name: 'wpmanga-adault', value: '1', domain: this.baseUrl })],
                param: this.chapterDetailsParam
            });
            const data = yield this.requestManager.schedule(request, 1);
            this.CloudFlareError(data.status);
            const $ = this.cheerio.load(data.data);
            return this.parser.parseChapterDetails($, mangaId, chapterId, this.chapterDetailsSelector);
        });
    }
    getTags() {
        return __awaiter(this, void 0, void 0, function* () {
            let request;
            if (this.hasAdvancedSearchPage) {
                request = createRequestObject({
                    url: `${this.baseUrl}/?s=&post_type=wp-manga`,
                    method: 'GET',
                    headers: this.constructHeaders()
                });
            }
            else {
                request = createRequestObject({
                    url: `${this.baseUrl}/`,
                    method: 'GET',
                    headers: this.constructHeaders()
                });
            }
            const data = yield this.requestManager.schedule(request, 1);
            this.CloudFlareError(data.status);
            const $ = this.cheerio.load(data.data);
            return this.parser.parseTags($, this.hasAdvancedSearchPage);
        });
    }
    getSearchResults(query, metadata) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // If we're supplied a page that we should be on, set our internal reference to that page. Otherwise, we start from page 0.
            const page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 1;
            const request = this.constructSearchRequest(page, query);
            const data = yield this.requestManager.schedule(request, 1);
            this.CloudFlareError(data.status);
            const $ = this.cheerio.load(data.data);
            const manga = this.parser.parseSearchResults($, this);
            return createPagedResults({
                results: manga,
                metadata: { page: (page + 1) }
            });
        });
    }
    filterUpdatedManga(mangaUpdatesFoundCallback, time, ids) {
        return __awaiter(this, void 0, void 0, function* () {
            // If we're supplied a page that we should be on, set our internal reference to that page. Otherwise, we start from page 0.
            let page = 0;
            let loadNextPage = true;
            while (loadNextPage) {
                const request = this.constructAjaxHomepageRequest(page, 50, '_latest_update');
                const data = yield this.requestManager.schedule(request, 1);
                this.CloudFlareError(data.status);
                const $ = this.cheerio.load(data.data);
                const updatedManga = this.parser.filterUpdatedManga($, time, ids, this);
                loadNextPage = updatedManga.loadNextPage;
                if (loadNextPage) {
                    page++;
                }
                if (updatedManga.updates.length > 0) {
                    mangaUpdatesFoundCallback(createMangaUpdates({
                        ids: updatedManga.updates
                    }));
                }
            }
            mangaUpdatesFoundCallback(createMangaUpdates({ ids: [] }));
        });
    }
    /**
     * It's hard to capture a default logic for homepages. So for Madara sources,
     * instead we've provided a homesection reader for the base_url/source_traversal_path/ endpoint.
     * This supports having paged views in almost all cases.
     * @param sectionCallback
     */
    getHomePageSections(sectionCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            const sections = [
                {
                    request: this.constructAjaxHomepageRequest(0, 10, '_latest_update'),
                    section: createHomeSection({
                        id: '0',
                        title: 'RECENTLY UPDATED',
                        view_more: true,
                    }),
                },
                {
                    request: this.constructAjaxHomepageRequest(0, 10, '_wp_manga_week_views_value'),
                    section: createHomeSection({
                        id: '1',
                        title: 'CURRENTLY TRENDING',
                        view_more: true,
                    })
                },
                {
                    request: this.constructAjaxHomepageRequest(0, 10, '_wp_manga_views'),
                    section: createHomeSection({
                        id: '2',
                        title: 'MOST POPULAR',
                        view_more: true,
                    })
                },
            ];
            const promises = [];
            for (const section of sections) {
                // Let the app load empty sections
                sectionCallback(section.section);
                // Get the section data
                promises.push(this.requestManager.schedule(section.request, 1).then(response => {
                    this.CloudFlareError(response.status);
                    const $ = this.cheerio.load(response.data);
                    section.section.items = this.parser.parseHomeSection($, this);
                    sectionCallback(section.section);
                }));
            }
            // Make sure the function completes
            yield Promise.all(promises);
        });
    }
    getViewMoreItems(homepageSectionId, metadata) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // We only have one homepage section ID, so we don't need to worry about handling that any
            const page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 0; // Default to page 0
            let sortBy = '';
            switch (homepageSectionId) {
                case '0': {
                    sortBy = '_latest_update';
                    break;
                }
                case '1': {
                    sortBy = '_wp_manga_week_views_value';
                    break;
                }
                case '2': {
                    sortBy = '_wp_manga_views';
                    break;
                }
            }
            const request = this.constructAjaxHomepageRequest(page, 50, sortBy);
            const data = yield this.requestManager.schedule(request, 1);
            this.CloudFlareError(data.status);
            const $ = this.cheerio.load(data.data);
            const items = this.parser.parseHomeSection($, this);
            // Set up to go to the next page. If we are on the last page, remove the logic.
            let mData = { page: (page + 1) };
            if (items.length < 50) {
                mData = undefined;
            }
            return createPagedResults({
                results: items,
                metadata: mData
            });
        });
    }
    getCloudflareBypassRequest() {
        return createRequestObject({
            url: `${this.baseUrl}`,
            method: 'GET',
            headers: this.constructHeaders()
        });
    }
    getNumericId(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${this.baseUrl}/${this.sourceTraversalPathName}/${mangaId}/`,
                method: 'GET',
                headers: this.constructHeaders()
            });
            const data = yield this.requestManager.schedule(request, 1);
            this.CloudFlareError(data.status);
            const $ = this.cheerio.load(data.data);
            const numericId = $('script#wp-manga-js-extra').get()[0].children[0].data.match('"manga_id":"(\\d+)"')[1];
            if (!numericId) {
                throw new Error(`Failed to parse the numeric ID for ${mangaId}`);
            }
            return numericId;
        });
    }
    /**
     * Constructs requests to be sent to the search page.
     */
    constructSearchRequest(page, query) {
        var _a, _b;
        return createRequestObject({
            url: new MadaraHelper_1.URLBuilder(this.baseUrl)
                .addPathComponent(this.searchPagePathName)
                .addPathComponent(page.toString())
                .addQueryParameter('s', encodeURIComponent((_a = query === null || query === void 0 ? void 0 : query.title) !== null && _a !== void 0 ? _a : ''))
                .addQueryParameter('post_type', 'wp-manga')
                .addQueryParameter('genre', (_b = query === null || query === void 0 ? void 0 : query.includedTags) === null || _b === void 0 ? void 0 : _b.map((x) => x.id))
                .buildUrl({ addTrailingSlash: true, includeUndefinedParameters: false }),
            method: 'GET',
            headers: this.constructHeaders(),
            cookies: [createCookie({ name: 'wpmanga-adault', value: '1', domain: this.baseUrl })]
        });
    }
    /**
     * Constructs requests to be sent to the Madara /admin-ajax.php endpoint.
     */
    constructAjaxHomepageRequest(page, postsPerPage, meta_key) {
        return createRequestObject({
            url: `${this.baseUrl}/wp-admin/admin-ajax.php`,
            method: 'POST',
            headers: this.constructHeaders({
                'content-type': 'application/x-www-form-urlencoded'
            }),
            data: {
                'action': 'madara_load_more',
                'template': 'madara-core/content/content-archive',
                'page': page,
                'vars[paged]': '1',
                'vars[posts_per_page]': postsPerPage,
                'vars[orderby]': 'meta_value_num',
                'vars[sidebar]': 'right',
                'vars[post_type]': 'wp-manga',
                'vars[order]': 'desc',
                'vars[meta_key]': meta_key
            },
            cookies: [createCookie({ name: 'wpmanga-adault', value: '1', domain: this.baseUrl })]
        });
    }
    /**
     * Parses a time string from a Madara source into a Date object.
     */
    convertTime(timeAgo) {
        var _a;
        let time;
        let trimmed = Number(((_a = /\d*/.exec(timeAgo)) !== null && _a !== void 0 ? _a : [])[0]);
        trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed;
        if (timeAgo.includes('mins') || timeAgo.includes('minutes') || timeAgo.includes('minute')) {
            time = new Date(Date.now() - trimmed * 60000);
        }
        else if (timeAgo.includes('hours') || timeAgo.includes('hour')) {
            time = new Date(Date.now() - trimmed * 3600000);
        }
        else if (timeAgo.includes('days') || timeAgo.includes('day')) {
            time = new Date(Date.now() - trimmed * 86400000);
        }
        else if (timeAgo.includes('year') || timeAgo.includes('years')) {
            time = new Date(Date.now() - trimmed * 31556952000);
        }
        else {
            time = new Date(timeAgo);
        }
        return time;
    }
    constructHeaders(headers, refererPath) {
        headers = headers !== null && headers !== void 0 ? headers : {};
        if (this.userAgentRandomizer !== '') {
            headers['user-agent'] = this.userAgentRandomizer;
        }
        headers['referer'] = `${this.baseUrl}${refererPath !== null && refererPath !== void 0 ? refererPath : ''}`;
        return headers;
    }
    globalRequestHeaders() {
        if (this.userAgentRandomizer !== '') {
            return {
                'referer': `${this.baseUrl}/`,
                'user-agent': this.userAgentRandomizer,
                'accept': 'image/jpeg,image/png,image/*;q=0.8'
            };
        }
        else {
            return {
                'referer': `${this.baseUrl}/`,
                'accept': 'image/jpeg,image/png,image/*;q=0.8'
            };
        }
    }
    CloudFlareError(status) {
        if (status == 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > \<\The name of this source\> and press Cloudflare Bypass');
        }
    }
}
exports.Madara = Madara;

},{"./MadaraHelper":50,"./MadaraParser":51,"paperback-extensions-common":5}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.URLBuilder = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
class URLBuilder {
    constructor(baseUrl) {
        this.parameters = {};
        this.pathComponents = [];
        this.baseUrl = baseUrl.replace(/(^\/)?(?=.*)(\/$)?/gim, '');
    }
    addPathComponent(component) {
        this.pathComponents.push(component.replace(/(^\/)?(?=.*)(\/$)?/gim, ''));
        return this;
    }
    addQueryParameter(key, value) {
        this.parameters[key] = value;
        return this;
    }
    buildUrl({ addTrailingSlash, includeUndefinedParameters } = { addTrailingSlash: false, includeUndefinedParameters: false }) {
        let finalUrl = this.baseUrl + '/';
        finalUrl += this.pathComponents.join('/');
        finalUrl += addTrailingSlash ? '/' : '';
        finalUrl += Object.values(this.parameters).length > 0 ? '?' : '';
        finalUrl += Object.entries(this.parameters).map(entry => {
            if (entry[1] == null && !includeUndefinedParameters) {
                return undefined;
            }
            if (Array.isArray(entry[1])) {
                return entry[1].map(value => value || includeUndefinedParameters ? `${entry[0]}[]=${value}` : undefined)
                    .filter(x => x !== undefined)
                    .join('&');
            }
            if (typeof entry[1] === 'object') {
                return Object.keys(entry[1]).map(key => `${entry[0]}[${key}]=${entry[1][key]}`)
                    .join('&');
            }
            return `${entry[0]}=${entry[1]}`;
        }).filter(x => x !== undefined).join('&');
        return finalUrl;
    }
}
exports.URLBuilder = URLBuilder;

},{}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
const paperback_extensions_common_1 = require("paperback-extensions-common");
class Parser {
    parseMangaDetails($, mangaId) {
        var _a, _b;
        const numericId = $('script#wp-manga-js-extra').get()[0].children[0].data.match('"manga_id":"(\\d+)"')[1];
        const title = this.decodeHTMLEntity($('div.post-title h1').children().remove().end().text().trim());
        const author = this.decodeHTMLEntity($('div.author-content').first().text().replace('\\n', '').trim()).replace('Updating', 'Unknown');
        const artist = this.decodeHTMLEntity($('div.artist-content').first().text().replace('\\n', '').trim()).replace('Updating', 'Unknown');
        const summary = this.decodeHTMLEntity($('div.description-summary').first().text()).replace('Show more', '').trim();
        const image = encodeURI(this.getImageSrc($('div.summary_image img').first()));
        const rating = $('span.total_votes').text().replace('Your Rating', '');
        const isOngoing = $('div.summary-content', $('div.post-content_item').last()).text().toLowerCase().trim() == 'ongoing';
        const genres = [];
        let hentai = $('.manga-title-badges.adult').length > 0;
        // Grab genres and check for smut tag
        for (const obj of $('div.genres-content a').toArray()) {
            const label = $(obj).text();
            const id = (_b = (_a = $(obj).attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[4]) !== null && _b !== void 0 ? _b : label;
            if (label.toLowerCase().includes('smut'))
                hentai = true;
            genres.push(createTag({ label: label, id: id }));
        }
        const tagSections = [createTagSection({ id: '0', label: 'genres', tags: genres })];
        // If we cannot parse out the data-id for this title, we cannot complete subsequent requests
        if (!numericId) {
            throw new Error(`Could not parse out the data-id for ${mangaId} - This method might need overridden in the implementing source`);
        }
        // If we do not have a valid image, something is wrong with the generic parsing logic. A source should always remedy this with
        // a custom implementation.
        if (!image) {
            throw new Error(`Could not parse out a valid image while parsing manga details for manga: ${mangaId}`);
        }
        return createManga({
            id: mangaId,
            titles: [title],
            image: image,
            author: author,
            artist: artist,
            tags: tagSections,
            desc: summary,
            status: isOngoing ? paperback_extensions_common_1.MangaStatus.ONGOING : paperback_extensions_common_1.MangaStatus.COMPLETED,
            rating: Number(rating),
            hentai: hentai
        });
    }
    parseChapterList($, mangaId, source) {
        var _a, _b, _c;
        const chapters = [];
        // Capture the manga title, as this differs from the ID which this function is fed
        const realTitle = (_a = $('a', $('li.wp-manga-chapter  ').first()).attr('href')) === null || _a === void 0 ? void 0 : _a.replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').toLowerCase().replace(/\/chapter.*/, '');
        if (!realTitle) {
            throw new Error(`Failed to parse the human-readable title for ${mangaId}`);
        }
        // For each available chapter..
        for (const obj of $('li.wp-manga-chapter  ').toArray()) {
            const id = ($('a', $(obj)).first().attr('href') || '').replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').replace(/\/$/, '');
            const chapNum = Number((_b = id.match(/\D*(\d*\.?\d*)$/)) === null || _b === void 0 ? void 0 : _b.pop());
            const chapName = $('a', $(obj)).first().text();
            let mangaTime;
            const timeSelector = $('span.chapter-release-date > a, span.chapter-release-date > span.c-new-tag > a', obj).attr('title');
            if (typeof timeSelector !== 'undefined') {
                //Firstly check if there is a NEW tag, if so parse the time from this
                mangaTime = source.convertTime(timeSelector !== null && timeSelector !== void 0 ? timeSelector : '');
            }
            else {
                //Else get the date from the info box
                mangaTime = source.convertTime($('span.chapter-release-date > i', obj).text().trim());
            }
            //Check if the date is a valid date, else return the current date
            if (!mangaTime.getTime())
                mangaTime = new Date();
            if (typeof id === 'undefined') {
                throw new Error(`Could not parse out ID when getting chapters for ${mangaId}`);
            }
            chapters.push(createChapter({
                id: id,
                mangaId: mangaId,
                langCode: (_c = source.languageCode) !== null && _c !== void 0 ? _c : paperback_extensions_common_1.LanguageCode.UNKNOWN,
                chapNum: Number.isNaN(chapNum) ? 0 : chapNum,
                name: Number.isNaN(chapNum) ? chapName : undefined,
                time: mangaTime
            }));
        }
        return chapters;
    }
    parseChapterDetails($, mangaId, chapterId, selector) {
        const pages = [];
        for (const obj of $(selector).toArray()) {
            const page = this.getImageSrc($(obj));
            if (!page) {
                throw new Error(`Could not parse page for ${mangaId}/${chapterId}`);
            }
            pages.push(page);
        }
        return createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
            longStrip: false
        });
    }
    parseTags($, advancedSearch) {
        var _a, _b, _c;
        const genres = [];
        if (advancedSearch) {
            for (const obj of $('.checkbox-group div label').toArray()) {
                const label = $(obj).text().trim();
                const id = (_a = $(obj).attr('for')) !== null && _a !== void 0 ? _a : label;
                genres.push(createTag({ label: label, id: id }));
            }
        }
        else {
            for (const obj of $('.menu-item-object-wp-manga-genre a', $('.second-menu')).toArray()) {
                const label = $(obj).text().trim();
                const id = (_c = (_b = $(obj).attr('href')) === null || _b === void 0 ? void 0 : _b.split('/')[4]) !== null && _c !== void 0 ? _c : label;
                genres.push(createTag({ label: label, id: id }));
            }
        }
        return [createTagSection({ id: '0', label: 'genres', tags: genres })];
    }
    parseSearchResults($, source) {
        var _a, _b;
        const results = [];
        for (const obj of $(source.searchMangaSelector).toArray()) {
            const id = ((_a = $('a', $(obj)).attr('href')) !== null && _a !== void 0 ? _a : '').replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').replace(/\/$/, '');
            const title = createIconText({ text: this.decodeHTMLEntity((_b = $('a', $(obj)).attr('title')) !== null && _b !== void 0 ? _b : '') });
            const image = encodeURI(this.getImageSrc($('img', $(obj))));
            const subtitle = createIconText({ text: $('span.font-meta.chapter', obj).text().trim() });
            if (!id || !image || !title.text) {
                if (id.includes(source.baseUrl.replace(/\/$/, '')))
                    continue;
                // Something went wrong with our parsing, return a detailed error
                throw new Error(`Failed to parse searchResult for ${source.baseUrl} using ${source.searchMangaSelector} as a loop selector`);
            }
            results.push(createMangaTile({
                id: id,
                title: title,
                image: image,
                subtitleText: subtitle
            }));
        }
        return results;
    }
    parseHomeSection($, source) {
        var _a, _b;
        const items = [];
        for (const obj of $('div.page-item-detail').toArray()) {
            const image = encodeURI((_a = this.getImageSrc($('img', $(obj)))) !== null && _a !== void 0 ? _a : '');
            const title = this.decodeHTMLEntity($('a', $('h3.h5', $(obj))).text());
            const id = (_b = $('a', $('h3.h5', $(obj))).attr('href')) === null || _b === void 0 ? void 0 : _b.replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').replace(/\/$/, '');
            const subtitle = $('span.font-meta.chapter', obj).first().text().trim();
            if (!id || !title || !image) {
                throw new Error(`Failed to parse homepage sections for ${source.baseUrl}/`);
            }
            items.push(createMangaTile({
                id: id,
                title: createIconText({ text: title }),
                image: image,
                subtitleText: createIconText({ text: subtitle })
            }));
        }
        return items;
    }
    filterUpdatedManga($, time, ids, source) {
        var _a, _b;
        let passedReferenceTimePrior = false;
        let passedReferenceTimeCurrent = false;
        const updatedManga = [];
        for (const obj of $('div.page-item-detail').toArray()) {
            const id = (_b = (_a = $('a', $('h3.h5', obj)).attr('href')) === null || _a === void 0 ? void 0 : _a.replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').replace(/\/$/, '')) !== null && _b !== void 0 ? _b : '';
            let mangaTime;
            const timeSelector = $('span.post-on.font-meta > a, span.post-on.font-meta > span > a', obj).attr('title');
            if (typeof timeSelector !== 'undefined') {
                //Firstly check if there is a NEW tag, if so parse the time from this
                mangaTime = source.convertTime(timeSelector !== null && timeSelector !== void 0 ? timeSelector : '');
            }
            else {
                //Else get the date from the span
                mangaTime = source.convertTime($('span.post-on.font-meta', obj).first().text().trim());
            }
            //Check if the date is valid, if it isn't we should skip it
            if (!mangaTime.getTime())
                continue;
            passedReferenceTimeCurrent = mangaTime <= time;
            if (!passedReferenceTimeCurrent || !passedReferenceTimePrior) {
                if (ids.includes(id)) {
                    updatedManga.push(id);
                }
            }
            else
                break;
            if (typeof id === 'undefined') {
                throw new Error(`Failed to parse homepage sections for ${source.baseUrl}/${source.homePage}/`);
            }
            passedReferenceTimePrior = passedReferenceTimeCurrent;
        }
        if (!passedReferenceTimeCurrent || !passedReferenceTimePrior) {
            return { updates: updatedManga, loadNextPage: true };
        }
        else {
            return { updates: updatedManga, loadNextPage: false };
        }
    }
    // UTILITY METHODS
    getImageSrc(imageObj) {
        var _a, _b, _c;
        let image;
        if (typeof (imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('data-src')) != 'undefined') {
            image = imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('data-src');
        }
        else if (typeof (imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('data-lazy-src')) != 'undefined') {
            image = imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('data-lazy-src');
        }
        else if (typeof (imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('srcset')) != 'undefined') {
            image = (_b = (_a = imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('srcset')) === null || _a === void 0 ? void 0 : _a.split(' ')[0]) !== null && _b !== void 0 ? _b : '';
        }
        else {
            image = imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('src');
        }
        return encodeURI(decodeURI(this.decodeHTMLEntity((_c = image === null || image === void 0 ? void 0 : image.trim()) !== null && _c !== void 0 ? _c : '')));
    }
    decodeHTMLEntity(str) {
        return str.replace(/&#(\d+);/g, (_match, dec) => {
            return String.fromCharCode(dec);
        });
    }
}
exports.Parser = Parser;

},{"paperback-extensions-common":5}]},{},[48])(48)
});
